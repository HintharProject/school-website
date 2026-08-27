import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import FooterSection from "@/app/components/sections/FooterSection";
import ArticleView from "./ArticleView";
import { getNewsBySlug, getPublishedNews } from "@/lib/actions/news";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return { title: "News | Hinthar International School" };
  return {
    title: `${post.title} | Hinthar International School`,
    description: post.excerpt || post.body.slice(0, 150),
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedNews(6)).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-[820px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        <ArticleView post={post} />

        {related.length > 0 && (
          <section className="mt-14 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-black text-[#09234B] mb-5 tracking-tight">More News</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group p-4 bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    {item.category}
                  </p>
                  <h3 className="text-xs font-black text-[#09234B] leading-snug line-clamp-3 group-hover:text-[#0E3B7D] transition-colors">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <FooterSection />
    </div>
  );
}
