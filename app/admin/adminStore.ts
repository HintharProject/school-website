"use client";

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
  programLevel?: string;
  academicStream?: string;
  selectedSubjects?: string[];
  intendedStartTerm?: string;
  studyMode?: string;
  previousSchool?: string;
  parentName?: string;
  relationship?: string;
  parentEmail: string;
  parentPhone: string;
  address?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  howHeard?: string;
  submittedDate: string;
  status: ApplicationStatus;
  assessmentDate?: string;
  notes?: string;
}

export function mapAdmissionRecord(d: any): AdmissionApplication {
  let subjects: string[] = [];
  if (Array.isArray(d.selectedSubjects || d.selected_subjects)) {
    subjects = d.selectedSubjects || d.selected_subjects;
  } else if (typeof (d.selectedSubjects || d.selected_subjects) === "string") {
    try {
      subjects = JSON.parse(d.selectedSubjects || d.selected_subjects);
    } catch {
      subjects = [];
    }
  }

  return {
    id: d.id,
    studentName: d.studentName || d.student_name || "Applicant",
    dateOfBirth: d.dateOfBirth ?? d.date_of_birth ?? undefined,
    gender: (d.gender ?? undefined) as "Male" | "Female" | "Other" | undefined,
    nationality: d.nationality ?? undefined,
    grade: d.grade || "IGCSE",
    programLevel: d.programLevel ?? d.program_level ?? undefined,
    academicStream: d.academicStream ?? d.academic_stream ?? undefined,
    selectedSubjects: subjects,
    intendedStartTerm: d.intendedStartTerm ?? d.intended_start_term ?? undefined,
    studyMode: d.studyMode ?? d.study_mode ?? undefined,
    previousSchool: d.previousSchool ?? d.previous_school ?? undefined,
    parentName: d.parentName ?? d.parent_name ?? undefined,
    relationship: d.relationship ?? undefined,
    parentEmail: d.parentEmail || d.parent_email || "",
    parentPhone: d.parentPhone || d.parent_phone || "",
    address: d.address ?? undefined,
    emergencyContact: d.emergencyContact ?? d.emergency_contact ?? undefined,
    medicalNotes: d.medicalNotes ?? d.medical_notes ?? undefined,
    howHeard: d.howHeard ?? d.how_heard ?? undefined,
    submittedDate: d.submittedDate || d.submitted_date || d.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
    status: (d.status as ApplicationStatus) || "Pending",
    assessmentDate: d.assessmentDate ?? d.assessment_date ?? undefined,
    notes: d.notes ?? undefined,
  };
}

// ── YEARBOOK SCHOLAR (camelCase UI type) ──────────────────────────────────────
export interface YearbookScholar {
  id: number;
  name: string;
  category: "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions";
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
    badge: d.badge ?? undefined,
    campus: d.campus ?? "both-campuses",
    status: d.status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    reviewerNotes: d.reviewerNotes ?? d.reviewer_notes,
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
  isActive?: boolean;
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
    room: d.room ?? undefined,
    credits: d.credits ?? "Core",
    description: d.description ?? undefined,
    isActive: typeof d.isActive === "boolean" ? d.isActive : typeof d.is_active === "boolean" ? d.is_active : true,
  };
}

// ── BULLETIN NOTICE (camelCase UI type) ───────────────────────────────────────
export interface BulletinNotice {
  id: number;
  title: string;
  date: string;
  type: "Official Notice" | "Academic" | "General";
  content: string;
  isPinned?: boolean;
}

