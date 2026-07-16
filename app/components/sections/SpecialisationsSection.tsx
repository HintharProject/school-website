"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring" } },
};

const specialisations = [
  {
    id: "engineering",
    title: "Engineering",
    icon: "engineering",
    description:
      "Develop technical expertise and problem-solving abilities through hands-on learning.",
    image:
      "https://lh3.googleusercontent.com/aida/AP1WRLuj0jH-Eo42DVI0hnp8rL4wmW3Kth2U8Z4qwH8nYmKmOTyZgYkVp-WRkNfSD5Q6F3fMEzPW_jz0RBtbBF_NTUizCT37mTDIkyuBfa9_nDj-r84_t-t-2gwG1VWjCbaUQsIEJQzocST2R2Ov0qt9bLPyYDY01YT3rbb6JnC63WReDZZTDt8wy92MeZ_DUW_SYtTaBrol6Z_Qi-uPoTq8Y01HGSaZYy3KsM0sS-7xjCHP8G6psHLyA-kwMg",
  },
  {
    id: "it",
    title: "Information Technology",
    icon: "developer_board",
    description:
      "Master digital transformation and technical implementation in a connected world.",
    image:
      "https://lh3.googleusercontent.com/aida/AP1WRLubSOzy0hIVdU-OIXQJq9sleqvpygjkiLIi-0EtMI78CjSIavfUdFQ232oK_gDg10GOB8nKQG2NbaisHwYQQoT1ggV1es1srgGjtPrfZJWj5-dY_b3-Tv6CguByN649rwstTDWY4879DY4xHvdb9r5gpGvAj_yI4lPMZLVcaHX7WXHd0v0C0f0ipNesCgc6IjPko6YL-JaiRUs3XgFvBuVm4q4XsopEHObf9QUzH6X60_epq_u9NizbvlQ",
  },
  {
    id: "business",
    title: "Business",
    icon: "corporate_fare",
    description:
      "Cultivate leadership, management skills, and strategic thinking for the global market.",
    image:
      "https://lh3.googleusercontent.com/aida/AP1WRLsHQ4d-Yv2CqNgm6l7b4ysFXR2tj9vMPfbhpr6fAHgFDfqQL6AXsFRDlRw2ZzaoQI3Tl-bGqMV2_mg9OQjJHPAeKE-sd-EWylhk7vaPebUsiCpqsUPIl5RthiE8CmZTctl9Sp3T4CKHeOV5DyqcrCrLAIgYn3YZ7Fq4s1gkee1c5D0kpNTpW1Hiub1L79MKExKyksWqIeC6G7RttBdCQKESfHzuyneWkioWwpnkRDizVR_ghki4T63ebUQ",
  },
  {
    id: "medical",
    title: "Medical",
    icon: "stethoscope",
    description:
      "Foundational science and preparation for prestigious medical careers worldwide.",
    image:
      "https://lh3.googleusercontent.com/aida/AP1WRLsh_skzIdmnZdKSHk8e4gfg4nGWOR9WKXfRtEuk1r6s9jLgr4648f3KCLhrQBMwbi-cJjIK5PyL3oq_573s1FwK-cKOVnRa60RsPNuZDjmjn-PwpTsL5yNfTivUkHCf_P1Pi22-MmjsyHzmNTQutdq9PoMlK5w-Aa0xQYDmNxkw6Z7Nyw7QEwVVA-nqsXg8HVGTGZ1f-F3emoVFDNowNQmdscvgfG0iQ_Js_jmmR1CyL26qInTnsxgzS_w",
  },
];

export default function SpecialisationsSection() {
  return (
    <section
      id="specialisations"
      className="bg-neutral-surface py-[80px] md:py-[120px] scroll-mt-20 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-[500px] bg-academic-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10">
        {/* Heading */}
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
            <span className="material-symbols-outlined text-academic-gold text-sm">stars</span>
            <span className="text-sm font-bold text-oxford-blue uppercase tracking-widest">
              Our Expertise
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-oxford-blue mb-6 tracking-tight">
            Our <span className="text-primary">Specialisations</span>
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant font-light">
            Develop technical expertise and problem-solving abilities through
            our highly specialized and internationally recognized academic tracks.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {specialisations.map((spec) => (
            <motion.div
              key={spec.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col relative"
            >
              {/* Card image */}
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-oxford-blue/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <Image
                  src={spec.image}
                  alt={`${spec.title} Specialisation`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Floating Icon */}
                <div className="absolute -bottom-6 right-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center z-20 group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {spec.icon}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 pt-8 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-oxford-blue mb-3 tracking-tight group-hover:text-primary transition-colors">
                  {spec.title}
                </h3>
                <p className="text-sm md:text-base text-on-surface-variant mb-6 flex-1 leading-relaxed font-light">
                  {spec.description}
                </p>
                <div className="mt-auto">
                  <a
                    href="#"
                    aria-label={`Read more about ${spec.title}`}
                    className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wider uppercase group/link"
                  >
                    Read More 
                    <span className="material-symbols-outlined text-sm bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-all">
                      arrow_forward
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
