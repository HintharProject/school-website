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
    "Hinthar International School delivers internationally accredited Pearson Edexcel qualifications across 5 campuses in Yangon (Shwe Hinthar, Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine, preparing Myanmar scholars for leading global universities.",
  footerBlurbMy:
    "Hinthar International School သည် ရန်ကုန်နှင့် မော်လမြိုင်ရှိ ကျောင်းခွဲ ၅ ခု (Shwe Hinthar၊ Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet၊ Mawlamyine) တွင် နိုင်ငံတကာအသိအမှတ်ပြု Pearson Edexcel ပညာရေးလမ်းကြောင်းများကို သင်ကြားပို့ချပေးနေပြီး ကမ္ဘာ့ထိပ်တန်း တက္ကသိုလ်များသို့ တက်ရောက်နိုင်ရန် ပြင်ဆင်ပေးလျက်ရှိပါသည်။",
  primaryPhone: "+95 9 894 332200",
  secondaryPhone: "+95 9 894 332299",
  admissionsEmail: "admissions@hinthar.education",
  addressSummaryEn: "5 Campuses: 4 in Yangon (Shwe Hinthar, Ywarma, Shwe Padauk, Shwe Pone Nyet) & 1 in Mawlamyine (Mon State IS Licensed)",
  addressSummaryMy: "ရန်ကုန် ၄ ခု (Shwe Hinthar၊ Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet) နှင့် မော်လမြိုင်ရှိ ကျောင်းခွဲ ၅ ခု",
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
    id: "ann-intake-nov",
    text: "November 2026 Intake Starting: Year 7, 8, 9 (6-Month Fast-Track Pre-IGCSE) & IGCSE Class L (18 Months) — Admissions Open!",
    textMy: "၂၀၂၆ နိုဝင်ဘာ Intake အတန်းအသစ်များ စတင်ပါမည် - Year 7, 8, 9 (၆ လ Fast-Track Pre-IG) နှင့် IGCSE Class L (၁၈ လသင်တန်း) ကျောင်းသားအသစ်များ လက်ခံနေပါပြီ!",
    href: "/admission",
  },
  {
    id: "ann-hackathon",
    text: "Hinthar Tech Hackathon 2026 (Nov 2026) — Led by World Highest Mark in A-Level IT holder Ko Thaw Ye Zaw. Registration Open!",
    textMy: "Hinthar Tech Hackathon ၂၀၂၆ - A-Level IT ကမ္ဘာ့အမြင့်ဆုံးအမှတ်ရ ကိုသော်ရဲဇော် ဦးဆောင်သော နည်းပညာပြိုင်ပွဲ စတင်စာရင်းပေးသွင်းနိုင်ပါပြီ!",
    href: "/clubs#activities",
  },
  {
    id: "ann-icsc",
    text: "Proud Winners of ICSC 2026 (International Computer Science Competition): School Award for Excellence & National Awards!",
    textMy: "နိုင်ငံတကာ ICSC ၂၀၂၆ ကွန်ပျူတာသိပ္ပံပြိုင်ပွဲကြီးတွင် School Award for Excellence နှင့် နိုင်ငံလုံးဆိုင်ရာဆုများ ထိုက်တန်စွာ ရရှိခဲ့ပါသည်!",
    href: "/clubs",
  },
  {
    id: "ann-counseling",
    text: "Admissions Hotline (7 Days, 9:00 AM – 4:00 PM): 09 894 33 22 00 / 09 894 33 22 99",
    textMy: "ကျောင်းဝင်ခွင့် စုံစမ်းရန် (စနေ၊ တနင်္ဂနွေမရွေး ၉:၀၀ မှ ၄:၀၀ နာရီ) - 09 894 33 22 00 / 09 894 33 22 99",
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
      value: "5 Campuses",
      valueMy: "ကျောင်းခွဲ ၅ ခု",
      label: "Yangon & Mawlamyine",
      labelMy: "ရန်ကုန်နှင့် မော်လမြိုင်",
      sub: "4 in YGN · 1 in MLM",
      subMy: "ရန်ကုန် ၄ ခု · မော်လမြိုင် ၁ ခု",
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
    "Operating across 5 dedicated campuses — Shwe Hinthar, Ywarma, Shwe Padauk, and Shwe Pone Nyet in Yangon alongside our Mawlamyine Regional Campus (IS Licensed) — Hinthar International School equips students with rigorous analytical thinking, laboratory mastery, and academic discipline.",
  paragraph1My:
    "ရန်ကုန်မြို့ရှိ Shwe Hinthar၊ Ywarma၊ Shwe Padauk နှင့် Shwe Pone Nyet ကျောင်းခွဲ ၄ ခုအပြင် မော်လမြိုင် IS Licensed ကျောင်းခွဲအပါအဝင် စုစုပေါင်း ကျောင်းခွဲ ၅ ခုတွင် Hinthar International School သည် ကျောင်းသား၊ ကျောင်းသူများအား ဆန်းစစ်တွေးခေါ်နိုင်စွမ်း၊ လက်တွေ့ဓာတ်ခွဲစမ်းသပ်မှုနှင့် ခိုင်မာသော ပညာရေးအခြေခံကောင်းများ ရရှိစေရန် ပြုစုပျိုးထောင်ပေးနေပါသည်။",
  paragraph2En:
    "Our unified Pearson Edexcel continuum spans Lower Secondary Education (Year 7–9), Pearson Edexcel IGCSE (Year 10–11), and International Advanced Level (IAL / Year 12–13) — opening direct doors to leading universities worldwide.",
  paragraph2My:
    "Lower Secondary (Year 7–9) မှစတင်၍ Pearson Edexcel IGCSE (Year 10–11) နှင့် International Advanced Level (IAL / Year 12–13) အထိ တစ်ဆက်တည်း ချိတ်ဆက်ထားသော သင်ရိုးလမ်းကြောင်းဖြင့် ကမ္ဘာတစ်ဝှမ်းရှိ ထိပ်တန်းတက္ကသိုလ်များသို့ တိုက်ရိုက်လျှောက်ထားနိုင်စေပါသည်။",
  exploreCampusesCtaEn: "Explore All 5 Campuses & Facilities",
  exploreCampusesCtaMy: "ကျောင်းခွဲ ၅ ခုနှင့် သင်ထောက်ကူ အဆောက်အအုံများကို ကြည့်ရှုရန်",
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
    "Explore Hinthar International School's 5 dedicated campuses across Yangon (Shwe Hinthar, Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine.",
  subtitleMy:
    "ရန်ကုန်မြို့ရှိ Shwe Hinthar၊ Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet နှင့် မော်လမြိုင်မြို့ရှိ Hinthar International School ကျောင်းခွဲ ၅ ခုကို လေ့လာကြည့်ရှုနိုင်ပါသည်။",
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
    "November 2026 Intake (Class L & Fast-Track)",
    "January 2027 Intake (Class H A-Level)",
    "June 2027 Intake (1-Year Lower Secondary)",
    "Immediate Placement / Transfer",
  ],
  studyModes: [
    "Full-Time Intensive (Mon–Fri 8:30 AM – 4:00 PM)",
    "18-Month Regular Intake (Class L)",
    "2-Year Weekend Course (Sat–Sun)",
    "6-Month Fast-Track (Pre-IGCSE)",
    "Modular Pearson IAL Track (10–16 Months)",
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
    question: "Which international curriculum and examination pathways does Hinthar offer?",
    questionMy: "Hinthar တွင် မည်သည့် နိုင်ငံတကာ သင်ရိုးညွှန်းတမ်းနှင့် အတန်းများကို တက်ရောက်နိုင်ပါသလဲ။",
    answer:
      "We provide British international curricula across 5 distinct pathways: 1) 6-Month Fast-Track (Year 7, 8, 9 Pre-IGCSE), 2) 1-Year Pearson Edexcel Lower Secondary (Year 6–9), 3) Pearson Edexcel IGCSE Class L (18-Month Regular Intake), 4) 2-Year Weekend Budget IGCSE Course (3 subjects/year), and 5) Pearson Edexcel International A-Level (IAL) with proven entry to MIT, UC Berkeley, KIT Germany, Shizuoka (100% Scholarship), and Tongji MBBS.",
    answerMy:
      "Hinthar တွင် British နိုင်ငံတကာ သင်ရိုးများဖြစ်သည့် ၁) Year 7, 8, 9 (၆ လ Fast-Track Pre-IGCSE)၊ ၂) Year 6-9 (Pearson Edexcel ၁ နှစ် အတန်းများ)၊ ၃) Pearson Edexcel IGCSE Class L (၁၈ လပုံမှန်အတန်း)၊ ၄) IGCSE / O Level ၂ နှစ် Weekends အတန်း (၁ နှစ် ၃ ဘာသာ) နှင့် ၅) Pearson Edexcel International A-Level (IAL) တို့ကို စနစ်တကျ သင်ကြားပေးပါသည်။",
    defaultOpen: true,
  },
  {
    id: "faq-no-hidden-fees",
    question: "Are there any hidden costs, documentation fees, or surprise surcharges?",
    questionMy: "ကျောင်းလခနှင့် ပတ်သက်၍ Hidden Cost များနှင့် နောက်မှလိုက်ကောက်သော ကြေးများ ရှိပါသလား။",
    answer:
      "Absolutely zero hidden costs. All tuition and program fees are transparently established upfront before enrollment with zero surprise registration or documentation surcharges. Furthermore, graduation ceremony attendance for the graduating scholar plus up to 2 family guests is 100% complimentary.",
    answerMy:
      "လုံးဝ မရှိပါ။ Hinthar တွင် ကျောင်းစရိတ်များကို အစအဆုံး ကြိုတင်သတ်မှတ်ထားပြီး Registration Fees၊ Documentation Fees ဟူသော Hidden Cost များနှင့် နောက်မှလိုက်ကောက်သည့် ကြေးများ လုံးဝမရှိပါ။ ထို့အပြင် Graduation အခမ်းအနားတွင် ကျောင်းသားအပြင် မိသားစုဝင် ၂ ဦးအထိ အခမဲ့ တက်ရောက်ခွင့် စီစဉ်ပေးပါသည်။",
  },
  {
    id: "faq-study-guides",
    question: "Do students need external private tuition or extra guide teachers?",
    questionMy: "ကလေး စာမလိုက်နိုင်ပါက ပြင်ပ Guide သီးသန့် ထပ်ငှားရန် လိုပါသလား။",
    answer:
      "No external tuition is required. Hinthar provides complimentary FOC Study Guide sessions on weekends and after class, past paper drills at the end of each unit/chapter, and detailed diagnostic progress reports after every assessment.",
    answerMy:
      "လုံးဝ မလိုပါ။ အခမဲ့ စီစဉ်ပေးထားသော FOC Study Guide အတန်းများ ရှိပြီး အခန်းတစ်ခုစီ ပြီးဆုံးတိုင်း Past Paper လေ့ကျင့်မှုများကို အတန်းထဲတွင် တစ်ပါတည်း ထည့်သွင်းသင်ကြားပေးပါသည်။ စာမေးပွဲ စစ်ဆေးပြီးတိုင်းလည်း Detailed Feedback ပေးသဖြင့် ကလေး၏ အားနည်းချက်၊ အားသာချက်ကို တိကျစွာ သိရှိနိုင်ပါသည်။",
  },
  {
    id: "faq-fast-track",
    question: "What is the 6-Month Fast-Track program for Year 7, 8, and 9?",
    questionMy: "Year 7, 8, 9 (၆ လ Fast-Track) အတန်းသည် မည်သူများအတွက် သင့်တော်ပါသလဲ။",
    answer:
      "Each level is completed in 6 intensive months (Monday to Friday, 8:30 AM – 4:00 PM) focusing exclusively on essential academic subjects: English, Mathematics, Physics, Chemistry, Biology, Computing (ICT + CS + Practical Python Programming), Global Citizenship, and Arts. Year 8 and 9 serve as Pre-IGCSE foundations, ideal for students switching from the Myanmar state curriculum or catching up after COVID/political disruptions.",
    answerMy:
      "တစ်တန်းလျှင် (၆) လဖြင့် တနင်္လာမှ သောကြာ (8:30 AM – 4:00 PM) အချိန်ပြည့် တက်ရောက်ရသော အတန်းဖြစ်ပါသည်။ Essential Academic Subjects များဖြစ်သော English, Maths, Science, Computing (Python အပါအဝင်), Global Citizenship, Arts တို့ကို အဓိက အချိန်ပေး လေ့ကျင့်ပေးပြီး မြန်မာသင်ရိုးမှ ကူးပြောင်းလိုသူများ၊ အတန်းနားထားရသူများနှင့် အချိန်တိုအတွင်း IGCSE သို့ ဦးတည်လိုသူများအတွက် အထူးသင့်တော်ပါသည်။",
  },
  {
    id: "faq-weekend-olevel",
    question: "How does the 2-Year Weekend O-Level course work?",
    questionMy: "O-Level ၂ နှစ်သင်တန်း (Weekends အတန်း) ၏ ထူးခြားချက်က ဘာလဲ။",
    answer:
      "A budget-friendly and focused alternative where students take only 3 subjects per year over 2 years (Saturdays & Sundays). It is ideal for students attending Myanmar high school simultaneously or wishing to focus on fewer subjects at a time with guided self-study.",
    answerMy:
      "ဘတ်ဂျက်အရ သက်သာပြီး တစ်နှစ်လျှင် ၃ ဘာသာနှုန်းဖြင့် ၂ နှစ်အတွင်း ၆ ဘာသာ ဖြေဆိုရမည့် စနေ၊ တနင်္ဂနွေ အတန်းဖြစ်ပါသည်။ မြန်မာသင်ရိုးတက်နေရင်း IGCSE ကိုပါ တစ်ချိန်တည်း လုပ်လိုသူများနှင့် တစ်ကြိမ်လျှင် ဘာသာရပ် ၃ ခုကိုသာ စိတ်စိုက် လေ့လာလိုသူများအတွက် အထူးသင့်တော်ပါသည်။",
  },
  {
    id: "faq-campuses",
    question: "Where are Hinthar's 5 campuses located?",
    questionMy: "Hinthar International School ၏ ကျောင်းခွဲ ၅ ခုသည် မည်သည့်နေရာများတွင် တည်ရှိပါသလဲ။",
    answer:
      "We operate 5 campuses: 4 in Yangon (Shwe Hinthar Campus, Ywarma Campus, Shwe Padauk Campus, and Shwe Pone Nyet Campus) and 1 regional campus in Mawlamyine, Mon State (Mon State IS Licensed). Contact our hotlines at 09 894 33 22 00 / 09 894 33 22 99 (Open 7 days a week, 9:00 AM – 4:00 PM).",
    answerMy:
      "ရန်ကုန်တွင် ကျောင်းခွဲ ၄ ခု (Shwe Hinthar၊ Ywarma၊ Shwe Padauk၊ Shwe Pone Nyet) နှင့် မွန်ပြည်နယ် မော်လမြိုင်တွင် ကျောင်းခွဲ ၁ ခု (IS လိုင်စင်ရ)၊ စုစုပေါင်း ၅ ခု ဖွင့်လှစ်ထားရှိပါသည်။ အသေးစိတ်ကို 09 894 33 22 00 / 09 894 33 22 99 (စနေ၊ တနင်္ဂနွေမရွေး ၉:၀၀ မှ ၄:၀၀ နာရီ) သို့ ဆက်သွယ်နိုင်ပါသည်။",
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
  { id: "ls-computing", nameEn: "Computing (ICT + CS + Practical Python)", nameMy: "ကွန်ပျူတာ (ICT + CS + Python Programming)", code: "LCP11", level: "Lower Secondary", track: "Computing", isActive: true },
  { id: "ls-global", nameEn: "Global Citizenship & Perspectives", nameMy: "နိုင်ငံတကာ အမြင်နှင့် လေ့လာမှု", code: "LGP11", level: "Lower Secondary", track: "General", isActive: true },
  { id: "s-pure-math", nameEn: "Further Pure Mathematics / Pure Mathematics", nameMy: "Pure Mathematics", code: "4PM1 / WMA11", level: "Both", track: "STEM", isActive: true },
  { id: "s-math-b", nameEn: "Mathematics B", nameMy: "Mathematics B", code: "4MB1", level: "IGCSE", track: "STEM", isActive: true },
  { id: "s-further-math", nameEn: "Further Mathematics", nameMy: "Further Mathematics", code: "YFM01", level: "IAL", track: "STEM", isActive: true },
  { id: "s-physics", nameEn: "Physics", nameMy: "ရူပဗေဒ (Physics)", code: "4PH1 / WPH11", level: "Both", track: "STEM", isActive: true },
  { id: "s-chemistry", nameEn: "Chemistry", nameMy: "ဓာတုဗေဒ (Chemistry)", code: "4CH1 / WCH11", level: "Both", track: "STEM", isActive: true },
  { id: "s-biology", nameEn: "Biology", nameMy: "ဇီဝဗေဒ (Biology)", code: "4BI1 / WBI11", level: "Both", track: "STEM", isActive: true },
  { id: "s-human-biology", nameEn: "Human Biology", nameMy: "လူ့ခန္ဓာဗေဒ (Human Biology)", code: "4HB1", level: "IGCSE", track: "STEM", isActive: true },
  { id: "s-cs", nameEn: "Computer Science", nameMy: "Computer Science", code: "4CP0", level: "IGCSE", track: "Computing", isActive: true },
  { id: "s-it", nameEn: "Information Technology (ICT / IT)", nameMy: "Information Technology (ICT / IT)", code: "4IT1 / WIT11", level: "Both", track: "Computing", isActive: true },
  { id: "s-econ", nameEn: "Economics", nameMy: "ဘောဂဗေဒ (Economics)", code: "4EC1 / WEC11", level: "Both", track: "Business", isActive: true },
  { id: "s-acc", nameEn: "Accounting", nameMy: "စာရင်းကိုင်ပညာ (Accounting)", code: "4AC1 / WAC11", level: "Both", track: "Business", isActive: true },
  { id: "s-business", nameEn: "Business", nameMy: "စီးပွားရေးပညာ (Business)", code: "4BS1 / WBS11", level: "Both", track: "Business", isActive: true },
  { id: "s-english", nameEn: "English as a Second / First Language", nameMy: "အင်္ဂလိပ်စာ (English Language)", code: "4ES1 / 4EA1", level: "IGCSE", track: "Languages", isActive: true },
  { id: "s-env-mgmt", nameEn: "Environmental Management", nameMy: "သဘာဝပတ်ဝန်းကျင် စီမံခန့်ခွဲမှု", code: "4EV1", level: "IGCSE", track: "General", isActive: true },
  { id: "s-travel-tourism", nameEn: "Travel & Tourism", nameMy: "ခရီးသွားလုပ်ငန်းနှင့် ဧည့်ဝတ်ကျေပွန်မှု", code: "4TT1", level: "IGCSE", track: "General", isActive: true },
  { id: "s-sociology", nameEn: "Sociology", nameMy: "လူမှုဗေဒ (Sociology)", code: "4SO1", level: "IGCSE", track: "General", isActive: true },
  { id: "s-arts-3d", nameEn: "Arts & Design (3D & Fine Arts)", nameMy: "အနုပညာနှင့် ဒီဇိုင်း (3D / Fine Arts)", code: "4FA1", level: "Both", track: "General", isActive: true },
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
    id: "lower-secondary-fast-track",
    nameEn: "Pre-IGCSE Fast-Track (Year 7, 8, 9 — 6 Months)",
    nameMy: "Pre-IGCSE Fast-Track အထူးအရှိန်မြှင့်သင်တန်း (Year 7, 8, 9 — ၆ လသင်တန်း)",
    badgeEn: "6-Month Fast-Track · Pre-IGCSE",
    badgeMy: "၆ လသင်တန်း · Pre-IGCSE",
    ageRangeEn: "Ages 11 – 15+",
    ageRangeMy: "အသက် ၁၁ – ၁၅ နှစ်အထက်",
    summaryEn:
      "Accelerated 6-month per level full-day intensive pathway (Mon–Fri 8:30 AM – 4:00 PM) focused on essential academic subjects (English, Maths, Sciences, Computing with Python, Global Citizenship, and Arts), ideal for students switching from Myanmar curriculum or catching up after school disruptions.",
    summaryMy:
      "တစ်တန်းလျှင် ၆ လဖြင့် တနင်္လာမှ သောကြာ (8:30 AM – 4:00 PM) အချိန်ပြည့် တက်ရောက်ရပြီး English, Maths, Science, Computing (Python), Global Citizenship, Arts တို့ကို အဓိက အချိန်ပေး လေ့ကျင့်ပေးမည့် Pre-IGCSE အတန်းဖြစ်ပါသည်။",
    descriptionEn:
      "Designed for students who want to bridge rapidly into IGCSE or who paused studies due to COVID/disruptions. Extracurricular PE/Music are reduced to maximize dedicated academic mastery with integrated Python programming and Cambridge Checkpoint foundations.",
    descriptionMy:
      "မြန်မာသင်ရိုးမှ IGCSE သို့ ကူးပြောင်းလိုသူများနှင့် အသက်အရွယ်အရ IGCSE + A-Level သို့ အချိန်တိုအတွင်း ဦးတည်လိုသူများအတွက် PE/Music စသည့် အခြားသင်ရိုးပြင်ပ ဘာသာရပ်များကို လျှော့ချထားပြီး Essential Academic Subjects များကိုပဲ အဓိက အချိန်ပေး လေ့ကျင့်ပေးပါသည်။ Computing တွင် ICT နှင့် CS အပြင် Practical Python Programming ကိုပါ ထည့်သွင်းသင်ကြားပါသည်။",
    highlightsEn: [
      "6 Months per Year level with fast-track academic acceleration",
      "Full-Day Intensive Schedule: Mon–Fri, 8:30 AM – 4:00 PM",
      "Essential Academics: English, Maths, Sciences, Computing with Python & Arts",
      "Ideal bridge for Myanmar curriculum switchers & Pre-IGCSE candidates",
    ],
    highlightsMy: [
      "တစ်တန်းလျှင် ၆ လဖြင့် အချိန်တိုအတွင်း ထိရောက်မြန်ဆန်စွာ ပြီးမြောက်ခြင်း",
      "တနင်္လာမှ သောကြာ၊ နံနက် ၈:၃၀ မှ ညနေ ၄:၀၀ အထိ အချိန်ပြည့် လေ့ကျင့်မှု",
      "Essential Academics: အင်္ဂလိပ်စာ၊ သင်္ချာ၊ သိပ္ပံ၊ Python ကွန်ပျူတာနှင့် အနုပညာ",
      "မြန်မာသင်ရိုးမှ IGCSE သို့ ကူးပြောင်းလိုသူများအတွက် အထူးသင့်တော်ခြင်း",
    ],
    curriculum: "British Curriculum & Checkpoint",
    duration: "6 Months per Level (Full-Day Intensive)",
    campus: "both",
    studyMode: "Full-Time Intensive (Mon–Fri 8:30 AM – 4:00 PM)",
    programLevel: "lower_secondary",
    imageUrl: "/images/g4.jpg",
    sortOrder: 1,
    subjectIds: ["ls-math", "ls-science", "ls-english", "ls-computing", "ls-global", "s-arts-3d"],
  },
  {
    id: "lower-secondary",
    nameEn: "Pearson Edexcel Lower Secondary (1-Year Program)",
    nameMy: "Pearson Edexcel Lower Secondary (၁ နှစ် အတန်းများ)",
    badgeEn: "Year 6 – Year 9 (1-Year Continuum)",
    badgeMy: "Year 6 – Year 9 (၁ နှစ် အတန်းများ)",
    ageRangeEn: "Ages 11 – 14",
    ageRangeMy: "အသက် ၁၁ – ၁၄ နှစ်",
    summaryEn:
      "Full-year British curriculum continuum running June to March (3 Terms) with strict class caps of 10–12 students for maximum individual attention, including Myanmar literature in Years 6 & 7.",
    summaryMy:
      "ဇွန်လမှ မတ်လအထိ (Term ၃ ခုဖြင့်) ကျောင်းသား ၁၀-၁၂ ဦးသာ သတ်မှတ်၍ အနီးကပ် သင်ကြားပေးသော ၁ နှစ် အတန်းများဖြစ်ပြီး Year 6 နှင့် 7 တွင် မြန်မာစာပါ ထည့်သွင်းသင်ကြားပါသည်။",
    descriptionEn:
      "Following the Pearson Edexcel Lower Secondary framework across Term I (June–Sep), Term II (Oct–Dec), and Term III (Jan–Mar). Students develop deep scientific inquiry, mathematical rigor, computing mastery, and global perspectives in an intimate learning cohort.",
    descriptionMy:
      "Term ၃ ခု (June-Sep, Oct-Dec, Jan-Mar) ဖြင့် စနစ်တကျ သင်ကြားပြီး Term အလိုက် ကျောင်းပြောင်းလာတက်နိုင်ပါသည်။ English, Maths, Science, Computing, Global Citizenship, PE, Music, Arts တို့ကို အချိုးကျ ထည့်သွင်းသင်ကြားပါသည်။",
    highlightsEn: [
      "Strict small class limit: 10–12 students per classroom",
      "Structured 3-Term Academic Year (June – March) with April exams",
      "Integrated Myanmar literature for Years 6 & 7",
      "Smooth progression into Pearson Edexcel International GCSE",
    ],
    highlightsMy: [
      "တစ်တန်းလျှင် ကျောင်းသား ၁၀-၁၂ ဦးသာ ကန့်သတ်ထားရှိခြင်း",
      "၃ Term စနစ် (June - March) ဖြင့် စနစ်တကျ သင်ကြားပေးခြင်း",
      "Year 6 နှင့် 7 တွင် မြန်မာစာဘာသာရပ် ထည့်သွင်းသင်ကြားခြင်း",
      "Pearson Edexcel IGCSE သို့ ချောမွေ့စွာ ဆက်လက်တက်လှမ်းနိုင်ခြင်း",
    ],
    curriculum: "Pearson Edexcel",
    duration: "1 Academic Year (June – March, 3 Terms)",
    campus: "both",
    studyMode: "Full-Time On-Campus (Mon–Fri)",
    programLevel: "lower_secondary",
    imageUrl: "/images/g8.jpg",
    sortOrder: 2,
    subjectIds: ["ls-math", "ls-science", "ls-english", "ls-computing", "ls-global", "s-arts-3d"],
  },
  {
    id: "pearson-igcse",
    nameEn: "Pearson Edexcel International GCSE (Class L — 18 Months)",
    nameMy: "Pearson Edexcel International GCSE (Class L — ၁၈ လအတန်း)",
    badgeEn: "18-Month Regular Intake (Class L)",
    badgeMy: "၁၈ လပုံမှန်အတန်း (Class L)",
    ageRangeEn: "Ages 14 – 16",
    ageRangeMy: "အသက် ၁၄ – ၁၆ နှစ်",
    summaryEn:
      "Our premier 18-month Pearson Edexcel IGCSE pathway with Nov 2026 intake targeting the May/June 2028 exams, featuring complimentary weekend FOC Study Guides, in-class past paper drills, detailed diagnostic feedback, and newly added subjects.",
    summaryMy:
      "May/June 2028 စာမေးပွဲအတွက် ၁၈ လကြာ သင်ယူရမည့် ပုံမှန်အတန်းဖြစ်ပြီး FOC Study Guide များ၊ အခန်းတိုင်း Past Paper လေ့ကျင့်မှုများနှင့် အသစ်ထည့်သွင်းထားသော ဘာသာရပ်များ ပါဝင်ပါသည်။",
    descriptionEn:
      "At Hinthar, IGCSE is taught as a strategic game: chapter-by-chapter past papers are solved in class, diagnostic test feedback identifies individual strengths, and weekend study guides ensure no scholar needs external private tuition.",
    descriptionMy:
      "Chapter/Unit တစ်ခုစီ ပြီးဆုံးတိုင်း အတန်းထဲမှာပဲ Past Paper လေ့ကျင့်မှုများ ထည့်သွင်းသင်ကြားပြီး အခမဲ့ FOC Study Guide အတန်းများဖြင့် လိုအပ်ချက်များကို ဖြည့်ဆည်းပေးသဖြင့် ပြင်ပ Guide သီးသန့် ငှားရန် မလိုပါ။",
    highlightsEn: [
      "18 Months thorough syllabus mastery (Nov 2026 – May 2028 Exam)",
      "Complimentary FOC Weekend Study Guides — Zero external tuition needed",
      "In-class past paper integration after every chapter/unit",
      "Newly added: Environmental Management, Travel & Tourism, Sociology",
    ],
    highlightsMy: [
      "၁၈ လတာ စနစ်တကျ သင်ယူမှု (Nov 2026 – May 2028 Exam)",
      "အခမဲ့ FOC Study Guide အတန်းများ (ပြင်ပ Guide လုံးဝမလို)",
      "အခန်းတိုင်း အတန်းတွင်း Past Paper လေ့ကျင့်သင်ကြားမှု",
      "ဘာသာရပ်အသစ်များ: Environmental Management, Travel & Tourism, Sociology",
    ],
    curriculum: "Pearson Edexcel",
    duration: "18 Months (Nov 2026 – May 2028)",
    campus: "both",
    studyMode: "Full-Time On-Campus + FOC Weekend Study Guides",
    programLevel: "igcse",
    imageUrl: "/images/engineering.avif",
    sortOrder: 3,
    subjectIds: [
      "s-pure-math",
      "s-math-b",
      "s-physics",
      "s-chemistry",
      "s-biology",
      "s-human-biology",
      "s-cs",
      "s-it",
      "s-econ",
      "s-acc",
      "s-business",
      "s-english",
      "s-env-mgmt",
      "s-travel-tourism",
      "s-sociology",
      "s-arts-3d",
    ],
  },
  {
    id: "igcse-weekend-2yr",
    nameEn: "IGCSE / O-Level 2-Year Weekend Course (3 Subjects / Year)",
    nameMy: "IGCSE / O-Level ၂ နှစ်သင်တန်း (Weekends အတန်း)",
    badgeEn: "2-Year Weekend Pathway",
    badgeMy: "၂ နှစ်သင်တန်း (Weekends အတန်း)",
    ageRangeEn: "Ages 14 – 18",
    ageRangeMy: "အသက် ၁၄ – ၁၈ နှစ်",
    summaryEn:
      "A budget-friendly and focused alternative taking only 3 subjects per year over 2 years (Saturdays & Sundays), ideal for students attending Myanmar curriculum simultaneously or wishing to master subjects with deep focus.",
    summaryMy:
      "တစ်နှစ် ၃ ဘာသာနှုန်းဖြင့် ၂ နှစ်အတွင်း ၆ ဘာသာ ဖြေဆိုရမည့် ဘတ်ဂျက်သက်သာသော စနေ၊ တနင်္ဂနွေ အတန်းဖြစ်ပြီး မြန်မာသင်ရိုးတက်နေသူများအတွက် အထူးသင့်တော်ပါသည်။",
    descriptionEn:
      "Designed for students balancing dual curricula or seeking reduced financial load. Taking 3 subjects per year allows deep, concentrated study on weekends paired with structured self-study routines at home.",
    descriptionMy:
      "ဘတ်ဂျက်အရလည်း သက်သာပြီး တစ်ကြိမ်လျှင် ဘာသာရပ် ၃ ခုကိုသာ အာရုံစိုက်နိုင်သဖြင့် မြန်မာသင်ရိုးတက်နေရင်း O-Level ကိုပါ တစ်ချိန်တည်း လုပ်လိုသူများနှင့် စာကြိုးစားလိုသော ကျောင်းသားများအတွက် အဆင်ပြေစေပါသည်။",
    highlightsEn: [
      "Budget-friendly payment structure & manageable academic workload",
      "Weekend Schedule: Saturdays & Sundays on-campus sessions",
      "Focus on 3 subjects per year for high-grade achievement",
      "Perfect for dual-track students attending Myanmar state curriculum",
    ],
    highlightsMy: [
      "ဘတ်ဂျက်သက်သာပြီး စာဖိအားကို မျှတစွာ ခွဲဝေနိုင်ခြင်း",
      "စနေနှင့် တနင်္ဂနွေ ၂ ရက်သာ ကျောင်းတက်ရမည့် အစီအစဉ်",
      "တစ်နှစ်လျှင် ၃ ဘာသာသာ ဖြေဆိုရသဖြင့် အဆင့်မြင့်အမှတ်များ ရရှိနိုင်ခြင်း",
      "မြန်မာသင်ရိုးတက်နေရင်း IGCSE နိုင်ငံတကာအောင်လက်မှတ် ရယူနိုင်ခြင်း",
    ],
    curriculum: "Pearson Edexcel",
    duration: "2 Academic Years (3 Subjects / Year)",
    campus: "both",
    studyMode: "Weekend On-Campus (Sat–Sun) + Guided Self-Study",
    programLevel: "igcse",
    imageUrl: "/images/business.jpg",
    sortOrder: 4,
    subjectIds: [
      "s-pure-math",
      "s-physics",
      "s-chemistry",
      "s-biology",
      "s-it",
      "s-econ",
      "s-business",
      "s-english",
    ],
  },
  {
    id: "pearson-ial",
    nameEn: "Pearson Edexcel International A-Level (Class H)",
    nameMy: "Pearson Edexcel International A-Level (Class H — A-Level အတန်း)",
    badgeEn: "January 2027 Intake (Class H)",
    badgeMy: "Class H (ဇန်နဝါရီ ၂၀၂၇ အတန်း)",
    ageRangeEn: "Ages 16 – 19+",
    ageRangeMy: "အသက် ၁၆ – ၁၉ နှစ်အထက်",
    summaryEn:
      "Modular pre-university gold standard qualification unlocking direct entry to MIT, UC Berkeley, KIT & DIT Germany, Shizuoka University Japan (100% Scholarship), and Tongji University MBBS.",
    summaryMy:
      "MIT၊ UC Berkeley၊ KIT/DIT Germany၊ Shizuoka (100% Scholar) နှင့် Tongji (MBBS) တို့သို့ တိုက်ရိုက်ဝင်ခွင့် ရရှိထားသော နိုင်ငံတကာ ထိပ်တန်း တက္ကသိုလ်ဝင်ခွင့် အတန်းဖြစ်ပါသည်။",
    descriptionEn:
      "Pearson Edexcel IAL offers flexible modular assessment across AS and A2 units. Scholars can complete in 10 months (accelerated track), 16 months (standard 3-subject track), or 20–24 months (4-subject / medical track), with proven alumni placed at the world's most prestigious institutions.",
    descriptionMy:
      "ကျောင်းသားပေါ် မူတည်၍ ၁၀ လဖြင့် ၃-၄ ဘာသာပြီးစီးသူများ၊ ၁၆ လဖြင့် ၃ ဘာသာ ပြီးစီးသူများနှင့် ဆေးတက္ကသိုလ်အတွက် ၂၀-၂၄ လဖြင့် ၄ ဘာသာ ပြီးစီးသူများအထိ စနစ်တကျ သင်ကြားပေးပါသည်။ Hinthar မှ Pearson Edexcel A-Level ဖြေဆိုပြီး MIT, UC Berkeley, KIT/DIT Germany, Shizuoka Uni (100% Scholarship), Tongji Uni (MBBS) တို့တွင် တက်ရောက်နေကြပါပြီ။",
    highlightsEn: [
      "Fast-track 10-month, standard 16-month, and 24-month medical options",
      "Proven placements: MIT, UC Berkeley, KIT/DIT Germany, Shizuoka (100% Scholar), Tongji (MBBS)",
      "Individual UCAS, Common App & international scholarship mentorship",
      "World Highest Mark achievement mentorship (A-Level IT World #1)",
    ],
    highlightsMy: [
      "၁၀ လ အထူးအရှိန်မြှင့်သင်တန်း၊ ၁၆ လ ပုံမှန်တန်းနှင့် ဆေးကျောင်းအတွက် ၂၄ လ အတန်းများ",
      "MIT, UC Berkeley, KIT Germany, Shizuoka (100% Scholar), Tongji (MBBS) ဝင်ခွင့်မှတ်တမ်းများ",
      "တက္ကသိုလ်ဝင်ခွင့်နှင့် နိုင်ငံတကာ ပညာသင်ဆု လျှောက်ထားမှု တစ်ဦးချင်း လမ်းညွှန်ချက်",
      "A-Level IT ကမ္ဘာ့အမြင့်ဆုံးအမှတ် (World Highest Mark) ရရှိခဲ့သော စနစ်ကျသည့် သင်ကြားမှု",
    ],
    curriculum: "Pearson Edexcel",
    duration: "10 – 16 Months (Fast-Track) / 20 – 24 Months (Medical/4-Subjects)",
    campus: "both",
    studyMode: "Full-Time On-Campus (Mon–Fri)",
    programLevel: "ial",
    imageUrl: "/images/graduation.webp",
    sortOrder: 5,
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
