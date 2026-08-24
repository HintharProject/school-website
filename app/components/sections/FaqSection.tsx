"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: "curriculum",
    question: "What curriculums and examination boards are taught at Hinthar?",
    answer:
      "We officially follow the Pearson Edexcel International Curriculum, guiding students through Lower Secondary Education (Year 7–9), Pearson Edexcel IGCSE (Year 10–11), and Pearson Edexcel International Advanced Level (IAL / Year 12–13). Our qualifications are recognized worldwide for direct admission to universities in the UK, USA, Australia, Canada, Singapore, and beyond.",
    defaultOpen: true,
  },
  {
    id: "subjects",
    question: "What subject pathways are available for IGCSE and IAL?",
    answer:
      "Students can choose from specialized streams including STEM & Pure Sciences (Physics, Chemistry, Biology, Pure Mathematics), Engineering & Computer Science (Further Pure Mathematics, Mechanics, Computer Science, ICT), and Business & Commerce (Accounting, Economics, Business Studies).",
  },
  {
    id: "admission_process",
    question: "How does the admission and placement assessment work?",
    answer:
      "Parents can submit an online application via our Admission Portal. After initial review, applicants are scheduled for a friendly placement assessment (Mathematics & English) and a family consultation with our academic leads to ensure proper grade and pathway placement.",
  },
  {
    id: "exam_center",
    question: "Is Hinthar an approved Pearson Edexcel Examination Center?",
    answer:
      "Yes. Our students sit for their official Pearson Edexcel IGCSE and IAL examinations on campus with verified British Council and Pearson standards, accredited invigilators, and fully equipped science practical laboratories.",
  },
  {
    id: "modes",
    question: "Are classes full-time on campus in Yangon?",
    answer:
      "Yes. We offer full-time on-campus learning at our Hlaing Township campus in Yangon equipped with modern multimedia classrooms and STEM laboratories, accompanied by LMS revision resources for students.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("curriculum");

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
      </motion.div>
    </section>
  );
}
