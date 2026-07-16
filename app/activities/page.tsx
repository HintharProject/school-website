import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "Activities & Announcements | Hinthar International School",
  description:
    "Stay up to date with Hinthar International School's latest activities, events, and announcements.",
};

export default function ActivitiesPage() {
  return (
    <ComingSoon
      title="Activities & Announcements"
      description="Our Activities and Announcements hub is on its way. You'll soon be able to browse school events, extracurricular activities, and important announcements all in one place."
      icon="campaign"
    />
  );
}
