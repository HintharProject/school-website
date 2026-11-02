/**
 * Master Default Site Content & Pearson Edexcel Catalog.
 * Every section here is 100% Admin-editable via the `site_content` D1 table.
 * Natural Burmese translations strictly keep "Hinthar International School",
 * "Pearson Edexcel", "IGCSE", "IAL", and subject codes in English.
 */

export interface SocialLinkItem {
  platform: "facebook" | "youtube" | "telegram" | "viber" | "linkedin" | "website";
  label: string;
  url: string;
}

export interface BrandAndFooterContent {
  schoolName: string; // Kept in English across EN & MY per brand rule
  subtitleEn: string;
  subtitleMy: string;
  logoUrl: string;
  footerBlurbEn: string;
  footerBlurbMy: string;
  primaryPhone: string;
  secondaryPhone: string;
  admissionsEmail: string;
  addressSummaryEn: string;
  addressSummaryMy: string;
  copyrightEn: string;
  copyrightMy: string;
  socialLinks: SocialLinkItem[];
}

export interface AnnouncementItem {
  id: string;
  text: string;
  textMy?: string;
  href?: string;
}

export interface KeyHighlight {
  value: string;
  valueMy?: string;
  label: string;
  labelMy?: string;
  sub: string;
  subMy?: string;
}

export interface HeroContent {
  credentialBadgeEn: string;
  credentialBadgeMy: string;
  intakePillEn: string;
  intakePillMy: string;
  titleLine1En: string;
  titleLine1My: string;
  titleHighlightEn: string;
  titleHighlightMy: string;
  subtitleEn: string;
  subtitleMy: string;
  primaryCtaEn: string;
  primaryCtaMy: string;
  secondaryCtaEn: string;
  secondaryCtaMy: string;
  trustNoteEn: string;
  trustNoteMy: string;
  heroImageUrl: string;
  heroImageCaptionEn: string;
  heroImageCaptionMy: string;
  highlights: KeyHighlight[];
}

export interface StatBadgeItem {
  value: string;
  valueMy?: string;
  label: string;
  labelMy?: string;
}

export interface AboutPrincipalContent {
  badgeEn: string;
  badgeMy: string;
  titleEn: string;
  titleMy: string;
  titleHighlightEn: string;
  titleHighlightMy: string;
  paragraph1En: string;
  paragraph1My: string;
  paragraph2En: string;
  paragraph2My: string;
  exploreCampusesCtaEn: string;
  exploreCampusesCtaMy: string;
  principalName: string;
  principalRoleEn: string;
  principalRoleMy: string;
  principalImageUrl: string;
  principalQuoteEn: string;
  principalQuoteMy: string;
  stats: StatBadgeItem[];
}

export interface HomeSectionsContent {
  classesBadgeEn: string;
  classesBadgeMy: string;
  classesTitleEn: string;
  classesTitleMy: string;
  classesSubtitleEn: string;
  classesSubtitleMy: string;
  guidanceTitleEn: string;
  guidanceTitleMy: string;
  guidanceSubtitleEn: string;
  guidanceSubtitleMy: string;
  guidanceCtaEn: string;
  guidanceCtaMy: string;
  campusesBadgeEn: string;
  campusesBadgeMy: string;
  campusesTitleEn: string;
  campusesTitleMy: string;
  campusesSubtitleEn: string;
  campusesSubtitleMy: string;
  testimonialsBadgeEn: string;
  testimonialsBadgeMy: string;
  testimonialsTitleEn: string;
  testimonialsTitleMy: string;
  testimonialsSubtitleEn: string;
  testimonialsSubtitleMy: string;
  faqBadgeEn: string;
  faqBadgeMy: string;
  faqTitleEn: string;
  faqTitleMy: string;
  faqSubtitleEn: string;
  faqSubtitleMy: string;
}

export interface InnerPageHeaderContent {
  badgeEn: string;
  badgeMy: string;
  titleEn: string;
  titleMy: string;
  subtitleEn: string;
  subtitleMy: string;
}

export interface ClubsPageContent extends InnerPageHeaderContent {
  activitiesBadgeEn: string;
  activitiesBadgeMy: string;
  activitiesTitleEn: string;
  activitiesTitleMy: string;
  activitiesSubtitleEn: string;
  activitiesSubtitleMy: string;
}

export interface AdmissionDocumentRules {
  identityRequired: boolean;
  reportRequired: boolean;
  photoRequired: boolean;
}

export interface AdmissionsConfigContent {
  badgeEn: string;
  badgeMy: string;
  titleEn: string;
  titleMy: string;
  subtitleEn: string;
  subtitleMy: string;
  trackTitleEn: string;
  trackTitleMy: string;
  trackSubtitleEn: string;
  trackSubtitleMy: string;
  intendedStartTerms: string[];
  studyModes: string[];
  academicStreams: string[];
  relationships: string[];
  documentRules: AdmissionDocumentRules;
}

export interface FaqItem {
  id: string;
  question: string;
  questionMy?: string;
  answer: string;
  answerMy?: string;
  defaultOpen?: boolean;
}

// ==============================================================================
// COMPILED ACCURATE DEFAULTS
// ==============================================================================

