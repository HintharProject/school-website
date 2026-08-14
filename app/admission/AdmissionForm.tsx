"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

type Step = 1 | 2 | 3 | 4 | 5;

export default function AdmissionForm() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Student Details
    studentName: "",
    gender: "Male",
    dob: "",
    nationality: "Myanmar",
    currentSchool: "",
    programLevel: "igcse",
    gradeLevel: "Grade 10 (IGCSE Year 1)",

    // Step 2: Academic Stream & Subjects
    academicStream: "stem",
    selectedSubjects: ["Mathematics", "Physics", "Chemistry", "English Language"],
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || "Document",
      }));
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || "Document",
      }));
      setUploadedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomCode = `HIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedId(randomCode);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[860px] mx-auto w-full px-4 sm:px-6 md:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">school</span>
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
                      <span className="material-symbols-outlined text-base">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">{item.icon}</span>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Student Name (as on Passport / Birth Certificate) *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Aung Kaung Myat"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date of Birth *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Gender *
                  </label>
                  <select
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Academic Program *
                  </label>
                  <select
                    value={formData.programLevel}
                    onChange={(e) => setFormData({ ...formData, programLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900 font-semibold"
                  >
                    <option value="lower_secondary">Lower Secondary (Year 7–9 / Ages 11–14)</option>
                    <option value="igcse">Pearson Edexcel IGCSE (Year 10–11 / Ages 14–16)</option>
                    <option value="ial">Pearson Edexcel IAL - A-Level (Year 12–13 / Ages 16–18)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current / Previous School
                  </label>
                  <input
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
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Academic Focus Track
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "stem", label: "STEM & Pure Sciences", icon: "science", desc: "Physics, Chem, Bio, Pure Math" },
                    { id: "cs", label: "Computing & IT", icon: "developer_board", desc: "Computer Science, ICT, Math" },
                    { id: "business", label: "Business & Commerce", icon: "trending_up", desc: "Economics, Accounting, Business" },
                  ].map((track) => (
                    <div
                      key={track.id}
                      onClick={() => setFormData({ ...formData, academicStream: track.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.academicStream === track.id
                          ? "border-[#0E3B7D] bg-[#E8F0FE] ring-2 ring-[#0E3B7D]/30"
                          : "border-slate-200 hover:border-[#0E3B7D]/50 bg-slate-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[#0E3B7D] text-2xl mb-1 font-bold">
                        {track.icon}
                      </span>
                      <h4 className="text-sm font-bold text-[#09234B]">{track.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-normal">{track.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Checkboxes */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Target Electives / Subjects
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    "Pure Mathematics",
                    "Further Mathematics",
                    "Physics",
                    "Chemistry",
                    "Biology",
                    "Computer Science",
                    "Information Technology",
                    "Economics",
                    "Accounting",
                    "Business Studies",
                    "English Language",
                    "Global Perspectives",
                  ].map((subj) => {
                    const isSelected = formData.selectedSubjects.includes(subj);
                    return (
                      <button
                        type="button"
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-[#FFF8E1] border-[#FFC700] text-[#09234B]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#0E3B7D]/50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base text-[#0E3B7D]">
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Intended Start Term
                  </label>
                  <select
                    value={formData.intendedStartTerm}
                    onChange={(e) => setFormData({ ...formData, intendedStartTerm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="August 2026">Term 1: August 2026</option>
                    <option value="January 2027">Term 2: January 2027</option>
                    <option value="Immediate Placement">Immediate Placement / Mid-Year</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Study Format
                  </label>
                  <select
                    value={formData.studyMode}
                    onChange={(e) => setFormData({ ...formData, studyMode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Full-Time On-Campus">Full-Time On-Campus (Hlaing)</option>
                    <option value="Hybrid / Supplementary">Hybrid &amp; Supplementary Labs</option>
                  </select>
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
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Daw Khin Win"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Relationship to Student *
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address (for admissions status) *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@email.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+95 9 894 332200"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-sm text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Residential Address in Yangon / Township
                  </label>
                  <input
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
                  <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Document Uploads & Submission */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#09234B]">
                  Step 4: Supporting Documents &amp; Review
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  Upload student records, passport/NRC, and previous report cards (optional for initial inquiry).
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-[#0E3B7D] bg-[#E8F0FE]"
                    : "border-slate-300 hover:border-[#0E3B7D] bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-[#FFC700] mb-2 font-bold">
                  cloud_upload
                </span>
                <p className="text-sm font-bold text-[#09234B] mb-1">
                  Drag and drop student documents here
                </p>
                <p className="text-xs text-slate-500 mb-4 font-normal">
                  Accepts PDF, JPG, PNG up to 15MB (Transcripts, Birth Cert, Passport Photo)
                </p>
                <label className="bg-white hover:bg-slate-100 border border-slate-300 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors text-[#0E3B7D] inline-block shadow-sm">
                  Browse Files
                  <input type="file" multiple className="hidden" onChange={handleFileInput} />
                </label>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Attached Files ({uploadedFiles.length})
                  </p>
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="material-symbols-outlined text-[#0E3B7D] text-base">description</span>
                        <div>
                          <p className="text-xs font-bold text-[#09234B] truncate max-w-[280px]">
                            {file.name}
                          </p>
                          <span className="text-[10px] text-slate-500">{file.size}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        aria-label="Remove attached file"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Application Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-[#09234B] uppercase tracking-wider">
                  Application Summary:
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Student:</strong> {formData.studentName}</div>
                  <div><strong>Program:</strong> {formData.programLevel.toUpperCase()}</div>
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
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 border border-[#FFC700]"
                >
                  <span>Submit Application</span>
                  <span className="material-symbols-outlined text-base font-bold">verified</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success & Tracking Code */}
          {currentStep === 5 && submittedId && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <span className="material-symbols-outlined text-3xl font-bold">check_circle</span>
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
                  Please keep this reference code handy for placement assessment and registration updates.
                </p>
              </div>

              {/* Next Steps List */}
              <div className="text-left p-5 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3 shadow-sm">
                <h4 className="text-xs font-black text-[#0E3B7D] uppercase tracking-wider">
                  What Happens Next:
                </h4>
                <div className="space-y-2 text-xs text-slate-600 font-normal">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">mark_email_read</span>
                    <span>A confirmation email has been sent to <strong>{formData.parentEmail}</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">calendar_today</span>
                    <span>Our admissions counselor will contact you within 24–48 hours to schedule the placement assessment.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[#0E3B7D] text-sm shrink-0">apartment</span>
                    <span>Campus placement takes place at No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-full border border-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-slate-700"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Print Receipt</span>
                </button>
                <a
                  href="/"
                  className="px-6 py-2.5 bg-[#0E3B7D] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#164E9A] transition-all"
                >
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
