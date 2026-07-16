import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "AI Consulting Chatbot | Hinthar International School",
  description:
    "Get instant answers from our AI consulting chatbot. Available soon at Hinthar International School.",
};

export default function ChatbotPage() {
  return (
    <ComingSoon
      title="AI Consulting Chatbot"
      description="Our intelligent consulting chatbot is coming soon. It will help you find the right program, answer admission questions, and guide you through your educational journey at Hinthar."
      icon="smart_toy"
    />
  );
}