export const DEFAULT_BRAND_AND_FOOTER: BrandAndFooterContent = {
  schoolName: "Hinthar International School",
  subtitleEn: "Pearson Edexcel · Year 7–9 · IGCSE · IAL",
  subtitleMy: "Pearson Edexcel · Year 7–9 · IGCSE · IAL",
  logoUrl: "/images/hinthar-logo.webp",
  footerBlurbEn:
    "Hinthar International School delivers internationally accredited Pearson Edexcel qualifications across 4 campuses in Yangon and Mawlamyine, preparing Myanmar scholars for leading global universities.",
  footerBlurbMy:
    "Hinthar International School သည် ရန်ကုန်နှင့် မော်လမြိုင်ရှိ ကျောင်းခွဲ ၄ ခုတွင် နိုင်ငံတကာအသိအမှတ်ပြု Pearson Edexcel ပညာရေးလမ်းကြောင်းများကို သင်ကြားပို့ချပေးနေပြီး ကမ္ဘာ့ထိပ်တန်း တက္ကသိုလ်များသို့ တက်ရောက်နိုင်ရန် ပြင်ဆင်ပေးလျက်ရှိပါသည်။",
  primaryPhone: "+95 9 894 332200",
  secondaryPhone: "+95 9 894 332211",
  admissionsEmail: "admissions@hinthar.education",
  addressSummaryEn: "4 Campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) & Mawlamyine",
  addressSummaryMy: "ရန်ကုန် (Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet) နှင့် မော်လမြိုင်ရှိ ကျောင်းခွဲ ၄ ခု",
  copyrightEn: "All rights reserved.",
  copyrightMy: "မူပိုင်ခွင့်များ ထိန်းသိမ်းထားပါသည်။",
  socialLinks: [
    {
      platform: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com",
    },
  ],
};

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-intake",
    text: "Admissions Open for 2026–2027 Academic Year (Lower Secondary Year 7–9 · Pearson IGCSE · Pearson IAL)",
    textMy: "၂၀၂၆–၂၀၂၇ ပညာသင်နှစ် ကျောင်းဝင်ခွင့် စတင်လက်ခံနေပါပြီ (Lower Secondary Year 7–9 · Pearson IGCSE · Pearson IAL)",
    href: "/admission",
  },
  {
    id: "ann-centre",
    text: "Approved Pearson Edexcel Examination Centre — Yangon & Mawlamyine Campuses",
    textMy: "တရားဝင် အသိအမှတ်ပြု Pearson Edexcel စာမေးပွဲစင်တာ — ရန်ကုန်နှင့် မော်လမြိုင် ကျောင်းခွဲများ",
    href: "/campuses",
  },
  {
    id: "ann-counseling",
    text: "One-on-One Academic Pathway Counseling Available: +95 9 894 332200",
    textMy: "တစ်ဦးချင်း ပညာရေးလမ်းကြောင်း ဆွေးနွေးတိုင်ပင်နိုင်ပါသည် — +95 9 894 332200",
    href: "/admission",
  },
];

export const DEFAULT_HERO: HeroContent = {
  credentialBadgeEn: "Approved Pearson Edexcel Centre · Yangon & Mawlamyine",
  credentialBadgeMy: "တရားဝင် Pearson Edexcel စာမေးပွဲစင်တာ · ရန်ကုန်နှင့် မော်လမြိုင်",
  intakePillEn: "2026–2027 Intake Open",
  intakePillMy: "၂၀၂၆–၂၀၂၇ ကျောင်းဝင်ခွင့် ဖွင့်လှစ်ထားသည်",
  titleLine1En: "Shaping Global Scholars.",
  titleLine1My: "ကမ္ဘာ့အဆင့်မီ ပညာရှင်လူငယ်များကို",
  titleHighlightEn: "Delivering Academic Excellence.",
  titleHighlightMy: "စနစ်တကျ ပြုစုပျိုးထောင်ပေးနေပါသည်။",
  subtitleEn:
    "Hinthar International School guides ambitious students from Lower Secondary (Year 7–9) through Pearson Edexcel IGCSE and International A-Level (IAL) toward direct admission at world-leading universities.",
  subtitleMy:
    "Hinthar International School သည် Lower Secondary (Year 7–9) မှ Pearson Edexcel IGCSE နှင့် International A-Level (IAL) အထိ နိုင်ငံတကာစံချိန်မီ သင်ရိုးညွှန်းတမ်းများဖြင့် ကမ္ဘာ့ထိပ်တန်း တက္ကသိုလ်များသို့ တိုက်ရိုက်တက်ရောက်နိုင်ရန် လမ်းညွှန်သင်ကြားပေးပါသည်။",
  primaryCtaEn: "Apply for Admission",
  primaryCtaMy: "ကျောင်းဝင်ခွင့် လျှောက်ထားရန်",
  secondaryCtaEn: "Explore Classes & Pathways",
  secondaryCtaMy: "အတန်းများနှင့် သင်ရိုးလမ်းကြောင်းများ",
  trustNoteEn: "British Curriculum Continuum · Small Class Mentorship · Global University Placement",
  trustNoteMy: "British သင်ရိုးညွှန်းတမ်း · စာသင်ခန်းငယ်များဖြင့် အနီးကပ်ကြီးကြပ်မှု · နိုင်ငံတကာ တက္ကသိုလ်ဝင်ခွင့်လမ်းကြောင်း",
  heroImageUrl: "/images/graduation.webp",
  heroImageCaptionEn: "Hinthar International School — Pearson Edexcel Graduating Scholars",
  heroImageCaptionMy: "Hinthar International School — Pearson Edexcel ထူးချွန်ကျောင်းသား၊ ကျောင်းသူများ",
  highlights: [
    {
      value: "4 Campuses",
      valueMy: "ကျောင်းခွဲ ၄ ခု",
      label: "Yangon & Mawlamyine",
      labelMy: "ရန်ကုန်နှင့် မော်လမြိုင်",
      sub: "3 in YGN · 1 in MLM",
      subMy: "ရန်ကုန် ၃ ခု · မော်လမြိုင် ၁ ခု",
    },
    {
      value: "Year 7–13",
      valueMy: "Year 7–13",
      label: "Pearson Edexcel",
      labelMy: "Pearson Edexcel သင်ရိုး",
      sub: "Lower Sec · IGCSE · IAL",
      subMy: "Lower Sec · IGCSE · IAL",
    },
    {
      value: "100%",
      valueMy: "၁၀၀%",
      label: "University Progression",
      labelMy: "တက္ကသိုလ် ဆက်လက်တက်ရောက်မှု",
      sub: "Global University Pathways",
      subMy: "နိုင်ငံတကာ တက္ကသိုလ်လမ်းကြောင်းများ",
    },
    {
      value: "1 : 10",
      valueMy: "၁ : ၁၀",
      label: "Faculty Mentorship",
      labelMy: "ဆရာနှင့် ကျောင်းသား အချိုး",
      sub: "Individual Academic Care",
      subMy: "တစ်ဦးချင်း အနီးကပ်ပံ့ပိုးမှု",
    },
  ],
};

