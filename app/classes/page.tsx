import type { Metadata } from "next";
import ClassesView from "./ClassesView";
import { getCourses, getBulletins } from "@/lib/actions/classes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classes & Announcements | Hinthar International School",
  description:
    "Stay up to date with class schedules, courses, and the latest school news and announcements.",
};

export default async function ClassesPage() {
  let initialCourses: Awaited<ReturnType<typeof getCourses>> = [];
  let initialBulletins: Awaited<ReturnType<typeof getBulletins>> = [];
  try {
    [initialCourses, initialBulletins] = await Promise.all([getCourses(), getBulletins()]);
  } catch (err) {
    console.warn("Classes SSR fetch note:", err);
  }

  return <ClassesView initialCourses={initialCourses} initialBulletins={initialBulletins} />;
}
