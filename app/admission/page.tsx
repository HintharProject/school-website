import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import AdmissionPortalView from "./AdmissionPortalView";
import { getEffectiveSiteContent } from "@/lib/actions/siteContent";
import { getPublicPrograms } from "@/lib/actions/academicCatalog";

export const metadata: Metadata = {
  title: "Admissions & Application Status",
  description:
    "Apply online to Hinthar International School Pearson Edexcel programmes or track your application status.",
};

export const dynamic = "force-dynamic";

export default async function AdmissionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, content, programs] = await Promise.all([
    searchParams,
    getEffectiveSiteContent(),
    getPublicPrograms(),
  ]);

  const tabParam = typeof params.tab === "string" ? params.tab : "";
  const refParam = typeof params.ref === "string" ? params.ref : "";
  const programParam = typeof params.program === "string" ? params.program : "";
  const regionParam = typeof params.region === "string" ? params.region : "";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar brand={content.brand} />
      <main className="flex-1">
        <AdmissionPortalView
          config={content.admissionsConfig}
          programs={programs}
          initialTab={tabParam === "track" || Boolean(refParam) ? "track" : "apply"}
          initialRef={refParam}
          initialProgramId={programParam}
          initialRegion={
            regionParam === "Mawlamyine" ? "Mawlamyine" : "Yangon"
          }
        />
      </main>
      <FooterSection brand={content.brand} />
    </div>
  );
}