export const DEFAULT_ABOUT_PRINCIPAL: AboutPrincipalContent = {
  badgeEn: "About Hinthar International School",
  badgeMy: "Hinthar International School အကြောင်း",
  titleEn: "A Trusted Standard of",
  titleMy: "ယုံကြည်စိတ်ချရသော နိုင်ငံတကာအဆင့်မီ",
  titleHighlightEn: "British International Education",
  titleHighlightMy: "ပညာရေး စံနှုန်းကောင်းများ",
  paragraph1En:
    "Operating across 4 dedicated campuses — Ywarma, Shwe Padauk, and Shwe Pone Nyet in Yangon alongside our Mawlamyine Regional Campus — Hinthar International School equips students with rigorous analytical thinking, laboratory mastery, and academic discipline.",
  paragraph1My:
    "ရန်ကုန်မြို့ရှိ Ywarma၊ Shwe Padauk နှင့် Shwe Pone Nyet ကျောင်းခွဲများအပြင် မော်လမြိုင် ကျောင်းခွဲအပါအဝင် စုစုပေါင်း ကျောင်းခွဲ ၄ ခုတွင် Hinthar International School သည် ကျောင်းသား၊ ကျောင်းသူများအား ဆန်းစစ်တွေးခေါ်နိုင်စွမ်း၊ လက်တွေ့ဓာတ်ခွဲစမ်းသပ်မှုနှင့် ခိုင်မာသော ပညာရေးအခြေခံကောင်းများ ရရှိစေရန် ပြုစုပျိုးထောင်ပေးနေပါသည်။",
  paragraph2En:
    "Our unified Pearson Edexcel continuum spans Lower Secondary Education (Year 7–9), Pearson Edexcel IGCSE (Year 10–11), and International Advanced Level (IAL / Year 12–13) — opening direct doors to leading universities worldwide.",
  paragraph2My:
    "Lower Secondary (Year 7–9) မှစတင်၍ Pearson Edexcel IGCSE (Year 10–11) နှင့် International Advanced Level (IAL / Year 12–13) အထိ တစ်ဆက်တည်း ချိတ်ဆက်ထားသော သင်ရိုးလမ်းကြောင်းဖြင့် ကမ္ဘာတစ်ဝှမ်းရှိ ထိပ်တန်းတက္ကသိုလ်များသို့ တိုက်ရိုက်လျှောက်ထားနိုင်စေပါသည်။",
  exploreCampusesCtaEn: "Explore All 4 Campuses & Facilities",
  exploreCampusesCtaMy: "ကျောင်းခွဲ ၄ ခုနှင့် သင်ထောက်ကူ အဆောက်အအုံများကို ကြည့်ရှုရန်",
  principalName: "Dr. Kaung Myat Htut",
  principalRoleEn: "Principal & Founder · Hinthar International School",
  principalRoleMy: "ကျောင်းအုပ်ကြီးနှင့် တည်ထောင်သူ · Hinthar International School",
  principalImageUrl: "/images/dr-kmh.webp",
  principalQuoteEn:
    "At Hinthar International School, every scholar receives personal mentorship, disciplined scientific inquiry, and globally benchmarked Pearson Edexcel preparation to achieve their highest university aspirations.",
  principalQuoteMy:
    "Hinthar International School တွင် ကျောင်းသားတစ်ဦးချင်းစီ၏ ရည်မှန်းချက်များ ပြည့်မြောက်စေရန် အနီးကပ် လမ်းညွှန်သင်ကြားမှု၊ စနစ်ကျသော လက်တွေ့လေ့လာမှုနှင့် နိုင်ငံတကာအသိအမှတ်ပြု Pearson Edexcel ပြင်ဆင်မှုများကို အကောင်းဆုံး ပံ့ပိုးပေးလျက်ရှိပါသည်။",
  stats: [
    {
      value: "Pearson",
      valueMy: "Pearson",
      label: "Edexcel Approved Curriculum",
      labelMy: "Edexcel အသိအမှတ်ပြု သင်ရိုး",
    },
    {
      value: "100%",
      valueMy: "၁၀၀%",
      label: "University Pass Rate",
      labelMy: "တက္ကသိုလ်ဝင်ခွင့် အောင်မြင်မှုနှုန်း",
    },
    {
      value: "15+ Yrs",
      valueMy: "၁၅ နှစ်+",
      label: "Academic Leadership",
      labelMy: "ပညာရေး အတွေ့အကြုံ",
    },
  ],
};

