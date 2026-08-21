"use server";

import { getDb, admissions, NewAdmission } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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

export async function getAdmissions() {
  await requireAdmin();
  const db = await getDb();
  const rows = await db
    .select()
    .from(admissions)
    .orderBy(desc(admissions.createdAt));

  return rows.map((r) => ({
    ...r,
    selectedSubjects: typeof r.selectedSubjects === "string" ? JSON.parse(r.selectedSubjects || "[]") : r.selectedSubjects,
  }));
}

export async function submitPublicAdmissionAction(data: unknown) {
  const validated = admissionSchema.parse(data);
  const db = await getDb();

  const secureNum = Math.floor(1000 + Math.random() * 9000);
  const applicationId = `HIS-2026-${secureNum}`;

  const insertData: NewAdmission = {
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
  };

  await db.insert(admissions).values(insertData);

  // Trigger confirmation email
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Hinthar Admissions <admissions@hinthar.education>",
        to: validated.parentEmail,
        subject: `Admission Application Received [${applicationId}] — ${validated.studentName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0E3B7D;">Hinthar International School</h2>
            <p>Dear <strong>${validated.parentName || "Parent / Guardian"}</strong>,</p>
            <p>Thank you for submitting the admission application for <strong>${validated.studentName}</strong>.</p>
            <p>Your Application Reference ID is: <strong style="color: #0E3B7D;">${applicationId}</strong></p>
            <p>Target Program: <strong>${validated.grade}</strong></p>
            <p>Our Admissions Office will review your application and contact you within 24–48 business hours to schedule a diagnostic assessment.</p>
          </div>
        `,
      });
    }
  } catch (emailErr) {
    console.warn("Admission confirmation email error:", emailErr);
  }

  revalidatePath("/admin/admissions");
  return { success: true, applicationId };
}

export async function updateAdmissionStatusAction(
  id: string,
  status: "Pending" | "Assessment Scheduled" | "Approved" | "Declined",
  notes?: string,
  assessmentDate?: string
) {
  const user = await requireAdmin();
  const db = await getDb();

  await db
    .update(admissions)
    .set({
      status,
      notes: notes ?? undefined,
      assessmentDate: assessmentDate ?? undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(admissions.id, id));

  await logAudit({
    actor: user,
    action: `ADMIN_UPDATED_ADMISSION_STATUS_${status.toUpperCase().replace(/\s+/g, "_")}`,
    resource: "admissions",
    resourceId: id,
    details: { status, notes, assessmentDate },
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
