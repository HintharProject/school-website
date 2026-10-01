import { redirect } from "next/navigation";

export default function LegacyAdminStaffPage() {
  redirect("/admin/people?tab=staff");
}
