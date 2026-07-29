import type { Metadata } from "next";
import ClubsView from "./ClubsView";

export const metadata: Metadata = {
  title: "School Clubs | Hinthar International School",
  description:
    "Discover your passion, develop new skills, and make lifelong friends by joining one of our diverse student clubs.",
};

export default function ClubsPage() {
  return <ClubsView />;
}