export const DEFAULT_HOME_SECTIONS: HomeSectionsContent = {
  classesBadgeEn: "Pearson Edexcel Continuum",
  classesBadgeMy: "Pearson Edexcel ပညာရေးလမ်းကြောင်း",
  classesTitleEn: "Classes & Academic Pathways",
  classesTitleMy: "အတန်းများနှင့် ပညာရေးလမ်းကြောင်းများ",
  classesSubtitleEn:
    "Structured British qualifications from Year 7 through Year 13. Select any pathway card to inspect offered Pearson subjects, study duration, and direct enrollment.",
  classesSubtitleMy:
    "Year 7 မှ Year 13 အထိ စနစ်တကျ ဖွဲ့စည်းထားသော Pearson Edexcel အတန်းများဖြစ်ပါသည်။ သင်ကြားပေးသည့် ဘာသာရပ်များ၊ ကာလနှင့် ကျောင်းဝင်ခွင့် အသေးစိတ်ကို သက်ဆိုင်ရာ အတန်းကတ်တွင် နှိပ်၍ ကြည့်ရှုနိုင်ပါသည်။",
  guidanceTitleEn: "Need help choosing the right Year group or subject combination?",
  guidanceTitleMy: "သင့်ကလေးအတွက် အသင့်တော်ဆုံး အတန်းနှင့် ဘာသာရပ်တွဲများ ရွေးချယ်ရန် အကြံဉာဏ်လိုအပ်ပါသလား။",
  guidanceSubtitleEn:
    "Our academic counselors review prior school transcripts and career goals to recommend the ideal Pearson Edexcel pathway.",
  guidanceSubtitleMy:
    "ကျွန်ုပ်တို့၏ ပညာရေးအကြံပေးအဖွဲ့မှ ကလေး၏ လက်ရှိပညာရေးမှတ်တမ်းနှင့် အနာဂတ်ရည်မှန်းချက်ပေါ် မူတည်၍ အသင့်တော်ဆုံး Pearson Edexcel လမ်းကြောင်းကို အကြံပြုပေးပါမည်။",
  guidanceCtaEn: "Start Admission Application",
  guidanceCtaMy: "ကျောင်းဝင်ခွင့် စတင်လျှောက်ထားရန်",
  campusesBadgeEn: "Yangon & Mawlamyine Network",
  campusesBadgeMy: "ရန်ကုန်နှင့် မော်လမြိုင် ကျောင်းခွဲများ",
  campusesTitleEn: "4 Purpose-Built Campuses",
  campusesTitleMy: "ခေတ်မီ ကျောင်းခွဲ ၄ ခု",
  campusesSubtitleEn:
    "Equipped with science practical laboratories, digital computing suites, and focused learning environments across Yangon and Mawlamyine.",
  campusesSubtitleMy:
    "ရန်ကုန်နှင့် မော်လမြိုင်တို့တွင် သိပ္ပံလက်တွေ့ဓာတ်ခွဲခန်းများ၊ ကွန်ပျူတာခန်းမများနှင့် သင်ယူမှုဝန်းကျင်ကောင်းများ ပြည့်စုံစွာ တည်ဆောက်ထားပါသည်။",
  testimonialsBadgeEn: "Parent & Alumni Voices",
  testimonialsBadgeMy: "မိဘများနှင့် ကျောင်းသားဟောင်းများ၏ စကားသံများ",
  testimonialsTitleEn: "Trusted by Families Across Myanmar",
  testimonialsTitleMy: "မိဘနှင့် ကျောင်းသားများ၏ ယုံကြည်မှု",
  testimonialsSubtitleEn:
    "Hear directly from parents and Hinthar International School graduates studying at leading international universities.",
  testimonialsSubtitleMy:
    "နိုင်ငံတကာ တက္ကသိုလ်များတွင် ပညာဆက်လက်သင်ယူနေကြသော Hinthar International School ကျောင်းသားဟောင်းများနှင့် မိဘများ၏ အတွေ့အကြုံများ။",
  faqBadgeEn: "Admissions & Curriculum FAQ",
  faqBadgeMy: "အမေးများသော မေးခွန်းများ",
  faqTitleEn: "Frequently Asked Questions",
  faqTitleMy: "မကြာခဏ မေးမြန်းလေ့ရှိသော မေးခွန်းများ",
  faqSubtitleEn:
    "Clear answers regarding Pearson Edexcel examinations, placement assessments, subject pathways, and campus facilities.",
  faqSubtitleMy:
    "Pearson Edexcel စာမေးပွဲများ၊ အဆင့်သတ်မှတ် စစ်ဆေးမှု၊ ဘာသာရပ်ရွေးချယ်မှုနှင့် ကျောင်းခွဲများဆိုင်ရာ သိလိုသမျှ အဖြေများ။",
};

export const DEFAULT_CAMPUSES_PAGE: InnerPageHeaderContent = {
  badgeEn: "Campus Network · Yangon & Mawlamyine",
  badgeMy: "ရန်ကုန်နှင့် မော်လမြိုင် ကျောင်းခွဲများ",
  titleEn: "Our Campuses & Learning Facilities",
  titleMy: "ကျောင်းခွဲများနှင့် သင်ထောက်ကူ အဆောက်အအုံများ",
  subtitleEn:
    "Explore Hinthar International School's 4 dedicated campuses across Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine.",
  subtitleMy:
    "ရန်ကုန်မြို့ရှိ Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet နှင့် မော်လမြိုင်မြို့ရှိ Hinthar International School ကျောင်းခွဲ ၄ ခုကို လေ့လာကြည့်ရှုနိုင်ပါသည်။",
};

export const DEFAULT_YEARBOOK_PAGE: InnerPageHeaderContent = {
  badgeEn: "Scholars & Alumni Chronicle",
  badgeMy: "ထူးချွန်ကျောင်းသား နှစ်ချုပ်မှတ်တမ်း",
  titleEn: "Student Yearbook",
  titleMy: "ကျောင်းသား နှစ်ချုပ်မှတ်တမ်း",
  subtitleEn:
    "Celebrating the achievements, Pearson Edexcel distinctions, and global university destinations of Hinthar International School students.",
  subtitleMy:
    "Hinthar International School ကျောင်းသား၊ ကျောင်းသူများ၏ Pearson Edexcel ထူးချွန်အောင်မြင်မှုများနှင့် နိုင်ငံတကာ တက္ကသိုလ်ဝင်ခွင့် မှတ်တမ်းများ။",
};

export const DEFAULT_CLUBS_PAGE: ClubsPageContent = {
  badgeEn: "Beyond the Classroom",
  badgeMy: "စာသင်ခန်းပြင်ပ ကျောင်းသားဘဝ",
  titleEn: "Clubs, Societies & School Activities",
  titleMy: "ကျောင်းသားအသင်းအဖွဲ့များနှင့် လှုပ်ရှားမှုများ",
  subtitleEn:
    "Developing leadership, scientific curiosity, debate rhetoric, arts, and sportsmanship across every Hinthar International School campus.",
  subtitleMy:
    "ခေါင်းဆောင်မှုစွမ်းရည်၊ သိပ္ပံစူးစမ်းလေ့လာမှု၊ စကားရည်လုပွဲ၊ အနုပညာနှင့် အားကစားစိတ်ဓာတ်များ ဖွံ့ဖြိုးတိုးတက်စေသည့် ကျောင်းတွင်းလှုပ်ရှားမှုများ။",
  activitiesBadgeEn: "Academic & Campus Calendar",
  activitiesBadgeMy: "ကျောင်းတွင်း ပွဲများနှင့် အစီအစဉ်များ",
  activitiesTitleEn: "Upcoming Activities & Event Highlights",
  activitiesTitleMy: "လာမည့် လှုပ်ရှားမှုများနှင့် အထူးပွဲအစီအစဉ်များ",
  activitiesSubtitleEn:
    "Innovation fairs, Pearson mock examination series, inter-house tournaments, and graduation ceremonies.",
  activitiesSubtitleMy:
    "သိပ္ပံနှင့် နည်းပညာပြပွဲများ၊ Pearson အကြိုစာမေးပွဲများ၊ အားကစားပြိုင်ပွဲများနှင့် ဘွဲ့နှင်းသဘင် အခမ်းအနားများ။",
};

