"use client";

/* eslint-disable @typescript-eslint/no-explicit-any -- Normalizers bridge D1/Drizzle and Better Auth records cleanly */

import { parseGalleryUrls } from "@/lib/campuses/images";

export type ApplicationStatus =
  | "Pending"
  | "Assessment Scheduled"
  | "Approved"
  | "Declined";

export interface AdmissionApplication {
  id: string;
  studentName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  nationality?: string;
  grade: string;
  programLevel?: string;
  targetProgramId?: string;
  finishedGrade?: string;
  suggestedEntryYear?: string;
  preferredRegion?: "Yangon" | "Mawlamyine";
  academicStream?: string;
  selectedSubjects?: string[];
  documentUrls?: {
    type: "identity" | "report" | "photo";
    url: string;
    filename: string;
  }[];
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

  let documents = d.documentUrls || d.document_urls || [];
  if (typeof documents === "string") {
    try {
      documents = JSON.parse(documents);
    } catch {
      documents = [];
    }
  }

  return {
    id: d.id,
    studentName: d.studentName || d.student_name || "Applicant",
    dateOfBirth: d.dateOfBirth ?? d.date_of_birth ?? undefined,
    gender: (d.gender ?? undefined) as "Male" | "Female" | "Other" | undefined,
    nationality: d.nationality ?? undefined,
    grade: d.grade || "Pearson Edexcel IGCSE",
    programLevel: d.programLevel ?? d.program_level ?? undefined,
    targetProgramId: d.targetProgramId ?? d.target_program_id ?? undefined,
    finishedGrade: d.finishedGrade ?? d.finished_grade ?? undefined,
    suggestedEntryYear:
      d.suggestedEntryYear ?? d.suggested_entry_year ?? undefined,
    preferredRegion: d.preferredRegion ?? d.preferred_region ?? undefined,
    academicStream: d.academicStream ?? d.academic_stream ?? undefined,
    selectedSubjects: subjects,
    documentUrls: Array.isArray(documents) ? documents : [],
    intendedStartTerm:
      d.intendedStartTerm ?? d.intended_start_term ?? undefined,
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
    submittedDate:
      d.submittedDate ||
      d.submitted_date ||
      d.createdAt?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
    status: (d.status as ApplicationStatus) || "Pending",
    assessmentDate: d.assessmentDate ?? d.assessment_date ?? undefined,
    notes: d.notes ?? undefined,
  };
}

export interface YearbookScholar {
  id: number;
  name: string;
  batchId: string;
  batchName: string;
  batchRegion: "Yangon" | "Mawlamyine";
  role: string;
  roleMy?: string;
  destination: string;
  subjects: string;
  quote: string;
  quoteMy?: string;
  image: string;
  badge?: string;
  badgeMy?: string;
  campus?: string;
  status?: "published" | "pending_review" | "archived";
  submittedBy?: string;
  reviewerNotes?: string;
}

export function mapYearbookRecord(d: any): YearbookScholar {
  return {
    id: Number(d.id),
    name: d.name,
    batchId: d.batchId ?? d.batch_id ?? "",
    batchName: d.batchName ?? d.batch_name ?? d.category ?? "Yearbook",
    batchRegion: (d.batchRegion ?? d.batch_region ?? "Yangon") as
      | "Yangon"
      | "Mawlamyine",
    role: d.role || "",
    roleMy: d.roleMy ?? d.role_my ?? undefined,
    destination: d.destination || "",
    subjects: d.subjects || "",
    quote: d.quote || "",
    quoteMy: d.quoteMy ?? d.quote_my ?? undefined,
    image: d.image || "/images/g5.jpg",
    badge: d.badge ?? undefined,
    badgeMy: d.badgeMy ?? d.badge_my ?? undefined,
    campus: d.campus ?? "both-campuses",
    status: d.status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    reviewerNotes: d.reviewerNotes ?? d.reviewer_notes,
  };
}

export interface ClubItem {
  id: number;
  name: string;
  category:
    | "STEM & Tech"
    | "Academic & Debate"
    | "STEM & Science"
    | "Creative Arts"
    | "Sports & Fitness";
  icon: string;
  members: string;
  meetingTime: string;
  meetingTimeMy?: string;
  leadership: string;
  leadershipMy?: string;
  description: string;
  descriptionMy?: string;
  image: string;
  galleryUrls?: string[];
  campus?: string;
  status?: "published" | "pending_review" | "archived";
  submittedBy?: string;
  isActive?: boolean;
}

