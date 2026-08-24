import type { Metadata } from "next";
import YearbookGallery from "./YearbookGallery";
import { getYearbook } from "@/lib/actions/yearbook";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Year Book | Hinthar International School",
  description:
    "Explore Hinthar International School's annual yearbook — celebrating student achievements and memories.",
};

export default async function YearbookPage() {
  let initialData: Awaited<ReturnType<typeof getYearbook>> = [];
  try {
    initialData = await getYearbook();
  } catch (err) {
    console.warn("Yearbook SSR fetch note:", err);
  }

  return <YearbookGallery initialData={initialData} />;
}
