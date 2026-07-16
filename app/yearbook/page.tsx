import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "Year Book | Hinthar International School",
  description:
    "Explore Hinthar International School's annual yearbook — celebrating student achievements and memories.",
};

export default function YearbookPage() {
  return (
    <ComingSoon
      title="School Year Book"
      description="Our digital Year Book is being crafted to celebrate the achievements, memories, and milestones of Hinthar students. Check back soon to relive the year's best moments."
      icon="photo_album"
    />
  );
}
