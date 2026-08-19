"use client";

import { CampusRecord } from "@/lib/supabase/types";

export type ApplicationStatus = "Pending" | "Assessment Scheduled" | "Approved" | "Declined";

export interface AdmissionApplication {
  id: string;
  studentName: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  grade: string;
  previousSchool?: string;
  parentName?: string;
  parentEmail: string;
  parentPhone: string;
  submittedDate: string;
  status: ApplicationStatus;
  assessmentDate?: string;
  notes?: string;
}

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

export interface CourseItem {
  id: string;
  name: string;
  code: string;
  grade: "Lower Secondary (Year 7–9)" | "Pearson IGCSE" | "Pearson IAL";
  category: "STEM" | "Business" | "Computing" | "Languages";
  time: string;
  instructor: string;
  room?: string;
}

export interface BulletinNotice {
  id: number;
  title: string;
  date: string;
  type: "Official Notice" | "Academic" | "General";
  content: string;
}

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
}

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

export const INITIAL_USER_ACCOUNTS: UserProfile[] = [FALLBACK_GUEST_USER];
export type AdminRoleUser = UserProfile;
export const ADMIN_ROLES: UserProfile[] = [FALLBACK_GUEST_USER];

export const initialApplications: AdmissionApplication[] = [];
export const initialYearbook: YearbookScholar[] = [];
export const initialCourses: CourseItem[] = [];
export const initialAnnouncements: BulletinNotice[] = [];
export const initialClubs: ClubItem[] = [];

// Helper Functions for LocalStorage Persistence
const STORAGE_KEYS = {
  USERS: "his_admin_users_v2",
  CAMPUSES: "his_admin_campuses_v2",
  APPLICATIONS: "his_admin_applications_v2",
  YEARBOOK: "his_admin_yearbook_v2",
  COURSES: "his_admin_courses_v2",
  BULLETINS: "his_admin_bulletins_v2",
  CLUBS: "his_admin_clubs_v2",
  ACTIVE_ROLE: "his_admin_active_role_v2",
};

// Purge any legacy v1 demo caches from client browsers
export function purgeLegacyStorageCaches() {
  if (typeof window === "undefined") return;
  try {
    const legacyKeys = [
      "his_admin_users_v1",
      "his_admin_applications_v1",
      "his_admin_yearbook_v1",
      "his_admin_clubs_v1",
      "his_admin_courses_v1",
      "his_admin_bulletins_v1",
      "his_admin_campuses_v1",
      "his_admin_active_role_v1",
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
}

if (typeof window !== "undefined") {
  purgeLegacyStorageCaches();
}

export function getStoredUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredUsers(users: UserProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent("his_users_updated"));
}

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

export function getStoredCampuses(): CampusRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPUSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredCampuses(campuses: CampusRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CAMPUSES, JSON.stringify(campuses));
  window.dispatchEvent(new CustomEvent("his_campuses_updated"));
}

export function getStoredApplications(): AdmissionApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredApplications(apps: AdmissionApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  window.dispatchEvent(new CustomEvent("his_applications_updated"));
}

export function getStoredYearbook(): YearbookScholar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YEARBOOK);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredYearbook(entries: YearbookScholar[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.YEARBOOK, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent("his_yearbook_updated"));
}

export function getStoredCourses(): CourseItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredCourses(courses: CourseItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  window.dispatchEvent(new CustomEvent("his_courses_updated"));
}

export function getStoredBulletins(): BulletinNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BULLETINS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredBulletins(bulletins: BulletinNotice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(bulletins));
  window.dispatchEvent(new CustomEvent("his_bulletins_updated"));
}

export function getStoredClubs(): ClubItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUBS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredClubs(clubs: ClubItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  window.dispatchEvent(new CustomEvent("his_clubs_updated"));
}

export function getActiveAdminRole(): AdminRoleUser {
  if (typeof window === "undefined") return FALLBACK_GUEST_USER;
  try {
    const roleId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    const stored = getStoredUsers();
    if (stored && stored.length > 0) {
      const found = stored.find((r) => r && r.id === roleId);
      return found || stored[0] || FALLBACK_GUEST_USER;
    }
    return FALLBACK_GUEST_USER;
  } catch {
    return FALLBACK_GUEST_USER;
  }
}

export function setActiveAdminRole(roleId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleId);
  window.dispatchEvent(new CustomEvent("his_role_updated", { detail: roleId }));
}

export function resetAllDemoData() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.YEARBOOK, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));

  window.dispatchEvent(new CustomEvent("his_applications_updated"));
  window.dispatchEvent(new CustomEvent("his_yearbook_updated"));
  window.dispatchEvent(new CustomEvent("his_courses_updated"));
  window.dispatchEvent(new CustomEvent("his_bulletins_updated"));
  window.dispatchEvent(new CustomEvent("his_clubs_updated"));
  window.dispatchEvent(new CustomEvent("his_users_updated"));
}
