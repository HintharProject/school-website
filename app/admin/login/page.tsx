import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Hinthar International School",
  description: "Secure login for Hinthar International School staff.",
};

export default function LoginPage() {
  return <LoginForm />;
}
