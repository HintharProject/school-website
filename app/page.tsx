import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import SpecialisationsSection from "./components/sections/SpecialisationsSection";
import FaqSection from "./components/sections/FaqSection";
import FooterSection from "./components/sections/FooterSection";
import { getSiteContentMap } from "@/lib/actions/siteContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContentMap();

  return (
    <>
      <Navbar />
      <main>
        {/* AnnouncementTicker renders inside HeroSection so the bar
            stays pinned to the hero's bottom edge within 100vh */}
        <HeroSection highlights={content.heroHighlights} />
        <AboutSection />
        <SpecialisationsSection programs={content.programs} />
        <FaqSection faqs={content.faqs} />
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
