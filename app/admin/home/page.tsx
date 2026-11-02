"use client";

import { useState, useEffect } from "react";
import {
  House,
  Megaphone,
  Sparkle,
  Quotes,
  Question,
  Phone,
  GraduationCap,
  FloppyDisk,
  ArrowsClockwise,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  getEffectiveSiteContent,
  upsertSiteContentAction,
  type FullSiteContent,
  type AnnouncementItem,
} from "@/lib/actions/siteContent";
import {
  getProgramsForAdmin,
  getSubjectsForAdmin,
  upsertProgramAction,
  deleteProgramAction,
  upsertSubjectAction,
  deleteSubjectAction,
} from "@/lib/actions/academicCatalog";
import {
  getAllTestimonials,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "@/lib/actions/testimonials";
import type { CatalogProgram, CatalogSubject } from "@/lib/academic/catalog";
import BilingualField from "@/app/components/admin/BilingualField";
import ImageUploadPicker from "@/app/components/admin/ImageUploadPicker";

type HomeTab =
  | "brand"
  | "ticker"
  | "hero"
  | "about"
  | "classes"
  | "testimonials"
  | "faqs"
  | "footer";

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>("brand");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // CMS Content
  const [content, setContent] = useState<FullSiteContent | null>(null);

  // Pearson Programs & Subjects
  const [programs, setPrograms] = useState<CatalogProgram[]>([]);
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [editingProgram, setEditingProgram] = useState<CatalogProgram | null>(null);
  const [editingSubject, setEditingSubject] = useState<CatalogSubject | null>(null);

  // Testimonials
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteData, progData, subData, testData] = await Promise.all([
        getEffectiveSiteContent(),
        getProgramsForAdmin().catch(() => []),
        getSubjectsForAdmin().catch(() => []),
        getAllTestimonials().catch(() => []),
      ]);
      setContent(siteData);
      setPrograms(progData);
      setSubjects(subData);
      setTestimonialsList(testData);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load content.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveSection = async (key: keyof FullSiteContent, value: any) => {
    setSaving(true);
    try {
      const res = await upsertSiteContentAction(key as any, value);
      if (res.success) {
        showFeedback("success", res.message);
        await loadData();
      } else {
        showFeedback("error", res.message);
      }
    } catch (err: unknown) {
      showFeedback(
        "error",
        err instanceof Error ? err.message : "Failed to save section."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <div className="p-12 text-center text-sm font-bold text-slate-500">
        Loading Home Page & Pearson Classes CMS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3FC] text-[#193E8A] px-3.5 py-1 text-xs font-extrabold mb-2">
            <House className="w-4 h-4" weight="fill" />
            Home Page & Pearson Classes
          </span>
          <h1 className="text-2xl font-extrabold text-[#1E232B] tracking-tight">
            100% Editable Home Page Content
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Update announcements ticker, hero copy, principal message, Pearson
            pathways, testimonials, FAQs, and footer contacts.
          </p>
        </div>

        {feedback && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" weight="fill" />
            ) : (
              <WarningCircle className="w-4 h-4 shrink-0" weight="fill" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs Strip */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
        {(
          [
            ["brand", "Brand & School Name", House],
            ["ticker", "Top Ticker", Megaphone],
            ["hero", "Hero & Key Stats", Sparkle],
            ["about", "About & Principal", Quotes],
            ["classes", "Pearson Classes & Subjects", GraduationCap],
            ["testimonials", "Testimonials", Quotes],
            ["faqs", "FAQs", Question],
            ["footer", "Footer & Contacts", Phone],
          ] as const
        ).map(([tabKey, label, Icon]) => {
          const active = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#193E8A] text-white shadow-2xs"
                  : "text-slate-600 hover:text-[#193E8A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" weight="bold" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Brand & School Name */}
      {activeTab === "brand" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#1E232B]">
              Brand Identity & School Name
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict Rule: School Name stays in English across both EN and MY.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official School Name (English across all locales)
              </label>
              <input
                type="text"
                value={content.brand.schoolName}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, schoolName: e.target.value },
                  })
                }
                className="w-full min-h-10 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-[#1E232B] font-bold focus:border-[#193E8A] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <BilingualField
                label="Navbar Brand Subtitle"
                enValue={content.brand.subtitleEn}
                myValue={content.brand.subtitleMy}
                onEnChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, subtitleEn: v },
                  })
                }
                onMyChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, subtitleMy: v },
                  })
                }
                helperText="Appears below Hinthar International School in the top navbar."
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadPicker
                label="Brand Logo"
                value={content.brand.logoUrl}
                onChange={(url) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, logoUrl: url },
                  })
                }
                aspectRatio="square"
                folder="general"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSection("brand", content.brand)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save Brand Settings"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Top Ticker Announcements */}
      {activeTab === "ticker" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1E232B]">
                Top Announcement Ticker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rotates at the very top of the website above the navigation bar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newItem: AnnouncementItem = {
                  id: `ann-${Date.now()}`,
                  text: "New Notice",
                  textMy: "",
                  href: "/admission",
                };
                setContent({
                  ...content,
                  announcements: [...content.announcements, newItem],
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEF3FC] text-[#193E8A] hover:bg-[#193E8A] hover:text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" weight="bold" />
              <span>Add Notice</span>
            </button>
          </div>

          <div className="space-y-4">
            {content.announcements.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-[#F8FAFC]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#193E8A]">
                    Notice #{idx + 1}
                  </span>
                  {content.announcements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setContent({
                          ...content,
                          announcements: content.announcements.filter(
                            (_, i) => i !== idx
                          ),
                        });
                      }}
                      className="text-red-600 hover:text-red-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" weight="bold" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <BilingualField
                  label="Notice Text"
                  enValue={item.text}
                  myValue={item.textMy || ""}
                  onEnChange={(v) => {
                    const next = [...content.announcements];
                    next[idx] = { ...next[idx], text: v };
                    setContent({ ...content, announcements: next });
                  }}
                  onMyChange={(v) => {
                    const next = [...content.announcements];
                    next[idx] = { ...next[idx], textMy: v };
                    setContent({ ...content, announcements: next });
                  }}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Link Destination (Optional e.g. /admission or /campuses)
                  </label>
                  <input
                    type="text"
                    value={item.href || ""}
                    onChange={(e) => {
                      const next = [...content.announcements];
                      next[idx] = { ...next[idx], href: e.target.value };
                      setContent({ ...content, announcements: next });
                    }}
                    placeholder="/admission"
                    className="w-full min-h-9 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-[#1E232B] focus:border-[#193E8A] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSaveSection("announcements", content.announcements)
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save Ticker Notices"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Hero & Key Stats */}
      {activeTab === "hero" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#1E232B]">
              Hero Section & Key Stats
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Framed Split Hero photograph, institutional headings, AAA contrast
              Gold CTAs, and 4 highlight cards.
            </p>
          </div>

          <div className="space-y-4">
            <BilingualField
              label="Credential Badge"
              enValue={content.hero.credentialBadgeEn}
              myValue={content.hero.credentialBadgeMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, credentialBadgeEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, credentialBadgeMy: v },
                })
              }
            />

            <BilingualField
              label="Intake Pill"
              enValue={content.hero.intakePillEn}
              myValue={content.hero.intakePillMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, intakePillEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, intakePillMy: v },
                })
              }
            />

            <BilingualField
              label="Title Line 1"
              enValue={content.hero.titleLine1En}
              myValue={content.hero.titleLine1My}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titleLine1En: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titleLine1My: v },
                })
              }
            />

            <BilingualField
              label="Title Highlight (Cobalt Blue)"
              enValue={content.hero.titleHighlightEn}
              myValue={content.hero.titleHighlightMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titleHighlightEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, titleHighlightMy: v },
                })
              }
            />

            <BilingualField
              label="Hero Subtitle"
              multiline
              rows={3}
              enValue={content.hero.subtitleEn}
              myValue={content.hero.subtitleMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, subtitleEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, subtitleMy: v },
                })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BilingualField
                label="Primary Gold CTA"
                enValue={content.hero.primaryCtaEn}
                myValue={content.hero.primaryCtaMy}
                onEnChange={(v) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, primaryCtaEn: v },
                  })
                }
                onMyChange={(v) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, primaryCtaMy: v },
                  })
                }
              />
              <BilingualField
                label="Secondary Pathway CTA"
                enValue={content.hero.secondaryCtaEn}
                myValue={content.hero.secondaryCtaMy}
                onEnChange={(v) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, secondaryCtaEn: v },
                  })
                }
                onMyChange={(v) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, secondaryCtaMy: v },
                  })
                }
              />
            </div>

            <ImageUploadPicker
              label="Framed Hero Photograph"
              value={content.hero.heroImageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, heroImageUrl: url },
                })
              }
              aspectRatio="banner"
              folder="general"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSection("hero", content.hero)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save Hero Section"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: About & Principal */}
      {activeTab === "about" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#1E232B]">
              About Hinthar & Principal Welcome
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Institutional story, Principal Dr. Kaung Myat Htut message, and
              portrait photo.
            </p>
          </div>

          <div className="space-y-4">
            <BilingualField
              label="Section Badge"
              enValue={content.aboutPrincipal.badgeEn}
              myValue={content.aboutPrincipal.badgeMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, badgeEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, badgeMy: v },
                })
              }
            />

            <BilingualField
              label="Section Title"
              enValue={content.aboutPrincipal.titleEn}
              myValue={content.aboutPrincipal.titleMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, titleEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, titleMy: v },
                })
              }
            />

            <BilingualField
              label="Title Highlight (Cobalt Blue)"
              enValue={content.aboutPrincipal.titleHighlightEn}
              myValue={content.aboutPrincipal.titleHighlightMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: {
                    ...content.aboutPrincipal,
                    titleHighlightEn: v,
                  },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: {
                    ...content.aboutPrincipal,
                    titleHighlightMy: v,
                  },
                })
              }
            />

            <BilingualField
              label="Paragraph 1 (Institutional Story)"
              multiline
              rows={3}
              enValue={content.aboutPrincipal.paragraph1En}
              myValue={content.aboutPrincipal.paragraph1My}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, paragraph1En: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, paragraph1My: v },
                })
              }
            />

            <BilingualField
              label="Paragraph 2"
              multiline
              rows={3}
              enValue={content.aboutPrincipal.paragraph2En}
              myValue={content.aboutPrincipal.paragraph2My}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, paragraph2En: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: { ...content.aboutPrincipal, paragraph2My: v },
                })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Principal Full Name
                </label>
                <input
                  type="text"
                  value={content.aboutPrincipal.principalName}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      aboutPrincipal: {
                        ...content.aboutPrincipal,
                        principalName: e.target.value,
                      },
                    })
                  }
                  className="w-full min-h-10 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-[#1E232B] font-bold focus:border-[#193E8A] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <BilingualField
                  label="Principal Role / Title"
                  enValue={content.aboutPrincipal.principalRoleEn}
                  myValue={content.aboutPrincipal.principalRoleMy}
                  onEnChange={(v) =>
                    setContent({
                      ...content,
                      aboutPrincipal: {
                        ...content.aboutPrincipal,
                        principalRoleEn: v,
                      },
                    })
                  }
                  onMyChange={(v) =>
                    setContent({
                      ...content,
                      aboutPrincipal: {
                        ...content.aboutPrincipal,
                        principalRoleMy: v,
                      },
                    })
                  }
                />
              </div>
            </div>

            <BilingualField
              label="Principal Quote"
              multiline
              rows={3}
              enValue={content.aboutPrincipal.principalQuoteEn}
              myValue={content.aboutPrincipal.principalQuoteMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: {
                    ...content.aboutPrincipal,
                    principalQuoteEn: v,
                  },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  aboutPrincipal: {
                    ...content.aboutPrincipal,
                    principalQuoteMy: v,
                  },
                })
              }
            />

            <ImageUploadPicker
              label="Principal Portrait Photo"
              value={content.aboutPrincipal.principalImageUrl}
              onChange={(url) =>
                setContent({
                  ...content,
                  aboutPrincipal: {
                    ...content.aboutPrincipal,
                    principalImageUrl: url,
                  },
                })
              }
              aspectRatio="portrait"
              folder="avatars"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSaveSection("aboutPrincipal", content.aboutPrincipal)
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save About Section"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Pearson Classes & Academic Catalog */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          {/* Section Headings */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#1E232B]">
                #classes Section Headings on Home Page
              </h2>
            </div>
            <BilingualField
              label="Classes Section Title"
              enValue={content.homeSections.classesTitleEn}
              myValue={content.homeSections.classesTitleMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  homeSections: { ...content.homeSections, classesTitleEn: v },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  homeSections: { ...content.homeSections, classesTitleMy: v },
                })
              }
            />
            <BilingualField
              label="Classes Section Subtitle"
              multiline
              rows={2}
              enValue={content.homeSections.classesSubtitleEn}
              myValue={content.homeSections.classesSubtitleMy}
              onEnChange={(v) =>
                setContent({
                  ...content,
                  homeSections: {
                    ...content.homeSections,
                    classesSubtitleEn: v,
                  },
                })
              }
              onMyChange={(v) =>
                setContent({
                  ...content,
                  homeSections: {
                    ...content.homeSections,
                    classesSubtitleMy: v,
                  },
                })
              }
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  handleSaveSection("homeSections", content.homeSections)
                }
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#193E8A] text-white text-xs font-bold"
              >
                <FloppyDisk className="w-4 h-4" />
                <span>Save Section Titles</span>
              </button>
            </div>
          </div>

          {/* Pearson Pathways Manager */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1E232B]">
                  Pearson Edexcel Academic Pathways ({programs.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Powers the interactive cards and Syllabus/Subject modals on
                  the Home page and in Admissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProgram({
                    id: `pearson-${Date.now()}`,
                    nameEn: "New Pearson Pathway",
                    nameMy: null,
                    badgeEn: "Year 10 – Year 11",
                    badgeMy: null,
                    ageRangeEn: "Ages 14 – 16",
                    ageRangeMy: null,
                    summaryEn: "",
                    summaryMy: null,
                    descriptionEn: "",
                    descriptionMy: null,
                    highlightsEn: [],
                    highlightsMy: [],
                    curriculum: "Pearson Edexcel",
                    duration: "2 Academic Years",
                    campus: "both",
                    studyMode: "Full-Time On-Campus",
                    programLevel: "igcse",
                    imageUrl: "/images/g2.jpg",
                    sortOrder: programs.length + 1,
                    isActive: true,
                    subjects: [],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEF3FC] text-[#193E8A] text-xs font-extrabold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pathway</span>
              </button>
            </div>

            <div className="space-y-4">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-2xl border border-slate-200 p-5 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#FFD600] px-2.5 py-0.5 text-[10px] font-extrabold text-[#162033]">
                        {prog.badgeEn || prog.curriculum}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {prog.subjects.length} Subjects linked
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-[#1E232B] mt-1">
                      {prog.nameEn}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prog.campus === "both"
                        ? "Yangon & Mawlamyine"
                        : prog.campus}{" "}
                      · {prog.duration}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingProgram(prog)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#193E8A] text-xs font-bold text-[#193E8A] cursor-pointer"
                    >
                      Edit Pathway & Subjects
                    </button>
                    {programs.length > 1 && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (
                            confirm(`Delete Pearson pathway "${prog.nameEn}"?`)
                          ) {
                            await deleteProgramAction(prog.id);
                            await loadData();
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pearson Subjects Catalog */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1E232B]">
                  Pearson Edexcel Subjects ({subjects.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned to Pearson pathways and presented in Admissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSubject({
                    id: `sub-${Date.now()}`,
                    nameEn: "New Subject",
                    nameMy: null,
                    code: "",
                    level: "IGCSE",
                    track: "STEM",
                    isActive: true,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEF3FC] text-[#193E8A] text-xs font-extrabold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-slate-200 p-3.5 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#EEF3FC] px-1.5 py-0.5 text-[10px] font-bold text-[#193E8A]">
                        {sub.code || "No Code"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {sub.track}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-[#1E232B] mt-1">
                      {sub.nameEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingSubject(sub)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete subject "${sub.nameEn}"?`)) {
                          await deleteSubjectAction(sub.id);
                          await loadData();
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1E232B]">
                Parent & Alumni Testimonials ({testimonialsList.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays in the Parent & Alumni Testimonials grid on the Home
                page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingTestimonial({
                  id: 0,
                  authorName: "New Parent / Scholar",
                  authorRole: "Parent of Pearson IAL Scholar",
                  authorRoleMy: "",
                  quote: "Wonderful academic environment and care.",
                  quoteMy: "",
                  rating: 5,
                  sortOrder: testimonialsList.length + 1,
                  status: "published",
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEF3FC] text-[#193E8A] text-xs font-extrabold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="space-y-4">
            {testimonialsList.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl border border-slate-200 p-5 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#1E232B]">
                    {test.authorName}
                  </h4>
                  <p className="text-xs font-semibold text-[#193E8A]">
                    {test.authorRole}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    “{test.quote}”
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(test)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#193E8A] cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (
                        confirm(`Delete testimonial from "${test.authorName}"?`)
                      ) {
                        await deleteTestimonialAction(test.id);
                        await loadData();
                      }
                    }}
                    className="p-2 text-red-600 cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: FAQs */}
      {activeTab === "faqs" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#1E232B]">
                Frequently Asked Questions ({content.faqs.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accordion items on the Home page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setContent({
                  ...content,
                  faqs: [
                    ...content.faqs,
                    {
                      id: "faq-" + Date.now(),
                      question: "New question?",
                      questionMy: "",
                      answer: "Answer explanation here.",
                      answerMy: "",
                      defaultOpen: false,
                    },
                  ],
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEF3FC] text-[#193E8A] text-xs font-extrabold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {content.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 p-5 bg-[#F8FAFC] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#193E8A]">
                    FAQ #{idx + 1}
                  </span>
                  {content.faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setContent({
                          ...content,
                          faqs: content.faqs.filter((_, i) => i !== idx),
                        });
                      }}
                      className="text-red-600 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <BilingualField
                  label="Question"
                  enValue={faq.question}
                  myValue={faq.questionMy || ""}
                  onEnChange={(v) => {
                    const next = [...content.faqs];
                    next[idx] = { ...next[idx], question: v };
                    setContent({ ...content, faqs: next });
                  }}
                  onMyChange={(v) => {
                    const next = [...content.faqs];
                    next[idx] = { ...next[idx], questionMy: v };
                    setContent({ ...content, faqs: next });
                  }}
                />

                <BilingualField
                  label="Answer"
                  multiline
                  rows={3}
                  enValue={faq.answer}
                  myValue={faq.answerMy || ""}
                  onEnChange={(v) => {
                    const next = [...content.faqs];
                    next[idx] = { ...next[idx], answer: v };
                    setContent({ ...content, faqs: next });
                  }}
                  onMyChange={(v) => {
                    const next = [...content.faqs];
                    next[idx] = { ...next[idx], answerMy: v };
                    setContent({ ...content, faqs: next });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSection("faqs", content.faqs)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save FAQs"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: Footer & Contacts */}
      {activeTab === "footer" && (
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-[#1E232B]">
              Footer & Admissions Contact Info
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phone numbers, email addresses, and footer summary copy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Phone Number
              </label>
              <input
                type="text"
                value={content.brand.primaryPhone}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, primaryPhone: e.target.value },
                  })
                }
                className="w-full min-h-10 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-[#1E232B] font-bold focus:border-[#193E8A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secondary Phone Number (Optional)
              </label>
              <input
                type="text"
                value={content.brand.secondaryPhone}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, secondaryPhone: e.target.value },
                  })
                }
                className="w-full min-h-10 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admissions Email Address
              </label>
              <input
                type="email"
                value={content.brand.admissionsEmail}
                onChange={(e) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, admissionsEmail: e.target.value },
                  })
                }
                className="w-full min-h-10 rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <BilingualField
                label="Footer Blurb"
                multiline
                rows={3}
                enValue={content.brand.footerBlurbEn}
                myValue={content.brand.footerBlurbMy}
                onEnChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, footerBlurbEn: v },
                  })
                }
                onMyChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, footerBlurbMy: v },
                  })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <BilingualField
                label="Campus Location Summary"
                enValue={content.brand.addressSummaryEn}
                myValue={content.brand.addressSummaryMy}
                onEnChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, addressSummaryEn: v },
                  })
                }
                onMyChange={(v) =>
                  setContent({
                    ...content,
                    brand: { ...content.brand, addressSummaryMy: v },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveSection("brand", content.brand)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#193E8A] hover:bg-[#2352B0] disabled:opacity-60 text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              <FloppyDisk className="w-4 h-4" weight="bold" />
              <span>{saving ? "Saving..." : "Save Footer Settings"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Program Editing Modal */}
      {editingProgram && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F2759]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#1E232B]">
              Edit Pearson Pathway
            </h3>
            <div className="space-y-4">
              <BilingualField
                label="Pathway Name"
                enValue={editingProgram.nameEn}
                myValue={editingProgram.nameMy || ""}
                onEnChange={(v) =>
                  setEditingProgram({ ...editingProgram, nameEn: v })
                }
                onMyChange={(v) =>
                  setEditingProgram({ ...editingProgram, nameMy: v })
                }
              />
              <BilingualField
                label="Grade Badge (e.g. Year 10 – Year 11)"
                enValue={editingProgram.badgeEn || ""}
                myValue={editingProgram.badgeMy || ""}
                onEnChange={(v) =>
                  setEditingProgram({ ...editingProgram, badgeEn: v })
                }
                onMyChange={(v) =>
                  setEditingProgram({ ...editingProgram, badgeMy: v })
                }
              />
              <BilingualField
                label="Age Range (e.g. Ages 14 – 16)"
                enValue={editingProgram.ageRangeEn || ""}
                myValue={editingProgram.ageRangeMy || ""}
                onEnChange={(v) =>
                  setEditingProgram({ ...editingProgram, ageRangeEn: v })
                }
                onMyChange={(v) =>
                  setEditingProgram({ ...editingProgram, ageRangeMy: v })
                }
              />
              <BilingualField
                label="Summary"
                multiline
                rows={2}
                enValue={editingProgram.summaryEn || ""}
                myValue={editingProgram.summaryMy || ""}
                onEnChange={(v) =>
                  setEditingProgram({ ...editingProgram, summaryEn: v })
                }
                onMyChange={(v) =>
                  setEditingProgram({ ...editingProgram, summaryMy: v })
                }
              />

              {/* Linked Subjects Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Linked Subjects in this Pathway
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {subjects.map((sub) => {
                    const isChecked = editingProgram.subjects.some(
                      (s) => s.id === sub.id
                    );
                    return (
                      <label
                        key={sub.id}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingProgram({
                                ...editingProgram,
                                subjects: [...editingProgram.subjects, sub],
                              });
                            } else {
                              setEditingProgram({
                                ...editingProgram,
                                subjects: editingProgram.subjects.filter(
                                  (s) => s.id !== sub.id
                                ),
                              });
                            }
                          }}
                        />
                        <span>{sub.nameEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <ImageUploadPicker
                label="Pathway Visual"
                value={editingProgram.imageUrl || ""}
                onChange={(url) =>
                  setEditingProgram({ ...editingProgram, imageUrl: url })
                }
                aspectRatio="banner"
                folder="general"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await upsertProgramAction({
                    ...editingProgram,
                    subjectIds: editingProgram.subjects.map((s) => s.id),
                  });
                  setEditingProgram(null);
                  await loadData();
                }}
                className="px-5 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-extrabold"
              >
                Save Pathway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Editing Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F2759]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#1E232B]">
              Edit Academic Subject
            </h3>
            <BilingualField
              label="Subject Name"
              enValue={editingSubject.nameEn}
              myValue={editingSubject.nameMy || ""}
              onEnChange={(v) =>
                setEditingSubject({ ...editingSubject, nameEn: v })
              }
              onMyChange={(v) =>
                setEditingSubject({ ...editingSubject, nameMy: v })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Code (e.g. 4PM1)
                </label>
                <input
                  type="text"
                  value={editingSubject.code || ""}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      code: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Track
                </label>
                <select
                  value={editingSubject.track}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      track: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                >
                  <option value="STEM">STEM</option>
                  <option value="Business">Business</option>
                  <option value="Computing">Computing</option>
                  <option value="Languages">Languages</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await upsertSubjectAction(editingSubject);
                  setEditingSubject(null);
                  await loadData();
                }}
                className="px-5 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-extrabold"
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Editing Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F2759]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-[#1E232B]">
              Edit Testimonial
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Author Full Name
              </label>
              <input
                type="text"
                value={editingTestimonial.authorName}
                onChange={(e) =>
                  setEditingTestimonial({
                    ...editingTestimonial,
                    authorName: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
            <BilingualField
              label="Author Role"
              enValue={editingTestimonial.authorRole || ""}
              myValue={editingTestimonial.authorRoleMy || ""}
              onEnChange={(v) =>
                setEditingTestimonial({ ...editingTestimonial, authorRole: v })
              }
              onMyChange={(v) =>
                setEditingTestimonial({
                  ...editingTestimonial,
                  authorRoleMy: v,
                })
              }
            />
            <BilingualField
              label="Quote"
              multiline
              rows={3}
              enValue={editingTestimonial.quote}
              myValue={editingTestimonial.quoteMy || ""}
              onEnChange={(v) =>
                setEditingTestimonial({ ...editingTestimonial, quote: v })
              }
              onMyChange={(v) =>
                setEditingTestimonial({ ...editingTestimonial, quoteMy: v })
              }
            />
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (editingTestimonial.id) {
                    await updateTestimonialAction(
                      editingTestimonial.id,
                      editingTestimonial
                    );
                  } else {
                    await createTestimonialAction(editingTestimonial);
                  }
                  setEditingTestimonial(null);
                  await loadData();
                }}
                className="px-5 py-2 rounded-xl bg-[#193E8A] text-white text-xs font-extrabold"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

