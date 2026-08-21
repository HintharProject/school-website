import { NextResponse } from "next/server";
import { bootstrapInitialAdmin } from "@/lib/auth/bootstrap";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-admin-init-secret") || req.headers.get("x-admin-bootstrap-secret");
    const configuredSecret = process.env.ADMIN_INIT_SECRET || process.env.ADMIN_BOOTSTRAP_SECRET;

    if (configuredSecret && authHeader !== configuredSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid administrative bootstrap token." },
        { status: 401 }
      );
    }

    const result = await bootstrapInitialAdmin();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to initialize administrator" },
      { status: 500 }
    );
  }
}
