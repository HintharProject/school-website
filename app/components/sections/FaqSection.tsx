"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    id: "courses",
    question: "What courses do you offer?",
    answer:
      "We offer a variety of courses including Primary, Secondary, O Level, IAL, and BCS preparation.",
    defaultOpen: true,
  },
  {
    id: "enroll",
    question: "How can I enroll in a course?",
    answer:
      "You can enroll by visiting our office, contacting us via phone or email, or completing the online registration form on our website.",
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, cash payments at our office, and mobile payments through popular platforms.",
  },
  {
    id: "mode",
    question: "Do you offer online and on-campus classes?",
    answer:
      "Yes, we offer both online and on-campus classes to provide flexible learning options for our students. You can choose the mode that best fits your needs.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("courses");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="bg-background py-[80px] md:py-[120px] scroll-mt-20 relative overflow-hidden"
    >
      <motion.div 
        className="max-w-[800px] mx-auto px-6 md:px-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-3 bg-academic-gold/10 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-academic-gold text-sm">help</span>
            <span className="text-sm font-bold text-academic-gold uppercase tracking-widest">
              Have Questions?
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-oxford-blue mb-6 tracking-tight">
            Frequently Asked <span className="text-gradient-gold">Questions</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                layout
                className={`rounded-2xl border ${isOpen ? "bg-white border-academic-gold/50 shadow-md" : "bg-white/50 border-outline-variant/30 hover:bg-white hover:border-academic-gold/30"} overflow-hidden transition-all duration-300`}
              >
                <button
                  id={`faq-btn-${faq.id}`}
                  className="flex justify-between items-center w-full p-5 md:p-6 cursor-pointer text-left focus:outline-none focus-visible:bg-academic-gold/5"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                >
                  <h3 className={`text-lg md:text-xl font-bold pr-4 transition-colors ${isOpen ? "text-primary" : "text-oxford-blue"}`}>
                    {faq.question}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-primary/10 text-primary" : "bg-neutral-surface text-on-surface-variant"}`}>
                    <span
                      className={`material-symbols-outlined transition-transform duration-500 ${
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
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-on-surface-variant text-sm md:text-base leading-relaxed font-light border-t border-outline-variant/10 pt-4">
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
