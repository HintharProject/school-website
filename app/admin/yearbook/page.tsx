import { redirect } from "next/navigation";

export default function LegacyAdminYearbookPage() {
  redirect("/admin/people?tab=yearbook");
}
