import type { Metadata } from "next";
import StudentLifeView from "./StudentLifeView";
import { getClubs } from "@/lib/actions/clubs";
import { getActivities } from "@/lib/actions/activities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Life — Clubs, Societies & Activities | Hinthar International School",
  description:
    "Explore student-led societies, robotics teams, athletic competitions, and vibrant campus events across Hinthar International School.",
};

export default async function ClubsPage() {
  const [initialClubs, initialActivities] = await Promise.all([
    getClubs().catch(() => []),
    getActivities().catch(() => []),
  ]);

  return (
    <StudentLifeView
      initialClubs={initialClubs}
      initialActivities={initialActivities}
      initialTab="clubs"
    />
  );
}
