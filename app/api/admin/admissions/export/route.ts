import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/rbac";
import { getDb, admissions } from "@/lib/db";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Admin-only export of admission applications for transfer into the external
 * school management system.
 *   GET /api/admin/admissions/export?format=json  (default)
 *   GET /api/admin/admissions/export?format=csv
 *   GET /api/admin/admissions/export?status=Approved   (optional filter)
 */
export async function GET(req: NextRequest) {
  const { user } = await getServerSession();
  if (!user || user.status !== "active" || user.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Administrator access required." },
      { status: 401 }
    );
  }

  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();
  const statusFilter = req.nextUrl.searchParams.get("status");

  try {
    const db = await getDb();
    let rows = await db.select().from(admissions).orderBy(desc(admissions.createdAt));

    if (statusFilter) {
      rows = rows.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "csv") {
      const headers = [
        "id",
        "student_name",
        "date_of_birth",
        "gender",
        "nationality",
        "grade",
        "program_level",
        "academic_stream",
        "selected_subjects",
        "intended_start_term",
        "study_mode",
        "previous_school",
        "parent_name",
        "relationship",
        "parent_email",
        "parent_phone",
        "address",
        "emergency_contact",
        "medical_notes",
        "how_heard",
        "submitted_date",
        "status",
        "assessment_date",
        "notes",
        "created_at",
        "updated_at",
      ];

      const escapeCsv = (value: unknown): string => {
        const str = value == null ? "" : String(value);
        return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      };

      const lines = [headers.join(",")];
      for (const row of rows) {
        lines.push(
          headers
            .map((h) => {
              const key = h as keyof typeof row;
              const camel = h.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()) as keyof typeof row;
              return escapeCsv(row[key] ?? row[camel]);
            })
            .join(",")
        );
      }

      return new NextResponse(lines.join("\r\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="hinthar-admissions-${stamp}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), count: rows.length, applications: rows }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="hinthar-admissions-${stamp}.json"`,
      },
    });
  } catch (err) {
    console.error("Admissions export error:", err);
    return NextResponse.json(
      { success: false, error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}
