"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FooterSection from "../components/sections/FooterSection";

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  time: string;
  link?: { href: string; label: string };
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const FAQ_PROMPTS = [
  {
    category: "4 School Campuses",
    items: [
      "Tell me about your 4 campuses across Yangon & Mawlamyine.",
      "Where is the flagship Ywarma campus located?",
      "What facilities are available at Mawlamyine campus?",
    ],
  },
  {
    category: "Academic Continuum",
    items: [
      "What subjects are offered in Pearson Edexcel IGCSE?",
      "How does the Pearson IAL (A-Level) program work?",
      "Tell me about Lower Secondary (Year 7–9) education.",
    ],
  },
  {
    category: "Admissions & Life",
    items: [
      "How can I apply for the 2026–2027 intake?",
      "What student clubs and robotics societies exist?",
      "Where do your alumni go for university studies?",
    ],
  },
];

const KNOWLEDGE_RESPONSES: Record<string, { text: string; link?: { href: string; label: string } }> = {
  igcse: {
    text: "Pearson Edexcel International GCSEs (Ages 14–16) provide a rigorous UK-standard foundation. Subjects available at Hinthar include:\n• **Pure Mathematics & Further Pure Math**\n• **Physics, Chemistry, and Biology**\n• **Computer Science & Information Communication Technology (ICT)**\n• **Economics, Accounting, and Business Studies**\n• **English First & Second Language, Global Perspectives**",
    link: { href: "/classes", label: "Explore Detailed Course Timetables" },
  },
  ial: {
    text: "Pearson Edexcel International Advanced Levels (IAL / A-Levels, Ages 16–18) are gold-standard modular qualifications recognized by top universities across the UK, USA, Australia, and Singapore. Students typically take 3 to 4 subjects with comprehensive experimental laboratory practice in our dedicated Newton Science & Turing Computer Labs.",
    link: { href: "/admission", label: "Apply for Pearson IAL Track" },
  },
  lower_secondary: {
    text: "Our Lower Secondary (Year 7 – Year 9 / Ages 11–14) curriculum builds critical STEM thinking, pre-IGCSE Mathematics, scientific laboratory inquiry, English literacy, and global perspective research.",
    link: { href: "/classes", label: "View Lower Secondary Syllabi" },
  },
  apply: {
    text: "Admissions for 2026–2027 are open. The application process is simple:\n1. Fill out our online 4-step wizard.\n2. Receive your Application Reference ID (e.g. HIS-2026-XXXX).\n3. Attend a placement assessment and parent consultation at our Hlaing campus.",
    link: { href: "/admission", label: "Complete Online Application" },
  },
  location: {
    text: "📍 **Campus Location**: No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar (11051).\n📞 **Contact Numbers**: +95 9 894 332200 / +95 9 894 332211\n✉️ **Email**: admissions@hinthar.education\n🕒 **Office Hours**: Monday through Saturday, 08:30 AM – 05:00 PM.",
    link: { href: "/#contact", label: "View Campus Location" },
  },
  clubs: {
    text: "Hinthar offers vibrant student societies, including the Robotics, IoT & AI Club, Model United Nations (MUN) & Debate Society, Newton Science Discovery Society, Badminton & Sports Club, and Performing Arts Ensemble.",
    link: { href: "/clubs", label: "Discover Student Clubs" },
  },
  alumni: {
    text: "Our alumni have received admissions to world-renowned institutions, such as Imperial College London, National University of Singapore (NUS), University of Melbourne, and University of Manchester.",
    link: { href: "/yearbook", label: "View Yearbook & Placements" },
  },
};

