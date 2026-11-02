import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import CampusesView from "./CampusesView";
import { getEffectiveSiteContent } from "@/lib/actions/siteContent";
import { getPublicCampuses } from "@/lib/actions/campuses";

export const metadata: Metadata = {
  title: "Campuses",
  description:
    "Explore Hinthar International School campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine.",
};

export const dynamic = "force-dynamic";

export default async function CampusesPage() {
  const [content, campuses] = await Promise.all([
    getEffectiveSiteContent(),
    getPublicCampuses(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar brand={content.brand} />
      <main className="flex-1">
        <CampusesView header={content.campusesPage} campuses={campuses} />
      </main>
      <FooterSection brand={content.brand} />
    </div>
  );
}
