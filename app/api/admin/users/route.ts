import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/rbac";
import { getUsers, deleteUserAction, updateUserStatusAction } from "@/lib/actions/users";

export async function GET() {
  try {
    const { user } = await getServerSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Administrative login required." },
        { status: 401 }
      );
    }

    const userList = await getUsers();
    return NextResponse.json({ users: userList, count: userList.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await getServerSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    await deleteUserAction(id);
    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
