import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import FooterSection from "@/app/components/sections/FooterSection";
import StaffView from "./StaffView";
import { getPublishedStaff } from "@/lib/actions/staff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teachers & Staff | Hinthar International School",
  description:
    "Meet the leadership, teachers, and academic mentors of Hinthar International School — Pearson Edexcel specialists across Yangon and Mawlamyine campuses.",
};

export default async function StaffPage() {
  const staff = await getPublishedStaff();

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        <StaffView staff={staff} />
      </main>
      <FooterSection />
    </div>
  );
}
