import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/rbac";
import { inviteUserAction } from "@/lib/actions/users";

export async function POST(req: Request) {
  try {
    const { user } = await getServerSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Administrative privileges required to issue invitations." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as any;
    const result = await inviteUserAction({
      email: body.email,
      fullName: body.full_name || body.fullName || body.email.split("@")[0],
      role: body.role || "student",
      title: body.title,
      campusId: body.campus_id || body.campusId || "ywarma-campus",
      grade: body.grade,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: body.email,
      inviteUrl: result.inviteUrl,
      magicLink: result.inviteUrl,
      emailSent: result.emailSent,
      message: `Invitation link generated successfully.`,
    });
  } catch {
    console.error("Invite API error");
    return NextResponse.json(
      { error: "Failed to generate invitation. Please verify the details and retry." },
      { status: 500 }
    );
  }
}
