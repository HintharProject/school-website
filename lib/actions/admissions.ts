"use server";

import { getDb, admissions, NewAdmission } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendAdmissionEmail } from "@/lib/email/email";

const admissionSchema = z.object({
  studentName: z.string().min(2).max(200),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  nationality: z.string().default("Myanmar").optional().nullable(),
  grade: z.string().min(2),
  programLevel: z.string().optional().nullable(),
  academicStream: z.string().optional().nullable(),
  selectedSubjects: z.array(z.string()).default([]),
  intendedStartTerm: z.string().optional().nullable(),
  studyMode: z.string().default("Full-Time On-Campus").optional().nullable(),
  previousSchool: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  relationship: z.string().default("Parent").optional().nullable(),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(5),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  medicalNotes: z.string().optional().nullable(),
  howHeard: z.string().default("School Website").optional().nullable(),
});

function parseSubjects(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function getAdmissions() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(admissions)
    .orderBy(desc(admissions.createdAt));

  return rows.map((r) => ({
    ...r,
    selectedSubjects: parseSubjects(r.selectedSubjects),
  }));
}

function generateApplicationId(): string {
  const secureNum = Math.floor(100000 + Math.random() * 900000);
  return `HIS-2026-${secureNum}`;
}

export async function submitPublicAdmissionAction(data: unknown) {
  const validatedResult = admissionSchema.safeParse(data);
  if (!validatedResult.success) {
    return {
      success: false as const,
      error: "Please review the highlighted fields and try again.",
      fieldErrors: validatedResult.error.flatten().fieldErrors,
    };
  }
  const validated = validatedResult.data;
  const db = await getDb();

  // Insert with collision-safe retry (unique primary key)
  let applicationId = "";
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    applicationId = generateApplicationId();
    try {
      await db.insert(admissions).values({
        id: applicationId,
        studentName: validated.studentName,
        dateOfBirth: validated.dateOfBirth ?? null,
        gender: validated.gender ?? null,
        nationality: validated.nationality ?? "Myanmar",
        grade: validated.grade,
        programLevel: validated.programLevel ?? null,
        academicStream: validated.academicStream ?? null,
        selectedSubjects: JSON.stringify(validated.selectedSubjects),
        intendedStartTerm: validated.intendedStartTerm ?? null,
        studyMode: validated.studyMode ?? "Full-Time On-Campus",
        previousSchool: validated.previousSchool ?? null,
        parentName: validated.parentName ?? null,
        relationship: validated.relationship ?? "Parent",
        parentEmail: validated.parentEmail,
        parentPhone: validated.parentPhone,
        address: validated.address ?? null,
        emergencyContact: validated.emergencyContact ?? null,
        medicalNotes: validated.medicalNotes ?? null,
        howHeard: validated.howHeard ?? "School Website",
        submittedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: `Stream: ${validated.academicStream || "General"} | Mode: ${validated.studyMode || "Full-Time"}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      inserted = true;
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (!msg.includes("UNIQUE") && !msg.includes("constraint")) {
        throw err;
      }
    }
  }

  if (!inserted) {
    return { success: false as const, error: "Could not register the application. Please try again." };
  }

  // Trigger confirmation email (non-fatal)
  const emailResult = await sendAdmissionEmail({
    type: "admission_submitted",
    recipientEmail: validated.parentEmail,
    recipientName: validated.parentName || undefined,
    studentName: validated.studentName,
    applicationId,
    grade: validated.grade,
    status: "Pending",
  });

  revalidatePath("/admin/admissions");
  return { success: true as const, applicationId, emailSent: emailResult.sent };
}

export async function updateAdmissionStatusAction(
  id: string,
  status: string,
  notes?: string,
  assessmentDate?: string
) {
  const user = await requireAdmin();

  const statusSchema = z.enum(["Pending", "Assessment Scheduled", "Approved", "Declined"]);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return { success: false as const, error: "Invalid admission status." };
  }
  const validStatus = parsedStatus.data;

  if (id && (id.includes("'") || id.includes('"') || id.includes(";"))) {
    return { success: false as const, error: "Invalid admission id." };
  }

  const db = await getDb();

  const updated = await db
    .update(admissions)
    .set({
      status: validStatus,
      notes: notes ?? undefined,
      assessmentDate: assessmentDate ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(admissions.id, id))
    .returning({ id: admissions.id });

  if (!updated.length) {
    return { success: false as const, error: "Application not found. It may have been deleted." };
  }

  // Notify the family about the status change / scheduled assessment
  let emailSent = false;
  try {
    const rows = await db
      .select({
        parentEmail: admissions.parentEmail,
        studentName: admissions.studentName,
        grade: admissions.grade,
      })
      .from(admissions)
      .where(eq(admissions.id, id))
      .limit(1);

    if (rows[0]?.parentEmail) {
      const result = await sendAdmissionEmail({
        type: validStatus === "Assessment Scheduled" ? "assessment_scheduled" : "admission_status_updated",
        recipientEmail: rows[0].parentEmail,
        studentName: rows[0].studentName || undefined,
        applicationId: id,
        grade: rows[0].grade || undefined,
        status: validStatus,
        assessmentDate,
        notes,
      });
      emailSent = result.sent;
    }
  } catch (emailErr) {
    console.warn("Admission status email error:", emailErr);
  }

  await logAudit({
    actor: user,
    action: `ADMIN_UPDATED_ADMISSION_STATUS_${validStatus.toUpperCase().replace(/\s+/g, "_")}`,
    resource: "admissions",
    resourceId: id,
    details: { status: validStatus, notes, assessmentDate },
  });

  revalidatePath("/admin/admissions");
  return { success: true as const, emailSent };
}

export async function updateAdmissionDetailsAction(id: string, data: unknown) {
  const user = await requireAdmin();

  const detailsSchema = admissionSchema.partial().extend({
    status: z.enum(["Pending", "Assessment Scheduled", "Approved", "Declined"]).optional(),
    assessmentDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });
  const validatedResult = detailsSchema.safeParse(data);
  if (!validatedResult.success) {
    return {
      success: false as const,
      error: "Please review the highlighted fields and try again.",
      fieldErrors: validatedResult.error.flatten().fieldErrors,
    };
  }
  const validated = validatedResult.data;

  const db = await getDb();

  const updateData: Partial<NewAdmission> = {
    ...validated,
    selectedSubjects: validated.selectedSubjects ? JSON.stringify(validated.selectedSubjects) : undefined,
    updatedAt: new Date().toISOString(),
  };

  const updated = await db
    .update(admissions)
    .set(updateData)
    .where(eq(admissions.id, id))
    .returning({ id: admissions.id });

  if (!updated.length) {
    return { success: false as const, error: "Application not found. It may have been deleted." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_ADMISSION_DETAILS",
    resource: "admissions",
    resourceId: id,
    details: { studentName: validated.studentName, grade: validated.grade },
  });

  revalidatePath("/admin/admissions");
  return { success: true };
}

export async function deleteAdmissionAction(id: string) {
  const user = await requireAdmin();
  const db = await getDb();

  await db.delete(admissions).where(eq(admissions.id, id));

  await logAudit({
    actor: user,
    action: "ADMIN_DELETED_ADMISSION",
    resource: "admissions",
    resourceId: id,
  });

  revalidatePath("/admin/admissions");
  return { success: true };
}
