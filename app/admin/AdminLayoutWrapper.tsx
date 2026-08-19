"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { setActiveAdminRole, UserProfile, saveStoredUsers, getStoredUsers } from "./adminStore";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPublicPage = pathname === "/admin/login" || pathname === "/admin/update-password";
  const [isVerifying, setIsVerifying] = useState(!isAuthPublicPage);

  useEffect(() => {
    if (isAuthPublicPage) {
      setIsVerifying(false);
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      if (!isSupabaseConfigured) {
        if (isMounted) setIsVerifying(false);
        return;
      }

      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          if (isMounted) {
            router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }

        // Fetch live profile from Supabase user_profiles table
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          const role = profile.role || "student";
          const fullName = profile.full_name || user.email || "School Staff";
          const roleLabels: Record<string, string> = {
            principal: "School Principal & Founder",
            staff_admin: "Staff Administrator",
            student: "Student Contributor",
          };

          const initials = fullName
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "HIS";

          const activeProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            fullName,
            role,
            roleLabel: roleLabels[role] || "Staff Member",
            title: profile.title || (role === "principal" ? "Principal & CAO" : "Faculty Staff"),
            campusId: profile.campus_id || "ywarma-campus",
            grade: profile.grade,
            initials,
            badgeColor:
              role === "principal"
                ? "bg-[#FFC700] text-[#09234B]"
                : role === "staff_admin"
                ? "bg-[#0E3B7D] text-white"
                : "bg-emerald-600 text-white",
            status: profile.status || "active",
            createdAt: profile.created_at || new Date().toISOString(),
          };

          const currentUsers = getStoredUsers();
          const merged = [activeProfile, ...currentUsers.filter((u) => u.id !== activeProfile.id)];
          saveStoredUsers(merged);
          setActiveAdminRole(activeProfile.id);
        }

        if (isMounted) setIsVerifying(false);
      } catch (err) {
        console.warn("Auth check error:", err);
        if (isMounted) router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        router.push("/admin/login");
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

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#FFC700] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-sm text-slate-300">Verifying secure administrative session...</p>
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
