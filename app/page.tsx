import Navbar from "./components/Navbar";
import AnnouncementTicker from "./components/sections/AnnouncementTicker";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import ClassesSection from "./components/sections/ClassesSection";
import CampusesPreviewSection from "./components/sections/CampusesPreviewSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import FaqSection from "./components/sections/FaqSection";
import FooterSection from "./components/sections/FooterSection";
import { getEffectiveSiteContent } from "@/lib/actions/siteContent";
import { getPublicPrograms } from "@/lib/actions/academicCatalog";
import { getPublicCampuses } from "@/lib/actions/campuses";
import { getPublishedTestimonials } from "@/lib/actions/testimonials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, programs, campuses, testimonials] = await Promise.all([
    getEffectiveSiteContent(),
    getPublicPrograms(),
    getPublicCampuses(),
    getPublishedTestimonials(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementTicker items={content.announcements} />
      <Navbar brand={content.brand} />

      <main className="flex-1">
        <HeroSection hero={content.hero} />
        <AboutSection about={content.aboutPrincipal} />
        <ClassesSection programs={programs} sections={content.homeSections} />
        <CampusesPreviewSection
          campuses={campuses}
          sections={content.homeSections}
        />
        <TestimonialsSection
          testimonials={testimonials}
          sections={content.homeSections}
        />
        <FaqSection faqs={content.faqs} sections={content.homeSections} />
      </main>

      <FooterSection brand={content.brand} />
    </div>
  );
}
