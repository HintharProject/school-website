import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import SpecialisationsSection from "./components/sections/SpecialisationsSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import FaqSection from "./components/sections/FaqSection";
import FooterSection from "./components/sections/FooterSection";
import { getSiteContentMap } from "@/lib/actions/siteContent";
import { getPublishedTestimonials } from "@/lib/actions/testimonials";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, testimonials] = await Promise.all([
    getSiteContentMap(),
    getPublishedTestimonials(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        {/* AnnouncementTicker renders inside HeroSection so the bar
            stays pinned to the hero's bottom edge within 100vh */}
        <HeroSection highlights={content.heroHighlights} />
        <AboutSection />
        <SpecialisationsSection programs={content.programs} />
        <TestimonialsSection items={testimonials} />
        <FaqSection faqs={content.faqs} />
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