export function mapBulletinRecord(d: any): BulletinNotice {
  return {
    id: Number(d.id),
    title: d.title,
    date: d.date,
    type: d.type,
    content: d.content,
    isPinned: typeof d.isPinned === "boolean" ? d.isPinned : typeof d.is_pinned === "boolean" ? d.is_pinned : false,
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
  isActive?: boolean;
}

export function mapClubRecord(d: any): ClubItem {
  return {
    id: Number(d.id),
    name: d.name,
    category: d.category,
    icon: d.icon || "groups",
    members: d.members || "25+ Scholars",
    meetingTime: d.meetingTime || d.meeting_time || "",
    leadership: d.leadership || "",
    description: d.description || "",
    image: d.image || "/images/engineering.avif",
    campus: d.campus || "both-campuses",
    status: d.status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    isActive: typeof d.isActive === "boolean" ? d.isActive : typeof d.is_active === "boolean" ? d.is_active : true,
  };
}

// ── ACTIVITY ITEM (camelCase UI type) ─────────────────────────────────────────
export interface ActivityItem {
  id: number;
  clubId?: number;
  title: string;
  category: "academic" | "sports" | "cultural" | "science";
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  description: string;
  image: string;
  status: "Upcoming" | "Active Registration" | "Past Highlight";
  campus?: string;
  featured?: boolean;
  reviewStatus?: "published" | "pending_review" | "archived";
  submittedBy?: string;
  isActive?: boolean;
}

export function mapActivityRecord(d: any): ActivityItem {
  return {
    id: Number(d.id),
    clubId: d.clubId ? Number(d.clubId) : d.club_id ? Number(d.club_id) : undefined,
    title: d.title,
    category: d.category || "academic",
    date: d.date || "",
    month: d.month || "",
    day: d.day || "",
    time: d.time || "",
    location: d.location || "",
    description: d.description || "",
    image: d.image || "/images/engineering.avif",
    status: d.status || "Upcoming",
    campus: d.campus || "both-campuses",
    featured: typeof d.featured === "boolean" ? d.featured : false,
    reviewStatus: d.reviewStatus || d.review_status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
  };
}

// ── CAMPUS RECORD ─────────────────────────────────────────────────────────────
export interface CampusRecord {
  id: string;
  name: string;
  nameMy?: string;
  city: "Yangon" | "Mawlamyine";
  tagline: string;
  taglineMy?: string;
  address: string;
  addressMy?: string;
  phone: string;
  email: string;
  officeHours: string;
  gradesServed: string;
  facilities: string[];
  imageUrl: string;
  mapUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function mapCampusRecord(d: any): CampusRecord {
  let facs: string[] = [];
  if (Array.isArray(d.facilities)) {
    facs = d.facilities;
  } else if (typeof d.facilities === "string") {
    try {
      facs = JSON.parse(d.facilities);
    } catch {
      facs = [];
    }
  }

  return {
    id: d.id,
    name: d.name,
    nameMy: d.nameMy || d.name_my || undefined,
    city: d.city,
    tagline: d.tagline || "",
    taglineMy: d.taglineMy || d.tagline_my || undefined,
    address: d.address || "",
    addressMy: d.addressMy || d.address_my || undefined,
    phone: d.phone || "",
    email: d.email || "",
    officeHours: d.officeHours || d.office_hours || "Mon–Sat: 08:30 AM – 05:00 PM",
    gradesServed: d.gradesServed || d.grades_served || "",
    facilities: facs,
    imageUrl: d.imageUrl || d.image_url || "/images/g2.jpg",
    mapUrl: d.mapUrl || d.map_url || undefined,
    isActive: typeof d.isActive === "boolean" ? d.isActive : typeof d.is_active === "boolean" ? d.is_active : true,
    createdAt: d.createdAt || d.created_at,
    updatedAt: d.updatedAt || d.updated_at,
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
export type UserRole = "admin" | "student" | "principal" | "staff_admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "student";
  roleLabel: string;
  title: string;
  campusId: string;
  grade?: string;
  initials: string;
  badgeColor: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}

// Pre-session placeholder. Deliberately NOT an admin: privileged UI must only
// appear once the real session confirms the user's role.
export const FALLBACK_GUEST_USER: UserProfile = {
  id: "guest",
  email: "",
  fullName: "Signed Out",
  role: "student",
  roleLabel: "Guest",
  title: "",
  campusId: "ywarma-campus",
  initials: "?",
  badgeColor: "bg-slate-200 text-slate-600",
  status: "active",
  createdAt: "",
};

export function mapUserProfileRecord(d: any): UserProfile {
  const isAdm = d.role === "admin" || d.role === "principal" || d.role === "staff_admin";
  const normalizedRole: "admin" | "student" = isAdm ? "admin" : "student";

  const roleLabels: Record<string, string> = {
    admin: "School Administrator",
    principal: "School Principal & Founder",
    staff_admin: "Staff Administrator",
    student: "Student Contributor",
  };
  const badgeColors: Record<string, string> = {
    admin: "bg-[#FFC700] text-[#09234B]",
    principal: "bg-[#FFC700] text-[#09234B]",
    staff_admin: "bg-[#0E3B7D] text-white",
    student: "bg-emerald-600 text-white",
  };

  const fullName = d.name || d.fullName || d.full_name || d.email || "School Staff";
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
    role: normalizedRole,
    roleLabel: roleLabels[d.role] || (isAdm ? "Administrator" : "Student Contributor"),
    title: d.title || (isAdm ? "Administrator" : "Student Contributor"),
    campusId: d.campusId || d.campus_id || "ywarma-campus",
    grade: d.grade ?? undefined,
    initials,
    badgeColor: badgeColors[d.role] || (isAdm ? "bg-[#FFC700] text-[#09234B]" : "bg-emerald-600 text-white"),
    status: d.status === "inactive" || d.status === "suspended" ? d.status : "active",
    createdAt: typeof d.createdAt === "string" ? d.createdAt.split("T")[0] : d.createdAt ? new Date(d.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };
}
