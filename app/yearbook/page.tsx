import type { Metadata } from "next";
import PeopleAlumniView from "./PeopleAlumniView";
import { getYearbook, getYearbookBatches } from "@/lib/actions/yearbook";
import { getPublishedStaff } from "@/lib/actions/staff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People & Alumni — Yearbook & Faculty Directory | Hinthar International School",
  description:
    "Explore Hinthar International School's annual alumni yearbook and meet our certified Pearson Edexcel faculty across Yangon and Mawlamyine campuses.",
};

export default async function YearbookPage() {
  const [initialYearbook, initialBatches, initialStaff] = await Promise.all([
    getYearbook().catch(() => []),
    getYearbookBatches().catch(() => []),
    getPublishedStaff().catch(() => []),
  ]);

  return (
    <PeopleAlumniView
      initialYearbook={initialYearbook}
      initialBatches={initialBatches}
      initialStaff={initialStaff}
      initialTab="yearbook"
    />
  );
}
