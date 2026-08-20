"use client";

import { useState, useEffect } from "react";
import {
  UserProfile,
  UserRole,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "../adminStore";
import { fetchUsers, getCurrentUserProfile } from "@/lib/supabase/actions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [templatesTab, setTemplatesTab] = useState<"staff_email" | "student_email" | "supabase_guide">("staff_email");
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [inviteModalData, setInviteModalData] = useState<{
    name: string;
    email: string;
    magicLink: string;
    role: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // New Account Form
  const [newForm, setNewForm] = useState({
    fullName: "",
    email: "",
    provisionMethod: "magic_link" as "magic_link" | "password",
    password: "HintharStudent2026!",
    role: "student" as UserRole,
    title: "Student Contributor",
    campusId: "ywarma-campus",
    grade: "Pearson IGCSE (Year 10)",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await getCurrentUserProfile();
        if (profile) setCurrentUser(mapUserProfileRecord(profile));
      } catch (err) {
        console.warn("Could not load current user profile:", err);
      }

      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setUsers(data.users.map(mapUserProfileRecord));
          }
        }
      } catch (err) {
        console.warn("Could not fetch API users:", err);
      }
    }
    loadData();
  }, []);

  const isPrincipal = (currentUser?.role ?? "principal") === "principal";
  const isStaff = (currentUser?.role ?? "") === "staff_admin";
  const isStudent = (currentUser?.role ?? "") === "student";

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    const campusInfo = formatCampusBadge(u.campusId);
    const matchesCampus =
      selectedCampusFilter === "All" ||
      campusInfo.city === selectedCampusFilter ||
      (selectedCampusFilter === "Both" && campusInfo.city === "Both") ||
      (selectedCampusFilter === "Yangon" && (campusInfo.city === "Yangon" || campusInfo.city === "Both")) ||
      (selectedCampusFilter === "Mawlamyine" && (campusInfo.city === "Mawlamyine" || campusInfo.city === "Both"));

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.title && u.title.toLowerCase().includes(searchLower)) ||
      (u.grade && u.grade.toLowerCase().includes(searchLower));

    return matchesRole && matchesCampus && matchesSearch;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.fullName.trim() || !newForm.email.trim()) return;

    if (isStaff && newForm.role !== "student") {
      alert("Staff administrators can only create Student Contributor accounts.");
      return;
    }

    const cleanEmail = newForm.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      alert(`An account with email ${newForm.email} already exists.`);
      return;
    }

    const initials = newForm.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

    const roleBadgeColors: Record<UserRole, string> = {
      principal: "bg-[#FFC700] text-[#09234B]",
      staff_admin: "bg-[#0E3B7D] text-white",
      student: "bg-emerald-600 text-white",
    };

    const roleLabels: Record<UserRole, string> = {
      principal: "School Principal",
      staff_admin: "Staff Administrator",
      student: "Student Contributor",
    };

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      fullName: newForm.fullName.trim(),
      role: newForm.role,
      roleLabel: roleLabels[newForm.role],
      title: newForm.title || roleLabels[newForm.role],
      campusId: newForm.campusId,
      grade: newForm.role === "student" ? newForm.grade : undefined,
      initials,
      badgeColor: roleBadgeColors[newForm.role],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Optimistically update UI
    setUsers((prev) => [newUser, ...prev]);

    const isMagicLink = newForm.provisionMethod === "magic_link";

    // Call live API
    try {
      if (isMagicLink) {
        const res = await fetch("/api/admin/users/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            full_name: newForm.fullName.trim(),
            role: newForm.role,
            title: newForm.title,
            campus_id: newForm.campusId,
            grade: newForm.grade,
          }),
        });
        const data = await res.json();
        if (data.magicLink) {
          setInviteModalData({
            name: newUser.fullName,
            email: cleanEmail,
            magicLink: data.magicLink,
            role: newUser.roleLabel,
          });
        }
      } else {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            full_name: newForm.fullName.trim(),
            role: newForm.role,
            title: newForm.title,
            campus_id: newForm.campusId,
            grade: newForm.grade,
            password: newForm.password,
            send_magic_link: false,
          }),
        });
      }
    } catch (err) {
      console.warn("Account provision API error:", err);
    }

    setIsAddModalOpen(false);
    setNewForm({
      fullName: "",
      email: "",
      provisionMethod: "magic_link",
      password: "HintharStudent2026!",
      role: "student",
      title: "Student Contributor",
      campusId: "ywarma-campus",
      grade: "Pearson IGCSE (Year 10)",
    });

    showToast(`Account provisioned for ${newUser.fullName} (${newUser.roleLabel})`);
  };

  const handleSendMagicInvite = async (user: UserProfile) => {
    setIsSendingInvite(true);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          title: user.title,
          campus_id: user.campusId,
          grade: user.grade,
        }),
      });

      const data = await res.json();
      if (data.magicLink) {
        setInviteModalData({
          name: user.fullName,
          email: user.email,
          magicLink: data.magicLink,
          role: user.roleLabel,
        });
        showToast(`Magic invite generated for ${user.email}`);
      } else {
        showToast(`Invite dispatched to ${user.email}`);
      }
    } catch (err) {
      console.warn("Magic invite error:", err);
      showToast(`Failed to generate magic link.`);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    if (target.role === "principal") {
      alert("The Principal master account cannot be disabled.");
      return;
    }

    if (isStaff && target.role !== "student") {
      alert("Staff administrators can only alter Student Contributor accounts.");
      return;
    }

    const newStatus = target.status === "active" ? "inactive" : "active";
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus as "active" | "inactive" } : u)));

    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.warn("Status toggle API note:", err);
    }

    showToast(`${target.fullName} is now ${newStatus.toUpperCase()}`);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (deletingUser.role === "principal") {
      alert("The Principal master account cannot be deleted.");
      setDeletingUser(null);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));

    try {
      await fetch(`/api/admin/users?id=${encodeURIComponent(deletingUser.id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Delete user API note:", err);
    }

    showToast(`Account for ${deletingUser.fullName} removed.`);
    setDeletingUser(null);
  };

  const copyToClipboard = (text: string, type: "link" | "template" = "link") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2500);
    }
  };

  // Pre-formatted Email Templates
  const staffEmailTemplateHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0E3B7D; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #FFC700; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .button-container { text-align: center; margin: 28px 0; }
    .button { background: #0E3B7D; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 15px; border: 2px solid #FFC700; }
    .info-box { background: #f1f5f9; border-left: 4px solid #0E3B7D; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
    .footer { background: #09234B; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>HINTHAR INTERNATIONAL SCHOOL</h1>
      <p>Faculty & Staff Administrative Access</p>
    </div>
    <div class="content">
      <p>Dear Faculty Member,</p>
      <p>You have been provisioned with an administrative account for the <strong>Hinthar International School Administration Portal</strong>.</p>
      <div class="info-box">
        <strong>Authorized Role:</strong> Staff Administrator<br>
        <strong>Accessible Modules:</strong> Admissions Management, Class Timetables, Yearbook Review & Student Societies.
      </div>
      <p>Please click the button below to accept your invitation, set your account password, and access the school management platform:</p>
      <div class="button-container">
        <a href="{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=invite" class="button">Accept Faculty Invitation & Set Password</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">This invite link is single-use and expires in 24 hours. If you have any inquiries, contact Principal Dr. Kaung Myat Htut at <a href="mailto:kaungmyat.htut@gmail.com" style="color: #0E3B7D;">kaungmyat.htut@gmail.com</a>.</p>
    </div>
    <div class="footer">
      &copy; 2026 Hinthar International School. Yangon & Mawlamyine Campuses.
    </div>
  </div>
</body>
</html>`;

  const studentEmailTemplateHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0E3B7D; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #FFC700; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .button-container { text-align: center; margin: 28px 0; }
    .button { background: #059669; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block; font-size: 15px; }
    .info-box { background: #ecfdf5; border-left: 4px solid #059669; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #065f46; }
    .footer { background: #09234B; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>HINTHAR INTERNATIONAL SCHOOL</h1>
      <p>Student Contributor Invitation</p>
    </div>
    <div class="content">
      <p>Dear Student Scholar,</p>
      <p>You have been invited to join the <strong>Hinthar International School Student Editorial & Societies Portal</strong> as an authorized Student Contributor.</p>
      <div class="info-box">
        <strong>Authorized Privileges:</strong> Alumni Yearbook Entry Submissions & Student Club Proposals.
      </div>
      <p>Click the link below to set your account password and start contributing your achievements and club activities:</p>
      <div class="button-container">
        <a href="{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=invite" class="button">Activate Student Contributor Account</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Note: Your submissions will be reviewed by faculty coordinators prior to public release on the school website.</p>
    </div>
    <div class="footer">
      &copy; 2026 Hinthar International School &bull; Pearson Edexcel Academic Excellence
    </div>
  </div>
</body>
</html>`;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09234B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FFC700]/30 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <span className="material-symbols-outlined text-[#FFC700]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E3B7D] via-[#09234B] to-[#05152E] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC700]/20 text-[#FFC700] text-xs font-bold uppercase tracking-wider mb-3 border border-[#FFC700]/30">
              <span className="material-symbols-outlined text-sm">shield_person</span>
              3-Tier RBAC & Account Invitations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Faculty & Contributor Provisioning
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Manage accounts for School Principal, Staff Administrators, and Student Contributors. Issue secure magic invite links with automated email templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Supabase Guide & Email Templates Button */}
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[#FFC700] text-lg">mail</span>
              <span>Email Templates & Setup Guide</span>
            </button>

            {/* Add User Button */}
            {(isPrincipal || isStaff) && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E5B300] text-[#09234B] font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span>{isStaff ? "Add Student Contributor" : "Provision New Account"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
            search
          </span>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {["all", "principal", "staff_admin", "student"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRoleFilter === r
                    ? "bg-white text-[#0E3B7D] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r === "all" ? "All Roles" : r === "principal" ? "Principal" : r === "staff_admin" ? "Staff" : "Students"}
              </button>
            ))}
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampusFilter}
            onChange={(e) => setSelectedCampusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          >
            <option value="All">All Campuses</option>
            <option value="Yangon">Yangon</option>
            <option value="Mawlamyine">Mawlamyine</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
              <tr>
                <th className="py-3.5 px-6">User / Identity</th>
                <th className="py-3.5 px-4">Role & Privileges</th>
                <th className="py-3.5 px-4">Assigned Campus / Grade</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const campusBadge = formatCampusBadge(user.campusId);
                const isMasterPrincipal = user.role === "principal";
                const isEditable = isPrincipal || (isStaff && user.role === "student");

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${user.badgeColor}`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                            {user.fullName}
                            {isMasterPrincipal && (
                              <span className="material-symbols-outlined text-[#FFC700] text-sm" title="Master Principal">
                                star
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            user.role === "principal"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : user.role === "staff_admin"
                              ? "bg-blue-100 text-[#0E3B7D] border border-blue-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {user.roleLabel}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{user.title}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${campusBadge.badgeClass}`}>
                          {campusBadge.label}
                        </span>
                        {user.grade && (
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            {user.grade}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {user.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Invite / Magic Link Button */}
                        <button
                          onClick={() => handleSendMagicInvite(user)}
                          disabled={isSendingInvite}
                          title="Generate & Copy Direct Magic Link"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E3B7D] text-xs font-bold border border-blue-200 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">link</span>
                          <span>Invite</span>
                        </button>

                        {/* Status Toggle */}
                        {isEditable && !isMasterPrincipal && (
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                            title={user.status === "active" ? "Deactivate Account" : "Activate Account"}
                          >
                            {user.status === "active" ? "Disable" : "Enable"}
                          </button>
                        )}

                        {/* Delete Button */}
                        {isEditable && !isMasterPrincipal && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all"
                            title="Remove Account"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#09234B]">Provision New Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct provisioning with Supabase Auth & user_profiles sync.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.fullName}
                  onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                  placeholder="e.g. Tr. Rachel Evans"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="e.g. rachel.evans@hinthar.education"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Role Permission *
                </label>
                <select
                  disabled={isStaff}
                  value={newForm.role}
                  onChange={(e) =>
                    setNewForm({
                      ...newForm,
                      role: e.target.value as UserRole,
                      title:
                        e.target.value === "student"
                          ? "Student Contributor"
                          : e.target.value === "staff_admin"
                          ? "Staff Administrator"
                          : "Principal & Founder",
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                >
                  <option value="student">Student Contributor (Yearbook & Clubs)</option>
                  {isPrincipal && <option value="staff_admin">Staff Administrator (Admissions & Classes)</option>}
                  {isPrincipal && <option value="principal">School Principal (Superadmin)</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Designation / Academic Title
                </label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="e.g. Head of Science Department"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
              </div>

              {/* Campus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Primary Campus
                </label>
                <select
                  value={newForm.campusId}
                  onChange={(e) => setNewForm({ ...newForm, campusId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                >
                  {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade (If Student) */}
              {newForm.role === "student" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Student Grade Level
                  </label>
                  <input
                    type="text"
                    value={newForm.grade}
                    onChange={(e) => setNewForm({ ...newForm, grade: e.target.value })}
                    placeholder="e.g. Pearson IGCSE (Year 10)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              )}

              {/* Provision Method */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Activation Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, provisionMethod: "magic_link" })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      newForm.provisionMethod === "magic_link"
                        ? "border-[#0E3B7D] bg-blue-50 text-[#0E3B7D] ring-2 ring-[#0E3B7D]/20"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-sm">link</span>
                      <span>Magic Invite Link</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Generate one-click login link</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, provisionMethod: "password" })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      newForm.provisionMethod === "password"
                        ? "border-[#0E3B7D] bg-blue-50 text-[#0E3B7D] ring-2 ring-[#0E3B7D]/20"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-sm">password</span>
                      <span>Set Password</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Pre-configure credentials</p>
                  </button>
                </div>
              </div>

              {newForm.provisionMethod === "password" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={newForm.password}
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white font-bold text-xs shadow-md"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Invite Generated Modal ────────────────────────────────────── */}
      {inviteModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 mb-3 border border-emerald-200">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#09234B]">Magic Invite Ready!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Account provisioned for <strong>{inviteModalData.name}</strong> ({inviteModalData.email}).
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Direct Magic Activation URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteModalData.magicLink}
                    className="w-full text-xs font-mono text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteModalData.magicLink, "link")}
                    className="px-3.5 py-2 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white text-xs font-bold flex-shrink-0 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedLink ? "done" : "content_copy"}
                    </span>
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-[#0E3B7D] mb-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Instant Delivery Options:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li>Share this direct link with the user via WhatsApp, Viber, or Telegram.</li>
                  <li>Or use our copyable email templates to email them directly.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setInviteModalData(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Templates & Supabase Guide Modal ───────────────────────── */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#09234B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FFC700]">mark_email_unread</span>
                  Email Templates & Setup Guide
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ready-to-use HTML templates and Supabase dashboard configuration steps.
                </p>
              </div>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 mb-5 gap-2">
              <button
                onClick={() => setTemplatesTab("staff_email")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                  templatesTab === "staff_email"
                    ? "border-[#0E3B7D] text-[#0E3B7D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Staff Invite Template
              </button>
              <button
                onClick={() => setTemplatesTab("student_email")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                  templatesTab === "student_email"
                    ? "border-[#0E3B7D] text-[#0E3B7D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Student Invite Template
              </button>
              <button
                onClick={() => setTemplatesTab("supabase_guide")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
                  templatesTab === "supabase_guide"
                    ? "border-[#0E3B7D] text-[#0E3B7D]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Supabase Dashboard Guide
              </button>
            </div>

            {/* Staff Email Template Tab */}
            {templatesTab === "staff_email" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Staff Admin HTML Email Template
                  </span>
                  <button
                    onClick={() => copyToClipboard(staffEmailTemplateHtml, "template")}
                    className="px-3 py-1.5 rounded-lg bg-[#0E3B7D] hover:bg-[#09234B] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedTemplate ? "done" : "content_copy"}
                    </span>
                    <span>{copiedTemplate ? "Copied HTML!" : "Copy HTML"}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono max-h-60 overflow-y-auto select-all leading-relaxed">
                  {staffEmailTemplateHtml}
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold mb-1">How to use in Supabase Dashboard:</p>
                  <p className="text-[11px] leading-relaxed">
                    Go to <strong>Authentication &rarr; Email Templates &rarr; Invite user</strong>, paste this HTML into the message body, and click Save.
                  </p>
                </div>
              </div>
            )}

            {/* Student Email Template Tab */}
            {templatesTab === "student_email" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Student Contributor HTML Email Template
                  </span>
                  <button
                    onClick={() => copyToClipboard(studentEmailTemplateHtml, "template")}
                    className="px-3 py-1.5 rounded-lg bg-[#0E3B7D] hover:bg-[#09234B] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedTemplate ? "done" : "content_copy"}
                    </span>
                    <span>{copiedTemplate ? "Copied HTML!" : "Copy HTML"}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono max-h-60 overflow-y-auto select-all leading-relaxed">
                  {studentEmailTemplateHtml}
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-bold mb-1">How to use in Supabase Dashboard:</p>
                  <p className="text-[11px] leading-relaxed">
                    Use this template when sending customized student contributor onboarding emails or in Supabase Magic Link templates.
                  </p>
                </div>
              </div>
            )}

            {/* Supabase Dashboard Guide Tab */}
            {templatesTab === "supabase_guide" && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-sm text-[#09234B] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0E3B7D]">link</span>
                    1. Site URL & Redirect URLs Setup
                  </div>
                  <p className="text-slate-600">
                    Open your Supabase Dashboard: <strong>https://supabase.com/dashboard/project/ytmylxemqrsjxdvrthxx/auth/url-configuration</strong>
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <p><strong>Site URL:</strong> http://localhost:3000</p>
                    <p><strong>Redirect URLs (Add all of the following):</strong></p>
                    <ul className="list-disc pl-4 text-blue-800">
                      <li>http://localhost:3000/auth/callback</li>
                      <li>http://localhost:3000/admin/**</li>
                      <li>https://*.hinthar.education/auth/callback</li>
                      <li>https://*.pages.dev/auth/callback</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-sm text-[#09234B] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0E3B7D]">forward_to_inbox</span>
                    2. Email Delivery (SMTP Settings)
                  </div>
                  <p className="text-slate-600">
                    Supabase default email has a rate limit of 3 emails/hour. For production, enable Custom SMTP under <strong>Project Settings &rarr; Authentication &rarr; SMTP Settings</strong> (using Resend, Brevo, SendGrid, or Google Workspace).
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-fade-in">
            <div className="w-14 h-14 bg-rose-50 rounded-2xl mx-auto flex items-center justify-center text-rose-600 mb-4 border border-rose-200">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-black text-[#09234B]">Remove Account?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove access for <strong>{deletingUser.fullName}</strong> ({deletingUser.email})?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
