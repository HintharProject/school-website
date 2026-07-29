import type { Metadata } from "next";
import YearbookGallery from "./YearbookGallery";

export const metadata: Metadata = {
  title: "Year Book | Hinthar International School",
  description:
    "Explore Hinthar International School's annual yearbook — celebrating student achievements and memories.",
};

export default function YearbookPage() {
  return (
    <YearbookGallery />
  );
}
