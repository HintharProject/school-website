export const PROGRAM_CAMPUSES = [
  { id: "both", label: "Yangon & Mawlamyine (All Campuses)" },
  { id: "yangon", label: "Yangon Campuses" },
  { id: "mawlamyine", label: "Mawlamyine Campus" },
] as const;

export const PROGRAM_LEVELS_META = [
  { id: "lower_secondary", label: "Lower Secondary (Year 7–9)" },
  { id: "igcse", label: "Pearson Edexcel IGCSE (Year 10–11)" },
  { id: "ial", label: "Pearson Edexcel IAL (Year 12–13)" },
] as const;

export const SUBJECT_LEVELS = ["Lower Secondary", "IGCSE", "IAL", "Both"] as const;
export const SUBJECT_TRACKS = ["STEM", "Business", "Computing", "Languages", "General"] as const;

export type ProgramCampus = (typeof PROGRAM_CAMPUSES)[number]["id"];
export type ProgramLevelId = (typeof PROGRAM_LEVELS_META)[number]["id"];
export type SubjectLevel = (typeof SUBJECT_LEVELS)[number];
export type SubjectTrack = (typeof SUBJECT_TRACKS)[number];

export type CatalogSubject = {
  id: string;
  nameEn: string;
  nameMy: string | null;
  code: string | null;
  level: string;
  track: string;
  isActive: boolean;
};

export type CatalogProgram = {
  id: string;
  nameEn: string;
  nameMy: string | null;
  badgeEn: string | null;
  badgeMy: string | null;
  ageRangeEn: string | null;
  ageRangeMy: string | null;
  summaryEn: string | null;
  summaryMy: string | null;
  descriptionEn: string | null;
  descriptionMy: string | null;
  highlightsEn: string[];
  highlightsMy: string[];
  curriculum: string;
  duration: string | null;
  campus: string;
  studyMode: string | null;
  programLevel: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  subjects: CatalogSubject[];
};
