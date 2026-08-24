"use client";

export default function HelpPage() {
  const contacts = [
    { icon: "call", label: "IT Support Hotline", value: "+95 9 894 332200", href: "tel:+959894332200" },
    { icon: "mail", label: "Administration Email", value: "admissions@hinthar.education", href: "mailto:admissions@hinthar.education" },
    { icon: "location_on", label: "Ywarma Campus Office", value: "No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon", href: undefined },
  ];

  const faqs = [
    {
      q: "How do I submit a Yearbook entry?",
      a: "Open Yearbook & Honors from the sidebar, use the Add Scholar button, and fill in the graduate's details. Admins publish instantly; contributors' entries go to review.",
    },
    {
      q: "Who can add students to clubs?",
      a: "Only school administrators can enroll members into clubs. Open any club in Clubs & Activities and use the members (group_add) button to add students by name — no student account required.",
    },
    {
      q: "How do notices and tasks work?",
      a: "The Noticeboard carries official messages from the administration. Actionable tasks show a Mark as Done button so you can track your progress.",
    },
    {
      q: "My account is locked or I forgot my password.",
      a: "Use Change Password in your profile menu if you know your current password. Otherwise contact IT support to have an administrator reset it for you.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-[#0E3B7D]">Help &amp; Support</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quick answers and direct lines to the people who can help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ */}
        <section className="lg:col-span-2 space-y-3" aria-label="Frequently asked questions">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white rounded-2xl border border-slate-200 group">
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-5 text-sm font-bold text-[#09234B]">
                {f.q}
                <span aria-hidden="true" className="material-symbols-outlined text-lg text-[#0E3B7D] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <p className="px-5 pb-5 text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </section>

        {/* Contacts */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 h-fit" aria-label="Contact information">
          <h2 className="text-sm font-black text-[#09234B] uppercase tracking-wider mb-4">Contact Us</h2>
          <ul className="space-y-4">
            {contacts.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-lg mt-0.5">{c.icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="text-xs font-bold text-[#0E3B7D] hover:underline break-words">
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-xs font-semibold text-slate-700">{c.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600">
            For urgent system issues affecting admissions, call the hotline during office hours:
            Monday – Friday, 9:00 AM – 4:30 PM.
          </div>
        </section>
      </div>
    </div>
  );
}
