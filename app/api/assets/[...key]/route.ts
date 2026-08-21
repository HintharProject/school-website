import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join("/");

    let r2: R2Bucket | undefined;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      r2 = (ctx?.env as any)?.R2 as R2Bucket | undefined;
    } catch {
      // Local development or non-CF environment
    }

    if (!r2 && typeof globalThis !== "undefined") {
      r2 = (globalThis as any).R2 as R2Bucket | undefined;
    }

    if (!r2) {
      return new NextResponse("Asset storage binding not available", { status: 404 });
    }

    const object = await r2.get(objectKey);
    if (!object) {
      return new NextResponse("Asset not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(object.body as any, {
      headers,
    });
  } catch (err) {
    console.error("Asset streaming error:", err);
    return new NextResponse("Error retrieving asset", { status: 500 });
  }
}
