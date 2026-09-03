/**
 * Default site content shown on the public website.
 * Every section here is overridable from the Admin Portal (Site Content)
 * via the `site_content` table — these defaults render whenever the
 * database has no override, so the site never breaks.
 */

export interface KeyHighlight {
  value: string;
  label: string;
  sub: string;
}

export const DEFAULT_HIGHLIGHTS: KeyHighlight[] = [
  { value: "4 Campuses", label: "Yangon & Mawlamyine", sub: "3 in YGN · 1 in MLM" },
  { value: "100%", label: "University Placement", sub: "Global Admissions" },
  { value: "Yr 7–13", label: "Academic Continuum", sub: "Pearson Edexcel" },
  { value: "100%", label: "Exam Board Center", sub: "British Council Partner" },
];

export const DEFAULT_ANNOUNCEMENTS: string[] = [
  "Admissions Open for 2026–2027 Academic Year (Year 7–9 · IGCSE · IAL)",
  "Official Pearson Edexcel Examination Centre — Hlaing Campus, Yangon",
  "Individual Academic Counseling Available: +95 9 894 332200",
  "Small Class Sizes with British Council Certified Faculty Mentorship",
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "curriculum",
    question: "What curriculums and examination boards are taught at Hinthar?",
    answer:
      "We officially follow the Pearson Edexcel International Curriculum, guiding students through Lower Secondary Education (Year 7–9), Pearson Edexcel IGCSE (Year 10–11), and Pearson Edexcel International Advanced Level (IAL / Year 12–13). Our qualifications are recognized worldwide for direct admission to universities in the UK, USA, Australia, Canada, Singapore, and beyond.",
    defaultOpen: true,
  },
  {
    id: "subjects",
    question: "What subject pathways are available for IGCSE and IAL?",
    answer:
      "Students can choose from specialized streams including STEM & Pure Sciences (Physics, Chemistry, Biology, Pure Mathematics), Engineering & Computer Science (Further Pure Mathematics, Mechanics, Computer Science, ICT), and Business & Commerce (Accounting, Economics, Business Studies).",
  },
  {
    id: "admission_process",
    question: "How does the admission and placement assessment work?",
    answer:
      "Parents can submit an online application via our Admission Portal. After initial review, applicants are scheduled for a friendly placement assessment (Mathematics & English) and a family consultation with our academic leads to ensure proper grade and pathway placement.",
  },
  {
    id: "exam_center",
    question: "Is Hinthar an approved Pearson Edexcel Examination Center?",
    answer:
      "Yes. Our students sit for their official Pearson Edexcel IGCSE and IAL examinations on campus with verified British Council and Pearson standards, accredited invigilators, and fully equipped science practical laboratories.",
  },
  {
    id: "modes",
    question: "Are classes full-time on campus in Yangon?",
    answer:
      "Yes. We offer full-time on-campus learning at our Hlaing Township campus in Yangon equipped with modern multimedia classrooms and STEM laboratories, accompanied by LMS revision resources for students.",
  },
];

export interface AcademicProgram {
  id: string;
  badge: string;
  age: string;
  title: string;
  icon: string;
  description: string;
  highlights: string[];
  image: string;
}

export const DEFAULT_PROGRAMS: AcademicProgram[] = [
  {
    id: "lower-secondary",
    badge: "Year 7 – Year 9",
    age: "Ages 11 – 14",
    title: "Lower Secondary Education",
    icon: "auto_stories",
    description:
      "Developing critical thinking, independent scientific inquiry, advanced numeracy, and study habits to bridge into Pearson IGCSE.",
    highlights: [
      "Advanced Mathematics, Physics, Chemistry & Biology",
      "English First/Second Language & Literature",
      "Computer Science & Digital Literacy Projects",
      "Global Perspectives, Leadership & Debate",
    ],
    image: "/images/g4.jpg",
  },
  {
    id: "igcse",
    badge: "Year 10 – Year 11",
    age: "Ages 14 – 16",
    title: "Pearson Edexcel IGCSE",
    icon: "workspace_premium",
    description:
      "Internationally benchmarked UK secondary qualifications with specialized pathways across Pure Sciences, Computing, and Commerce.",
    highlights: [
      "Official Pearson Edexcel examination syllabus",
      "Pure Science, Computing & Business tracks",
      "Intensive mock exam series & past-paper mastery",
      "Hands-on scientific laboratory practicals",
    ],
    image: "/images/engineering.avif",
  },
  {
    id: "ial",
    badge: "Year 12 – Year 13",
    age: "Ages 16 – 18",
    title: "Pearson Edexcel IAL (A-Level)",
    icon: "school",
    description:
      "Modular international A-Levels engineered for direct admission into medicine, engineering, law, and elite global university programs.",
    highlights: [
      "Pearson Edexcel International Advanced Level certification",
      "Medicine, Engineering & Commerce specialization tracks",
      "University application & personal statement mentorship",
      "World-class A* distinction preparation program",
    ],
    image: "/images/graduation.jpg",
  },
];

