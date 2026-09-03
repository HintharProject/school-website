"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";
import { submitPublicAdmissionAction } from "@/lib/actions/admissions";
import { getSubjectCatalog, getAdmissionOptions, type SubjectEntry, type AdmissionOptions } from "@/lib/actions/siteContent";
import { DEFAULT_SUBJECT_CATALOG, DEFAULT_ADMISSION_OPTIONS } from "@/lib/content/defaults";
import {
  FINISHED_GRADE_OPTIONS,
  formatStoredGrade,
  PROGRAM_LEVELS,
  suggestEntryYear,
  type ProgramLevel,
} from "@/lib/admission/gradeMapping";
import { portalUrl } from "@/lib/routes/public";

type Step = 1 | 2 | 3 | 4 | 5;
type AdmissionDocument = {
  type: "identity" | "report" | "photo";
  url: string;
  filename: string;
};

export default function AdmissionForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<AdmissionDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<AdmissionDocument["type"] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectEntry[]>(() =>
    DEFAULT_SUBJECT_CATALOG.filter((s) => s.isActive)
  );
  const [admissionOptions, setAdmissionOptions] = useState<AdmissionOptions>(DEFAULT_ADMISSION_OPTIONS);

  const [formData, setFormData] = useState({
    // Step 1: Student Details
    studentName: "",
    gender: "Male",
    dob: "",
    nationality: "Myanmar",
    currentSchool: "",
    programLevel: "igcse",
    finishedGrade: "Year 9 (completed)",
    preferredRegion: "Yangon",

    // Step 2: Academic Stream & Subjects
    academicStream: DEFAULT_ADMISSION_OPTIONS.academicStreams[0],
    selectedSubjects: ["Pure Mathematics", "Physics", "Chemistry", "English Language"],
    intendedStartTerm: "August 2026",
    studyMode: "Full-Time On-Campus",

    // Step 3: Parent/Guardian
    parentName: "",
    relationship: "Parent",
    parentEmail: "",
    parentPhone: "",
    address: "",
    emergencyContact: "",

    // Step 4: Additional Notes
    medicalNotes: "",
    howHeard: "School Website",
  });

  useEffect(() => {
    let mounted = true;
    getSubjectCatalog()
      .then((catalog) => {
        if (mounted && Array.isArray(catalog) && catalog.length > 0) {
          const active = catalog.filter((s) => s.isActive);
          if (active.length > 0) {
            setAvailableSubjects(active);
            const activeNames = new Set(active.map((subject) => subject.name));
            setFormData((current) => ({
              ...current,
              selectedSubjects: current.selectedSubjects.filter((subject) => activeNames.has(subject)),
            }));
          }
        }
      })
      .catch(() => {});
    getAdmissionOptions()
      .then((opts) => {
        if (mounted && opts) {
          setAdmissionOptions(opts);
          setFormData((current) => ({
            ...current,
            intendedStartTerm: opts.intendedStartTerms.includes(current.intendedStartTerm)
              ? current.intendedStartTerm
              : opts.intendedStartTerms[0],
            academicStream: opts.academicStreams.includes(current.academicStream)
              ? current.academicStream
              : opts.academicStreams[0],
          }));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleDocumentUpload = async (
    type: AdmissionDocument["type"],
    file?: File
  ) => {
    if (!file || uploadingType) return;
    setUploadingType(type);
    setUploadError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("documentType", type);
      const response = await fetch("/api/admission/upload", { method: "POST", body });
      const result = await response.json() as {
        success?: boolean;
        error?: string;
        document?: AdmissionDocument;
      };
      if (!response.ok || !result.success || !result.document) {
        throw new Error(result.error || "Upload failed.");
      }
      setUploadedDocuments((current) => [
        ...current.filter((document) => document.type !== type),
        result.document!,
      ]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploadingType(null);
    }
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSubjects.includes(subject);
      return {
        ...prev,
        selectedSubjects: exists
          ? prev.selectedSubjects.filter((s) => s !== subject)
          : [...prev.selectedSubjects, subject],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (uploadedDocuments.length !== 3) {
      setSubmitError("Please upload all three required documents.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const programLevel = formData.programLevel as ProgramLevel;
    const suggestedEntryYear = suggestEntryYear(formData.finishedGrade, programLevel);
    const gradeLabel = formatStoredGrade(programLevel, suggestedEntryYear);

    try {
      const result = await submitPublicAdmissionAction({
        studentName: formData.studentName,
        dateOfBirth: formData.dob || null,
        gender: formData.gender as "Male" | "Female" | "Other",
        nationality: formData.nationality,
        grade: gradeLabel,
        programLevel,
        finishedGrade: formData.finishedGrade,
        suggestedEntryYear: `Year ${suggestedEntryYear}`,
        preferredRegion: formData.preferredRegion,
        academicStream: formData.academicStream,
        selectedSubjects: formData.selectedSubjects,
        documentUrls: uploadedDocuments,
        intendedStartTerm: formData.intendedStartTerm,
        studyMode: formData.studyMode,
        previousSchool: formData.currentSchool || null,
        parentName: formData.parentName || null,
        relationship: formData.relationship,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        address: formData.address || null,
        emergencyContact: formData.emergencyContact || null,
        medicalNotes: formData.medicalNotes || null,
        howHeard: formData.howHeard || "School Website",
      });

      if (!result.success || !("applicationId" in result) || !result.applicationId) {
        // Collect field errors into a readable message if available
        const fieldErrors = "fieldErrors" in result ? result.fieldErrors : null;
        let errorMsg = ("error" in result && result.error)
          ? result.error
          : "Your application could not be submitted. Please check your connection and try again.";
        if (fieldErrors) {
          const fieldMsgs = Object.entries(fieldErrors)
            .flatMap(([field, msgs]) =>
              Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : []
            )
            .slice(0, 3)
            .join(" • ");
          if (fieldMsgs) errorMsg = `Validation failed — ${fieldMsgs}`;
        }
        setSubmitError(errorMsg);
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setSubmittedId(result.applicationId);
      setEmailSent(result.emailSent === true);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("[AdmissionForm] submit error:", err);
      setSubmitError("Your application could not be submitted. Please check your connection and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };


  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const programLevel = formData.programLevel as ProgramLevel;
  const suggestedEntryYear = suggestEntryYear(formData.finishedGrade, programLevel);
  const filteredSubjects = availableSubjects.filter((subject) =>
    programLevel === "lower_secondary"
      ? subject.level === "Lower Secondary"
      : subject.level === "Both" || subject.level === (programLevel === "igcse" ? "IGCSE" : "IAL")
  );

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[860px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">school</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              Admissions 2026–2027
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black text-[#09234B] mb-3 tracking-tight">
            Apply to <span className="text-[#0E3B7D]">Hinthar International</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto">
            Take the first step toward world-class Pearson Edexcel education. Complete the application below.
          </p>
        </div>

        {/* Progress Stepper */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative max-w-xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#0E3B7D] transition-all duration-500 z-0"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {[
                { step: 1, label: "Student", icon: "person" },
                { step: 2, label: "Curriculum", icon: "menu_book" },
                { step: 3, label: "Guardian", icon: "family_restroom" },
                { step: 4, label: "Documents", icon: "upload_file" },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                      currentStep === item.step
                        ? "bg-[#0E3B7D] text-[#FFC700] ring-4 ring-[#0E3B7D]/20 scale-110"
                        : currentStep > item.step
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-400 border border-slate-300"
                    }`}
                  >
                    {currentStep > item.step ? (
                      <span aria-hidden="true" className="material-symbols-outlined text-base">check</span>
                    ) : (
                      <span aria-hidden="true" className="material-symbols-outlined text-base">{item.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider mt-2 transition-colors ${
                      currentStep === item.step
                        ? "text-[#0E3B7D]"
                        : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Form Body */}
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200">
          {/* STEP 1: Student Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#09234B]">
                  Step 1: Student Information
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Enter student identity details and the target educational tier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="adm-student-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Student Name (as on Passport / Birth Certificate) *
                  </label>
                  <input
                    id="adm-student-name"
                    required
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Aung Kaung Myat"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-dob" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date of Birth *
                  </label>
                  <input
                    id="adm-dob"
                    required
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-gender" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender *
                  </label>
                  <select
                    id="adm-gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-program-level" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Academic Program *
                  </label>
                  <select
                    id="adm-program-level"
                    value={formData.programLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      programLevel: e.target.value,
                      selectedSubjects: [],
                    })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900 font-semibold"
                  >
                    <option value="lower_secondary">Lower Secondary (Year 7–9 / Ages 11–14)</option>
                    <option value="igcse">Pearson Edexcel IGCSE (Year 10–11 / Ages 14–16)</option>
                    <option value="ial">Pearson Edexcel IAL (Year 12–13 / Ages 16–18)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-finished-grade" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Last Completed Grade *
                  </label>
                  <select
                    id="adm-finished-grade"
                    value={formData.finishedGrade}
                    onChange={(e) => setFormData({ ...formData, finishedGrade: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  >
                    {FINISHED_GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Suggested entry: <strong>Year {suggestedEntryYear}</strong>. Final placement is confirmed after the placement test.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-region" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Preferred Campus Region *
                  </label>
                  <select
                    id="adm-region"
                    value={formData.preferredRegion}
                    onChange={(e) => setFormData({ ...formData, preferredRegion: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  >
                    <option value="Yangon">Yangon</option>
                    <option value="Mawlamyine">Mawlamyine</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-current-school" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current / Previous School
                  </label>
                  <input
                    id="adm-current-school"
                    type="text"
                    value={formData.currentSchool}
                    onChange={(e) => setFormData({ ...formData, currentSchool: e.target.value })}
                    placeholder="Name of last school attended"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.studentName || !formData.dob}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <span>Continue to Curriculum</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Academic Track & Subjects */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#09234B]">
                  Step 2: Academic Stream &amp; Subjects
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Select your intended specialization track and subject preferences.
                </p>
              </div>

              {/* Stream Selection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Academic Focus Track
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Academic Focus Track">
                  {admissionOptions.academicStreams.map((track) => (
                    <button
                      key={track}
                      type="button"
                      role="radio"
                      aria-checked={formData.academicStream === track}
                      onClick={() => setFormData({ ...formData, academicStream: track })}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        formData.academicStream === track
                          ? "border-[#0E3B7D] bg-[#E8F0FE] ring-2 ring-[#0E3B7D]/30"
                          : "border-slate-200 hover:border-[#0E3B7D]/50 bg-slate-50"
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-2xl mb-1 font-bold block">
                        school
                      </span>
                      <span className="block text-sm font-bold text-[#09234B]">{track}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Checkboxes */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Target Electives / Subjects
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Select Target Electives / Subjects">
                  {filteredSubjects.map((entry) => {
                    const subj = entry.name;
                    const isSelected = formData.selectedSubjects.includes(subj);
                    return (
                      <button
                        type="button"
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FFF8E1] border-[#FFC700] text-[#09234B]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#0E3B7D]/50"
                        }`}
                      >
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
                          {isSelected ? "check_box" : "check_box_outline_blank"}
                        </span>
                        <span className="truncate">{subj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Study Mode & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="adm-start-term" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Intended Start Term
                  </label>
                  <select
                    id="adm-start-term"
                    value={formData.intendedStartTerm}
                    onChange={(e) => setFormData({ ...formData, intendedStartTerm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {admissionOptions.intendedStartTerms.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Study Format
                  </span>
                  <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    Full-Time On-Campus
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Continue to Guardian Info</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Parent/Guardian Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#09234B]">
                  Step 3: Parent / Guardian Details
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Provide primary contact details for academic notices, progress reports, and consultations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="adm-parent-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    id="adm-parent-name"
                    required
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Daw Khin Win"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-relationship" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Relationship to Student *
                  </label>
                  <select
                    id="adm-relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  >
                    {admissionOptions.relationships.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-parent-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address (for admissions status) *
                  </label>
                  <input
                    id="adm-parent-email"
                    required
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="adm-parent-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Phone Number *
                  </label>
                  <input
                    id="adm-parent-phone"
                    required
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+95 9 894 332200"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="adm-address" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Residential Address / Township
                  </label>
                  <input
                    id="adm-address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Hlaing Township, Yangon"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.parentName || !formData.parentEmail || !formData.parentPhone}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E3B7D] hover:bg-[#164E9A] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <span>Continue to Uploads</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Document Uploads & Submission */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
                  <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0 text-red-500 mt-0.5">error</span>
                  <span>{submitError}</span>
                </div>
              )}
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#09234B]">
                  Step 4: Supporting Documents &amp; Review
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Upload the three required documents. PDF, JPG, PNG, or WebP files up to 8 MB are accepted.
                </p>
              </div>

              {uploadError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {uploadError}
                </div>
              )}

              <div className="grid gap-3">
                {[
                  { type: "identity" as const, label: "Birth Certificate / Student NRC", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
                  { type: "report" as const, label: "Latest School Report Card", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
                  { type: "photo" as const, label: "Recent Student Photo", accept: ".jpg,.jpeg,.png,.webp" },
                ].map((slot) => {
                  const uploaded = uploadedDocuments.find((document) => document.type === slot.type);
                  const isUploading = uploadingType === slot.type;
                  return (
                    <div key={slot.type} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                      <span aria-hidden="true" className="material-symbols-outlined text-2xl text-[#0E3B7D]">
                        {uploaded ? "check_circle" : "upload_file"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#09234B]">{slot.label} *</p>
                        <p className="truncate text-[11px] text-slate-500">
                          {uploaded?.filename || "No file uploaded"}
                        </p>
                      </div>
                      <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-center text-xs font-bold uppercase tracking-wider text-[#0E3B7D] hover:bg-slate-100">
                        {isUploading ? "Uploading..." : uploaded ? "Replace" : "Choose File"}
                        <input
                          type="file"
                          accept={slot.accept}
                          disabled={Boolean(uploadingType)}
                          className="hidden"
                          onChange={(event) => {
                            void handleDocumentUpload(slot.type, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Application Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-[#09234B] uppercase tracking-wider">
                  Application Summary:
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Student:</strong> {formData.studentName}</div>
                  <div><strong>Program:</strong> {PROGRAM_LEVELS[programLevel].label}</div>
                  <div><strong>Suggested entry:</strong> Year {suggestedEntryYear}</div>
                  <div><strong>Region:</strong> {formData.preferredRegion}</div>
                  <div><strong>Parent:</strong> {formData.parentName}</div>
                  <div><strong>Contact:</strong> {formData.parentPhone}</div>
                  <div className="col-span-2"><strong>Subjects:</strong> {formData.selectedSubjects.join(", ")}</div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(uploadingType) || uploadedDocuments.length !== 3}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 border border-[#FFC700] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <span aria-hidden="true" className="w-3.5 h-3.5 border-2 border-[#09234B]/30 border-t-[#09234B] rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <span aria-hidden="true" className="material-symbols-outlined text-base font-bold">verified</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success & Tracking Code */}
          {currentStep === 5 && submittedId && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <span aria-hidden="true" className="material-symbols-outlined text-3xl font-bold">check_circle</span>
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                  Application Received
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#09234B]">
                  Welcome to the Hinthar Family!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 font-normal">
                  Your application for <strong>{formData.studentName}</strong> has been received by our Admissions Office.
                </p>
              </div>

              {/* Tracking Code Box */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Your Application Tracking Reference
                </p>
                <div className="text-2xl sm:text-3xl font-mono font-black text-[#0E3B7D] tracking-wider select-all">
                  {submittedId}
                </div>
                <p className="text-[11px] text-slate-500">
                  Keep this reference code — use it in the Student Portal to track your application status anytime.
                </p>
              </div>

              {/* Next Steps List */}
              <div className="text-left p-5 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3 shadow-sm">
                <h4 className="text-xs font-black text-[#0E3B7D] uppercase tracking-wider">
                  What Happens Next:
                </h4>
                <div className="space-y-2 text-xs text-slate-600 font-normal">
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">mark_email_read</span>
                    <span>
                      {emailSent ? (
                        <>
                          A confirmation email has been sent to <strong>{formData.parentEmail}</strong>.
                        </>
                      ) : (
                        <>
                          Our Admissions Office will contact you at <strong>{formData.parentEmail}</strong> or{" "}
                          <strong>{formData.parentPhone}</strong> with your confirmation.
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">calendar_today</span>
                    <span>Our admissions counselor will contact you within 24–48 hours to schedule the placement assessment.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">apartment</span>
                    <span>Your placement assessment will be arranged with the admissions team in {formData.preferredRegion}.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-slate-700"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">print</span>
                  <span>Print Receipt</span>
                </button>
                <Link
                  href={portalUrl({ id: submittedId, email: formData.parentEmail })}
                  className="px-6 py-2.5 bg-[#0E3B7D] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#164E9A] transition-all inline-flex items-center gap-1.5"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">manage_accounts</span>
                  <span>Track Application Status</span>
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
