"use server";

import { getDb, admissions, type NewAdmission } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin, logAudit } from "@/lib/auth/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendAdmissionEmail } from "@/lib/email/email";
import { getAdmissionsConfig } from "@/lib/actions/siteContent";
import { DEFAULT_ADMISSIONS_CONFIG } from "@/lib/content/defaults";
import { validateAdmissionSubjects } from "@/lib/actions/academicCatalog";

const documentItemSchema = z.object({
  type: z.enum(["identity", "report", "photo"]),
  url: z.string().startsWith("/api/assets/admissions/"),
  filename: z.string().min(1).max(255),
});

const admissionSchema = z.object({
  studentName: z.string().trim().min(2).max(200),
  dateOfBirth: z.string().trim().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  nationality: z.string().trim().default("Myanmar").optional().nullable(),
  grade: z.string().trim().min(2),
  programLevel: z.enum(["lower_secondary", "igcse", "ial"]).optional().nullable(),
  targetProgramId: z.string().trim().max(100).optional().nullable(),
  finishedGrade: z.string().trim().max(80).optional().nullable(),
  suggestedEntryYear: z.string().trim().max(50).optional().nullable(),
  preferredRegion: z.enum(["Yangon", "Mawlamyine"]).optional().nullable(),
  academicStream: z.string().trim().optional().nullable(),
  selectedSubjects: z.array(z.string()).default([]),
  documentUrls: z.array(documentItemSchema).max(3).default([]),
  intendedStartTerm: z.string().trim().optional().nullable(),
  studyMode: z.string().trim().default("Full-Time On-Campus (Mon–Fri)").optional().nullable(),
  previousSchool: z.string().trim().optional().nullable(),
  parentName: z.string().trim().min(2).max(200),
  relationship: z.string().trim().default("Parent").optional().nullable(),
  parentEmail: z.string().trim().email(),
  parentPhone: z.string().trim().min(5),
  address: z.string().trim().optional().nullable(),
  emergencyContact: z.string().trim().optional().nullable(),
  medicalNotes: z.string().trim().optional().nullable(),
  howHeard: z.string().trim().default("School Website").optional().nullable(),
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

function parseDocuments(raw: unknown): z.infer<typeof documentItemSchema>[] {
  if (Array.isArray(raw)) return raw as z.infer<typeof documentItemSchema>[];
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

function safeRevalidate(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // Non-fatal
    }
  }
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
    documentUrls: parseDocuments(r.documentUrls),
  }));
}

function generateApplicationId(): string {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  const secureNum = 100000 + (random[0] % 900000);
  const year = new Date().getFullYear();
  return `HIS-${year}-${secureNum}`;
}

export async function submitPublicAdmissionAction(data: unknown) {
  const validatedResult = admissionSchema.safeParse(data);
  if (!validatedResult.success) {
    return {
      success: false as const,
      error: "Please check your student and guardian contact details and try again.",
      fieldErrors: validatedResult.error.flatten().fieldErrors,
    };
  }
  const validated = validatedResult.data;
  const config = await getAdmissionsConfig();

  // Enforce Admin-configurable required document rules
  const uploadedTypes = new Set(validated.documentUrls.map((d) => d.type));
  if (config.documentRules.identityRequired && !uploadedTypes.has("identity")) {
    return { success: false as const, error: "Please upload the Student Identity Document (Passport / NRC / Birth Certificate)." };
  }
  if (config.documentRules.reportRequired && !uploadedTypes.has("report")) {
    return { success: false as const, error: "Please upload the Latest School Report / Transcript." };
  }
  if (config.documentRules.photoRequired && !uploadedTypes.has("photo")) {
    return { success: false as const, error: "Please upload a Student Portrait Photo." };
  }

  const subjectCheck = await validateAdmissionSubjects(
    validated.targetProgramId,
    validated.selectedSubjects
  );
  if (!subjectCheck.ok) {
    return { success: false as const, error: subjectCheck.error };
  }

  const db = await getDb();

  let applicationId = "";
  let inserted = false;
  for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
    applicationId = generateApplicationId();
    try {
      await db.insert(admissions).values({
        id: applicationId,
        studentName: validated.studentName,
        dateOfBirth: validated.dateOfBirth || null,
        gender: validated.gender || null,
        nationality: validated.nationality || "Myanmar",
        grade: validated.grade,
        programLevel: validated.programLevel || null,
        targetProgramId: validated.targetProgramId || null,
        finishedGrade: validated.finishedGrade || null,
        suggestedEntryYear: validated.suggestedEntryYear || null,
        preferredRegion: validated.preferredRegion || null,
        academicStream: validated.academicStream || null,
        selectedSubjects: JSON.stringify(validated.selectedSubjects),
        documentUrls: JSON.stringify(validated.documentUrls),
        intendedStartTerm: validated.intendedStartTerm || config.intendedStartTerms[0],
        studyMode: validated.studyMode || DEFAULT_ADMISSIONS_CONFIG.studyModes[0],
        previousSchool: validated.previousSchool || null,
        parentName: validated.parentName,
        relationship: validated.relationship || "Parent",
        parentEmail: validated.parentEmail.toLowerCase(),
        parentPhone: validated.parentPhone,
        address: validated.address || null,
        emergencyContact: validated.emergencyContact || null,
        medicalNotes: validated.medicalNotes || null,
        howHeard: validated.howHeard || "School Website",
        submittedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: validated.medicalNotes ? `Applicant Notes: ${validated.medicalNotes}` : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      inserted = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("UNIQUE") && !msg.includes("constraint")) {
        throw err;
      }
    }
  }

  if (!inserted) {
    return { success: false as const, error: "Could not register the application. Please try again." };
  }

  const emailResult = await sendAdmissionEmail({
    type: "admission_submitted",
    recipientEmail: validated.parentEmail,
    recipientName: validated.parentName || undefined,
    studentName: validated.studentName,
    applicationId,
    grade: validated.grade,
    status: "Pending",
  });

  safeRevalidate(["/admin", "/admin/admissions"]);
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
    return { success: false as const, error: "Application not found." };
  }

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

  safeRevalidate(["/admin", "/admin/admissions"]);
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
    };
  }
  const validated = validatedResult.data;
  const db = await getDb();

  const updateData: Partial<NewAdmission> = {
    ...validated,
    selectedSubjects: validated.selectedSubjects ? JSON.stringify(validated.selectedSubjects) : undefined,
    documentUrls: validated.documentUrls ? JSON.stringify(validated.documentUrls) : undefined,
    updatedAt: new Date().toISOString(),
  };

  const updated = await db
    .update(admissions)
    .set(updateData)
    .where(eq(admissions.id, id))
    .returning({ id: admissions.id });

  if (!updated.length) {
    return { success: false as const, error: "Application not found." };
  }

  await logAudit({
    actor: user,
    action: "ADMIN_UPDATED_ADMISSION_DETAILS",
    resource: "admissions",
    resourceId: id,
  });

  safeRevalidate(["/admin", "/admin/admissions"]);
  return { success: true as const };
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
  safeRevalidate(["/admin", "/admin/admissions"]);
  return { success: true as const };
}

