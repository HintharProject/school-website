import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/rbac";
import { sendAdmissionEmail } from "@/lib/email/email";

/**
 * Admin-only email notification endpoint.
 * Requires an authenticated, active administrator session.
 */
export async function POST(req: Request) {
  try {
    const { user } = await getServerSession();
    if (!user || user.role !== "admin" || user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator session required." },
        { status: 401 }
      );
    }

    const raw = await req.json().catch(() => null);
    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const result = await sendAdmissionEmail(raw);

    if (result.error && !result.sent && !result.simulated) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      delivered: result.sent,
      simulated: result.simulated,
      provider: result.provider,
      id: result.id,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error processing email notification." },
      { status: 500 }
    );
  }
}
