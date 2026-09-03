import type { Metadata } from "next";
import CampusesView from "./CampusesView";
import { getPublicCampuses } from "@/lib/actions/campuses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Campuses | 3 in Yangon & 1 in Mawlamyine | Hinthar International School",
  description:
    "Explore Hinthar International School's 4 campuses across Myanmar: Ywarma, Shwe Padauk, and Shwe Pone Nyet in Yangon, and our Mawlamyine regional campus.",
};

export default async function CampusesPage() {
  let initialData: Awaited<ReturnType<typeof getPublicCampuses>> = [];
  try {
    initialData = await getPublicCampuses();
  } catch (err) {
    console.warn("Campuses SSR fetch note:", err);
  }

  return <CampusesView initialData={initialData} />;
}