export function mapClubRecord(d: any): ClubItem {
  const gallery = d.galleryUrls ?? d.gallery_urls ?? [];
  return {
    id: Number(d.id),
    name: d.name,
    category: d.category,
    icon: d.icon || "users",
    members: d.members || "25+ Scholars",
    meetingTime: d.meetingTime || d.meeting_time || "",
    meetingTimeMy: d.meetingTimeMy ?? d.meeting_time_my ?? undefined,
    leadership: d.leadership || "",
    leadershipMy: d.leadershipMy ?? d.leadership_my ?? undefined,
    description: d.description || "",
    descriptionMy: d.descriptionMy ?? d.description_my ?? undefined,
    image: d.image || "/images/engineering.avif",
    galleryUrls: Array.isArray(gallery)
      ? gallery
      : (() => {
          try {
            return JSON.parse(gallery);
          } catch {
            return [];
          }
        })(),
    campus: d.campus || "both-campuses",
    status: d.status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    isActive:
      typeof d.isActive === "boolean"
        ? d.isActive
        : typeof d.is_active === "boolean"
          ? d.is_active
          : true,
  };
}

export interface ActivityItem {
  id: number;
  clubId?: number;
  title: string;
  titleMy?: string;
  category: "academic" | "sports" | "cultural" | "science";
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  locationMy?: string;
  description: string;
  descriptionMy?: string;
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
    clubId: d.clubId
      ? Number(d.clubId)
      : d.club_id
        ? Number(d.club_id)
        : undefined,
    title: d.title,
    titleMy: d.titleMy ?? d.title_my ?? undefined,
    category: d.category || "academic",
    date: d.date || "",
    month: d.month || "",
    day: d.day || "",
    time: d.time || "",
    location: d.location || "",
    locationMy: d.locationMy ?? d.location_my ?? undefined,
    description: d.description || "",
    descriptionMy: d.descriptionMy ?? d.description_my ?? undefined,
    image: d.image || "/images/engineering.avif",
    status: d.status || "Upcoming",
    campus: d.campus || "both-campuses",
    featured: typeof d.featured === "boolean" ? d.featured : false,
    reviewStatus: d.reviewStatus || d.review_status || "published",
    submittedBy: d.submittedBy ?? d.submitted_by,
    isActive: typeof d.isActive === "boolean" ? d.isActive : true,
  };
}

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
  gradesServed: string;
  gradesServedMy?: string;
  facilitiesEn?: string[];
  facilitiesMy?: string[];
  imageUrl: string;
  galleryUrls?: string[];
  mapUrl?: string;
  sortOrder?: number;
  isActive: boolean;
}

function parseJsonStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapCampusRecord(d: any): CampusRecord {
  return {
    id: d.id,
    name: d.name,
    nameMy: d.nameMy || d.name_my || undefined,
    city: d.city === "Mawlamyine" ? "Mawlamyine" : "Yangon",
    tagline: d.tagline || "",
    taglineMy: d.taglineMy || d.tagline_my || undefined,
    address: d.address || "",
    addressMy: d.addressMy || d.address_my || undefined,
    phone: d.phone || "",
    email: d.email || "",
    gradesServed: d.gradesServed || d.grades_served || "",
    gradesServedMy: d.gradesServedMy || d.grades_served_my || undefined,
    facilitiesEn: parseJsonStringList(d.facilitiesEn ?? d.facilities_en),
    facilitiesMy: parseJsonStringList(d.facilitiesMy ?? d.facilities_my),
    imageUrl: d.imageUrl || d.image_url || "/images/g2.jpg",
    galleryUrls: parseGalleryUrls(d.galleryUrls ?? d.gallery_urls),
    mapUrl: d.mapUrl || d.map_url || undefined,
    sortOrder: Number(d.sortOrder ?? d.sort_order ?? 0),
    isActive:
      typeof d.isActive === "boolean"
        ? d.isActive
        : typeof d.is_active === "boolean"
          ? d.is_active
          : true,
  };
}

