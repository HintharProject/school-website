import type { Metadata } from "next";
import ChatbotPageView from "./ChatbotPageView";

export const metadata: Metadata = {
  title: "AI Admissions & Academic Consultation | Hinthar International School",
  description:
    "Get instant 24/7 answers regarding Pearson Edexcel curriculums, grade placements, admissions, and campus facilities at Hinthar International School.",
};

export default function ChatbotPage() {
  return <ChatbotPageView />;
}

