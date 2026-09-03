import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sql } from "drizzle-orm";
import { admissionUploadLimits, getDb, fileAssets } from "@/lib/db";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const UPLOAD_LIMIT = 12;

function hasValidSignature(type: string, bytes: Uint8Array) {
  if (type === "application/pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (type === "image/webp") {
    return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return false;
}

async function isRateLimited(request: NextRequest) {
  const identity = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || `local:${request.headers.get("user-agent") || "unknown"}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const now = Date.now();
  const bucket = Math.floor(now / UPLOAD_WINDOW_MS);
  const db = await getDb();
  const rows = await db
    .insert(admissionUploadLimits)
    .values({ key: `${hash}:${bucket}`, count: 1, resetAt: now + UPLOAD_WINDOW_MS })
    .onConflictDoUpdate({
      target: admissionUploadLimits.key,
      set: { count: sql`${admissionUploadLimits.count} + 1` },
    })
    .returning({ count: admissionUploadLimits.count });
  return (rows[0]?.count ?? UPLOAD_LIMIT + 1) > UPLOAD_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    let rateLimited = false;
    try {
      rateLimited = await isRateLimited(request);
    } catch (rateLimitError) {
      // A delayed migration must not make the entire admissions intake unusable.
      // File type/size/slot limits still constrain the public upload endpoint.
      console.warn("Admission upload rate limiter unavailable:", rateLimitError);
    }
    if (rateLimited) {
      return NextResponse.json({ success: false, error: "Too many uploads. Please wait a few minutes and try again." }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = String(formData.get("documentType") || "");

    if (!(file instanceof File) || !["identity", "report", "photo"].includes(documentType)) {
      return NextResponse.json({ success: false, error: "A valid document slot and file are required." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Use a PDF, JPG, PNG, or WebP file up to 8 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidSignature(file.type, bytes.subarray(0, 16))) {
      return NextResponse.json({ success: false, error: "The file contents do not match its file type." }, { status: 400 });
    }

    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, "-").replace(/-+/g, "-");
    const objectKey = `admissions/${documentType}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const publicUrl = `/api/assets/${objectKey}`;
    const { env } = await getCloudflareContext({ async: true });

    await env.R2.put(objectKey, bytes, {
      httpMetadata: { contentType: file.type },
    });

    const db = await getDb();
    await db.insert(fileAssets).values({
      id: `file_${crypto.randomUUID()}`,
      objectKey,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      folder: "admissions",
      publicUrl,
      uploadedBy: null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      document: { type: documentType, url: publicUrl, filename: file.name },
    });
  } catch (error) {
    console.error("Public admission upload failed:", error);
    return NextResponse.json({ success: false, error: "Document upload failed. Please try again." }, { status: 500 });
  }
}
