"use client";

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
}

export interface AdminRoleUser {
  id: string;
  name: string;
  title: string;
  role: "Head of Admissions" | "Academic Director" | "Student Affairs Lead";
  email: string;
  initials: string;
  badgeColor: string;
}

export const ADMIN_ROLES: AdminRoleUser[] = [
  {
    id: "admissions-head",
    name: "Daw Khin Sandar",
    title: "Head of Admissions & Student Placement",
    role: "Head of Admissions",
    email: "admissions.head@hinthar.education",
    initials: "KS",
    badgeColor: "bg-[#FFC700] text-[#09234B]",
  },
  {
    id: "academic-director",
    name: "Dr. Kaung Myat Htut",
    title: "Academic Director & Pearson Coordinator",
    role: "Academic Director",
    email: "academic.director@hinthar.education",
    initials: "KM",
    badgeColor: "bg-[#0E3B7D] text-white",
  },
  {
    id: "student-affairs",
    name: "Tr. Rachel Evans",
    title: "Head of Student Affairs & Societies",
    role: "Student Affairs Lead",
    email: "student.affairs@hinthar.education",
    initials: "RE",
    badgeColor: "bg-emerald-600 text-white",
  },
];

export const initialApplications: AdmissionApplication[] = [
  {
    id: "HIS-2026-8421",
    studentName: "Aung Kaung Myat",
    dateOfBirth: "2009-04-12",
    gender: "Male",
    grade: "Pearson IAL (Year 12)",
    previousSchool: "Yangon International Grammar School",
    parentName: "U Myat Min Tun",
    parentEmail: "kaung.myat@parent.com",
    parentPhone: "+95 9 790 123456",
    submittedDate: "2026-08-14",
    status: "Pending",
    notes: "Top performer in Lower Secondary Math. Applying for 4 A-Level subjects (Math, Further Math, Physics, Chemistry).",
  },
  {
    id: "HIS-2026-7912",
    studentName: "Su Myat Noe",
    dateOfBirth: "2011-09-24",
    gender: "Female",
    grade: "Pearson IGCSE (Year 10)",
    previousSchool: "Practising High School Kamayut",
    parentName: "Daw Khin Myo Sett",
    parentEmail: "sumyat.n@parent.com",
    parentPhone: "+95 9 790 234567",
    submittedDate: "2026-08-13",
    status: "Approved",
    assessmentDate: "2026-08-14",
    notes: "Diagnostic assessment passed with 94% aggregate. Enrolled in 8 IGCSE subjects.",
  },
  {
    id: "HIS-2026-6401",
    studentName: "Zaw Lin Htet",
    dateOfBirth: "2013-02-18",
    gender: "Male",
    grade: "Lower Secondary (Year 8)",
    previousSchool: "International School of Myanmar",
    parentName: "U Htet Zaw",
    parentEmail: "zawlin.h@parent.com",
    parentPhone: "+95 9 790 345678",
    submittedDate: "2026-08-12",
    status: "Assessment Scheduled",
    assessmentDate: "2026-08-18 (10:00 AM)",
    notes: "Assessment in English & Math scheduled at Hlaing Campus Testing Suite A.",
  },
  {
    id: "HIS-2026-5120",
    studentName: "Hnin Wutt Yee",
    dateOfBirth: "2009-11-05",
    gender: "Female",
    grade: "Pearson IAL (Year 12)",
    previousSchool: "Basic Education High School No. 2 Dagon",
    parentName: "Daw Yin Yin Htwe",
    parentEmail: "hnin.wy@parent.com",
    parentPhone: "+95 9 790 456789",
    submittedDate: "2026-08-10",
    status: "Approved",
    assessmentDate: "2026-08-11",
    notes: "Candidate was awarded Hinthar Academic Scholarship for IGCSE distinction.",
  },
  {
    id: "HIS-2026-4890",
    studentName: "Min Khant Kyaw",
    dateOfBirth: "2014-06-30",
    gender: "Male",
    grade: "Lower Secondary (Year 7)",
    previousSchool: "St. Paul Primary School",
    parentName: "Dr. Kyaw Zin",
    parentEmail: "minkhant.k@parent.com",
    parentPhone: "+95 9 790 567890",
    submittedDate: "2026-08-08",
    status: "Pending",
    notes: "Requires sibling discount evaluation (brother currently in Year 11).",
  },
  {
    id: "HIS-2026-3721",
    studentName: "Thandar Win",
    dateOfBirth: "2010-08-14",
    gender: "Female",
    grade: "Pearson IGCSE (Year 11)",
    previousSchool: "Overseas International School (Bangkok)",
    parentName: "Daw May Win",
    parentEmail: "thandar.w@parent.com",
    parentPhone: "+95 9 790 678901",
    submittedDate: "2026-08-05",
    status: "Declined",
    notes: "Requested mid-year curriculum stream switch not currently available for Year 11 series.",
  },
  {
    id: "HIS-2026-2910",
    studentName: "Htet Aung Lin",
    dateOfBirth: "2012-01-19",
    gender: "Male",
    grade: "Lower Secondary (Year 9)",
    previousSchool: "Yangon Academy",
    parentName: "U Lin Aung",
    parentEmail: "htetaung.l@parent.com",
    parentPhone: "+95 9 790 789012",
    submittedDate: "2026-08-02",
    status: "Assessment Scheduled",
    assessmentDate: "2026-08-20 (02:00 PM)",
    notes: "Diagnostic assessment for Lower Secondary science placement.",
  },
];

