"use client";

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 70, damping: 15 } 
  },
};

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-[100svh] flex flex-col justify-center items-center pt-20 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-oxford-blue/50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-oxford-blue/70 z-10" />
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-[15000ms] ease-out hover:scale-110"
          style={{ backgroundImage: "url(/images/graduation.png)" }}
        />
      </div>



      {/* Main Content (Centered) */}
      <div className="relative z-20 w-full max-w-[900px] mx-auto px-6 md:px-8 text-white text-center mt-[-40px]">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col items-center">
          <motion.span
            variants={itemVariants}
            className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-academic-gold text-xs md:text-sm font-bold mb-6 rounded-full uppercase tracking-[0.2em] shadow-lg"
          >
            {"Excellence in Education"}
          </motion.span>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-[64px] lg:text-[72px] font-extrabold leading-[1.1] mb-6 text-shadow-lg tracking-tight"
          >
            Delivering <span className="text-gradient-gold">Quality</span> Education
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-xl mb-10 text-shadow-md opacity-90 leading-relaxed max-w-2xl font-light mx-auto"
          >
            Your gateway to a brighter future. Empowering young minds with
            high-quality learning experiences that inspire confidence and success.
          </motion.p>
          
          {/* Quick Inquiry Form */}
          <motion.form variants={itemVariants} className="w-full max-w-md mx-auto relative mb-12">
            <div className="flex bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-1.5 shadow-lg focus-within:ring-2 focus-within:ring-academic-gold transition-all">
              <span className="material-symbols-outlined text-white/50 pl-4 self-center">mail</span>
              <input 
                type="email" 
                placeholder="Enter your email to learn more" 
                className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder:text-white/50 text-sm md:text-base"
                required
              />
              <button 
                type="submit"
                className="bg-academic-gold text-oxford-blue px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors whitespace-nowrap flex items-center gap-2"
              >
                Inquire <span className="hidden sm:inline">Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>

      {/* Scrolling News Ticker */}
      <div className="absolute bottom-0 left-0 w-full bg-primary/90 backdrop-blur-md border-t border-white/10 text-white py-3 z-30 overflow-hidden flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent z-40" />
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            Admissions open for 2024-2025 Academic Year
          </span>
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            New Advanced IT Curriculum Introduced
          </span>
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            Scholarship Application Deadline: August 31st
          </span>
          {/* Duplicate for infinite effect */}
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            Admissions open for 2024-2025 Academic Year
          </span>
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            New Advanced IT Curriculum Introduced
          </span>
          <span className="mx-8 flex items-center gap-2 text-sm font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" /> 
            Scholarship Application Deadline: August 31st
          </span>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary to-transparent z-40" />
      </div>
    </section>
  );
}