export const DEFAULT_ADMISSIONS_CONFIG: AdmissionsConfigContent = {
  badgeEn: "2026–2027 Enrollment",
  badgeMy: "၂၀၂၆–၂၀၂၇ ကျောင်းဝင်ခွင့်",
  titleEn: "Admissions & Application Status",
  titleMy: "ကျောင်းဝင်ခွင့် လျှောက်လွှာနှင့် အခြေအနေ စစ်ဆေးရန်",
  subtitleEn:
    "Complete our streamlined 3-step online application for Pearson Edexcel pathways or check the live status of an existing application.",
  subtitleMy:
    "Pearson Edexcel အတန်းများအတွက် အဆင့် ၃ ဆင့်ဖြင့် လွယ်ကူစွာ အွန်လိုင်းမှ လျှောက်ထားနိုင်သလို လျှောက်ထားပြီးသား လျှောက်လွှာအခြေအနေကိုလည်း တစ်နေရာတည်းတွင် စစ်ဆေးနိုင်ပါသည်။",
  trackTitleEn: "Track Your Application Status",
  trackTitleMy: "လျှောက်လွှာ အခြေအနေ စစ်ဆေးရန်",
  trackSubtitleEn:
    "Enter the reference code from your receipt (e.g. HIS-2026-123456) together with the guardian email address used during submission.",
  trackSubtitleMy:
    "လျှောက်လွှာလက်ခံဖြတ်ပိုင်းမှ Reference Code (ဥပမာ HIS-2026-123456) နှင့် လျှောက်ထားစဉ် အသုံးပြုခဲ့သော အုပ်ထိန်းသူ၏ အီးမေးလ်ဖြင့် စစ်ဆေးနိုင်ပါသည်။",
  intendedStartTerms: [
    "Term 1 (August 2026)",
    "Term 2 (January 2027)",
    "Term 3 (April 2027)",
    "Immediate Placement / Transfer",
  ],
  studyModes: [
    "Full-Time On-Campus (Mon–Fri)",
    "1-Year Intensive Pearson IGCSE",
    "Modular Pearson IAL Pathway",
    "Pearson Examination Candidate",
  ],
  academicStreams: [
    "STEM & Engineering",
    "Medicine & Life Sciences",
    "Computing & AI",
    "Business & Economics",
    "General / Undecided",
  ],
  relationships: ["Father", "Mother", "Parent", "Legal Guardian", "Other"],
  documentRules: {
    identityRequired: false,
    reportRequired: false,
    photoRequired: false,
  },
};

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-curriculum",
    question: "Which international curriculum and examination board does Hinthar International School follow?",
    questionMy: "Hinthar International School တွင် မည်သည့် နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းနှင့် စာမေးပွဲစနစ်ကို အသုံးပြုပါသလဲ။",
    answer:
      "We follow the Pearson Edexcel British International Curriculum exclusively across Lower Secondary (Year 7–9), Pearson Edexcel IGCSE (Year 10–11), and Pearson Edexcel International Advanced Level (IAL / Year 12–13), recognized directly by top universities worldwide.",
    answerMy:
      "Lower Secondary (Year 7–9)၊ Pearson Edexcel IGCSE (Year 10–11) နှင့် Pearson Edexcel International Advanced Level (IAL / Year 12–13) အတန်းများအားလုံးတွင် ကမ္ဘာ့ထိပ်တန်း တက္ကသိုလ်များမှ တိုက်ရိုက်အသိအမှတ်ပြုသော Pearson Edexcel British သင်ရိုးညွှန်းတမ်းကိုသာ စနစ်တကျ သင်ကြားပေးပါသည်။",
    defaultOpen: true,
  },
  {
    id: "faq-pathways",
    question: "What subject streams are available for Pearson IGCSE and IAL students?",
    questionMy: "Pearson IGCSE နှင့် IAL ကျောင်းသားများအတွက် မည်သည့် ဘာသာရပ်လမ်းကြောင်းများ ရွေးချယ်နိုင်ပါသလဲ။",
    answer:
      "Students can specialize in STEM & Engineering (Pure Mathematics, Further Mathematics, Physics, Chemistry), Medicine & Life Sciences (Biology, Chemistry, Pure Mathematics), Computing & AI (Computer Science, ICT), or Business & Commerce (Economics, Accounting, Business Studies).",
    answerMy:
      "ကျောင်းသား၏ အနာဂတ်ရည်မှန်းချက်အလိုက် STEM နှင့် အင်ဂျင်နီယာလမ်းကြောင်း (Pure Mathematics, Further Mathematics, Physics, Chemistry)၊ ဆေးပညာနှင့် သိပ္ပံလမ်းကြောင်း (Biology, Chemistry)၊ ကွန်ပျူတာနှင့် နည်းပညာလမ်းကြောင်း (Computer Science, ICT) သို့မဟုတ် စီးပွားရေးလမ်းကြောင်း (Economics, Accounting, Business Studies) တို့ကို စိတ်ကြိုက်ရွေးချယ်သင်ယူနိုင်ပါသည်။",
  },
  {
    id: "faq-admissions",
    question: "How does the admission and placement assessment process work?",
    questionMy: "ကျောင်းဝင်ခွင့် လျှောက်ထားခြင်းနှင့် အဆင့်သတ်မှတ် စစ်ဆေးမှု အစီအစဉ် မည်သို့ဆောင်ရွက်ပါသလဲ။",
    answer:
      "Submit your application online in minutes via our Admissions page (supporting documents can be uploaded immediately or brought later). Our Admissions Office then schedules a placement assessment in English and Mathematics along with a parent-student academic consultation.",
    answerMy:
      "Admissions စာမျက်နှာမှတစ်ဆင့် မိနစ်ပိုင်းအတွင်း အွန်လိုင်းမှ လျှောက်ထားနိုင်ပါသည် (စာရွက်စာတမ်းများကို တစ်ပါတည်း တင်နိုင်သလို နောက်ပိုင်းမှလည်း ပေးပို့နိုင်ပါသည်)။ ထို့နောက် ကျောင်းဝင်ခွင့်ရုံးမှ English နှင့် Mathematics အဆင့်သတ်မှတ် စစ်ဆေးမှုနှင့် မိဘ၊ ကျောင်းသား ဆွေးနွေးပွဲအတွက် ရက်ချိန်းစီစဉ်ပေးပါသည်။",
  },
  {
    id: "faq-campuses",
    question: "Where are Hinthar International School's campuses located?",
    questionMy: "Hinthar International School ၏ ကျောင်းခွဲများသည် မည်သည့်နေရာများတွင် တည်ရှိပါသလဲ။",
    answer:
      "We operate 4 dedicated campuses: 3 in Yangon (Ywarma Campus, Shwe Padauk Campus, and Shwe Pone Nyet Campus) and 1 regional campus in Mawlamyine, Mon State.",
    answerMy:
      "ရန်ကုန်မြို့တွင် ကျောင်းခွဲ ၃ ခု (Ywarma Campus၊ Shwe Padauk Campus နှင့် Shwe Pone Nyet Campus) နှင့် မွန်ပြည်နယ် မော်လမြိုင်မြို့တွင် ကျောင်းခွဲ ၁ ခု၊ စုစုပေါင်း ကျောင်းခွဲ ၄ ခု ဖွင့်လှစ်ထားရှိပါသည်။",
  },
];