export const initialYearbook: YearbookScholar[] = [
  {
    id: 1,
    name: "Aung Kaung Myat",
    category: "Class of 2026",
    role: "Valedictorian & Student Council President",
    destination: "Target: Imperial College London (Mechanical Engineering)",
    subjects: "IAL 4 A*s: Pure Math, Further Math, Physics, Chemistry",
    quote: "Hinthar gave me the discipline, lab exposure, and mentorship to turn my passion for engineering into reality.",
    image: "/images/g5.jpg",
    badge: "World Top Scorer",
  },
  {
    id: 2,
    name: "Su Myat Noe",
    category: "Class of 2026",
    role: "Debate Society Captain & High Distinction",
    destination: "Accepted: National University of Singapore (NUS) - Computer Science",
    subjects: "IAL: Computer Science, Pure Math, Economics",
    quote: "The faculty pushed us to think critically beyond standard textbooks. Grateful for every lesson.",
    image: "/images/g6.jpg",
    badge: "Top Distinction",
  },
  {
    id: 3,
    name: "Min Khant Kyaw",
    category: "Class of 2025",
    role: "Science & Robotics Lead",
    destination: "Currently at: University of Melbourne (Biomedical Science)",
    subjects: "IAL: Biology, Chemistry, Mathematics",
    quote: "Practical laboratory experiments at Hinthar made my university transition seamless and exciting.",
    image: "/images/g4.jpg",
    badge: "Alumni 2025",
  },
  {
    id: 4,
    name: "Hnin Wutt Yee",
    category: "Class of 2025",
    role: "Business Club Leader & Model UN Delegate",
    destination: "Currently at: University of Manchester (Economics & Finance)",
    subjects: "IAL: Economics, Business Studies, Accounting",
    quote: "Confidence is built step by step. Hinthar gave us the stage to lead and speak with conviction.",
    image: "/images/g8.jpg",
    badge: "Alumni 2025",
  },
  {
    id: 5,
    name: "Zaw Lin Htet",
    category: "Class of 2024",
    role: "Badminton Captain & Math Olympiad Silver",
    destination: "Currently at: University of New South Wales (UNSW Sydney - IT)",
    subjects: "IGCSE: 8 A*s (STEM Stream)",
    quote: "Balancing athletic sports and intense Pearson IGCSE exams taught me resilience that stays with me today.",
    image: "/images/g7.jpg",
    badge: "Alumni 2024",
  },
  {
    id: 6,
    name: "Thandar Win",
    category: "Class of 2024",
    role: "Peer Tutor & Head Prefect",
    destination: "Currently at: King's College London (Law & Global Politics)",
    subjects: "IAL: Global Perspectives, Literature, Economics",
    quote: "A true international community in the heart of Yangon where every teacher genuinely cares about student growth.",
    image: "/images/g9.jpg",
    badge: "Alumni 2024",
  },
];

