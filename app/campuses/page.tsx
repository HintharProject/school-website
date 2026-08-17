import type { Metadata } from "next";
import CampusesView from "./CampusesView";

export const metadata: Metadata = {
  title: "Our Campuses | 3 in Yangon & 1 in Mawlamyine | Hinthar International School",
  description:
    "Explore Hinthar International School's 4 campuses across Myanmar: Ywarma, Shwe Padauk, and Shwe Pone Nyet in Yangon, and our Mawlamyine regional campus.",
};

export default function CampusesPage() {
  return <CampusesView />;
}
