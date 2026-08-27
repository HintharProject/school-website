import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import FooterSection from "@/app/components/sections/FooterSection";
import NewsView from "./NewsView";
import { getPublishedNews } from "@/lib/actions/news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Events | Hinthar International School",
  description:
    "Official announcements, academic updates, examination information, and stories from the Hinthar International School community.",
};

export default async function NewsPage() {
  const posts = await getPublishedNews();

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        <NewsView posts={posts} />
      </main>
      <FooterSection />
    </div>
  );
}