export const initialCourses: CourseItem[] = [
  { id: "1", name: "Pure Mathematics (P1–P4)", code: "WMA11 / WMA12", grade: "Pearson IAL", category: "STEM", time: "Mon, Wed, Fri - 8:30 AM", instructor: "Dr. Kaung Myat Htut & U Than Win", room: "Newton Hall 101" },
  { id: "2", name: "Advanced Physics & Practical Lab", code: "WPH11 / WPH14", grade: "Pearson IAL", category: "STEM", time: "Tue, Thu - 10:30 AM", instructor: "Dr. Htet Aung Lin", room: "Faraday Physics Lab" },
  { id: "3", name: "Pearson IGCSE Computer Science", code: "4CP0", grade: "Pearson IGCSE", category: "Computing", time: "Mon, Thu - 1:00 PM", instructor: "Daw May Zin Thet", room: "Turing Lab 204" },
  { id: "4", name: "Pearson IGCSE Chemistry & Biology", code: "4CH1 / 4BI1", grade: "Pearson IGCSE", category: "STEM", time: "Mon, Wed, Fri - 10:30 AM", instructor: "Dr. Su Mon Kyaw", room: "Franklin Science Suite" },
  { id: "5", name: "Economics & Business Studies", code: "4EC1 / 4BS1", grade: "Pearson IGCSE", category: "Business", time: "Tue, Thu - 2:00 PM", instructor: "U Myo Min Tun (MBA)", room: "Room 302" },
  { id: "6", name: "Lower Secondary STEM & Math Discovery", code: "SEC-MATH-08", grade: "Lower Secondary (Year 7–9)", category: "STEM", time: "Daily - 9:00 AM", instructor: "Tr. Rachel Evans", room: "Junior Wing 105" },
  { id: "7", name: "Lower Secondary English & Perspectives", code: "SEC-ENG-09", grade: "Lower Secondary (Year 7–9)", category: "Languages", time: "Daily - 11:00 AM", instructor: "Tr. Sarah Jenkins", room: "Language Lab A" },
];

export const initialAnnouncements: BulletinNotice[] = [
  { id: 1, title: "Pearson Edexcel Oct/Nov 2026 Registration", date: "Aug 20, 2026", type: "Official Notice", content: "All candidate entries for upcoming Pearson Edexcel examination series must be confirmed through the exam officer." },
  { id: 2, title: "Science & Engineering Practical Schedule", date: "Aug 15, 2026", type: "Academic", content: "Physics and Chemistry practical lab sessions for AS & A2 students commence in Newton Lab this week." },
  { id: 3, title: "Parent-Teacher Consultations (Year 7–13)", date: "Aug 10, 2026", type: "General", content: "Individual consultations with faculty subject leads will take place on campus on Saturday, August 29th." },
];

export const initialClubs: ClubItem[] = [
  {
    id: 1,
    name: "Robotics, IoT & AI Club",
    category: "STEM & Tech",
    icon: "smart_toy",
    members: "38 Active Members",
    meetingTime: "Wednesdays · 03:45 PM – 05:15 PM",
    leadership: "Student Lead: Aung Kaung | Advisor: Dr. Kaung Myat Htut",
    description: "Design autonomous Arduino & Raspberry Pi robots, code computer vision scripts, and prepare for international robotics olympiads.",
    image: "/images/engineering.avif",
  },
  {
    id: 2,
    name: "Model United Nations & Debate Society",
    category: "Academic & Debate",
    icon: "forum",
    members: "45 Active Members",
    meetingTime: "Tuesdays · 04:00 PM – 05:30 PM",
    leadership: "President: Su Myat Noe | Advisor: Tr. Rachel Evans",
    description: "Master diplomatic public speaking, persuasive negotiation, international policy analysis, and competitive debate sparring.",
    image: "/images/business.jpg",
  },
  {
    id: 3,
    name: "Science Discovery & Astronomy Society",
    category: "STEM & Science",
    icon: "biotech",
    members: "32 Active Members",
    meetingTime: "Thursdays · 03:30 PM – 05:00 PM",
    leadership: "President: Lin Htet | Advisor: Dr. Su Mon Kyaw",
    description: "Conduct chemical reaction experiments, study celestial bodies with telescopes, and organize the annual Science Fair.",
    image: "/images/g2.jpg",
  },
  {
    id: 4,
    name: "Digital Media, Photography & Film",
    category: "Creative Arts",
    icon: "photo_camera",
    members: "28 Active Members",
    meetingTime: "Fridays · 03:30 PM – 05:00 PM",
    leadership: "Editor: Min Khant | Advisor: Daw May Zin Thet",
    description: "Learn cinematography, digital graphic design, school magazine journalism, and yearbook photography coverage.",
    image: "/images/g8.jpg",
  },
  {
    id: 5,
    name: "Badminton & Table Tennis Club",
    category: "Sports & Fitness",
    icon: "sports_tennis",
    members: "50+ Active Members",
    meetingTime: "Mon & Thu · 04:15 PM – 05:45 PM",
    leadership: "Captains: Thura & May | Coach: U Zaw Lin",
    description: "Training agility, competitive drills, inter-school friendly fixtures, and intra-house championship tournaments.",
    image: "/images/g7.jpg",
  },
  {
    id: 6,
    name: "Music, Choir & Performing Arts",
    category: "Creative Arts",
    icon: "theater_comedy",
    members: "34 Active Members",
    meetingTime: "Wednesdays · 04:00 PM – 05:30 PM",
    leadership: "Director: Kay Zin | Advisor: Tr. Sarah Jenkins",
    description: "Acoustic ensemble, classical choral singing, and stage theatre productions for school galas and cultural festivals.",
    image: "/images/g6.jpg",
  },
];

