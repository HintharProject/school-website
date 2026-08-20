"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile } from "./adminStore";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPublicPage = pathname === "/admin/login" || pathname === "/admin/update-password";
  const [isVerifying, setIsVerifying] = useState(!isAuthPublicPage);
  const [isAuthenticated, setIsAuthenticated] = useState(isAuthPublicPage);

  useEffect(() => {
    if (isAuthPublicPage) {
      setIsVerifying(false);
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      setIsVerifying(true);

      if (!isSupabaseConfigured) {
        // Supabase not configured — block access
        if (isMounted) {
          setIsAuthenticated(false);
          setIsVerifying(true);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          if (isMounted) {
            setIsAuthenticated(false);
            setIsVerifying(true);
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        // Fetch live profile from Supabase user_profiles table
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id, email, full_name, role, title, campus_id, grade, status, created_at")
          .eq("id", user.id)
          .single();

        if (profile && profile.status !== "active") {
          await supabase.auth.signOut();
          if (isMounted) {
            setIsAuthenticated(false);
            router.replace("/admin/login?error=account_disabled");
          }
          return;
        }

        if (isMounted) {
          setIsAuthenticated(true);
          setIsVerifying(false);
        }
      } catch (err) {
        console.warn("Supabase auth check error:", err);
        if (isMounted) {
          setIsAuthenticated(false);
          setIsVerifying(true);
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, isAuthPublicPage, router]);

  if (isAuthPublicPage) {
    return <>{children}</>;
  }

  if (isVerifying || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-4 border-[#FFC700] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-sm text-slate-300">Verifying administrative credentials...</p>
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
