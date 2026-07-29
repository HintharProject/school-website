"use client";

import { useState } from "react";
import InnerNavbar from "../components/InnerNavbar";
import FooterSection from "../components/sections/FooterSection";

export default function AdmissionForm() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    grade: "",
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
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent default and mock submit
    alert("Application submitted successfully! Our admissions team will contact you shortly.");
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 bg-background">
      <InnerNavbar />
      
      <main className="flex-1 max-w-[800px] mx-auto w-full px-6 md:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-academic-gold/10 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-academic-gold text-sm">school</span>
            <span className="text-sm font-bold text-academic-gold uppercase tracking-widest">Admissions 2026-2027</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-oxford-blue dark:text-white mb-4 tracking-tight">
            Apply to <span className="text-primary dark:text-primary-fixed">Hinthar</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-light">
            Take the first step towards a brighter future. Fill out the application form below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface dark:bg-surface-variant p-8 md:p-10 rounded-3xl shadow-sm border border-outline-variant/30 space-y-8">
          
          {/* Section 1: Personal Info */}
          <div>
            <h2 className="text-xl font-bold text-oxford-blue dark:text-white mb-6 border-b border-outline-variant/30 pb-2">1. Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">First Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white" 
                  placeholder="John" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Last Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white" 
                  placeholder="Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</label>
                <input 
                  required 
                  type="date" 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Applying For Grade</label>
                <select 
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="" disabled>Select Grade</option>
                  <option value="Primary">Primary Education</option>
                  <option value="Secondary">Secondary Education</option>
                  <option value="O-Level">O Level</option>
                  <option value="A-Level">A Level / IAL</option>
                  <option value="BCS">BCS Preparation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-oxford-blue dark:text-white mb-6 border-b border-outline-variant/30 pb-2">2. Parent/Guardian Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white" 
                  placeholder="parent@example.com" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                <input 
                  required 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white" 
                  placeholder="+95 9 123 45678" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Upload */}
          <div>
            <h2 className="text-xl font-bold text-oxford-blue dark:text-white mb-6 border-b border-outline-variant/30 pb-2">3. Supporting Documents</h2>
            <p className="text-sm text-on-surface-variant mb-4 font-light">Please upload previous academic transcripts or certificates (PDF, JPG, PNG).</p>
            
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-outline-variant/50 hover:border-primary/50"}`}
            >
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">cloud_upload</span>
              <p className="text-oxford-blue dark:text-white font-medium mb-1">Drag and drop files here</p>
              <p className="text-sm text-on-surface-variant mb-4">or</p>
              <label className="bg-neutral-surface dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 border border-outline-variant/30 px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors text-oxford-blue dark:text-white inline-block">
                Browse Files
                <input type="file" multiple className="hidden" onChange={(e) => { const files = e.target.files; if (files) setUploadedFiles(prev => [...prev, ...Array.from(files)]); }} />
              </label>
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-surface dark:bg-black/20 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="material-symbols-outlined text-primary dark:text-primary-fixed">description</span>
                      <span className="text-sm font-medium text-oxford-blue dark:text-white truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="text-on-surface-variant hover:text-red-500 transition-colors p-1 rounded-full">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-outline-variant/30">
            <button type="submit" className="w-full bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md flex items-center justify-center gap-2">
              Submit Application
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </form>
      </main>

      <FooterSection />
    </div>
  );
}
