import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "Admission Portal | Hinthar International School",
  description:
    "Apply to Hinthar International School. Our admission portal will be available soon.",
};

export default function AdmissionPage() {
  return (
    <ComingSoon
      title="Admission Portal"
      description="Our online admission portal is under development. Soon you'll be able to apply for enrollment, track your application status, and manage your admission documents all in one place."
      icon="school"
    />
  );
}
