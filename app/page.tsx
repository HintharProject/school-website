import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import SpecialisationsSection from "./components/sections/SpecialisationsSection";
import FaqSection from "./components/sections/FaqSection";
import FooterSection from "./components/sections/FooterSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SpecialisationsSection />
        <FaqSection />
      </main>
      <FooterSection />
      <ChatbotWidget />
    </>
  );
}
