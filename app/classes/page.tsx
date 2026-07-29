import type { Metadata } from "next";
import ClassesView from "./ClassesView";

export const metadata: Metadata = {
  title: "Classes & Announcements | Hinthar International School",
  description:
    "Stay up to date with class schedules, courses, and the latest school news and announcements.",
};

export default function ClassesPage() {
  return <ClassesView />;
}
