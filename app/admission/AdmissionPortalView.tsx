"use client";

import { useMemo, useState } from "react";
import {
  GraduationCap,
  IdentificationBadge,
  CheckCircle,
  UploadSimple,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  SpinnerGap,
  WarningCircle,
  CalendarCheck,
  ClockCountdown,
  FileText,
} from "@phosphor-icons/react";
import type { AdmissionsConfigContent } from "@/lib/content/defaults";
import type { CatalogProgram } from "@/lib/academic/catalog";
import {
  submitPublicAdmissionAction,
  checkAdmissionStatusAction,
  type AdmissionStatusView,
} from "@/lib/actions/admissions";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField, locList } from "@/lib/i18n/loc";

type DocSlotType = "identity" | "report" | "photo";

interface UploadedDoc {
  type: DocSlotType;
  url: string;
  filename: string;
}

export default function AdmissionPortalView({
  config,
  programs,
  initialTab,
  initialRef,
  initialProgramId,
  initialRegion,
}: {
  config: AdmissionsConfigContent;
  programs: CatalogProgram[];
  initialTab: "apply" | "track";
  initialRef: string;
  initialProgramId: string;
  initialRegion: "Yangon" | "Mawlamyine";
}) {
  const locale = useLocale();
  const t = useT();

  const [activeTab, setActiveTab] = useState<"apply" | "track">(initialTab);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Localized dropdown options from Admin CMS config
  const terms =
    Array.isArray(config?.intendedStartTerms) && config.intendedStartTerms.length > 0
      ? config.intendedStartTerms
      : ["Term 1 (August 2026)", "Term 2 (January 2027)", "Term 3 (April 2027)", "Immediate Placement / Transfer"];
  const studyModes =
    Array.isArray(config?.studyModes) && config.studyModes.length > 0
      ? config.studyModes
      : ["Full-Time On-Campus (Mon–Fri)", "1-Year Intensive Pearson IGCSE", "Modular Pearson IAL Pathway", "Pearson Examination Candidate"];
  const streams =
    Array.isArray(config?.academicStreams) && config.academicStreams.length > 0
      ? config.academicStreams
      : ["STEM & Engineering", "Medicine & Life Sciences", "Computing & AI", "Business, Economics & Accounting", "Law, Humanities & Social Sciences"];
  const relationships =
    Array.isArray(config?.relationships) && config.relationships.length > 0
      ? config.relationships
      : ["Parent", "Father", "Mother", "Legal Guardian", "Relative"];

  // Step 1 state
  const defaultProgram =
    programs.find((p) => p.id === initialProgramId) ?? programs[0];
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [nationality, setNationality] = useState("Myanmar");
  const [previousSchool, setPreviousSchool] = useState("");
  const [preferredRegion, setPreferredRegion] =
    useState<"Yangon" | "Mawlamyine">(initialRegion);
  const [selectedProgramId, setSelectedProgramId] = useState(
    defaultProgram?.id ?? "pearson-igcse"
  );
  const [academicStream, setAcademicStream] = useState(
    streams[0] ?? "STEM & Engineering"
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 2 state
  const [parentName, setParentName] = useState("");
  const [relationship, setRelationship] = useState(
    relationships[0] ?? "Parent"
  );
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [intendedStartTerm, setIntendedStartTerm] = useState(
    terms[0] ?? "Term 1 (August 2026)"
  );
  const [studyMode, setStudyMode] = useState(
    studyModes[0] ?? "Full-Time On-Campus (Mon–Fri)"
  );
  const [address, setAddress] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // Step 3 state (documents + submission)
  const [documents, setDocuments] = useState<
    Partial<Record<DocSlotType, UploadedDoc>>
  >({});
  const [uploadingSlot, setUploadingSlot] = useState<DocSlotType | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Track Application Status state
  const [lookupRef, setLookupRef] = useState(initialRef);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<AdmissionStatusView | null>(
    null
  );

  const activeProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) ?? programs[0],
    [programs, selectedProgramId]
  );

  const anyDocumentRequired =
    config.documentRules.identityRequired ||
    config.documentRules.reportRequired ||
    config.documentRules.photoRequired;

  function toggleSubject(subjectName: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  }

  async function handleFileUpload(slot: DocSlotType, file: File) {
    setFormError(null);
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("documentType", slot);
      fd.append("file", file);
      const res = await fetch("/api/admission/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        document?: UploadedDoc;
      };
      if (!res.ok || !json.success || !json.document) {
        setFormError(json.error || "Document upload failed. Please try again.");
      } else {
        setDocuments((prev) => ({ ...prev, [slot]: json.document }));
      }
    } catch {
      setFormError("Document upload failed. Please check your connection.");
    } finally {
      setUploadingSlot(null);
    }
  }

  function goNextFromStep1() {
    if (studentName.trim().length < 2) {
      setFormError("Please enter the student's full name.");
      return;
    }
    setFormError(null);
    setStep(2);
  }

  function goNextFromStep2() {
    if (parentName.trim().length < 2) {
      setFormError("Please enter the parent or legal guardian's full name.");
      return;
    }
    if (!parentEmail.includes("@")) {
      setFormError("Please enter a valid guardian email address.");
      return;
    }
    if (parentPhone.trim().length < 5) {
      setFormError("Please enter a valid guardian phone number.");
      return;
    }
    setFormError(null);
    setStep(3);
  }

  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);

    try {
      const programLevel =
        activeProgram?.programLevel === "lower_secondary" ||
        activeProgram?.programLevel === "igcse" ||
        activeProgram?.programLevel === "ial"
          ? activeProgram.programLevel
          : "igcse";

      const result = await submitPublicAdmissionAction({
        studentName: studentName.trim(),
        dateOfBirth: dateOfBirth || null,
        gender,
        nationality: nationality.trim() || "Myanmar",
        grade: activeProgram?.nameEn || "Pearson Edexcel IGCSE",
        programLevel,
        targetProgramId: activeProgram?.id || null,
        preferredRegion,
        academicStream,
        selectedSubjects,
        documentUrls: Object.values(documents).filter(
          (d): d is UploadedDoc => Boolean(d)
        ),
        intendedStartTerm,
        studyMode,
        previousSchool: previousSchool.trim() || null,
        parentName: parentName.trim(),
        relationship,
        parentEmail: parentEmail.trim(),
        parentPhone: parentPhone.trim(),
        address: address.trim() || null,
        medicalNotes: medicalNotes.trim() || null,
      });

      if (!result.success) {
        setFormError(result.error);
      } else {
        setSubmittedRef(result.applicationId);
        setLookupRef(result.applicationId);
        setLookupEmail(parentEmail.trim());
      }
    } catch {
      setFormError("Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckStatus(e: React.FormEvent) {
    e.preventDefault();
    if (lookupLoading) return;
    setLookupError(null);
    setLookupResult(null);
    setLookupLoading(true);
    try {
      const res = await checkAdmissionStatusAction({
        applicationId: lookupRef,
        parentEmail: lookupEmail,
      });
      if (!res.success || !res.application) {
        setLookupError(
          res.error || "No application found matching those details."
        );
      } else {
        setLookupResult(res.application);
      }
    } catch {
      setLookupError("Unable to check status right now. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  }

  function statusLabel(status: AdmissionStatusView["status"]) {
    if (status === "Assessment Scheduled") return t("admission.statusAssessment");
    if (status === "Approved") return t("admission.statusApproved");
    if (status === "Declined") return t("admission.statusDeclined");
    return t("admission.statusPending");
  }

  return (
    <>
      {/* Clean Page Hero + Segmented Switcher */}
      <section className="bg-gradient-to-b from-[#EEF3FC]/75 to-white pt-6 pb-6 sm:pt-8 sm:pb-8 border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#193E8A]/15 px-3 py-1 text-[11px] font-extrabold text-[#193E8A] uppercase tracking-wider shadow-2xs">
            <GraduationCap className="w-4 h-4" weight="duotone" />
            <span>{locField(locale, config.badgeEn, config.badgeMy)}</span>
          </span>

          <h1 className={`font-extrabold text-[#1E232B] ${locale === "my" ? "text-2xl sm:text-3xl md:text-[34px] leading-[1.32]" : "text-2xl sm:text-3xl md:text-4xl tracking-tight leading-tight"}`}>

            {locField(locale, config.titleEn, config.titleMy)}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-normal max-w-xl mx-auto">
            {locField(locale, config.subtitleEn, config.subtitleMy)}
          </p>

          {/* Segmented Tab Switcher */}
          <div className="pt-1 inline-flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("apply")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "apply"
                  ? "bg-[#193E8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#193E8A]"
              }`}
            >
              <GraduationCap className="w-4 h-4" weight="duotone" />
              <span>{t("admission.tabApply")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("track")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === "track"
                  ? "bg-[#193E8A] text-white shadow-xs"
                  : "text-slate-600 hover:text-[#193E8A]"
              }`}
            >
              <IdentificationBadge className="w-4 h-4" weight="duotone" />
              <span>{t("admission.tabTrack")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "apply" ? (
            submittedRef ? (
              /* Official Submission Receipt Card */
              <div className="rounded-3xl bg-white border-2 border-[#193E8A]/25 shadow-hinthar p-6 sm:p-10 text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" weight="fill" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E232B]">
                    {t("admission.successTitle")}
                  </h2>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {t("admission.saveReferenceNote")}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-5 max-w-md mx-auto space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t("admission.referenceLabel")}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-extrabold tracking-wider text-[#193E8A] font-mono">
                      {submittedRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(submittedRef);
                        setCopiedRef(true);
                        window.setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#EEF3FC] hover:bg-[#193E8A] text-[#193E8A] hover:text-white px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {copiedRef ? (
                        <>
                          <Check className="w-3.5 h-3.5" weight="bold" />
                          <span>{t("common.copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" weight="bold" />
                          <span>{t("common.copy")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 pt-1">
                    {t("admission.saveReferenceNote")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("track")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] text-xs sm:text-sm font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    <IdentificationBadge className="w-4 h-4" weight="bold" />
                    <span>{t("admission.trackNow")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 bg-white text-xs font-bold text-[#1E232B] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" weight="bold" />
                    <span>{t("common.print")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setStep(1);
                      setStudentName("");
                      setDocuments({});
                    }}
                    className="px-4 py-3 text-xs font-bold text-[#193E8A] hover:underline cursor-pointer"
                  >
                    {t("admission.submitAnother")}
                  </button>
                </div>
              </div>
            ) : (
              /* 3-Step Pearson Online Application Wizard */
              <form
                onSubmit={handleSubmitApplication}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-hinthar overflow-hidden"
              >
                {/* Step Indicator Header */}
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-5">
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        [1, t("admission.step1")],
                        [2, t("admission.step2")],
                        [3, t("admission.step3")],
                      ] as const
                    ).map(([num, label]) => {
                      const active = step === num;
                      const done = step > num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            if (num < step) setStep(num);
                          }}
                          className={`flex items-center gap-2.5 text-left rounded-xl p-2 transition-colors ${
                            num < step ? "cursor-pointer hover:bg-white" : "cursor-default"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                              active
                                ? "bg-[#193E8A] text-white"
                                : done
                                  ? "bg-[#FFD600] text-[#162033]"
                                  : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {done ? "✓" : num}
                          </span>
                          <span
                            className={`text-xs font-bold truncate ${
                              active ? "text-[#193E8A]" : "text-slate-600"
                            }`}
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {formError && (
                    <div
                      role="alert"
                      className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-red-700 font-semibold"
                    >
                      <WarningCircle
                        className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                        weight="fill"
                      />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* STEP 1: Student & Pearson Pathway */}
                  {step === 1 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.studentName")} *
                          </label>
                          <input
                            type="text"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="e.g. Aung Khant Kyaw"
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.dob")}
                          </label>
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.gender")}
                          </label>
                          <select
                            value={gender}
                            onChange={(e) =>
                              setGender(
                                e.target.value as "Male" | "Female" | "Other"
                              )
                            }
                            className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.nationality")}
                          </label>
                          <input
                            type="text"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.previousSchool")}
                          </label>
                          <input
                            type="text"
                            value={previousSchool}
                            onChange={(e) => setPreviousSchool(e.target.value)}
                            placeholder="Current or most recent school"
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>
                      </div>

                      {/* Preferred Region */}
                      <div>
                        <label className="block text-xs font-bold text-[#1E232B] mb-2">
                          {t("admission.preferredRegion")} *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {(["Yangon", "Mawlamyine"] as const).map((reg) => {
                            const active = preferredRegion === reg;
                            return (
                              <button
                                key={reg}
                                type="button"
                                onClick={() => setPreferredRegion(reg)}
                                className={`min-h-11 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                  active
                                    ? "border-[#193E8A] bg-[#EEF3FC] text-[#193E8A]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                }`}
                              >
                                {reg === "Yangon"
                                  ? `${t("common.yangon")} (3 Campuses)`
                                  : t("common.mawlamyine")}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Select Pearson Pathway */}
                      <div>
                        <label className="block text-xs font-bold text-[#1E232B] mb-2">
                          {t("admission.selectProgram")} *
                        </label>
                        <div className="space-y-2.5">
                          {programs.map((prog) => {
                            const active = selectedProgramId === prog.id;
                            return (
                              <button
                                key={prog.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProgramId(prog.id);
                                  setSelectedSubjects([]);
                                }}
                                className={`w-full text-left rounded-2xl border p-4 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  active
                                    ? "border-[#193E8A] bg-[#EEF3FC]/65 shadow-2xs"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-extrabold text-[#1E232B]">
                                    {locField(locale, prog.nameEn, prog.nameMy)}
                                  </p>
                                  {prog.badgeEn && (
                                    <p className="text-xs font-semibold text-[#193E8A] mt-0.5">
                                      {locField(
                                        locale,
                                        prog.badgeEn,
                                        prog.badgeMy
                                      )}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    active
                                      ? "border-[#193E8A] bg-[#193E8A] text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {active && (
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Academic Stream */}
                      <div>
                        <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                          {t("admission.academicStream")}
                        </label>
                        <select
                          value={academicStream}
                          onChange={(e) => setAcademicStream(e.target.value)}
                          className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                        >
                          {streams.map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Preferred Subjects (Optional) */}
                      {activeProgram && activeProgram.subjects.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-2">
                            {t("admission.selectSubjects")}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeProgram.subjects.map((sub) => {
                              const checked = selectedSubjects.includes(
                                sub.nameEn
                              );
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => toggleSubject(sub.nameEn)}
                                  className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                                    checked
                                      ? "border-[#193E8A] bg-[#EEF3FC] text-[#193E8A]"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                  }`}
                                >
                                  <span>
                                    {locField(locale, sub.nameEn, sub.nameMy)}
                                  </span>
                                  {sub.code && (
                                    <span className="text-[10px] font-bold opacity-75">
                                      {sub.code}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={goNextFromStep1}
                          className="inline-flex items-center gap-2 min-h-11 px-7 py-3 rounded-full bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                        >
                          <span>{t("admission.nextStep")}</span>
                          <ArrowRight className="w-4 h-4" weight="bold" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Guardian & Intake Details */}
                  {step === 2 && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.parentName")} *
                          </label>
                          <input
                            type="text"
                            required
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="Parent / Guardian full name"
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.relationship")}
                          </label>
                          <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          >
                            {relationships.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.parentEmail")} *
                          </label>
                          <input
                            type="email"
                            required
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="guardian@example.com"
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.parentPhone")} *
                          </label>
                          <input
                            type="tel"
                            required
                            value={parentPhone}
                            onChange={(e) => setParentPhone(e.target.value)}
                            placeholder="+95 9 ..."
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.intendedTerm")}
                          </label>
                          <select
                            value={intendedStartTerm}
                            onChange={(e) =>
                              setIntendedStartTerm(e.target.value)
                            }
                            className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          >
                            {terms.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.studyMode")}
                          </label>
                          <select
                            value={studyMode}
                            onChange={(e) => setStudyMode(e.target.value)}
                            className="w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          >
                            {studyModes.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.address")}
                          </label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Township & City"
                            className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                            {t("admission.notes")}
                          </label>
                          <textarea
                            rows={3}
                            value={medicalNotes}
                            onChange={(e) => setMedicalNotes(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" weight="bold" />
                          <span>{t("admission.prevStep")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={goNextFromStep2}
                          className="inline-flex items-center gap-2 min-h-11 px-7 py-3 rounded-full bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                        >
                          <span>{t("admission.nextStep")}</span>
                          <ArrowRight className="w-4 h-4" weight="bold" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Supporting Documents & Submit */}
                  {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1.5">
                        <h2 className="text-base sm:text-lg font-extrabold text-[#1E232B]">
                          {t("admission.documentsTitle")}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {anyDocumentRequired
                            ? t("admission.documentsRequiredHint")
                            : t("admission.documentsOptionalHint")}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {(
                          [
                            [
                              "identity",
                              t("admission.docIdentity"),
                              config.documentRules.identityRequired,
                            ],
                            [
                              "report",
                              t("admission.docReport"),
                              config.documentRules.reportRequired,
                            ],
                            [
                              "photo",
                              t("admission.docPhoto"),
                              config.documentRules.photoRequired,
                            ],
                          ] as const
                        ).map(([slot, label, isReq]) => {
                          const uploaded = documents[slot];
                          const isBusy = uploadingSlot === slot;

                          return (
                            <div
                              key={slot}
                              className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-[#1E232B]">
                                    {label}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                      isReq
                                        ? "bg-[#FFD600] text-[#162033]"
                                        : "bg-slate-200/80 text-slate-600"
                                    }`}
                                  >
                                    {isReq
                                      ? t("admission.requiredTag")
                                      : t("admission.optionalTag")}
                                  </span>
                                </div>
                                {uploaded && (
                                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 truncate">
                                    <FileText className="w-3.5 h-3.5 shrink-0" weight="fill" />
                                    <span className="truncate">
                                      {uploaded.filename}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <label className="inline-flex items-center justify-center gap-2 min-h-10 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#193E8A] text-xs font-bold text-[#193E8A] cursor-pointer shrink-0 transition-colors">
                                {isBusy ? (
                                  <>
                                    <SpinnerGap className="w-4 h-4 animate-spin" />
                                    <span>{t("admission.uploading")}</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadSimple className="w-4 h-4" weight="bold" />
                                    <span>
                                      {uploaded
                                        ? "Replace File"
                                        : t("admission.uploadFile")}
                                    </span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept=".pdf,image/jpeg,image/png,image/webp"
                                  className="sr-only"
                                  disabled={isBusy}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleFileUpload(slot, f);
                                  }}
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary Card */}
                      <div className="rounded-2xl bg-[#EEF3FC]/65 border border-[#193E8A]/15 p-4 text-xs sm:text-sm space-y-1 text-[#1E232B]">
                        <p>
                          <span className="font-bold text-slate-500">
                            Scholar:{" "}
                          </span>
                          <span className="font-extrabold">{studentName}</span>{" "}
                          ({preferredRegion})
                        </p>
                        <p>
                          <span className="font-bold text-slate-500">
                            Pathway:{" "}
                          </span>
                          <span className="font-bold">
                            {activeProgram?.nameEn}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold text-slate-500">
                            Guardian:{" "}
                          </span>
                          <span>
                            {parentName} · {parentEmail} · {parentPhone}
                          </span>
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" weight="bold" />
                          <span>{t("admission.prevStep")}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={submitting || Boolean(uploadingSlot)}
                          className="inline-flex items-center gap-2 min-h-12 px-8 py-3 rounded-full bg-[#FFD600] hover:bg-[#ECC300] disabled:opacity-60 text-[#162033] text-xs sm:text-sm font-extrabold shadow-gold transition-all cursor-pointer"
                        >
                          {submitting ? (
                            <>
                              <SpinnerGap className="w-4 h-4 animate-spin" />
                              <span>{t("admission.submitting")}</span>
                            </>
                          ) : (
                            <>
                              <span>{t("admission.submit")}</span>
                              <ArrowRight className="w-4 h-4" weight="bold" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )
          ) : (
            /* TAB 2: Track Application Status */
            <div className="space-y-6 animate-fade-in">
              <form
                onSubmit={handleCheckStatus}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-hinthar p-6 sm:p-8 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                      {t("admission.refInputLabel")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={lookupRef}
                      onChange={(e) =>
                        setLookupRef(e.target.value.toUpperCase())
                      }
                      placeholder="HIS-2026-123456"
                      className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono text-[#1E232B] focus:border-[#193E8A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E232B] mb-1.5">
                      {t("admission.emailInputLabel")} *
                    </label>
                    <input
                      type="email"
                      required
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="guardian@example.com"
                      className="w-full min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
                    />
                  </div>
                </div>

                {lookupError && (
                  <div
                    role="alert"
                    className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2"
                  >
                    <WarningCircle className="w-4 h-4 shrink-0" weight="fill" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="inline-flex items-center gap-2 min-h-11 px-7 py-3 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    {lookupLoading ? (
                      <>
                        <SpinnerGap className="w-4 h-4 animate-spin" />
                        <span>{t("admission.checking")}</span>
                      </>
                    ) : (
                      <>
                        <IdentificationBadge className="w-4 h-4" weight="bold" />
                        <span>{t("admission.checkButton")}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {lookupResult && (
                <div className="rounded-3xl bg-white border-2 border-[#193E8A]/20 shadow-hinthar p-6 sm:p-8 space-y-5 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-mono font-bold text-[#193E8A]">
                        {lookupResult.applicationId}
                      </p>
                      <h2 className="text-xl font-extrabold text-[#1E232B] mt-0.5">
                        {lookupResult.studentName}
                      </h2>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold ${
                        lookupResult.status === "Approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : lookupResult.status === "Assessment Scheduled"
                            ? "bg-[#FFD600] text-[#162033]"
                            : lookupResult.status === "Declined"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-[#EEF3FC] text-[#193E8A]"
                      }`}
                    >
                      <ClockCountdown className="w-4 h-4" weight="bold" />
                      <span>{statusLabel(lookupResult.status)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-200/80">
                      <span className="font-bold text-slate-500 block">
                        Pearson Pathway
                      </span>
                      <span className="font-extrabold text-[#1E232B] mt-0.5 block">
                        {lookupResult.grade}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#F8FAFC] p-4 border border-slate-200/80">
                      <span className="font-bold text-slate-500 block">
                        Submitted Date
                      </span>
                      <span className="font-extrabold text-[#1E232B] mt-0.5 block">
                        {lookupResult.submittedDate}
                      </span>
                    </div>

                    {lookupResult.assessmentDate && (
                      <div className="sm:col-span-2 rounded-2xl bg-[#FFFBE6] border border-[#FFD600] p-4 flex items-center gap-3">
                        <CalendarCheck
                          className="w-6 h-6 text-[#193E8A] shrink-0"
                          weight="fill"
                        />
                        <div>
                          <span className="text-xs font-extrabold uppercase text-[#193E8A] block">
                            Scheduled Placement Assessment
                          </span>
                          <span className="text-sm font-extrabold text-[#162033]">
                            {lookupResult.assessmentDate}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

