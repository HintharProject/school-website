import type { Metadata } from "next";
import ActivitiesView from "./ActivitiesView";
import { getActivities } from "@/lib/actions/activities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activities & Announcements | Hinthar International School",
  description:
    "Explore upcoming academic competitions, school workshops, athletic meets, and campus events at Hinthar International School.",
};

export default async function ActivitiesPage() {
  let initialData: Awaited<ReturnType<typeof getActivities>> = [];
  try {
    initialData = await getActivities();
  } catch (err) {
    console.warn("Activities SSR fetch note:", err);
  }

  return <ActivitiesView initialData={initialData} />;
}