export default function ChatbotPageView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Mingalarpar! I am the Hinthar AI Academic Counselor. Ask me anything about our Pearson Edexcel curriculums, application procedures, fees, or campus life.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: Message = {
          id: Date.now() + 1,
          role: "ai",
          text: data.reply,
          time: getTime(),
          link: data.link,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback
    }

    const lower = trimmed.toLowerCase();
    let matchedResponse: { text: string; link?: { href: string; label: string } } = {
      text: "Thank you for asking! Hinthar International School operates across 4 campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine. You can connect with our admissions counselors directly at +95 9 894 332200 or complete an application online.",
      link: { href: "/admission", label: "Start Online Application" },
    };

    if (lower.includes("campus") || lower.includes("mawlamyine") || lower.includes("ywarma") || lower.includes("shwe padauk") || lower.includes("shwe pone nyet")) {
      matchedResponse = {
        text: "Hinthar International School operates 4 modern campuses:\n• Ywarma Campus (Hlaing Township, Yangon)\n• Shwe Padauk Campus (STEM & Robotics Innovation Hub, Yangon)\n• Shwe Pone Nyet Campus (Lower Secondary & Arts Hub, Yangon)\n• Mawlamyine Campus (Strand Road, Mawlamyine)",
        link: { href: "/campuses", label: "View All 4 Campuses" },
      };
    } else if (lower.includes("igcse") || lower.includes("subject") || lower.includes("o level")) {
      matchedResponse = KNOWLEDGE_RESPONSES.igcse;
    } else if (lower.includes("ial") || lower.includes("a level") || lower.includes("a-level")) {
      matchedResponse = KNOWLEDGE_RESPONSES.ial;
    } else if (lower.includes("lower secondary") || lower.includes("secondary") || lower.includes("year 7") || lower.includes("year 8") || lower.includes("year 9") || lower.includes("middle")) {
      matchedResponse = KNOWLEDGE_RESPONSES.lower_secondary;
    } else if (lower.includes("apply") || lower.includes("admission") || lower.includes("fee") || lower.includes("cost") || lower.includes("intake")) {
      matchedResponse = KNOWLEDGE_RESPONSES.apply;
    } else if (lower.includes("location") || lower.includes("where") || lower.includes("address") || lower.includes("phone") || lower.includes("contact") || lower.includes("hour")) {
      matchedResponse = KNOWLEDGE_RESPONSES.location;
    } else if (lower.includes("club") || lower.includes("robotics") || lower.includes("debate") || lower.includes("sport") || lower.includes("activity")) {
      matchedResponse = KNOWLEDGE_RESPONSES.clubs;
    } else if (lower.includes("alumni") || lower.includes("university") || lower.includes("graduate") || lower.includes("yearbook")) {
      matchedResponse = KNOWLEDGE_RESPONSES.alumni;
    }

    const aiMessage: Message = {
      id: Date.now() + 1,
      role: "ai",
      text: matchedResponse.text,
      time: getTime(),
      link: matchedResponse.link,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen flex flex-col pt-20 bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-3 border border-[#0E3B7D]/20">
            <span className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">smart_toy</span>
            <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">
              AI Admissions Counselor
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#09234B] mb-2 tracking-tight">
            Academic &amp; Admissions <span className="text-[#0E3B7D]">Consultation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Instant 24/7 guidance on Pearson Edexcel curriculums, grade placements, tuition, and campus life.
          </p>
        </div>

        {/* Main Consultation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Sidebar: Quick Topics */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#09234B] font-bold text-sm">
                <span className="material-symbols-outlined text-[#FFC700] text-lg font-bold">help_outline</span>
                <span>Frequently Asked Topics</span>
              </div>

              <div className="space-y-4 text-xs">
                {FAQ_PROMPTS.map((group, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-black text-[11px] text-slate-500 uppercase tracking-wider">
                      {group.category}
                    </p>
                    <div className="space-y-1.5">
                      {group.items.map((q, j) => (
                        <button
                          key={j}
                          type="button"
                          onClick={() => handleSend(q)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-[#E8F0FE] text-slate-800 border border-slate-200 hover:border-[#0E3B7D]/40 transition-colors leading-relaxed"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Person Callout */}
            <div className="p-5 bg-gradient-to-br from-[#09234B] to-[#0E3B7D] rounded-3xl text-white shadow-md space-y-3">
              <h4 className="font-bold text-sm">Prefer an In-Person Campus Tour?</h4>
              <p className="text-xs text-slate-200 font-light leading-relaxed">
                Visit our campus at No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon to meet our faculty and tour our laboratories.
              </p>
              <Link
                href="/admission"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors"
              >
                <span>Book Campus Tour</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Right: Immersive Chat Stream */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-[#09234B] text-white flex items-center justify-between border-b border-[#FFC700]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFC700] text-[#09234B] flex items-center justify-center font-black">
                  <span className="material-symbols-outlined text-2xl font-bold">school</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold">Hinthar Interactive AI Counselor</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-[#FFC700] font-bold uppercase tracking-wider">
                      Connected &bull; Pearson Edexcel Knowledge Base
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50 text-xs">
              {messages.map((m) =>
                m.role === "ai" ? (
                  <div key={m.id} className="flex items-start gap-3 max-w-[90%]">
                    <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] text-[#0E3B7D] flex items-center justify-center shrink-0 mt-0.5 border border-[#0E3B7D]/20">
                      <span className="material-symbols-outlined text-base font-bold">smart_toy</span>
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 text-slate-800 leading-relaxed">
                        <p className="whitespace-pre-line">{m.text}</p>
                        {m.link && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <Link
                              href={m.link.href}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0E3B7D] hover:underline"
                            >
                              <span>{m.link.label}</span>
                              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                            </Link>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block pl-1">{m.time}</span>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col items-end max-w-[85%] ml-auto space-y-1">
                    <div className="bg-[#0E3B7D] text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm font-medium">
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 pr-1">{m.time}</span>
                  </div>
                )
              )}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
                  <span className="material-symbols-outlined text-sm animate-spin text-[#0E3B7D]">refresh</span>
                  <span>Hinthar Counselor is preparing your answer...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type any questions about Pearson IGCSE, IAL, fees, or school schedules..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] px-5 py-3 rounded-2xl transition-colors disabled:opacity-40 flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-sm border border-[#FFC700]"
                >
                  <span className="material-symbols-outlined text-lg font-bold">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
