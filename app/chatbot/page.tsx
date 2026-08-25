import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "AI Admissions Consultant — Coming Soon | Hinthar International School",
  description:
    "Our AI Admissions & Academic Consultant is launching soon. In the meantime, contact our admissions team for Pearson Edexcel curriculum, placement, and campus inquiries.",
};

export default function ChatbotPage() {
  return (
    <ComingSoon
      title="Coming Soon!"
      description="Our AI Admissions & Academic Consultant is currently under development and will be available shortly. In the meantime, our admissions counselors are ready to help with any questions about Pearson Edexcel programs, placements, or campus life."
      icon="smart_toy"
    />
  );
}
