import type { Metadata } from "next";
import AdmissionForm from "./AdmissionForm";

export const metadata: Metadata = {
  title: "Admissions | Hinthar International School",
  description:
    "Apply to Hinthar International School. Take the first step towards a brighter future by filling out our online application form.",
};

export default function AdmissionPage() {
  return <AdmissionForm />;
}
