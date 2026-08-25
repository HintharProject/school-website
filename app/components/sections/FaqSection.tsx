"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_FAQS, type FaqItem } from "@/lib/content/defaults";

export default function FaqSection({ faqs = DEFAULT_FAQS }: { faqs?: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(
    faqs.find((f) => f.defaultOpen)?.id ?? null
  );

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="bg-white py-[80px] md:py-[120px] scroll-mt-20 relative overflow-hidden border-b border-slate-200"
    >
      <motion.div
        className="max-w-[860px] mx-auto px-6 md:px-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">help</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Have Questions?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#09234B] mb-4 tracking-tight">
            Frequently Asked <span className="text-[#0E3B7D]">Questions</span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto">
            Everything you need to know about our Pearson Edexcel programs, campus admissions, and student life.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                layout
                className={`rounded-2xl border ${
                  isOpen
                    ? "bg-slate-50 border-[#0E3B7D] shadow-md ring-1 ring-[#0E3B7D]/20"
                    : "bg-white border-slate-200 hover:border-[#0E3B7D]/40"
                } overflow-hidden transition-all duration-200`}
              >
                <button
                  id={`faq-btn-${faq.id}`}
                  className="flex justify-between items-center w-full p-5 md:p-6 cursor-pointer text-left focus:outline-none"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                >
                  <h3
                    className={`text-base md:text-lg font-bold pr-4 transition-colors ${
                      isOpen ? "text-[#0E3B7D]" : "text-[#09234B]"
                    }`}
                  >
                    {faq.question}
                  </h3>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? "bg-[#0E3B7D] text-[#FFC700]"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-slate-600 text-xs md:text-sm leading-relaxed font-normal border-t border-slate-200/60 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Have More Questions CTA */}
        <div className="mt-10 md:mt-12 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-[#E8F0FE]/60 p-7 md:p-9 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0E3B7D] text-[#FFC700] mb-4 shadow-md">
            <span aria-hidden="true" className="material-symbols-outlined">forum</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#09234B] tracking-tight">
            Have more questions?
          </h3>
          <p className="text-xs md:text-sm text-slate-600 mt-1.5 mb-5 font-normal">
            Our admissions team is happy to help — or get instant answers anytime.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">call</span>
              <span>Contact Us</span>
            </Link>
            <Link
              href="/chatbot"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#FFC700] text-[#0E3B7D] hover:bg-[#FFC700] hover:text-[#09234B] text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">smart_toy</span>
              <span>Ask Our AI!</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
