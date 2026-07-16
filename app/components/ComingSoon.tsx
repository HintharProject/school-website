import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: string;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pt-20">
        <div className="max-w-lg w-full text-center py-24">
          {/* Icon */}
          <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-primary text-5xl">
              {icon}
            </span>
          </div>

          {/* Badge */}
          <span
            className="inline-block px-4 py-1 bg-academic-gold text-oxford-blue text-xs font-bold mb-6 rounded-sm uppercase tracking-widest"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Coming Soon
          </span>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold text-oxford-blue mb-4"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {title}
          </h1>

          {/* Description */}
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-10">
            {description}
          </p>

          {/* Progress bar (visual) */}
          <div className="w-full bg-surface-container rounded-full h-2 mb-10 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: "35%" }}
            />
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-primary-container transition-all shadow-lg"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
