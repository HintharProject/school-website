import type { Metadata } from "next";
import ActivitiesView from "./ActivitiesView";

export const metadata: Metadata = {
  title: "Activities & Announcements | Hinthar International School",
  description:
    "Explore upcoming academic competitions, school workshops, athletic meets, and campus events at Hinthar International School.",
};

export default function ActivitiesPage() {
  return <ActivitiesView />;
}

