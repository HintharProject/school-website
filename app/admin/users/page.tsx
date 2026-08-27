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
import { authClient } from "@/lib/auth/auth-client";
import {
  getUsers,
  getPendingInvitations,
  inviteUserAction,
  updateUserStatusAction,
  updateUserAction,
  deleteUserAction,
} from "@/lib/actions/users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", role: "student" as "admin" | "student", title: "", campusId: "ywarma-campus", grade: "" });
  const [inviteModalData, setInviteModalData] = useState<{
    name: string;
    email: string;
    inviteUrl: string;
    role: string;
    emailSent: boolean;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Account Form
  const [newForm, setNewForm] = useState({
    fullName: "",
    email: "",
    role: "student" as "admin" | "student",
    title: "Student Contributor",
    campusId: "ywarma-campus",
    grade: "Pearson IGCSE (Year 10)",
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setCurrentUser(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [usersData, invitesData] = await Promise.all([
        getUsers().catch(() => []),
        getPendingInvitations().catch(() => []),
      ]);
      setUsers(usersData.map(mapUserProfileRecord));
      setPendingInvites(invitesData || []);
    } catch (err) {
      console.warn("Could not fetch users/invites:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = (currentUser?.role ?? "admin") === "admin";

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <span aria-hidden="true" className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h2 className="text-xl font-black text-slate-800">User Account Management</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Direct account provisioning and user directory access is restricted to School Administrators.
        </p>
      </div>
    );
  }

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

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.fullName.trim() || !newForm.email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await inviteUserAction({
        fullName: newForm.fullName.trim(),
        email: newForm.email.trim(),
        role: newForm.role,
        title: newForm.title,
        campusId: newForm.campusId,
        grade: newForm.role === "student" ? newForm.grade : null,
      });

      if (!res.success || !res.inviteUrl) {
        showToast(`Error: ${(res as { error?: string }).error || "Failed to create invitation."}`);
        setIsSubmitting(false);
        return;
      }

      setIsAddModalOpen(false);
      setInviteModalData({
        name: newForm.fullName.trim(),
        email: newForm.email.trim(),
        inviteUrl: res.inviteUrl,
        role: newForm.role === "admin" ? "School Administrator" : "Student Contributor",
        emailSent: res.emailSent === true,
      });

      setNewForm({
        fullName: "",
        email: "",
        role: "student",
        title: "Student Contributor",
        campusId: "ywarma-campus",
        grade: "Pearson IGCSE (Year 10)",
      });

      showToast("Invitation created successfully!");
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to invite user."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateUserStatusAction(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      showToast(`Account status updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update status."}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteUserAction(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      showToast(`Account (${deletingUser.email}) removed.`);
      setDeletingUser(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to delete user."}`);
    }
  };

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditForm({
      fullName: u.fullName,
      role: u.role as "admin" | "student",
      title: u.title || "",
      campusId: u.campusId || "ywarma-campus",
      grade: u.grade || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await updateUserAction(editingUser.id, {
        name: editForm.fullName,
        role: editForm.role,
        title: editForm.title || null,
        campusId: editForm.campusId,
        grade: editForm.grade || null,
      });
      if ((res as { success: boolean; error?: string }).success === false) {
        showToast(`Error: ${(res as { error?: string }).error || "Failed to update."}`);
        return;
      }
      setUsers((prev) => prev.map((p) => (p.id === editingUser.id ? { ...p, fullName: editForm.fullName, role: editForm.role, title: editForm.title, campusId: editForm.campusId, grade: editForm.grade } : p)));
      showToast(`Updated ${editForm.fullName} (${editForm.role}).`);
      setEditingUser(null);
    } catch (err: any) {
      showToast(`Error: ${err.message || "Failed to update."}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 bg-[#0E3B7D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FFC700] animate-fade-in">
          <span aria-hidden="true" className="material-symbols-outlined text-[#FFC700]">check_circle</span>
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0E3B7D]">User Accounts &amp; Access</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E3B7D] font-extrabold text-xs">
              {users.length} Active Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provision single-use invitations for School Administrators and Student Contributors across all 4 campuses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">person_add</span>
          <span>Invite New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <span aria-hidden="true" className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role, title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="student">Student Contributors</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">User / Member</th>
                <th className="p-4">Role &amp; Title</th>
                <th className="p-4">Campus Assignment</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const campusInfo = formatCampusBadge(u.campusId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${u.badgeColor}`}
                          >
                            {u.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-[#0E3B7D] text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {u.roleLabel}
                        </span>
                        {u.grade && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{u.grade}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${campusInfo.badgeClass}`}>
                          {campusInfo.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                          title="Click to toggle active status"
                          aria-label={`${u.status === "active" ? "Deactivate" : "Activate"} account for ${u.fullName}`}
                        >
                          {u.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0E3B7D] hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit account (name/role) — email cannot be changed"
                            aria-label={`Edit account for ${u.fullName}`}
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Account"
                            aria-label={`Delete account for ${u.fullName}`}
                          >
                            <span aria-hidden="true" className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PENDING INVITATIONS LIST */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#09234B] uppercase tracking-wider">
              Pending Single-Use Invitations ({pendingInvites.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{inv.fullName} ({inv.email})</p>
                  <p className="text-[10px] text-slate-400">
                    Role: <strong className="uppercase">{inv.role}</strong> • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button aria-label="Copy link"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    const url = `${baseUrl}/admin/login?inviteToken=${inv.token}&email=${encodeURIComponent(inv.email)}`;
                    navigator.clipboard.writeText(url);
                    showToast("Invite link copied to clipboard!");
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-[#0E3B7D] hover:text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-xs">content_copy</span>
                  <span>Copy Link</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-black text-[#09234B]">Invite School Account</h2>
            <form onSubmit={handleCreateInvite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daw Khin Khin Aye"
                  value={newForm.fullName}
                  onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">School / Personal Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@hinthar.education"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Access Role</label>
                  <select
                    value={newForm.role}
                    onChange={(e) => {
                      const r = e.target.value as any;
                      setNewForm({
                        ...newForm,
                        role: r,
                        title: r === "admin" ? "Staff Administrator" : "Student Contributor",
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="student">Student Contributor</option>
                    <option value="admin">School Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Assignment</label>
                  <select
                    value={newForm.campusId}
                    onChange={(e) => setNewForm({ ...newForm, campusId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newForm.role === "student" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Grade Continuum</label>
                  <select
                    value={newForm.grade}
                    onChange={(e) => setNewForm({ ...newForm, grade: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Lower Secondary (Year 7–9)">Lower Secondary (Year 7–9)</option>
                    <option value="Pearson IGCSE (Year 10)">Pearson IGCSE (Year 10)</option>
                    <option value="Pearson IGCSE (Year 11)">Pearson IGCSE (Year 11)</option>
                    <option value="Pearson IAL (Year 12)">Pearson IAL (Year 12)</option>
                    <option value="Pearson IAL (Year 13)">Pearson IAL (Year 13)</option>
                  </select>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-[11px] space-y-1">
                <p className="font-bold">✨ Single-Use Invitation Mechanism:</p>
                <p>
                  Generates an onboarding link that automatically dispatches via Resend email and provides a copyable link in the modal.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Generating..." : "Dispatch Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITATION GENERATED MODAL */}
      {inviteModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">mark_email_read</span>
            </div>
            <h2 className="text-xl font-black text-[#09234B]">Invitation Created!</h2>
            <p className="text-xs text-slate-600">
              An invitation has been generated for <strong>{inviteModalData.name}</strong> ({inviteModalData.email}) with role <strong>{inviteModalData.role}</strong>.
            </p>

            {inviteModalData.emailSent ? (
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                ✓ Automated email invitation sent via Resend.
              </p>
            ) : (
              <p className="text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ℹ Direct email not sent (RESEND_API_KEY unset). Share the link below directly:
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Single-Use Onboarding URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteModalData.inviteUrl}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteModalData.inviteUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer"
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInviteModalData(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER — name/role/title/campus/grade (email immutable) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-[#09234B]">Edit Account</h3>
            <p className="text-[11px] text-slate-500">Email cannot be changed — it is the invitation identity. To change email, delete and re-invite.</p>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email (locked)</label>
                <input type="text" disabled value={editingUser.email} className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input type="text" required value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role — promotion / demotion</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "admin" | "student" })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="student">Student Contributor</option>
                    <option value="admin">School Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus</label>
                  <select value={editForm.campusId} onChange={(e) => setEditForm({ ...editForm, campusId: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {HIERARCHICAL_CAMPUS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="e.g. Senior Teacher" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              {editForm.role === "student" && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade</label>
                  <input type="text" value={editForm.grade} onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })} placeholder="Pearson IGCSE (Year 10)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#0E3B7D] text-white font-bold text-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-[#09234B]">Delete Account?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete the account for <strong>{deletingUser.fullName}</strong> ({deletingUser.email})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
