import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Dashboard | Hinthar International School",
};

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Enrolled Students",
      value: "420",
      sub: "Year 7 – Year 13",
      icon: "school",
      color: "bg-[#0E3B7D] text-white",
    },
    {
      label: "Pending Admissions",
      value: "28",
      sub: "2026–2027 Intake",
      icon: "assignment_ind",
      color: "bg-[#FFC700] text-[#09234B]",
    },
    {
      label: "Student Clubs",
      value: "6",
      sub: "Active Societies",
      icon: "groups",
      color: "bg-[#09234B] text-white",
    },
    {
      label: "Pearson Exam Series",
      value: "Oct/Nov",
      sub: "Registration Open",
      icon: "event_available",
      color: "bg-emerald-600 text-white",
    },
  ];

  const recentApplications = [
    {
      id: "HIS-2026-8421",
      name: "Aung Kaung Myat",
      grade: "Pearson IAL (Year 12)",
      parentEmail: "kaung.myat@parent.com",
      status: "Under Review",
      statusColor: "bg-amber-100 text-amber-800",
      date: "Today, 10:45 AM",
    },
    {
      id: "HIS-2026-7912",
      name: "Su Myat Noe",
      grade: "Pearson IGCSE (Year 10)",
      parentEmail: "sumyat.n@parent.com",
      status: "Approved",
      statusColor: "bg-emerald-100 text-emerald-800",
      date: "Yesterday",
    },
    {
      id: "HIS-2026-6401",
      name: "Zaw Lin Htet",
      grade: "Lower Secondary (Year 8)",
      parentEmail: "zawlin.h@parent.com",
      status: "Assessment Scheduled",
      statusColor: "bg-[#E8F0FE] text-[#0E3B7D]",
      date: "Aug 12, 2026",
    },
    {
      id: "HIS-2026-5120",
      name: "Hnin Wutt Yee",
      grade: "Pearson IAL (Year 12)",
      parentEmail: "hnin.wy@parent.com",
      status: "Approved",
      statusColor: "bg-emerald-100 text-emerald-800",
      date: "Aug 10, 2026",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-3.5 py-1 rounded-full mb-2 border border-[#0E3B7D]/20">
            <span className="w-2 h-2 rounded-full bg-[#0E3B7D] animate-pulse" />
            <span className="text-[11px] font-black text-[#0E3B7D] uppercase tracking-wider">
              Faculty &amp; Administration Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#09234B] tracking-tight">
            Academic Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Hlaing Campus, Yangon · Pearson Edexcel Approved Centre
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/admin/admissions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">how_to_reg</span>
            <span>Review Admissions</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-sm ${stat.color}`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <span className="text-[11px] font-bold text-[#0E3B7D] bg-[#E8F0FE] px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-[#09234B] mb-0.5 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Admissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Recent Admissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#09234B] tracking-tight">
                  Recent Admission Applications
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Year 7 to 13 intake submissions requiring assessment &amp; enrollment
                </p>
              </div>
              <Link
                href="/admin/admissions"
                className="text-xs font-bold text-[#0E3B7D] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-600">
                    <th className="p-3.5 font-bold uppercase tracking-wider">Ref ID &amp; Student</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider">Grade Level</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider">Status</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-[#09234B]">{app.name}</p>
                        <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">{app.grade}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-slate-400 font-medium">{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
            <Link
              href="/admin/admissions"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0E3B7D] hover:text-[#164E9A]"
            >
              <span>Manage Application Workflow</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Right (1 Col): Quick Admin Actions & Announcements */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-[#09234B] uppercase tracking-wider mb-4">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New Notice", href: "/admin/classes", icon: "campaign", color: "text-[#0E3B7D]" },
                { label: "Add Course", href: "/admin/classes", icon: "menu_book", color: "text-[#0E3B7D]" },
                { label: "Yearbook Entry", href: "/admin/yearbook", icon: "auto_stories", color: "text-[#0E3B7D]" },
                { label: "Manage Clubs", href: "/admin/clubs", icon: "groups", color: "text-[#0E3B7D]" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-[#E8F0FE] border border-slate-200 hover:border-[#0E3B7D]/40 transition-all text-center group"
                >
                  <span className={`material-symbols-outlined text-2xl mb-1 ${item.color} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#0E3B7D]">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pearson Academic Bulletin */}
          <div className="bg-gradient-to-br from-[#09234B] to-[#0E3B7D] text-white p-5 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FFC700] text-xl font-bold">verified</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FFC700]">
                Pearson Examination Notice
              </h4>
            </div>
            <p className="text-xs text-slate-200 font-light leading-relaxed">
              Ensure all candidate entries for October/November 2026 IGCSE and IAL modules are submitted to the exam officer.
            </p>
            <div className="pt-1">
              <span className="text-[10px] font-mono text-slate-300">
                Exam Centre: Hlaing Campus Yangon (11051)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
