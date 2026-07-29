"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import InnerNavbar from "../components/InnerNavbar";
import FooterSection from "../components/sections/FooterSection";

const clubs = [
  {
    id: 1,
    name: "Robotics & AI Club",
    category: "Technology",
    icon: "smart_toy",
    meetingTime: "Wednesdays, 3:30 PM",
    leadership: "President: Alex J. | Advisor: Dr. Chen",
    description: "Explore the future by building autonomous robots and learning fundamental machine learning concepts.",
    image: "/images/g1.jpg",
  },
  {
    id: 2,
    name: "Debate Society",
    category: "Academic",
    icon: "forum",
    meetingTime: "Tuesdays, 4:00 PM",
    leadership: "Captain: Michael C. | Advisor: Mrs. Smith",
    description: "Sharpen your public speaking and critical thinking skills by discussing global issues.",
    image: "/images/g2.jpg",
  },
  {
    id: 3,
    name: "Eco Warriors",
    category: "Community",
    icon: "eco",
    meetingTime: "Fridays, 3:00 PM",
    leadership: "President: Sarah L. | Advisor: Mr. Davis",
    description: "Lead sustainability initiatives on campus and organize community clean-up drives.",
    image: "/images/g3.jpg",
  },
  {
    id: 4,
    name: "Performing Arts Group",
    category: "Arts",
    icon: "theater_comedy",
    meetingTime: "Mon & Thu, 4:30 PM",
    leadership: "Director: Ms. Rahman",
    description: "Express yourself through drama, dance, and musical performances in our biannual showcases.",
    image: "/images/g4.jpg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
};

export default function ClubsView() {
  return (
    <div className="min-h-screen flex flex-col pt-24 bg-background">
      <InnerNavbar />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 md:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-academic-gold/10 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-academic-gold text-sm">groups</span>
            <span className="text-sm font-bold text-academic-gold uppercase tracking-widest">Student Life</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-oxford-blue dark:text-white mb-6 tracking-tight">
            School <span className="text-primary dark:text-primary-fixed">Clubs</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-light">
            Discover your passion, develop new skills, and make lifelong friends by joining one of our diverse student clubs.
          </p>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {clubs.map((club) => (
            <motion.div
              key={club.id}
              variants={itemVariants}
              className="bg-surface dark:bg-surface-variant rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="h-48 md:h-64 relative overflow-hidden">
                <Image
                  src={club.image}
                  alt={club.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-oxford-blue/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-academic-gold bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">{club.icon}</span>
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">{club.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold">{club.name}</h3>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                <p className="text-on-surface-variant leading-relaxed font-light">{club.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-outline-variant/30">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Meeting Time</p>
                    <p className="text-sm font-semibold text-oxford-blue dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-sm">schedule</span>
                      {club.meetingTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Leadership</p>
                    <p className="text-sm font-semibold text-oxford-blue dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-sm">person</span>
                      {club.leadership}
                    </p>
                  </div>
                </div>

                <button className="w-full py-3 mt-4 rounded-xl font-bold uppercase tracking-wider text-sm bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed hover:bg-primary hover:text-white dark:hover:bg-primary-fixed dark:hover:text-oxford-blue transition-colors flex items-center justify-center gap-2">
                  Join Club <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <FooterSection />
    </div>
  );
}
