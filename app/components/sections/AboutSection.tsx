"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="bg-white py-[80px] md:py-[120px] scroll-mt-20 overflow-hidden border-b border-slate-200/80"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image column */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#0E3B7D]/10 rounded-full blur-3xl -z-10" />

            <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200 max-w-md mx-auto lg:max-w-none relative group">
              <Image
                src="/images/Dr_KMH.png"
                alt="Dr. Kaung Myat Htut – Principal of Hinthar International School"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Quote card (Glassmorphism) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute -bottom-8 -right-4 sm:-right-8 lg:-bottom-10 lg:-right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl max-w-[320px] hidden sm:block border border-slate-200 shadow-xl"
            >
              <div className="w-10 h-10 bg-[#FFC700] rounded-full flex items-center justify-center mb-3 shadow-md">
                <span className="material-symbols-outlined text-[#09234B] text-xl font-bold">
                  format_quote
                </span>
              </div>
              <p className="text-xs sm:text-sm italic mb-4 leading-relaxed text-slate-700">
                &quot;Join us and discover how Hinthar empowers every student to reach their academic dreams with confidence, discipline, and globally accredited qualifications.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0E3B7D] text-[#FFC700] flex items-center justify-center font-black text-xs shadow-sm">
                  KMH
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0E3B7D]">Dr. Kaung Myat Htut</p>
                  <p className="text-[11px] font-medium text-slate-500">Principal &amp; Founder</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text column */}
          <motion.div
            className="space-y-6 order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1.5 rounded-full border border-[#0E3B7D]/20">
              <div className="w-2 h-2 rounded-full bg-[#0E3B7D] animate-pulse" />
              <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
                About Hinthar International
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-black leading-[1.2] text-[#09234B] tracking-tight">
              A Proven Standard of <span className="text-[#0E3B7D]">Academic Excellence</span>
            </h2>

            <div className="text-sm md:text-base text-slate-600 space-y-4 leading-relaxed font-normal">
              <p>
                Located in <strong>Hlaing Township, Yangon</strong>, Hinthar International School provides world-class education tailored to prepare Myanmar students for prestigious global universities and lifelong leadership.
              </p>
              <p>
                Our rigorous academic programs encompass <strong>Lower Secondary Education (Year 7–9)</strong> progressing through to globally recognized <strong>Pearson Edexcel IGCSE (Year 10–11)</strong> and <strong>International Advanced Level (IAL / Year 12–13)</strong> qualifications.
              </p>
              <p>
                Through small class sizes, state-of-the-art STEM and computing laboratories, and dedicated British Council certified faculty, we provide individualized mentoring and holistic character building for every learner.
              </p>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-3">
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center mb-3 text-[#0E3B7D]">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[#09234B] mb-0.5">Pearson</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Edexcel Curriculum</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center mb-3 text-[#0E3B7D]">
                  <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[#09234B] mb-0.5">100%</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">University Pass Rate</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#09234B] to-[#0E3B7D] p-4 sm:p-5 rounded-2xl shadow-md transition-all text-white"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 text-[#FFC700]">
                  <span className="material-symbols-outlined text-xl">emoji_events</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black mb-0.5">15+</p>
                <p className="text-[11px] font-bold text-[#FFC700] uppercase tracking-wider">Years of Dedication</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
