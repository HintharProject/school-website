"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import type { PublicNewsItem } from "@/lib/actions/news";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

const CATEGORY_COLORS: Record<string, string> = {
  Announcement: "bg-[#E8F0FE] text-[#0E3B7D] border-[#0E3B7D]/20",
  Academic: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Event: "bg-amber-50 text-amber-700 border-amber-200",
  Achievement: "bg-purple-50 text-purple-700 border-purple-200",
  Examination: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function NewsView({ posts }: { posts: PublicNewsItem[] }) {
  const t = useT();

  return (
    <>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
          <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">newspaper</span>
          <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">Hinthar Bulletin</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#09234B] mb-3 tracking-tight">
          {t("news.pageTitle")}
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto">
          {t("news.pageSubtitle")}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-slate-300 mb-3">draft</span>
          <p className="text-sm text-slate-500 font-medium">{t("news.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    unoptimized={isR2AssetUrl(post.image)}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0E3B7D] to-[#164E9A] flex items-center justify-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700] text-5xl opacity-80">school</span>
                  </div>
                )}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm ${
                    CATEGORY_COLORS[post.category] || "bg-white/90 text-slate-700 border-slate-200"
                  }`}
                >
                  {post.category}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formatDate(post.publishedAt)}
                </p>
                <h2 className="text-sm font-black text-[#09234B] leading-snug line-clamp-2 group-hover:text-[#0E3B7D] transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-xs text-slate-500 font-light line-clamp-3">{post.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E3B7D] uppercase tracking-wider pt-1">
                  {t("common.readMore")}
                  <span aria-hidden="true" className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
