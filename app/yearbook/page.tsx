import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import YearbookView from "./YearbookView";
import { getEffectiveSiteContent } from "@/lib/actions/siteContent";
import {
  getPublicYearbook,
  getPublicYearbookBatches,
} from "@/lib/actions/yearbook";

export const metadata: Metadata = {
  title: "Student Yearbook",
  description:
    "Celebrate Hinthar International School scholars, Pearson Edexcel high achievers, and global university placements.",
};

export const dynamic = "force-dynamic";

export default async function YearbookPage() {
  const [content, batches, entries] = await Promise.all([
    getEffectiveSiteContent(),
    getPublicYearbookBatches(),
    getPublicYearbook(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar brand={content.brand} />
      <main className="flex-1">
        <YearbookView
          header={content.yearbookPage}
          batches={batches}
          entries={entries}
        />
      </main>
      <FooterSection brand={content.brand} />
    </div>
  );
}
