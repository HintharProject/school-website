import { NextResponse } from "next/server";
import { bootstrapInitialAdmin } from "@/lib/auth/bootstrap";

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Administrative initialization requires an authorized POST request." },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-admin-bootstrap-secret");
    const configuredSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

    if (!configuredSecret || !authHeader || authHeader !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Valid administrative bootstrap secret token required." },
        { status: 401 }
      );
    }

    const result = await bootstrapInitialAdmin();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute administrative bootstrap." },
      { status: 500 }
    );
  }
}
