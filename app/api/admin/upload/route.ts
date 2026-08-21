import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/rbac";
import { getDb, fileAssets } from "@/lib/db";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];

export async function POST(req: NextRequest) {
  try {
    const { user } = await getServerSession();
    if (!user || user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active school account required to upload assets." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type (${mimeType}). Allowed formats: JPG, PNG, WebP, AVIF, GIF, SVG, PDF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 8MB limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, "-")
      .replace(/-+/g, "-");
    const cleanFolder = folder.replace(/[^a-z0-9_-]/gi, "");
    const objectKey = `${cleanFolder}/${timestamp}-${sanitizedName}`;

    let publicUrl = `/api/assets/${objectKey}`;

    // 1. Attempt Cloudflare R2 Upload
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const r2 = (ctx?.env as any)?.R2 as R2Bucket | undefined;

      if (r2) {
        await r2.put(objectKey, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });
      } else if (typeof globalThis !== "undefined" && (globalThis as any).R2) {
        await (globalThis as any).R2.put(objectKey, arrayBuffer, {
          httpMetadata: { contentType: file.type },
        });
      }
    } catch {
      // If R2 binding is not available in local dev, fallback to base64 data URI
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      publicUrl = `data:${file.type};base64,${base64}`;
    }

    // 2. Track metadata in Cloudflare D1 file_assets
    try {
      const db = await getDb();
      await db.insert(fileAssets).values({
        id: `file_${timestamp}_${Math.random().toString(36).slice(2, 7)}`,
        objectKey,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        folder: cleanFolder,
        publicUrl,
        uploadedBy: user.id,
        createdAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("file_assets metadata record note:", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      objectKey,
      filename: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process asset upload." },
      { status: 500 }
    );
  }
}
