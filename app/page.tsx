import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import HeroSection from "./components/sections/HeroSection";
import AnnouncementTicker from "./components/sections/AnnouncementTicker";
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
        <HeroSection highlights={content.heroHighlights} />
        <AnnouncementTicker messages={content.announcements} />
        <AboutSection />
        <SpecialisationsSection programs={content.programs} />
        <FaqSection faqs={content.faqs} />
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