export interface ContactInfoItem {
  icon: string;
  text: string;
  href: string;
}

export const DEFAULT_CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: "location_on",
    text: "4 Campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) & Mawlamyine",
    href: "/campuses",
  },
  { icon: "mail", text: "admissions@hinthar.education", href: "mailto:admissions@hinthar.education" },
  { icon: "call", text: "+95 9 894 332200 / +95 9 894 332211", href: "tel:+959894332200" },
];

/** Keys allowed in the site_content table (defense against arbitrary writes). */
export const SITE_CONTENT_KEYS = [
  "announcements",
  "heroHighlights",
  "faqs",
  "programs",
  "contactInfo",
  "subjectCatalog",
  "admissionOptions",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

// ── SUBJECT CATALOG ───────────────────────────────────────────────────────────

export type SubjectLevel = "IGCSE" | "IAL" | "Both" | "Lower Secondary";
export type SubjectTrack = "STEM" | "Business" | "Computing" | "Languages" | "General";

export interface SubjectEntry {
  id: string;
  name: string;
  track: SubjectTrack;
  level: SubjectLevel;
  code?: string;
  isActive: boolean;
}

export const DEFAULT_SUBJECT_CATALOG: SubjectEntry[] = [
  { id: "ls-math",       name: "Mathematics",            track: "STEM",      level: "Lower Secondary", isActive: true },
  { id: "ls-science",    name: "Integrated Science",     track: "STEM",      level: "Lower Secondary", isActive: true },
  { id: "ls-english",    name: "English Language",       track: "Languages", level: "Lower Secondary", isActive: true },
  { id: "ls-computing",  name: "Computing & Digital Literacy", track: "Computing", level: "Lower Secondary", isActive: true },
  { id: "ls-global",     name: "Global Perspectives",   track: "General",   level: "Lower Secondary", isActive: true },
  { id: "s-pure-math",   name: "Pure Mathematics",     track: "STEM",      level: "Both",  code: "4PM1",  isActive: true },
  { id: "s-further-math",name: "Further Mathematics",  track: "STEM",      level: "IAL",   code: "YFM01", isActive: true },
  { id: "s-physics",     name: "Physics",               track: "STEM",      level: "Both",  code: "4PH1",  isActive: true },
  { id: "s-chemistry",   name: "Chemistry",             track: "STEM",      level: "Both",  code: "4CH1",  isActive: true },
  { id: "s-biology",     name: "Biology",               track: "STEM",      level: "Both",  code: "4BI1",  isActive: true },
  { id: "s-cs",          name: "Computer Science",      track: "Computing", level: "Both",  code: "4CP1",  isActive: true },
  { id: "s-ict",         name: "Information Technology",track: "Computing", level: "IGCSE", code: "4IT1",  isActive: true },
  { id: "s-econ",        name: "Economics",             track: "Business",  level: "Both",  code: "4EC1",  isActive: true },
  { id: "s-acc",         name: "Accounting",            track: "Business",  level: "Both",  code: "4AC1",  isActive: true },
  { id: "s-business",    name: "Business Studies",      track: "Business",  level: "Both",  code: "4BS1",  isActive: true },
  { id: "s-eng",         name: "English Language",      track: "Languages", level: "Both",  code: "4EA1",  isActive: true },
  { id: "s-gp",          name: "Global Perspectives",   track: "General",   level: "IGCSE", code: "4GP1",  isActive: true },
  { id: "s-stats",       name: "Statistics",            track: "STEM",      level: "IAL",   code: "YST01", isActive: true },
  { id: "s-art",         name: "Art & Design",          track: "General",   level: "IGCSE", code: "4AD1",  isActive: false },
  { id: "s-geo",         name: "Geography",             track: "General",   level: "Both",  code: "4GE1",  isActive: true },
];

// ── ADMISSION OPTIONS CATALOG (4 lists) ─────────────────────────────────────
export interface AdmissionOptions {
  intendedStartTerms: string[];
  studyModes: string[];
  academicStreams: string[];
  relationships: string[];
}

export const DEFAULT_ADMISSION_OPTIONS: AdmissionOptions = {
  intendedStartTerms: [
    "August 2026",
    "January 2027",
    "Immediate Placement",
    "Term 1 (August 2026)",
    "Term 2 (January 2027)",
    "Term 3 (April 2027)",
    "Immediate Mid-Term Transfer",
  ],
  studyModes: [
    "Full-Time On-Campus",
    "Hybrid / Supplementary",
    "Hybrid / Flexible Learning",
    "Pearson Examination Series Candidate",
  ],
  academicStreams: [
    "Science / STEM & Pre-Med",
    "Engineering & Computing",
    "Business, Economics & Finance",
    "Creative Arts & Digital Media",
    "General Academic",
    "STEM & Pure Sciences",
    "Computing & IT",
    "Business & Commerce",
  ],
  relationships: [
    "Father",
    "Mother",
    "Parent",
    "Legal Guardian",
    "Guardian",
    "Other",
  ],
};