export interface CampusOption {
  id: string;
  label: string;
  city: "Yangon" | "Mawlamyine" | "Both";
  scope: "branch" | "city_wide" | "all_campuses";
}

export const HIERARCHICAL_CAMPUS_OPTIONS: CampusOption[] = [
  {
    id: "ywarma-campus",
    label: "Yangon — Ywarma Campus (Flagship Centre)",
    city: "Yangon",
    scope: "branch",
  },
  {
    id: "shwe-padauk-campus",
    label: "Yangon — Shwe Padauk Campus (STEM & Robotics)",
    city: "Yangon",
    scope: "branch",
  },
  {
    id: "shwe-pone-nyet-campus",
    label: "Yangon — Shwe Pone Nyet Campus (Lower Secondary)",
    city: "Yangon",
    scope: "branch",
  },
  {
    id: "yangon-all",
    label: "Yangon — All Yangon Campuses",
    city: "Yangon",
    scope: "city_wide",
  },
  {
    id: "mawlamyine-campus",
    label: "Mawlamyine — Mawlamyine Campus",
    city: "Mawlamyine",
    scope: "branch",
  },
  {
    id: "both-campuses",
    label: "Both — Yangon & Mawlamyine Network",
    city: "Both",
    scope: "all_campuses",
  },
];

export function formatCampusBadge(campusIdOrCity?: string): {
  city: "Yangon" | "Mawlamyine" | "Both";
  label: string;
  badgeClass: string;
} {
  const key = (campusIdOrCity || "yangon-all").toLowerCase().trim();
  if (
    key.includes("both") ||
    key === "all-campuses" ||
    key === "both-campuses" ||
    key === "dual"
  ) {
    return {
      city: "Both",
      label: "Yangon & Mawlamyine",
      badgeClass: "bg-indigo-50 text-indigo-800 border border-indigo-200",
    };
  }
  if (key.includes("mawlamyine")) {
    return {
      city: "Mawlamyine",
      label: "Mawlamyine",
      badgeClass: "bg-[#FFFBE6] text-[#162033] border border-[#FFD600]",
    };
  }
  if (key === "ywarma-campus" || key === "ywarma") {
    return {
      city: "Yangon",
      label: "Yangon (Ywarma)",
      badgeClass: "bg-[#EEF3FC] text-[#193E8A] border border-[#193E8A]/20",
    };
  }
  if (key === "shwe-padauk-campus" || key === "shwe padauk") {
    return {
      city: "Yangon",
      label: "Yangon (Shwe Padauk)",
      badgeClass: "bg-[#EEF3FC] text-[#193E8A] border border-[#193E8A]/20",
    };
  }
  if (key === "shwe-pone-nyet-campus" || key === "shwe pone nyet") {
    return {
      city: "Yangon",
      label: "Yangon (Shwe Pone Nyet)",
      badgeClass: "bg-[#EEF3FC] text-[#193E8A] border border-[#193E8A]/20",
    };
  }
  return {
    city: "Yangon",
    label: "Yangon Campuses",
    badgeClass: "bg-[#EEF3FC] text-[#193E8A] border border-[#193E8A]/20",
  };
}

export type UserRole = "admin" | "student";

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
  const isAdm =
    d.role === "admin" || d.role === "principal" || d.role === "staff_admin";
  const normalizedRole: "admin" | "student" = isAdm ? "admin" : "student";

  const fullName =
    d.name || d.fullName || d.full_name || d.email || "School Member";
  const initials =
    fullName
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
    roleLabel: isAdm ? "School Administrator" : "Student Contributor",
    title: d.title || (isAdm ? "School Administrator" : "Student Contributor"),
    campusId: d.campusId || d.campus_id || "ywarma-campus",
    grade: d.grade ?? undefined,
    initials,
    badgeColor: isAdm
      ? "bg-[#FFD600] text-[#162033]"
      : "bg-emerald-600 text-white",
    status:
      d.status === "inactive" || d.status === "suspended" ? d.status : "active",
    createdAt:
      typeof d.createdAt === "string"
        ? d.createdAt.split("T")[0]
        : d.createdAt
          ? new Date(d.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
  };
}
