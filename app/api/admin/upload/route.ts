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
          error: `Invalid file type (${mimeType || "unknown"}). Allowed formats: JPG, PNG, WebP, AVIF, GIF.`,
        },
        { status: 400 }
      );
    }

    // Defense-in-depth: verify magic bytes match the declared image type
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const signatureOk =
      (mimeType === "image/jpeg" || mimeType === "image/jpg")
        ? header[0] === 0xff && header[1] === 0xd8
        : mimeType === "image/png"
          ? header[0] === 0x89 && header[1] === 0x50
          : mimeType === "image/gif"
            ? header[0] === 0x47 && header[1] === 0x49
            : mimeType === "image/webp"
              ? header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
              : mimeType === "image/avif"
                ? header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70
                : true;
    if (!signatureOk) {
      return NextResponse.json(
        { success: false, error: "File contents do not match the declared image type." },
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
        publicUrl = `/api/assets/${objectKey}`;
      } else if (typeof globalThis !== "undefined" && (globalThis as any).R2) {
        await (globalThis as any).R2.put(objectKey, arrayBuffer, {
          httpMetadata: { contentType: file.type },
        });
        publicUrl = `/api/assets/${objectKey}`;
      } else if (process.env.ALLOW_LOCAL_BASE64_UPLOADS === "true") {
        // Explicit local-dev escape hatch only. Never enabled by default:
        // multi-MB data URLs bloat D1 rows and every subsequent page load.
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        publicUrl = `data:${file.type};base64,${base64}`;
      } else {
        return NextResponse.json(
          { success: false, error: "Asset storage is not configured. Upload aborted." },
          { status: 503 }
        );
      }
    } catch (r2Err) {
      console.error("R2 upload failed:", r2Err);
      return NextResponse.json(
        { success: false, error: "Asset storage is currently unavailable. Please retry." },
        { status: 503 }
      );
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
      console.error("file_assets metadata record failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "Upload succeeded but asset registration failed. Please re-upload." },
        { status: 500 }
      );
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
      { success: false, error: "Failed to process asset upload." },
      { status: 500 }
    );
  }
}
