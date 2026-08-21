"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { authClient } from "@/lib/auth/auth-client";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPublicPage = pathname === "/admin/login" || pathname === "/admin/update-password";

  const { data: session, isPending } = authClient.useSession();
  const [isVerifying, setIsVerifying] = useState(!isAuthPublicPage);

  useEffect(() => {
    if (isAuthPublicPage) {
      setIsVerifying(false);
      return;
    }

    if (!isPending) {
      if (!session?.user) {
        setIsVerifying(true);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      } else if ((session.user as any).status === "inactive" || (session.user as any).status === "suspended") {
        authClient.signOut().then(() => {
          router.replace("/admin/login?error=account_disabled");
        });
      } else {
        setIsVerifying(false);
      }
    }
  }, [session, isPending, isAuthPublicPage, pathname, router]);

  if (isAuthPublicPage) {
    return <>{children}</>;
  }

  if (isVerifying || isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-4 border-[#FFC700] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-sm text-slate-300">Verifying administrative session...</p>
        <p className="text-xs text-slate-500 mt-1">Authentication required to access management portal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
