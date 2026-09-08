import type { Metadata } from "next";
import ClassesView from "./ClassesView";
import { getPublicPrograms } from "@/lib/actions/academicCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classes & Programs | Hinthar International School",
  description:
    "Explore Hinthar academic programs for 2026–2027 — Cambridge Checkpoint, Pearson Edexcel, O Level, A Level, vocational pathways, and university foundation tracks.",
};

export default async function ClassesPage() {
  let initialPrograms: Awaited<ReturnType<typeof getPublicPrograms>> = [];
  try {
    initialPrograms = await getPublicPrograms();
  } catch (err) {
    console.warn("Classes SSR fetch note:", err);
  }

  return <ClassesView initialPrograms={initialPrograms} />;
}
