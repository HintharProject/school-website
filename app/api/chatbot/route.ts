import { NextResponse } from "next/server";

interface ChatRequest {
  message: string;
}

const STATIC_RESPONSES = [
  {
    triggers: ["campus", "campuses", "location", "address", "where", "yangon", "mawlamyine", "branch", "ywarma", "shwe padauk", "shwe pone nyet"],
    reply: "Hinthar International School operates across 4 modern campuses:\n\n1. 🏛️ **Ywarma Campus (Yangon)**: Flagship Academic Center & Pearson Exam Hall in Hlaing Township (+95 9 894 332200).\n2. 🔬 **Shwe Padauk Campus (Yangon)**: Senior STEM, AI & Robotics Innovation Center.\n3. 🎨 **Shwe Pone Nyet Campus (Yangon)**: Lower Secondary (Year 7–9) & Creative Arts Hub.\n4. 🌟 **Mawlamyine Campus (Mon State)**: Regional Center of Academic Excellence on Strand Road.\n\nAll campuses feature British Council certified science & computing labs.",
    link: { href: "/campuses", label: "Explore All 4 Campuses & Facilities" },
    suggestions: ["How do I apply for admission?", "What is the Pearson IGCSE curriculum?", "What student clubs exist?"],
  },
  {
    triggers: ["curriculum", "pearson", "edexcel", "igcse", "ial", "a level", "alevel", "o level", "subject", "lower secondary", "year 7", "year 10", "year 12"],
    reply: "Hinthar offers a seamless Pearson Edexcel continuum:\n\n• **Lower Secondary (Year 7–9 / Ages 11–14)**: Foundation STEM, pre-IGCSE analytical reasoning, English literacy.\n• **Pearson Edexcel IGCSE (Year 10–11 / Ages 14–16)**: Pure Math, Physics, Chemistry, Biology, Computer Science, Economics, Business.\n• **Pearson Edexcel IAL (Year 12–13 / Ages 16–18)**: Modular gold-standard qualifications for direct university entry worldwide.",
    link: { href: "/classes", label: "View Class Syllabi & Timetables" },
    suggestions: ["How do I apply for 2026?", "Where are your 4 campuses?", "Tell me about alumni university destinations"],
  },
  {
    triggers: ["apply", "admission", "enrol", "register", "application", "fee", "cost", "scholarship", "entrance"],
    reply: "Admissions for the 2026–2027 academic year are open! Our application process is fast and transparent:\n\n1. Complete the 4-step online form on our website.\n2. Receive your unique Student Reference ID (HIS-2026-XXXX).\n3. Schedule a diagnostic assessment & parent consultation at your preferred campus.",
    link: { href: "/admission", label: "Start Online Application Form" },
    suggestions: ["Where are your 4 campuses?", "What subjects are taught in IGCSE?", "What student clubs are available?"],
  },
  {
    triggers: ["club", "activity", "robotics", "debate", "mun", "sport", "badminton", "art", "extracurricular"],
    reply: "Hinthar offers diverse student societies that nurture leadership and technical mastery:\n\n• 🤖 **Robotics, IoT & AI Club** (Arduino, ESP32, Computer Vision)\n• 🏛️ **Model United Nations (MUN) & Debate Society**\n• 🔬 **Newton Science Discovery Society**\n• 🎨 **Digital Arts & Yearbook Guild**\n• 🏸 **Badminton & Athletic Society**",
    link: { href: "/clubs", label: "Discover Student Clubs" },
    suggestions: ["How do I apply?", "Tell me about your 4 campuses", "Where do graduates go for university?"],
  },
  {
    triggers: ["alumni", "yearbook", "graduate", "university", "destination", "imperial", "nus", "melbourne"],
    reply: "Our graduates have earned top Pearson World Distinction medals and received acceptances to prestigious universities globally, including:\n\n• **Imperial College London** (Aeronautical Engineering)\n• **National University of Singapore (NUS)** (Computer Science)\n• **University of Melbourne** (Biomedical Science)\n• **University of Manchester** (Economics & Finance)\n• **King's College London** & **University of Edinburgh**",
    link: { href: "/yearbook", label: "View Alumni Yearbook Gallery" },
    suggestions: ["How do I apply for admission?", "Tell me about Pearson IAL", "Where are your campuses located?"],
  },
];

export async function POST(req: Request) {
  try {
    const body: Partial<ChatRequest> = await req.json();
    if (typeof body.message !== "string") {
      return NextResponse.json({ error: "Invalid message payload format" }, { status: 400 });
    }

    if (body.message.length > 2000) {
      return NextResponse.json({ error: "Message exceeds allowable character length" }, { status: 400 });
    }

    const query = body.message.slice(0, 500).toLowerCase().trim();

    if (!query) {
      return NextResponse.json({
        reply: "Mingalarpar! I am the Hinthar AI Consultation Assistant. Ask me anything regarding our Pearson Edexcel curriculums, 4 campuses across Yangon & Mawlamyine, or student admissions.",
        suggestions: ["Pearson Edexcel Tracks", "Our 4 School Campuses", "How to Apply for 2026", "Extracurricular Clubs"],
      });
    }

    for (const item of STATIC_RESPONSES) {
      if (item.triggers.some((t) => query.includes(t))) {
        return NextResponse.json({
          reply: item.reply,
          link: item.link,
          suggestions: item.suggestions,
        });
      }
    }

    return NextResponse.json({
      reply: "Thank you for reaching out! Hinthar International School provides world-standard Pearson Edexcel education across 4 campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine. You can speak with our admissions counselors at +95 9 894 332200 or submit an application online.",
      link: { href: "/admission", label: "Go to Admissions Portal" },
      suggestions: ["Explore Our 4 Campuses", "Pearson Edexcel Syllabi", "View Alumni Yearbook", "Student Clubs"],
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process chat query" },
      { status: 400 }
    );
  }
}