export interface AdmissionStatusView {
  applicationId: string;
  studentName: string;
  grade: string;
  status: "Pending" | "Assessment Scheduled" | "Approved" | "Declined";
  submittedDate: string;
  assessmentDate: string | null;
  updatedAt: string;
  academicStream?: string | null;
  intendedStartTerm?: string | null;
  studyMode?: string | null;
  selectedSubjects?: string[];
  parentName?: string | null;
}

const statusLookupSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^HIS-\d{4}-\d{4,6}$/, "Reference codes look like HIS-2026-123456."),
  parentEmail: z.string().trim().toLowerCase().email(),
});

const lookupAttempts = new Map<string, { count: number; resetAt: number }>();
const LOOKUP_LIMIT = 10;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = lookupAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    lookupAttempts.set(key, { count: 1, resetAt: now + LOOKUP_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LOOKUP_LIMIT;
}

export async function checkAdmissionStatusAction(
  data: unknown
): Promise<{ success: boolean; error?: string; application?: AdmissionStatusView }> {
  const parsed = statusLookupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please enter a valid reference code (e.g. HIS-2026-123456) and the guardian email used to apply.",
    };
  }

  const { applicationId, parentEmail } = parsed.data;

  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ip =
      h.get("cf-connecting-ip") ||
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      "unknown";
    if (isRateLimited(`${ip}:${applicationId}`)) {
      return { success: false, error: "Too many lookup attempts. Please try again in a few minutes." };
    }
  } catch {
    // Non-request context fallback
  }

  const db = await getDb();
  const rows = await db
    .select({
      applicationId: admissions.id,
      studentName: admissions.studentName,
      grade: admissions.grade,
      status: admissions.status,
      submittedDate: admissions.submittedDate,
      assessmentDate: admissions.assessmentDate,
      updatedAt: admissions.updatedAt,
      parentEmail: admissions.parentEmail,
      academicStream: admissions.academicStream,
      intendedStartTerm: admissions.intendedStartTerm,
      studyMode: admissions.studyMode,
      selectedSubjects: admissions.selectedSubjects,
      parentName: admissions.parentName,
    })
    .from(admissions)
    .where(eq(admissions.id, applicationId))
    .limit(1);

  const row = rows[0];
  if (!row || row.parentEmail?.trim().toLowerCase() !== parentEmail) {
    return {
      success: false,
      error: "No application found matching that reference code and guardian email.",
    };
  }

  const statusParsed = z
    .enum(["Pending", "Assessment Scheduled", "Approved", "Declined"])
    .safeParse(row.status);

  return {
    success: true,
    application: {
      applicationId: row.applicationId,
      studentName: row.studentName,
      grade: row.grade,
      status: statusParsed.success ? statusParsed.data : "Pending",
      submittedDate: row.submittedDate,
      assessmentDate: row.assessmentDate ?? null,
      updatedAt: row.updatedAt,
      academicStream: row.academicStream ?? null,
      intendedStartTerm: row.intendedStartTerm ?? null,
      studyMode: row.studyMode ?? null,
      selectedSubjects: parseSubjects(row.selectedSubjects),
      parentName: row.parentName ?? null,
    },
  };
}
