"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkAdmissionStatusAction, AdmissionStatusView } from "@/lib/actions/admissions";

const STATUS_STEPS = [
  { key: "submitted", label: "Application Received", icon: "mark_email_read", desc: "Your application has been received." },
  { key: "review", label: "Under Review", icon: "pending_actions", desc: "Admissions reviewing within 24–48h." },
  { key: "assessment", label: "Placement Test", icon: "edit_note", desc: "Diagnostic assessment scheduling." },
  { key: "decision", label: "Final Decision", icon: "verified", desc: "Enrollment confirmation." },
] as const;

function stepState(app: AdmissionStatusView | null, step: (typeof STATUS_STEPS)[number]["key"]) {
  if (!app) return "idle" as const;
  switch (step) {
    case "submitted":
      return "done" as const;
    case "review":
      return app.status === "Pending" ? ("current" as const) : ("done" as const);
    case "assessment":
      if (app.status === "Assessment Scheduled") return "current" as const;
      return app.status === "Pending" ? ("idle" as const) : ("done" as const);
    case "decision":
      if (app.status === "Approved" || app.status === "Declined") return app.status === "Approved" ? ("approved" as const) : ("declined" as const);
      return "idle" as const;
  }
}

export default function PortalClient() {
  const searchParams = useSearchParams();
  const [applicationId, setApplicationId] = useState(searchParams.get("ref") || "");
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [application, setApplication] = useState<AdmissionStatusView | null>(null);
  const [copied, setCopied] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Remember last successful lookup (MY optional — stored locally, fallback to EN if empty)
  useEffect(() => {
    if (searchParams.get("ref")) setApplicationId(searchParams.get("ref") || "");
    try {
      const savedId = localStorage.getItem("portal:lastRef");
      const savedEmail = localStorage.getItem("portal:lastEmail");
      if (savedId && !searchParams.get("ref")) setApplicationId(savedId);
      if (savedEmail) setParentEmail(savedEmail);
    } catch {}
  }, [searchParams]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setApplication(null);

    try {
      const result = await checkAdmissionStatusAction({
        applicationId: applicationId.trim(),
        parentEmail: parentEmail.trim(),
      });

      if (!result.success || !result.application) {
        setErrorMessage(result.error || "No application found for that reference code and guardian email combination.");
        // scroll to form to show error
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      } else {
        setApplication(result.application);
        try {
          localStorage.setItem("portal:lastRef", applicationId.trim().toUpperCase());
          localStorage.setItem("portal:lastEmail", parentEmail.trim().toLowerCase());
        } catch {}
        // scroll down to timeline
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    } catch {
      setErrorMessage("Something went wrong while checking your status. Please try again.");
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } finally {
      setLoading(false);
    }
  };

  const decision = application?.status === "Approved" ? "approved" : application?.status === "Declined" ? "declined" : null;

  const copyRef = async () => {
    if (!application?.applicationId) return;
    try {
      await navigator.clipboard.writeText(application.applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Lookup Form */}
      <form
        ref={formRef}
        onSubmit={handleLookup}
        className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D]">search</span>
          <h2 className="text-sm font-black text-[#09234B] uppercase tracking-wider">Check Status</h2>
          {(typeof window !== "undefined" && localStorage.getItem("portal:lastRef")) && (
            <span className="ml-auto text-[10px] text-slate-400">Last lookup remembered</span>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="portal-ref" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
            Application Reference Code
          </label>
          <div className="relative">
            <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base">
              tag
            </span>
            <input
              id="portal-ref"
              type="text"
              required
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value.toUpperCase())}
              placeholder="HIS-2026-123456"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs font-mono tracking-wider"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="portal-email" className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
            Guardian Email (used during application)
          </label>
          <div className="relative">
            <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base">
              mail
            </span>
            <input
              id="portal-email"
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="guardian@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
            />
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
            <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0 text-red-500 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3 rounded-xl font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
        >
          <span>{loading ? "Checking Status..." : "Check Application Status"}</span>
          <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">search</span>
        </button>

        <p className="text-[11px] text-slate-400 text-center">
          Lost your reference code? Contact the Admissions Office at{" "}
          <a href="tel:+959894332200" className="text-[#0E3B7D] font-bold hover:underline">+95 9 894 332200</a> with the guardian&apos;s phone number.
        </p>
      </form>

      {/* Status Result */}
      {application && (
        <div ref={resultRef} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden scroll-mt-24">
          {/* Header card with actions */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-[#0E3B7D] bg-[#E8F0FE] px-2.5 py-1 rounded-full border border-[#0E3B7D]/15">
                    {application.applicationId}
                  </span>
                  <button onClick={copyRef} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#0E3B7D] hover:border-[#0E3B7D]/30 transition-colors cursor-pointer">
                    <span aria-hidden="true" className="material-symbols-outlined text-xs">{copied ? "check" : "content_copy"}</span>
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button onClick={() => window.print()} className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:text-[#0E3B7D] transition-colors cursor-pointer">
                    <span aria-hidden="true" className="material-symbols-outlined text-xs">print</span>
                    <span>Print</span>
                  </button>
                </div>
                <h2 className="text-xl font-black text-[#09234B] tracking-tight mt-2 truncate">
                  {application.studentName}
                </h2>
                <p className="text-xs text-slate-500">
                  Applied: {application.submittedDate} &middot; Program: {application.grade} {application.intendedStartTerm ? `• ${application.intendedStartTerm}` : ""}
                </p>
                {application.parentName && <p className="text-[11px] text-slate-400">Guardian: {application.parentName}</p>}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    application.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : application.status === "Declined"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : application.status === "Assessment Scheduled"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-[#0E3B7D] border-[#0E3B7D]/20"
                  }`}
                >
                  {application.status}
                </span>
                {/* QR for reference (print/share) */}
                <img
                  alt="Reference QR"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(application.applicationId)}`}
                  className="w-12 h-12 rounded-lg border border-slate-200 bg-white hidden sm:block"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Full details — subjects stay EN per no-translate, other fields bilingual fallback already handled in D1 */}
            {(application.selectedSubjects && application.selectedSubjects.length > 0) || application.academicStream || application.studyMode ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {application.academicStream && (
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Academic Stream</span>
                    <span className="font-semibold text-slate-800">{application.academicStream}</span>
                  </div>
                )}
                {application.studyMode && (
                  <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Study Mode</span>
                    <span className="font-semibold text-slate-800">{application.studyMode}</span>
                  </div>
                )}
                {application.selectedSubjects && application.selectedSubjects.length > 0 && (
                  <div className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Selected Subjects — English only</span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.selectedSubjects.map((s) => (
                        <span key={s} className="px-2 py-1 rounded-full bg-[#FFF8E1] border border-[#FFC700] text-[#09234B] text-[11px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Timeline — horizontal on desktop, vertical on mobile */}
          <div className="p-6 sm:p-8">
            {/* Desktop horizontal */}
            <div className="hidden sm:flex items-start justify-between gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const state = stepState(application, step.key);
                const isLast = idx === STATUS_STEPS.length - 1;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center text-center relative">
                    {!isLast && (
                      <div className={`absolute top-4 left-[60%] right-[-40%] h-0.5 ${state === "done" || state === "current" || state === "approved" ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all z-10 ${
                        state === "done"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : state === "current"
                          ? "bg-white border-[#0E3B7D] text-[#0E3B7D] ring-4 ring-[#0E3B7D]/15"
                          : state === "approved"
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : state === "declined"
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">
                        {state === "done" || state === "approved" ? "check" : state === "declined" ? "close" : step.icon}
                      </span>
                    </div>
                    <p className={`mt-2 text-xs font-bold ${state === "idle" ? "text-slate-400" : "text-[#09234B]"}`}>{step.label}</p>
                    <p className="text-[11px] text-slate-500 max-w-[150px]">{step.desc}</p>
                    {step.key === "assessment" && application.assessmentDate && (
                      <p className="text-[11px] font-semibold text-[#0E3B7D] mt-1">{application.assessmentDate}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile vertical */}
            <div className="sm:hidden space-y-5">
              {STATUS_STEPS.map((step, idx) => {
                const state = stepState(application, step.key);
                const isLast = idx === STATUS_STEPS.length - 1;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                          state === "done"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : state === "current"
                            ? "bg-white border-[#0E3B7D] text-[#0E3B7D] ring-4 ring-[#0E3B7D]/15"
                            : state === "approved"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : state === "declined"
                            ? "bg-red-500 border-red-500 text-white"
                            : "bg-white border-slate-200 text-slate-300"
                        }`}
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base">
                          {state === "done" || state === "approved" ? "check" : state === "declined" ? "close" : step.icon}
                        </span>
                      </div>
                      {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${state === "done" ? "bg-emerald-500" : "bg-slate-200"}`} />}
                    </div>
                    <div className="pb-1">
                      <p className={`text-xs font-bold ${state === "idle" ? "text-slate-400" : "text-[#09234B]"}`}>{step.label}</p>
                      <p className="text-[11px] text-slate-500">{step.desc}</p>
                      {step.key === "assessment" && application.assessmentDate && (
                        <p className="text-[11px] text-[#0E3B7D] font-semibold mt-1">{application.assessmentDate} — arrive 15m early</p>
                      )}
                      {step.key === "decision" && state === "approved" && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">Congratulations — {application.grade}</p>
                      )}
                      {step.key === "decision" && state === "declined" && (
                        <p className="text-[11px] text-slate-500 mt-1">Not successful this intake — contact admissions for guidance.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assessment / decision extra copy for desktop */}
            <div className="hidden sm:block mt-6 space-y-2 text-[11px] text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200">
              {application.status === "Pending" && <p>Our Admissions Office is reviewing the application. Families are contacted within 24–48 hours to arrange the placement assessment.</p>}
              {application.status === "Assessment Scheduled" && application.assessmentDate && <p>Scheduled for <strong>{application.assessmentDate}</strong> — please arrive 15 minutes early with original documents.</p>}
              {application.status === "Approved" && <p className="text-emerald-700 font-semibold">Welcome to Hinthar! Present original documents at the campus office to complete enrollment.</p>}
              {application.status === "Declined" && <p>Unfortunately not successful at this time. Contact Admissions for future intakes.</p>}
            </div>
          </div>

          <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] text-slate-400">Last updated: {application.updatedAt}</p>
            <div className="flex items-center gap-2">
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(application.applicationId)}`} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-600 hover:text-[#0E3B7D] inline-flex items-center gap-1">
                <span aria-hidden="true" className="material-symbols-outlined text-sm">qr_code</span>
                <span>QR Share</span>
              </a>
              <Link href="/admission" className="text-xs font-bold text-[#0E3B7D] hover:underline inline-flex items-center gap-1">
                <span aria-hidden="true" className="material-symbols-outlined text-sm">add_circle</span>
                <span>Submit Another</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {decision === "approved" && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
          <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0 text-emerald-600 mt-0.5">celebration</span>
          <span>Welcome to the Hinthar family! Please present the original documents at the campus office to complete enrollment and receive your class timetable.</span>
        </div>
      )}
    </div>
  );
}
