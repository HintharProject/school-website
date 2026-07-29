import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Hinthar International School",
};

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Students", value: "1,248", trend: "+12% this year", icon: "school", color: "bg-blue-500" },
    { label: "Pending Admissions", value: "45", trend: "Needs review", icon: "assignment", color: "bg-academic-gold text-oxford-blue" },
    { label: "Active Clubs", value: "24", trend: "2 new this month", icon: "groups", color: "bg-green-500" },
    { label: "Upcoming Events", value: "12", trend: "Next 30 days", icon: "event", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-oxford-blue dark:text-white">Dashboard Overview</h1>
        <p className="text-on-surface-variant">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} shadow-sm`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-oxford-blue dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-xs text-on-surface-variant font-medium bg-neutral-surface dark:bg-black/20 inline-block px-2 py-1 rounded-md">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30">
          <h2 className="text-lg font-bold text-oxford-blue dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-3 hover:bg-neutral-surface dark:hover:bg-black/20 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary dark:text-primary-fixed">
                  <span className="material-symbols-outlined text-sm">history</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-oxford-blue dark:text-white">New application received</p>
                  <p className="text-xs text-on-surface-variant">Grade 10 application from Sarah Connor</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 uppercase">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface dark:bg-surface-variant p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col">
          <h2 className="text-lg font-bold text-oxford-blue dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <button className="flex flex-col items-center justify-center p-4 bg-neutral-surface dark:bg-black/20 rounded-xl hover:bg-primary/5 border border-outline-variant/30 transition-colors gap-2 text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined text-3xl">post_add</span>
              <span className="text-sm font-bold">New Post</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-neutral-surface dark:bg-black/20 rounded-xl hover:bg-primary/5 border border-outline-variant/30 transition-colors gap-2 text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined text-3xl">person_add</span>
              <span className="text-sm font-bold">Add Student</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-neutral-surface dark:bg-black/20 rounded-xl hover:bg-primary/5 border border-outline-variant/30 transition-colors gap-2 text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined text-3xl">event_available</span>
              <span className="text-sm font-bold">New Event</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-neutral-surface dark:bg-black/20 rounded-xl hover:bg-primary/5 border border-outline-variant/30 transition-colors gap-2 text-primary dark:text-primary-fixed">
              <span className="material-symbols-outlined text-3xl">settings</span>
              <span className="text-sm font-bold">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
