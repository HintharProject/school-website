import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join("/");

    let r2: R2Bucket | undefined;
    let ctxEnv: any = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true } as any);
      ctxEnv = (ctx as any)?.env;
      // wrangler binds as R2, typegen also exposes hinthar_assets — check both + case variants
      r2 =
        (ctxEnv?.R2 as R2Bucket | undefined) ||
        (ctxEnv?.hinthar_assets as R2Bucket | undefined) ||
        (ctxEnv?.r2 as R2Bucket | undefined) ||
        undefined;
      if (!r2) {
        // dump available keys for diagnostics (no PII)
        console.warn("[assets] R2 not in ctx.env, keys:", ctxEnv ? Object.keys(ctxEnv) : "no ctx");
      }
    } catch (e) {
      console.warn("[assets] getCloudflareContext failed:", e);
    }

    // Fallbacks for non-standard contexts (tests, older open-next)
    if (!r2 && typeof globalThis !== "undefined") {
      const g: any = globalThis as any;
      r2 = g.R2 || g.hinthar_assets || g.r2 || undefined;
    }
    // Node process env fallback (wrangler local sometimes injects there)
    if (!r2 && typeof process !== "undefined") {
      const p: any = process as any;
      r2 = p.env?.R2 || undefined;
    }

    if (!r2) {
      console.error("[assets] Asset storage binding not available. ctxEnv keys:", ctxEnv ? Object.keys(ctxEnv) : "none");
      return new NextResponse("Asset storage binding not available", { status: 404 });
    }

    const object = await r2.get(objectKey);
    if (!object) {
      console.warn(`[assets] R2 miss for key: ${objectKey}`);
      return new NextResponse("Asset not found", { status: 404 });
    }

    const headers = new Headers();
    try {
      // writeHttpMetadata may throw in some miniflare mocks
      object.writeHttpMetadata(headers);
    } catch (e) {
      // fallback: set content-type manually from R2 httpMetadata
      const ct = (object as any).httpMetadata?.contentType || (object as any).contentType;
      if (ct) headers.set("content-type", ct);
      console.warn("[assets] writeHttpMetadata failed, fallback:", e);
    }
    // httpEtag may be undefined in local emulation
    if ((object as any).httpEtag) headers.set("etag", (object as any).httpEtag);
    else if ((object as any).etag) headers.set("etag", (object as any).etag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("X-Content-Type-Options", "nosniff");
    // Ensure content-type present (some R2 mocks strip it)
    if (!headers.get("content-type")) {
      // infer from extension
      const ext = objectKey.split(".").pop()?.toLowerCase();
      const mimeByExt: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        avif: "image/avif",
        gif: "image/gif",
      };
      if (ext && mimeByExt[ext]) headers.set("content-type", mimeByExt[ext]);
    }

    // Defense-in-depth for executable/document content types (legacy uploads):
    const contentType = (headers.get("content-type") || "").toLowerCase();
    if (
      contentType.includes("svg") ||
      contentType.includes("html") ||
      contentType.includes("xml") ||
      contentType.includes("pdf")
    ) {
      headers.set("Content-Disposition", "attachment");
      headers.set("Content-Security-Policy", "sandbox");
    }

    const body: any = (object as any).body;
    if (!body) {
      console.error("[assets] R2 object has no body for", objectKey);
      return new NextResponse("Asset empty", { status: 500 });
    }
    return new NextResponse(body as any, {
      headers,
    });
  } catch (err) {
    console.error("Asset streaming error:", err);
    return new NextResponse("Error retrieving asset", { status: 500 });
  }
}
