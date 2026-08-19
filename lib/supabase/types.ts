export type UserRole = "principal" | "staff_admin" | "student";

export interface UserProfileRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  title?: string;
  campus_id?: string;
  grade?: string;
  avatar_url?: string;
  status: "active" | "inactive" | "suspended";
  created_at?: string;
  updated_at?: string;
}

export type ApplicationStatus = "Pending" | "Assessment Scheduled" | "Approved" | "Declined";
export type ReviewStatus = "published" | "pending_review" | "archived";

export interface CampusRecord {
  id: string;
  name: string;
  city: "Yangon" | "Mawlamyine";
  tagline: string;
  address: string;
  phone: string;
  email: string;
  office_hours: string;
  grades_served: string;
  facilities: string[];
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface YearbookAlumniRecord {
  id: number;
  name: string;
  category: "Class of 2026" | "Class of 2025" | "Class of 2024" | "University Placements" | "Competitions";
  role: string;
  destination?: string;
  subjects?: string;
  quote: string;
  image: string;
  badge?: string;
  campus?: string;
  status?: ReviewStatus;
  submitted_by?: string;
  reviewer_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClubRecord {
  id: number;
  name: string;
  category: "STEM & Tech" | "Academic & Debate" | "STEM & Science" | "Creative Arts" | "Sports & Fitness";
  icon: string;
  members: string;
  meeting_time: string;
  leadership: string;
  description: string;
  image: string;
  campus?: string;
  status?: ReviewStatus;
  submitted_by?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdmissionRecord {
  id: string;
  student_name: string;
  date_of_birth?: string;
  gender?: "Male" | "Female" | "Other";
  nationality?: string;
  grade: string;
  program_level?: string;
  academic_stream?: string;
  selected_subjects?: string[];
  intended_start_term?: string;
  study_mode?: string;
  previous_school?: string;
  parent_name?: string;
  relationship?: string;
  parent_email: string;
  parent_phone: string;
  address?: string;
  emergency_contact?: string;
  medical_notes?: string;
  how_heard?: string;
  submitted_date: string;
  status: ApplicationStatus;
  assessment_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseRecord {
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
  created_at?: string;
  updated_at?: string;
}

export interface BulletinNoticeRecord {
  id: number;
  title: string;
  date: string;
  type: "Official Notice" | "Academic" | "General";
  content: string;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}