export const SITE_CONTENT_KEYS = [
  "brand",
  "announcements",
  "hero",
  "aboutPrincipal",
  "homeSections",
  "campusesPage",
  "yearbookPage",
  "clubsPage",
  "admissionsConfig",
  "faqs",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export interface FullSiteContent {
  brand: BrandAndFooterContent;
  announcements: AnnouncementItem[];
  hero: HeroContent;
  aboutPrincipal: AboutPrincipalContent;
  homeSections: HomeSectionsContent;
  campusesPage: InnerPageHeaderContent;
  yearbookPage: InnerPageHeaderContent;
  clubsPage: ClubsPageContent;
  admissionsConfig: AdmissionsConfigContent;
  faqs: FaqItem[];
}

// ==============================================================================
// DEFAULT PEARSON EDEXCEL SUBJECTS & PROGRAMS (FALLBACK + SEED SOURCE)
// ==============================================================================

export type SubjectLevel = "Lower Secondary" | "IGCSE" | "IAL" | "Both";
export type SubjectTrack = "STEM" | "Business" | "Computing" | "Languages" | "General";

export interface DefaultSubjectSeed {
  id: string;
  nameEn: string;
  nameMy: string;
  code: string | null;
  level: SubjectLevel;
  track: SubjectTrack;
  isActive: boolean;
}

export const DEFAULT_PEARSON_SUBJECTS: DefaultSubjectSeed[] = [
  { id: "ls-math", nameEn: "Mathematics", nameMy: "သင်္ချာ (Mathematics)", code: "LMA11", level: "Lower Secondary", track: "STEM", isActive: true },
  { id: "ls-science", nameEn: "Integrated Science (Physics, Chemistry & Biology)", nameMy: "အထွေထွေသိပ္ပံ (Physics, Chemistry & Biology)", code: "LSC11", level: "Lower Secondary", track: "STEM", isActive: true },
  { id: "ls-english", nameEn: "English Language & Literature", nameMy: "အင်္ဂလိပ်စာနှင့် စာပေ (English)", code: "LEN11", level: "Lower Secondary", track: "Languages", isActive: true },
  { id: "ls-computing", nameEn: "Computing & Digital Literacy", nameMy: "ကွန်ပျူတာနှင့် ဒစ်ဂျစ်တယ်နည်းပညာ", code: "LCP11", level: "Lower Secondary", track: "Computing", isActive: true },
  { id: "ls-global", nameEn: "Global Citizenship & Perspectives", nameMy: "နိုင်ငံတကာ အမြင်နှင့် လေ့လာမှု", code: "LGP11", level: "Lower Secondary", track: "General", isActive: true },
  { id: "s-pure-math", nameEn: "Further Pure Mathematics / Pure Mathematics", nameMy: "Pure Mathematics", code: "4PM1 / WMA11", level: "Both", track: "STEM", isActive: true },
  { id: "s-math-b", nameEn: "Mathematics B", nameMy: "Mathematics B", code: "4MB1", level: "IGCSE", track: "STEM", isActive: true },
  { id: "s-further-math", nameEn: "Further Mathematics", nameMy: "Further Mathematics", code: "YFM01", level: "IAL", track: "STEM", isActive: true },
  { id: "s-physics", nameEn: "Physics", nameMy: "ရူပဗေဒ (Physics)", code: "4PH1 / WPH11", level: "Both", track: "STEM", isActive: true },
  { id: "s-chemistry", nameEn: "Chemistry", nameMy: "ဓာတုဗေဒ (Chemistry)", code: "4CH1 / WCH11", level: "Both", track: "STEM", isActive: true },
  { id: "s-biology", nameEn: "Biology", nameMy: "ဇီဝဗေဒ (Biology)", code: "4BI1 / WBI11", level: "Both", track: "STEM", isActive: true },
  { id: "s-cs", nameEn: "Computer Science", nameMy: "Computer Science", code: "4CP0", level: "IGCSE", track: "Computing", isActive: true },
  { id: "s-it", nameEn: "Information Technology (ICT / IT)", nameMy: "Information Technology (ICT / IT)", code: "4IT1 / WIT11", level: "Both", track: "Computing", isActive: true },
  { id: "s-econ", nameEn: "Economics", nameMy: "ဘောဂဗေဒ (Economics)", code: "4EC1 / WEC11", level: "Both", track: "Business", isActive: true },
  { id: "s-acc", nameEn: "Accounting", nameMy: "စာရင်းကိုင်ပညာ (Accounting)", code: "4AC1 / WAC11", level: "Both", track: "Business", isActive: true },
  { id: "s-business", nameEn: "Business", nameMy: "စီးပွားရေးပညာ (Business)", code: "4BS1 / WBS11", level: "Both", track: "Business", isActive: true },
  { id: "s-english", nameEn: "English as a Second / First Language", nameMy: "အင်္ဂလိပ်စာ (English Language)", code: "4ES1 / 4EA1", level: "IGCSE", track: "Languages", isActive: true },
];

export interface DefaultProgramSeed {
  id: string;
  nameEn: string;
  nameMy: string;
  badgeEn: string;
  badgeMy: string;
  ageRangeEn: string;
  ageRangeMy: string;
  summaryEn: string;
  summaryMy: string;
  descriptionEn: string;
  descriptionMy: string;
  highlightsEn: string[];
  highlightsMy: string[];
  curriculum: string;
  duration: string;
  campus: "both" | "yangon" | "mawlamyine";
  studyMode: string;
  programLevel: "lower_secondary" | "igcse" | "ial";
  imageUrl: string;
  sortOrder: number;
  subjectIds: string[];
}

export const DEFAULT_PEARSON_PROGRAMS: DefaultProgramSeed[] = [
  {
    id: "lower-secondary",
    nameEn: "Pearson Edexcel Lower Secondary",
    nameMy: "Pearson Edexcel Lower Secondary (အလယ်တန်းအဆင့်)",
    badgeEn: "Year 7 – Year 9",
    badgeMy: "Year 7 – Year 9",
    ageRangeEn: "Ages 11 – 14",
    ageRangeMy: "အသက် ၁၁ – ၁၄ နှစ်",
    summaryEn:
      "Building strong foundations in analytical mathematics, empirical sciences, academic English, and computing to bridge seamlessly into IGCSE.",
    summaryMy:
      "သင်္ချာ၊ သိပ္ပံ၊ အင်္ဂလိပ်စာနှင့် ကွန်ပျူတာဘာသာရပ်များတွင် အခြေခံခိုင်မာစေပြီး Pearson IGCSE အဆင့်သို့ ချောမွေ့စွာ ကူးပြောင်းနိုင်ရန် ပြင်ဆင်ပေးသည့် အတန်းဖြစ်ပါသည်။",
    descriptionEn:
      "Our Lower Secondary programme follows the Pearson Edexcel International Lower Secondary curriculum across Year 7, Year 8, and Year 9. Students develop laboratory confidence, structured academic writing, mathematical reasoning, and collaborative project leadership.",
    descriptionMy:
      "Year 7၊ Year 8 နှင့် Year 9 အတန်းများတွင် Pearson Edexcel International Lower Secondary သင်ရိုးညွှန်းတမ်းအတိုင်း သိပ္ပံဓာတ်ခွဲစမ်းသပ်မှု၊ စနစ်ကျသော အင်္ဂလိပ်စာ အရေးအသားနှင့် သင်္ချာတွေးခေါ်မှုစွမ်းရည်များကို အခြေခံမှစ၍ ပျိုးထောင်ပေးပါသည်။",
    highlightsEn: [
      "Core Mathematics, Physics, Chemistry & Biology foundations",
      "Academic English literacy, speech & critical writing",
      "Hands-on Computing, coding & STEM laboratory inquiry",
      "Seamless progression into Pearson Edexcel IGCSE",
    ],
    highlightsMy: [
      "သင်္ချာ၊ ရူပဗေဒ၊ ဓာတုဗေဒနှင့် ဇီဝဗေဒ အခြေခံကောင်းများ",
      "အင်္ဂလိပ်စာ အရေး၊ အဖတ်၊ အပြော စွမ်းရည် လေ့ကျင့်မှု",
      "လက်တွေ့ ကွန်ပျူတာနှင့် သိပ္ပံဓာတ်ခွဲခန်း စမ်းသပ်မှုများ",
      "Pearson Edexcel IGCSE သို့ တိုက်ရိုက် ချိတ်ဆက်တက်ရောက်နိုင်ခြင်း",
    ],
    curriculum: "Pearson Edexcel",
    duration: "3 Academic Years (Year 7–9)",
    campus: "both",
    studyMode: "Full-Time On-Campus (Mon–Fri)",
    programLevel: "lower_secondary",
    imageUrl: "/images/g4.jpg",
    sortOrder: 1,
    subjectIds: ["ls-math", "ls-science", "ls-english", "ls-computing", "ls-global"],
  },
  {
    id: "pearson-igcse",
    nameEn: "Pearson Edexcel International GCSE (IGCSE)",
    nameMy: "Pearson Edexcel International GCSE (IGCSE)",
    badgeEn: "Year 10 – Year 11",
    badgeMy: "Year 10 – Year 11",
    ageRangeEn: "Ages 14 – 16",
    ageRangeMy: "အသက် ၁၄ – ၁၆ နှစ်",
    summaryEn:
      "Globally recognized British secondary qualifications offering specialized subject tracks across STEM, Medicine, Computing, and Business.",
    summaryMy:
      "STEM၊ ဆေးပညာ၊ ကွန်ပျူတာနှင့် စီးပွားရေး ဘာသာရပ်လမ်းကြောင်းများဖြင့် ကမ္ဘာတစ်ဝှမ်း အသိအမှတ်ပြု British အထက်တန်းအဆင့် အောင်လက်မှတ် ရရှိစေမည့် အတန်းဖြစ်ပါသည်။",
    descriptionEn:
      "The two-year Pearson Edexcel IGCSE programme (with an intensive 1-year track available for qualified candidates) prepares scholars for official international examinations through rigorous syllabus mastery, laboratory practicals, and structured mock exam series.",
    descriptionMy:
      "Pearson Edexcel IGCSE သင်တန်းသည် တရားဝင် နိုင်ငံတကာစာမေးပွဲများတွင် ထူးချွန်စွာ အောင်မြင်စေရန် သင်ရိုးညွှန်းတမ်း အပြည့်အစုံ၊ ဓာတ်ခွဲခန်း လက်တွေ့သင်ခန်းစာများနှင့် အကြိုစာမေးပွဲ လေ့ကျင့်မှုများဖြင့် စနစ်တကျ သင်ကြားပေးပါသည်။",
    highlightsEn: [
      "Official Pearson Edexcel IGCSE examination preparation",
      "Dedicated STEM, Pre-Medicine, Computing & Business streams",
      "Structured past-paper mastery & examiner-standard mock exams",
      "Full science laboratory practicals on campus",
    ],
    highlightsMy: [
      "တရားဝင် Pearson Edexcel IGCSE စာမေးပွဲအတွက် အပြည့်အဝ ပြင်ဆင်မှု",
      "STEM၊ ဆေးပညာ၊ ကွန်ပျူတာနှင့် စီးပွားရေး အထူးပြုလမ်းကြောင်းများ",
      "မေးခွန်းဟောင်း လေ့ကျင့်မှုနှင့် စံချိန်မီ အကြိုစာမေးပွဲများ",
      "ကျောင်းခွဲတွင်း သိပ္ပံလက်တွေ့ ဓာတ်ခွဲစမ်းသပ်ခန်းများ",
    ],
    curriculum: "Pearson Edexcel",
    duration: "2 Academic Years (or 1-Year Intensive)",
    campus: "both",
    studyMode: "Full-Time On-Campus (Mon–Fri)",
    programLevel: "igcse",
    imageUrl: "/images/engineering.avif",
    sortOrder: 2,
    subjectIds: [
      "s-pure-math",
      "s-math-b",
      "s-physics",
      "s-chemistry",
      "s-biology",
      "s-cs",
      "s-it",
      "s-econ",
      "s-acc",
      "s-business",
      "s-english",
    ],
  },
  {
    id: "pearson-ial",
    nameEn: "Pearson Edexcel International A-Level (IAL)",
    nameMy: "Pearson Edexcel International A-Level (IAL)",
    badgeEn: "Year 12 – Year 13",
    badgeMy: "Year 12 – Year 13",
    ageRangeEn: "Ages 16 – 18+",
    ageRangeMy: "အသက် ၁၆ – ၁၈ နှစ်အထက်",
    summaryEn:
      "Gold-standard modular pre-university qualifications engineered for direct entry into top global Engineering, Medicine, Computing, and Finance degrees.",
    summaryMy:
      "ကမ္ဘာ့ထိပ်တန်း တက္ကသိုလ်ကြီးများ၏ အင်ဂျင်နီယာ၊ ဆေးပညာ၊ ကွန်ပျူတာနှင့် စီးပွားရေး ဘွဲ့ကြိုတန်းများသို့ တိုက်ရိုက်ဝင်ခွင့် ရရှိစေမည့် တက္ကသိုလ်အကြို အဆင့်မြင့်အတန်း ဖြစ်ပါသည်။",
    descriptionEn:
      "Pearson Edexcel International Advanced Level (IAL) offers flexible modular assessment across AS and A2 units. Scholars receive intensive A* distinction coaching alongside personalized university application, scholarship, and personal statement mentorship.",
    descriptionMy:
      "Pearson Edexcel International Advanced Level (IAL) သည် AS နှင့် A2 ယူနစ်များဖြင့် ဖြေဆိုနိုင်သော နိုင်ငံတကာ တက္ကသိုလ်ဝင်ခွင့် အဆင့်မြင့်သင်ရိုးဖြစ်ပြီး A* ထူးချွန်အမှတ် ရရှိရေးနှင့် နိုင်ငံတကာ တက္ကသိုလ် ပညာသင်ဆု လျှောက်ထားမှုများအထိ အနီးကပ် လမ်းညွှန်ပေးပါသည်။",
    highlightsEn: [
      "Modular AS & A2 Pearson Edexcel International A-Level units",
      "Direct admission recognition in UK, US, Singapore, Australia & beyond",
      "Individual university counseling & scholarship mentorship",
      "Advanced Pure/Further Mathematics, Sciences & Economics depth",
    ],
    highlightsMy: [
      "AS နှင့် A2 ယူနစ်အလိုက် ဖြေဆိုနိုင်သော Pearson Edexcel IAL စနစ်",
      "UK၊ US၊ စင်ကာပူ၊ ဩစတြေးလျနှင့် ကမ္ဘာ့တက္ကသိုလ်များသို့ တိုက်ရိုက်ဝင်ခွင့်",
      "တက္ကသိုလ်ရွေးချယ်မှုနှင့် ပညာသင်ဆု လျှောက်ထားမှု တစ်ဦးချင်း လမ်းညွှန်ချက်",
      "Further Mathematics၊ သိပ္ပံနှင့် စီးပွားရေး အဆင့်မြင့် ဘာသာရပ်များ",
    ],
    curriculum: "Pearson Edexcel",
    duration: "18 – 24 Months (AS & A2 Levels)",
    campus: "both",
    studyMode: "Full-Time On-Campus (Mon–Fri)",
    programLevel: "ial",
    imageUrl: "/images/graduation.webp",
    sortOrder: 3,
    subjectIds: [
      "s-pure-math",
      "s-further-math",
      "s-physics",
      "s-chemistry",
      "s-biology",
      "s-it",
      "s-econ",
      "s-acc",
      "s-business",
    ],
  },
];