// Helper Functions for LocalStorage Persistence
const STORAGE_KEYS = {
  APPLICATIONS: "his_admin_applications_v1",
  YEARBOOK: "his_admin_yearbook_v1",
  COURSES: "his_admin_courses_v1",
  BULLETINS: "his_admin_bulletins_v1",
  CLUBS: "his_admin_clubs_v1",
  ACTIVE_ROLE: "his_admin_active_role_v1",
};

export function getStoredApplications(): AdmissionApplication[] {
  if (typeof window === "undefined") return initialApplications;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
      return initialApplications;
    }
    return JSON.parse(raw);
  } catch {
    return initialApplications;
  }
}

export function saveStoredApplications(apps: AdmissionApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  window.dispatchEvent(new CustomEvent("his_applications_updated"));
}

export function getStoredYearbook(): YearbookScholar[] {
  if (typeof window === "undefined") return initialYearbook;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.YEARBOOK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.YEARBOOK, JSON.stringify(initialYearbook));
      return initialYearbook;
    }
    return JSON.parse(raw);
  } catch {
    return initialYearbook;
  }
}

export function saveStoredYearbook(entries: YearbookScholar[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.YEARBOOK, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent("his_yearbook_updated"));
}

export function getStoredCourses(): CourseItem[] {
  if (typeof window === "undefined") return initialCourses;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
      return initialCourses;
    }
    return JSON.parse(raw);
  } catch {
    return initialCourses;
  }
}

export function saveStoredCourses(courses: CourseItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  window.dispatchEvent(new CustomEvent("his_courses_updated"));
}

export function getStoredBulletins(): BulletinNotice[] {
  if (typeof window === "undefined") return initialAnnouncements;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BULLETINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(initialAnnouncements));
      return initialAnnouncements;
    }
    return JSON.parse(raw);
  } catch {
    return initialAnnouncements;
  }
}

export function saveStoredBulletins(bulletins: BulletinNotice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(bulletins));
  window.dispatchEvent(new CustomEvent("his_bulletins_updated"));
}

export function getStoredClubs(): ClubItem[] {
  if (typeof window === "undefined") return initialClubs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLUBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(initialClubs));
      return initialClubs;
    }
    return JSON.parse(raw);
  } catch {
    return initialClubs;
  }
}

export function saveStoredClubs(clubs: ClubItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  window.dispatchEvent(new CustomEvent("his_clubs_updated"));
}

export function getActiveAdminRole(): AdminRoleUser {
  if (typeof window === "undefined") return ADMIN_ROLES[0];
  try {
    const roleId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    const found = ADMIN_ROLES.find((r) => r.id === roleId);
    return found || ADMIN_ROLES[0];
  } catch {
    return ADMIN_ROLES[0];
  }
}

export function setActiveAdminRole(roleId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleId);
  window.dispatchEvent(new CustomEvent("his_role_updated", { detail: roleId }));
}

export function resetAllDemoData() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
  localStorage.setItem(STORAGE_KEYS.YEARBOOK, JSON.stringify(initialYearbook));
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
  localStorage.setItem(STORAGE_KEYS.BULLETINS, JSON.stringify(initialAnnouncements));
  localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(initialClubs));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, ADMIN_ROLES[0].id);

  window.dispatchEvent(new CustomEvent("his_applications_updated"));
  window.dispatchEvent(new CustomEvent("his_yearbook_updated"));
  window.dispatchEvent(new CustomEvent("his_courses_updated"));
  window.dispatchEvent(new CustomEvent("his_bulletins_updated"));
  window.dispatchEvent(new CustomEvent("his_clubs_updated"));
  window.dispatchEvent(new CustomEvent("his_role_updated", { detail: ADMIN_ROLES[0].id }));
}
