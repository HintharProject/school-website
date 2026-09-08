export const PROGRAM_CATEGORIES = [
  { id: "cambridge", label: "Cambridge" },
  { id: "pearson", label: "Pearson Edexcel" },
  { id: "vocational", label: "Vocational" },
  { id: "alevel", label: "A Level" },
  { id: "foundation", label: "Foundation / UFP" },
] as const;

export const PROGRAM_CAMPUSES = [
  { id: "both", label: "Both (All Campuses)" },
  { id: "yangon", label: "Yangon" },
  { id: "mawlamyine", label: "Mawlamyine" },
] as const;

export const SUBJECT_TRACKS = ["STEM", "Business", "Computing", "Languages", "General"] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number]["id"];
export type ProgramCampus = (typeof PROGRAM_CAMPUSES)[number]["id"];
export type SubjectTrack = (typeof SUBJECT_TRACKS)[number];

export type CatalogSubject = {
  id: string;
  nameEn: string;
  nameMy: string | null;
  code: string | null;
  track: string;
  isActive: boolean;
};

export type CatalogProgram = {
  id: string;
  nameEn: string;
  nameMy: string | null;
  summaryEn: string | null;
  summaryMy: string | null;
  descriptionEn: string | null;
  descriptionMy: string | null;
  curriculum: string;
  category: string;
  duration: string | null;
  campus: string;
  studyMode: string | null;
  programLevel: string | null;
  sortOrder: number;
  isActive: boolean;
  subjects: CatalogSubject[];
};
