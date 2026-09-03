export const PROGRAM_LEVELS = {
  lower_secondary: {
    label: "Lower Secondary (Year 7–9)",
    years: [7, 8, 9],
  },
  igcse: {
    label: "Pearson Edexcel IGCSE (Year 10–11)",
    years: [10, 11],
  },
  ial: {
    label: "Pearson Edexcel IAL (Year 12–13)",
    years: [12, 13],
  },
} as const;

export type ProgramLevel = keyof typeof PROGRAM_LEVELS;

export const FINISHED_GRADE_OPTIONS = [
  "Year 6 (completed)",
  "Year 7 (completed)",
  "Year 8 (completed)",
  "Year 9 (completed)",
  "Year 10 (completed)",
  "Year 11 (completed)",
  "Year 12 (completed)",
] as const;

export function suggestEntryYear(
  finishedGrade: string,
  programLevel: ProgramLevel
): number {
  const completedYear = Number(finishedGrade.match(/\d+/)?.[0] ?? 0);
  const allowedYears = PROGRAM_LEVELS[programLevel].years;
  const nextYear = completedYear + 1;

  return allowedYears.some((year) => year === nextYear)
    ? nextYear
    : allowedYears[0];
}

export function formatStoredGrade(
  programLevel: ProgramLevel,
  entryYear: number
): string {
  if (programLevel === "lower_secondary") {
    return `Lower Secondary (Year ${entryYear})`;
  }
  if (programLevel === "igcse") {
    return `Pearson IGCSE (Year ${entryYear})`;
  }
  return `Pearson IAL (Year ${entryYear})`;
}
