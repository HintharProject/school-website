import type { Metadata } from "next";
import StudentLifeView from "@/app/clubs/StudentLifeView";
import { getClubs } from "@/lib/actions/clubs";
import { getActivities } from "@/lib/actions/activities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "School Events & Activities Calendar | Hinthar International School",
  description:
    "Explore upcoming academic competitions, school workshops, athletic meets, and campus events at Hinthar International School.",
};

export default async function ActivitiesPage() {
  const [initialClubs, initialActivities] = await Promise.all([
    getClubs().catch(() => []),
    getActivities().catch(() => []),
  ]);

  return (
    <StudentLifeView
      initialClubs={initialClubs}
      initialActivities={initialActivities}
      initialTab="activities"
    />
  );
}
