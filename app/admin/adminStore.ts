"use client";

import { CampusRecord } from "@/lib/supabase/types";

// ── APPLICATION STATUS ────────────────────────────────────────────────────────
export type ApplicationStatus = "Pending" | "Assessment Scheduled" | "Approved" | "Declined";

// ── ADMISSION APPLICATION (camelCase UI type) ─────────────────────────────────
export interface AdmissionApplication {
  id: string;
  studentName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  nationality?: string;
  grade: string;
  academicStream?: string;
  selectedSubjects?: string[];
  previousSchool?: string;
  parentName?: string;
  parentEmail: string;
  parentPhone: string;
  address?: string;
  medicalNotes?: string;
  submittedDate: string;
  status: ApplicationStatus;
  assessmentDate?: string;
  notes?: string;
}

// Map from DB snake_case AdmissionRecord to UI camelCase AdmissionApplication
export function mapAdmissionRecord(d: any): AdmissionApplication {
  return {
    id: d.id,
    studentName: d.student_name,
    dateOfBirth: d.date_of_birth ?? undefined,
    gender: (d.gender ?? undefined) as "Male" | "Female" | "Other" | undefined,
    nationality: d.nationality ?? undefined,
    grade: d.grade,
    academicStream: d.academic_stream ?? undefined,
    selectedSubjects: d.selected_subjects ?? undefined,
    previousSchool: d.previous_school ?? undefined,
    parentName: d.parent_name ?? undefined,
    parentEmail: d.parent_email,
    parentPhone: d.parent_phone,
    address: d.address ?? undefined,
    medicalNotes: d.medical_notes ?? undefined,
    submittedDate: d.submitted_date || d.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    status: d.status as ApplicationStatus,
    assessmentDate: d.assessment_date ?? undefined,
    notes: d.notes ?? undefined,
  };
}

// ── YEARBOOK SCHOLAR (camelCase UI type) ──────────────────────────────────────
export interface YearbookScholar {
  id: number;
  name: string;
  category: "Class of 2026" | "Class of 2025" | "Class of 2024";
  role: string;
  destination: string;
  subjects: string;
  quote: string;
  image: string;
  badge?: string;
  campus?: string;
  status?: "published" | "pending_review" | "archived";
  submittedBy?: string;
  submittedByName?: string;
  reviewerNotes?: string;
}

// Map from DB snake_case to UI type
export function mapYearbookRecord(d: any): YearbookScholar {
  return {
    id: Number(d.id),
    name: d.name,
    category: d.category,
    role: d.role || "",
    destination: d.destination || "",
    subjects: d.subjects || "",
    quote: d.quote || "",
    image: d.image || "/images/g5.jpg",
    badge: d.badge,
    campus: d.campus,
    status: d.status || "published",
    submittedBy: d.submitted_by,
    reviewerNotes: d.reviewer_notes,
  };
}

// ── COURSE ITEM (camelCase UI type) ───────────────────────────────────────────
export interface CourseItem {
  id: string;
  name: string;
  code: string;
  grade: "Lower Secondary (Year 7–9)" | "Pearson IGCSE" | "Pearson IAL";
  category: "STEM" | "Business" | "Computing" | "Languages";
  time: string;
  instructor: string;
  room?: string;
  credits?: string;
  description?: string;
  is_active?: boolean;
}

export function mapCourseRecord(d: any): CourseItem {
  return {
    id: d.id,
    name: d.name,
    code: d.code || "",
    grade: d.grade,
    category: d.category,
    time: d.time || "",
    instructor: d.instructor || "",
    room: d.room,
    credits: d.credits,
    description: d.description,
    is_active: d.is_active,
  };
}

// ── BULLETIN NOTICE (camelCase UI type) ───────────────────────────────────────
export interface BulletinNotice {
  id: number;
  title: string;
  date: string;
  type: "Official Notice" | "Academic" | "General";
  content: string;
  is_pinned?: boolean;
}

export function mapBulletinRecord(d: any): BulletinNotice {
  return {
    id: Number(d.id),
    title: d.title,
    date: d.date,
    type: d.type,
    content: d.content,
    is_pinned: d.is_pinned,
  };
}

// ── CLUB ITEM (camelCase UI type) ─────────────────────────────────────────────
export interface ClubItem {
  id: number;
  name: string;
  category: "STEM & Tech" | "Academic & Debate" | "STEM & Science" | "Creative Arts" | "Sports & Fitness";
  icon: string;
  members: string;
  meetingTime: string;
  leadership: string;
  description: string;
  image: string;
  campus?: string;
  status?: "published" | "pending_review" | "archived";
  submittedBy?: string;
  submittedByName?: string;
  is_active?: boolean;
}

export function mapClubRecord(d: any): ClubItem {
  return {
    id: Number(d.id),
    name: d.name,
    category: d.category,
    icon: d.icon || "groups",
    members: d.members || "25+ Members",
    meetingTime: d.meeting_time || "",
    leadership: d.leadership || "",
    description: d.description || "",
    image: d.image || "/images/engineering.avif",
    campus: d.campus || "both-campuses",
    status: d.status || "published",
    submittedBy: d.submitted_by,
    is_active: d.is_active,
  };
}

// ── CAMPUS OPTION ─────────────────────────────────────────────────────────────
export interface CampusOption {
  id: string;
  label: string;
  city: "Yangon" | "Mawlamyine" | "Both";
  scope: "branch" | "city_wide" | "all_campuses";
}

