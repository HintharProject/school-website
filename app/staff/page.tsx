import type { Metadata } from "next";
import PeopleAlumniView from "@/app/yearbook/PeopleAlumniView";
import { getYearbook, getYearbookBatches } from "@/lib/actions/yearbook";
import { getPublishedStaff } from "@/lib/actions/staff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teachers & Leadership Faculty | Hinthar International School",
  description:
    "Meet the leadership, teachers, and academic mentors of Hinthar International School — Pearson Edexcel specialists across Yangon and Mawlamyine campuses.",
};

export default async function StaffPage() {
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
      initialTab="staff"
    />
  );
}
