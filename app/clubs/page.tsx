import type { Metadata } from "next";
import ClubsView from "./ClubsView";
import { getClubs } from "@/lib/actions/clubs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "School Clubs | Hinthar International School",
  description:
    "Discover your passion, develop new skills, and make lifelong friends by joining one of our diverse student clubs.",
};

export default async function ClubsPage() {
  let initialData: Awaited<ReturnType<typeof getClubs>> = [];
  try {
    initialData = await getClubs();
  } catch (err) {
    console.warn("Clubs SSR fetch note:", err);
  }

  return <ClubsView initialData={initialData} />;
}
