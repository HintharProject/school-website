import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import ClubsActivitiesView from "./ClubsActivitiesView";
import { getEffectiveSiteContent } from "@/lib/actions/siteContent";
import { getPublicClubs } from "@/lib/actions/clubs";
import { getPublicActivities } from "@/lib/actions/activities";

export const metadata: Metadata = {
  title: "Clubs & Activities",
  description:
    "Explore student-led STEM, Debate, Arts & Sports societies and annual school events across Hinthar International School.",
};

export const dynamic = "force-dynamic";

export default async function ClubsAndActivitiesPage() {
  const [content, clubs, activities] = await Promise.all([
    getEffectiveSiteContent(),
    getPublicClubs(),
    getPublicActivities(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar brand={content.brand} />
      <main className="flex-1">
        <ClubsActivitiesView
          header={content.clubsPage}
          clubs={clubs}
          activities={activities}
        />
      </main>
      <FooterSection brand={content.brand} />
    </div>
  );
}
