"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/lib/i18n/useT";
import type { PublicNewsItem } from "@/lib/actions/news";

type ArticleData = PublicNewsItem & { body: string };

function formatDate(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

/** Renders plain-text bodies with blank-line paragraphs (no raw HTML risk). */
function BodyParagraphs({ body }: { body: string }) {
  const paragraphs = body
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-slate-700 font-light leading-relaxed whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

export default function ArticleView({ post }: { post: ArticleData }) {
  const t = useT();

  return (
    <article className="space-y-6">
      <nav>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E3B7D] hover:underline uppercase tracking-wider"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
          {t("news.backToNews")}
        </Link>
      </nav>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#E8F0FE] text-[#0E3B7D] border border-[#0E3B7D]/20 text-[10px] font-black uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {t("news.publishedOn")}: {formatDate(post.publishedAt)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#09234B] tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.excerpt && <p className="text-sm text-slate-500 font-normal">{post.excerpt}</p>}
      </header>

      {post.image && (
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 820px) 100vw, 820px"
            priority
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <BodyParagraphs body={post.body} />
      </div>
    </article>
  );
}
