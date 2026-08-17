"use client";

import { useState, useEffect } from "react";
import {
  UserProfile,
  UserRole,
  getStoredUsers,
  saveStoredUsers,
  getActiveAdminRole,
  HIERARCHICAL_CAMPUS_OPTIONS,
  formatCampusBadge,
} from "../adminStore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getActiveAdminRole());
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [inviteModalData, setInviteModalData] = useState<{
    name: string;
    email: string;
    magicLink: string;
    role: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
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
    const active = getActiveAdminRole();
    setCurrentUser(active);
    setUsers(getStoredUsers());

    const handleUsersUpdate = () => {
      setUsers(getStoredUsers());
    };
    const handleRoleUpdate = () => {
      setCurrentUser(getActiveAdminRole());
    };

    window.addEventListener("his_users_updated", handleUsersUpdate);
    window.addEventListener("his_role_updated", handleRoleUpdate);

    return () => {
      window.removeEventListener("his_users_updated", handleUsersUpdate);
      window.removeEventListener("his_role_updated", handleRoleUpdate);
    };
  }, []);

  const isPrincipal = currentUser.role === "principal";
  const isStaff = currentUser.role === "staff_admin";
  const isStudent = currentUser.role === "student";

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

  // Fetch users from live API on mount
  useEffect(() => {
    async function fetchApiUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            const roleLabels: Record<UserRole, string> = {
              principal: "School Principal",
              staff_admin: "Staff Administrator",
              student: "Student Contributor",
            };
            const roleBadgeColors: Record<UserRole, string> = {
              principal: "bg-[#FFC700] text-[#09234B]",
              staff_admin: "bg-[#0E3B7D] text-white",
              student: "bg-emerald-600 text-white",
            };
            const mapped: UserProfile[] = data.users.map((u: any) => {
              const initials = (u.full_name || "AU")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return {
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                role: u.role as UserRole,
                roleLabel: roleLabels[u.role as UserRole] || u.role,
                title: u.title || roleLabels[u.role as UserRole] || "Faculty Staff",
                campusId: u.campus_id || "ywarma-campus",
                grade: u.grade,
                initials: initials || "US",
                badgeColor: roleBadgeColors[u.role as UserRole] || "bg-[#0E3B7D] text-white",
                status: u.status === "inactive" ? "inactive" : "active",
                createdAt: u.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
              };
            });
            setUsers(mapped);
            saveStoredUsers(mapped);
          }
        }
      } catch (err) {
        console.warn("Could not fetch API users, using cached store:", err);
      }
    }
    fetchApiUsers();
  }, []);

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
    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredUsers(updated);

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
      alert("The School Principal master account cannot be suspended.");
      return;
    }

    const nextStatus = target.status === "active" ? "inactive" : "active";
    const updated = users.map((u) =>
      u.id === id ? { ...u, status: nextStatus as "active" | "inactive" } : u
    );
    setUsers(updated);
    saveStoredUsers(updated);

    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
    } catch (err) {
      console.warn("Status toggle error:", err);
    }

    showToast(`Account status set to ${nextStatus}.`);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (deletingUser.role === "principal") {
      alert("The School Principal master account cannot be deleted.");
      setDeletingUser(null);
      return;
    }

    if (isStaff && deletingUser.role !== "student") {
      alert("Staff administrators can only delete Student Contributor accounts.");
      setDeletingUser(null);
      return;
    }

    const targetId = deletingUser.id;
    const updated = users.filter((u) => u.id !== targetId);
    setUsers(updated);
    saveStoredUsers(updated);
    setDeletingUser(null);

    try {
      await fetch(`/api/admin/users?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Delete API error:", err);
    }

    showToast(`Account deleted successfully.`);
  };

  const copyMagicLinkToClipboard = () => {
    if (!inviteModalData?.magicLink) return;
    navigator.clipboard.writeText(inviteModalData.magicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If Student tries to access User Management
  if (isStudent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          User Account Management is restricted to School Principal &amp; Staff Administrators. As a Student Contributor, you can contribute to the <strong>Yearbook Gallery</strong> and <strong>Student Clubs</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-bounce">
          <span className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">Account &amp; Role Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              {users.length} Total Users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isPrincipal
              ? "Full authority: Issue accounts directly or dispatch one-time Magic Invite Links."
              : "Staff authority: Provision and dispatch Magic Invite Links for Student Contributors."}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base font-bold">person_add</span>
          <span>{isPrincipal ? "Create New User / Send Invite" : "Provision Student Account"}</span>
        </button>
      </div>

      {/* Role Counts Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FFC700] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">School Principal</p>
            <p className="text-xl font-black text-[#09234B]">
              {users.filter((u) => u.role === "principal").length} Superadmin
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">badge</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty &amp; Staff</p>
            <p className="text-xl font-black text-[#0E3B7D]">
              {users.filter((u) => u.role === "staff_admin").length} Administrators
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Contributors</p>
            <p className="text-xl font-black text-emerald-700">
              {users.filter((u) => u.role === "student").length} Scholars
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Role:</span>
            {[
              { id: "all", label: "All Roles" },
              { id: "principal", label: "Principal" },
              { id: "staff_admin", label: "Staff Admin" },
              { id: "student", label: "Students" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  selectedRoleFilter === tab.id
                    ? "bg-[#0E3B7D] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            />
          </div>
        </div>

        {/* Campus Location Filter Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#0E3B7D]">pin_drop</span>
            <span>Campus:</span>
          </span>
          {[
            { id: "All", label: "All Locations" },
            { id: "Yangon", label: "Yangon Branches" },
            { id: "Mawlamyine", label: "Mawlamyine Regional" },
            { id: "Both", label: "Both (Dual Network)" },
          ].map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedCampusFilter(loc.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedCampusFilter === loc.id
                  ? "bg-[#FFC700] text-[#09234B] font-black shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="p-4">User &amp; Email</th>
                <th className="p-4">Role / Level</th>
                <th className="p-4">Title &amp; Department</th>
                <th className="p-4">Assigned Campus / Grade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions &amp; Invites</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const canManage = isPrincipal || (isStaff && user.role === "student");
                const campusBadge = formatCampusBadge(user.campusId);

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${user.badgeColor}`}
                        >
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName}</p>
                          <p className="text-slate-400 font-mono text-[11px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.role === "principal"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : user.role === "staff_admin"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {user.roleLabel}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{user.title}</td>
                    <td className="p-4 text-slate-600 font-medium">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${campusBadge.badgeClass}`}>
                          {campusBadge.label}
                        </span>
                        {user.grade && (
                          <span className="text-[10px] text-slate-400 font-semibold">{user.grade}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          user.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {canManage && user.role !== "principal" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Magic Invite Link Button */}
                          <button
                            type="button"
                            onClick={() => handleSendMagicInvite(user)}
                            disabled={isSendingInvite}
                            title="Generate & Send Magic Invite Link"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0E3B7D] font-black text-[10px] transition-colors border border-blue-200"
                          >
                            <span className="material-symbols-outlined text-xs">mark_email_read</span>
                            <span>Magic Link</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                          >
                            {user.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] transition-colors"
                            title="Delete User Account"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Protected Master</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-black text-[#0E3B7D]">Direct Account Provisioning</h2>
                <p className="text-xs text-slate-400">Accounts &amp; Magic Invite Links are managed here.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Provisioning Mode Toggle */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
                  Provisioning Method
                </label>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, provisionMethod: "magic_link" })}
                    className={`py-2 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                      newForm.provisionMethod === "magic_link"
                        ? "bg-[#0E3B7D] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">mark_email_read</span>
                    <span>Magic Invite Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewForm({ ...newForm, provisionMethod: "password" })}
                    className={`py-2 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                      newForm.provisionMethod === "password"
                        ? "bg-[#0E3B7D] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Set Initial Password</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aung Myat Min"
                  value={newForm.fullName}
                  onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. aungmyat.min@student.hinthar.education"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Access Role</label>
                  <select
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
                            : "School Principal",
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="student">Student (Data Entry)</option>
                    {isPrincipal && <option value="staff_admin">Staff / Admin</option>}
                  </select>
                </div>

                {newForm.provisionMethod === "password" ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Initial Password</label>
                    <input
                      type="text"
                      value={newForm.password}
                      onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none font-mono"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Delivery Channel</label>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0E3B7D] font-bold text-[11px] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Instant Magic Link Dispatch</span>
                    </div>
                  </div>
                )}
              </div>

              {newForm.role === "student" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Level</label>
                  <select
                    value={newForm.grade}
                    onChange={(e) => setNewForm({ ...newForm, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
                    <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
                    <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
                    <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Campus / Scope</label>
                <select
                  value={newForm.campusId}
                  onChange={(e) => setNewForm({ ...newForm, campusId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0E3B7D] outline-none"
                >
                  {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black"
                >
                  {newForm.provisionMethod === "magic_link" ? "Dispatch Magic Invite" : "Issue Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Magic Invite Link Generated Modal ────────────────────────── */}
      {inviteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E3B7D] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">mark_email_read</span>
              </div>
              <div>
                <h3 className="text-base font-black text-[#09234B]">Magic Invite Link Ready</h3>
                <p className="text-xs text-slate-400">One-time secure authentication link</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="text-slate-500 font-medium">
                  Recipient: <strong className="text-slate-800">{inviteModalData.name}</strong> ({inviteModalData.email})
                </p>
                <p className="text-slate-500 font-medium">
                  Role: <strong className="text-slate-800">{inviteModalData.role}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Direct Magic Sign-in Link</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteModalData.magicLink}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-mono text-[11px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyMagicLinkToClipboard}
                    className={`px-3 py-2.5 rounded-xl font-black text-xs shrink-0 flex items-center gap-1 transition-all ${
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-[#0E3B7D] hover:bg-[#164E9A] text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedLink ? "check" : "content_copy"}
                    </span>
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Share this link directly with the user or let Supabase deliver it automatically to their email inbox.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInviteModalData(null)}
                className="px-5 py-2 rounded-xl bg-[#09234B] text-[#FFC700] font-black text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">Delete User Account</h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Are you sure you want to remove <strong>{deletingUser.fullName}</strong> ({deletingUser.email})?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-black text-xs text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