export const HIERARCHICAL_CAMPUS_OPTIONS: CampusOption[] = [
  { id: "ywarma-campus", label: "Yangon — Ywarma Campus (Flagship Academic Center)", city: "Yangon", scope: "branch" },
  { id: "shwe-padauk-campus", label: "Yangon — Shwe Padauk Campus (Senior STEM & Robotics Lab)", city: "Yangon", scope: "branch" },
  { id: "shwe-pone-nyet-campus", label: "Yangon — Shwe Pone Nyet Campus (Junior & Creative Arts)", city: "Yangon", scope: "branch" },
  { id: "yangon-all", label: "Yangon — All Yangon Branches (City-wide)", city: "Yangon", scope: "city_wide" },
  { id: "mawlamyine-campus", label: "Mawlamyine — Mawlamyine Regional Campus", city: "Mawlamyine", scope: "branch" },
  { id: "both-campuses", label: "Both — Yangon & Mawlamyine (Dual Campus Network)", city: "Both", scope: "all_campuses" },
];

export function formatCampusBadge(campusIdOrCity?: string): {
  city: "Yangon" | "Mawlamyine" | "Both";
  label: string;
  badgeClass: string;
} {
  const key = (campusIdOrCity || "yangon-all").toLowerCase().trim();
  if (key.includes("both") || key === "all-campuses" || key === "both-campuses" || key === "dual") {
    return {
      city: "Both",
      label: "Yangon & Mawlamyine (Both)",
      badgeClass: "bg-purple-100 text-purple-800 border border-purple-200",
    };
  }
  if (key.includes("mawlamyine")) {
    return {
      city: "Mawlamyine",
      label: "Mawlamyine Campus",
      badgeClass: "bg-amber-100 text-amber-900 border border-amber-300",
    };
  }
  if (key === "ywarma-campus" || key === "ywarma") {
    return {
      city: "Yangon",
      label: "Yangon (Ywarma)",
      badgeClass: "bg-blue-100 text-[#0E3B7D] border border-blue-200",
    };
  }
  if (key === "shwe-padauk-campus" || key === "shwe padauk") {
    return {
      city: "Yangon",
      label: "Yangon (Shwe Padauk)",
      badgeClass: "bg-blue-100 text-[#0E3B7D] border border-blue-200",
    };
  }
  if (key === "shwe-pone-nyet-campus" || key === "shwe pone nyet") {
    return {
      city: "Yangon",
      label: "Yangon (Shwe Pone Nyet)",
      badgeClass: "bg-blue-100 text-[#0E3B7D] border border-blue-200",
    };
  }
  return {
    city: "Yangon",
    label: "Yangon Campuses",
    badgeClass: "bg-blue-100 text-[#0E3B7D] border border-blue-200",
  };
}

// ── USER PROFILE ──────────────────────────────────────────────────────────────
export type UserRole = "principal" | "staff_admin" | "student";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  campusId: string;
  grade?: string;
  initials: string;
  badgeColor: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const FALLBACK_GUEST_USER: UserProfile = {
  id: "principal-master",
  email: "kaungmyat.htut@gmail.com",
  fullName: "Dr. Kaung Myat Htut",
  role: "principal",
  roleLabel: "School Principal & Founder",
  title: "Principal & Chief Academic Officer",
  campusId: "ywarma-campus",
  initials: "KM",
  badgeColor: "bg-[#FFC700] text-[#09234B]",
  status: "active",
  createdAt: "2026-08-01",
};

// Map DB profile row to UI UserProfile
export function mapUserProfileRecord(d: any): UserProfile {
  const roleLabels: Record<string, string> = {
    principal: "School Principal & Founder",
    staff_admin: "Staff Administrator",
    student: "Student Contributor",
  };
  const badgeColors: Record<string, string> = {
    principal: "bg-[#FFC700] text-[#09234B]",
    staff_admin: "bg-[#0E3B7D] text-white",
    student: "bg-emerald-600 text-white",
  };
  const fullName = d.full_name || d.email || "School Staff";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "HIS";

  return {
    id: d.id,
    email: d.email,
    fullName,
    role: d.role as UserRole,
    roleLabel: roleLabels[d.role] || "Staff Member",
    title: d.title || roleLabels[d.role] || "Faculty Staff",
    campusId: d.campus_id || "ywarma-campus",
    grade: d.grade,
    initials,
    badgeColor: badgeColors[d.role] || "bg-[#0E3B7D] text-white",
    status: d.status === "inactive" ? "inactive" : "active",
    createdAt: d.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
  };
}

export type AdminRoleUser = UserProfile;

export function hasPermission(
  role: UserRole,
  action: "manage_users" | "create_staff" | "create_students" | "manage_campuses" | "manage_admissions" | "review_yearbook" | "submit_yearbook" | "manage_classes" | "manage_clubs"
): boolean {
  switch (role) {
    case "principal":
      return true;
    case "staff_admin":
      return [
        "manage_users",
        "create_students",
        "manage_admissions",
        "review_yearbook",
        "submit_yearbook",
        "manage_classes",
        "manage_clubs",
      ].includes(action);
    case "student":
      return ["submit_yearbook", "manage_clubs"].includes(action);
    default:
      return false;
  }
}
