"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="bg-background py-[80px] md:py-[120px] scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image column */}
          <motion.div 
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-primary rounded-full blur-[80px] opacity-20 -z-10 mix-blend-multiply" />
            
            <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white max-w-md mx-auto lg:max-w-none relative group">
              <Image
                src="/images/Dr_KMH.png"
                alt="Dr. K.M.H – Principal of Hinthar International School"
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
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -right-4 sm:-right-8 lg:-bottom-10 lg:-right-10 glass-card p-6 lg:p-8 rounded-2xl max-w-[280px] hidden sm:block"
            >
              <div className="w-12 h-12 bg-academic-gold rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl">
                  format_quote
                </span>
              </div>
              <p className="text-sm lg:text-base italic mb-4 leading-relaxed text-on-surface-variant">
                &quot;Join us and discover how Hinthar Education can help you
                reach your educational goals with confidence and skill.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  KMH
                </div>
                <div>
                  <p className="text-sm font-bold text-oxford-blue">Dr. K.M.H</p>
                  <p className="text-xs text-on-surface-variant">Principal</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Text column */}
          <motion.div 
            className="space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="inline-flex items-center gap-3 bg-academic-gold/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-academic-gold animate-pulse" />
              <span className="text-sm font-bold text-academic-gold uppercase tracking-widest">
                About Us
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.2] text-oxford-blue tracking-tight">
              Empowering Students for a <span className="text-gradient-gold">Brighter Tomorrow</span>
            </h2>

            <div className="text-base md:text-lg text-on-surface-variant space-y-6 leading-relaxed font-light">
              <p>
                Hinthar Education is dedicated to empowering students with
                high-quality learning experiences that inspire confidence and
                success.
              </p>
              <p>
                Located in the heart of Yangon, Myanmar, our institution offers
                a wide range of educational programs designed to meet the
                diverse needs of learners at every stage. From Primary and
                Secondary education to internationally recognized qualifications
                such as O Level, A Level, and BCS preparation.
              </p>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">school</span>
                </div>
                <p className="text-3xl lg:text-4xl font-extrabold text-oxford-blue mb-1">100%</p>
                <p className="text-xs lg:text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Success Rate</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gradient-primary p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-white group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-academic-gold">emoji_events</span>
                </div>
                <p className="text-3xl lg:text-4xl font-extrabold mb-1">15+</p>
                <p className="text-xs lg:text-sm font-semibold text-white/80 uppercase tracking-wider">Years Excellence</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
