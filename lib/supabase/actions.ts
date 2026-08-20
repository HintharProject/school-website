/**
 * Centralized Supabase data-access helpers for all admin modules.
 * All reads/writes go through these functions — no localStorage caching.
 */
import { supabase } from "./client";
import type {
  AdmissionRecord,
  YearbookAlumniRecord,
  ClubRecord,
  CampusRecord,
  CourseRecord,
  BulletinNoticeRecord,
  UserProfileRecord,
} from "./types";

// ── CLUBS ────────────────────────────────────────────────────────────────────

export async function fetchClubs() {
  const { data, error } = await supabase
    .from("clubs")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data || []) as ClubRecord[];
}

export async function createClub(club: Omit<ClubRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("clubs")
    .insert([club])
    .select()
    .single();
  if (error) throw error;
  return data as ClubRecord;
}

export async function updateClub(id: number, updates: Partial<ClubRecord>) {
  const { data, error } = await supabase
    .from("clubs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ClubRecord;
}

export async function deleteClub(id: number) {
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) throw error;
}

// ── YEARBOOK ─────────────────────────────────────────────────────────────────

export async function fetchYearbook() {
  const { data, error } = await supabase
    .from("yearbook_alumni")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return (data || []) as YearbookAlumniRecord[];
}

export async function createYearbookEntry(entry: Omit<YearbookAlumniRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("yearbook_alumni")
    .insert([entry])
    .select()
    .single();
  if (error) throw error;
  return data as YearbookAlumniRecord;
}

export async function updateYearbookEntry(id: number, updates: Partial<YearbookAlumniRecord>) {
  const { data, error } = await supabase
    .from("yearbook_alumni")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as YearbookAlumniRecord;
}

export async function deleteYearbookEntry(id: number) {
  const { error } = await supabase.from("yearbook_alumni").delete().eq("id", id);
  if (error) throw error;
}

// ── ADMISSIONS ────────────────────────────────────────────────────────────────

export async function fetchAdmissions() {
  const { data, error } = await supabase
    .from("admissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AdmissionRecord[];
}

export async function createAdmission(record: Omit<AdmissionRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("admissions")
    .insert([record])
    .select()
    .single();
  if (error) throw error;
  return data as AdmissionRecord;
}

export async function updateAdmission(id: string, updates: Partial<AdmissionRecord>) {
  const { data, error } = await supabase
    .from("admissions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AdmissionRecord;
}

export async function deleteAdmission(id: string) {
  const { error } = await supabase.from("admissions").delete().eq("id", id);
  if (error) throw error;
}

// ── CAMPUSES ──────────────────────────────────────────────────────────────────

export async function fetchCampuses() {
  const { data, error } = await supabase
    .from("campuses")
    .select("*")
    .order("city", { ascending: false });
  if (error) throw error;
  return (data || []) as CampusRecord[];
}

export async function createCampus(campus: Omit<CampusRecord, "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("campuses")
    .insert([campus])
    .select()
    .single();
  if (error) throw error;
  return data as CampusRecord;
}

export async function updateCampus(id: string, updates: Partial<CampusRecord>) {
  const { data, error } = await supabase
    .from("campuses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CampusRecord;
}

export async function deleteCampus(id: string) {
  const { error } = await supabase.from("campuses").delete().eq("id", id);
  if (error) throw error;
}

// ── COURSES ───────────────────────────────────────────────────────────────────

export async function fetchCourses() {
  const { data, error } = await supabase
    .from("classes_courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CourseRecord[];
}

export async function createCourse(course: Omit<CourseRecord, "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("classes_courses")
    .insert([course])
    .select()
    .single();
  if (error) throw error;
  return data as CourseRecord;
}

export async function updateCourse(id: string, updates: Partial<CourseRecord>) {
  const { data, error } = await supabase
    .from("classes_courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CourseRecord;
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from("classes_courses").delete().eq("id", id);
  if (error) throw error;
}

// ── BULLETINS ─────────────────────────────────────────────────────────────────

export async function fetchBulletins() {
  const { data, error } = await supabase
    .from("bulletin_notices")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []) as BulletinNoticeRecord[];
}

export async function createBulletin(bulletin: Omit<BulletinNoticeRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("bulletin_notices")
    .insert([bulletin])
    .select()
    .single();
  if (error) throw error;
  return data as BulletinNoticeRecord;
}

export async function updateBulletin(id: number, updates: Partial<BulletinNoticeRecord>) {
  const { data, error } = await supabase
    .from("bulletin_notices")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as BulletinNoticeRecord;
}

export async function deleteBulletin(id: number) {
  const { error } = await supabase.from("bulletin_notices").delete().eq("id", id);
  if (error) throw error;
}

// ── USERS ─────────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, role, title, campus_id, grade, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as UserProfileRecord[];
}

// ── CURRENT USER ──────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<UserProfileRecord | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, role, title, campus_id, grade, status, created_at")
    .eq("id", user.id)
    .single();

  return profile || null;
}
