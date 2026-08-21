"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

const KNOWLEDGE_BASE: { keywords: string[]; reply: string; link?: { href: string; label: string } }[] = [
  {
    keywords: ["curriculum", "pearson", "edexcel", "igcse", "ial", "a level", "o level", "level", "program", "course", "subject"],
    reply: "Hinthar offers the Pearson Edexcel continuum from Year 7 to Year 13: Lower Secondary Education (Year 7–9 / Ages 11–14), Pearson Edexcel IGCSE (Year 10–11 / Ages 14–16), and Pearson Edexcel International Advanced Level (IAL / A-Level, Year 12–13 / Ages 16–18). Specializations include Pure STEM, Computing & IT, and Business & Economics.",
    link: { href: "/classes", label: "View Class Syllabi & Timetables" },
  },
  {
    keywords: ["admission", "apply", "enrol", "register", "application", "fee", "cost", "price", "tuition", "requirement"],
    reply: "Admissions for the 2026–2027 academic year are open! You can submit an online application through our 4-step wizard. Our admissions office will arrange a student placement diagnostic assessment and campus tour within 24–48 hours.",
    link: { href: "/admission", label: "Start Online Application" },
  },
  {
    keywords: ["location", "address", "where", "campus", "hlaing", "yangon", "phone", "contact", "email", "office", "call"],
    reply: "📍 **Campus Location**: No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar (11051).\n📞 **Phone**: +95 9 894 332200 / +95 9 894 332211\n✉️ **Email**: admissions@hinthar.education\n🕒 **Office Hours**: Mon–Sat, 08:30 AM – 05:00 PM.",
    link: { href: "/#contact", label: "View Contact Details" },
  },
  {
    keywords: ["principal", "founder", "dr kaung", "teacher", "faculty", "staff", "leadership"],
    reply: "Hinthar International School is led by Principal Dr. Kaung Myat Htut alongside seasoned UK-certified Pearson Edexcel subject coordinators and British Council accredited examiners.",
    link: { href: "/#about", label: "Read Leadership Message" },
  },
  {
    keywords: ["club", "activity", "sport", "robotics", "debate", "event", "mun", "extracurricular"],
    reply: "We offer diverse extracurricular societies including the Robotics & AI Club, Model United Nations & Debate Society, Newton Science Society, Badminton & Sports Club, and Performing Arts Ensemble.",
    link: { href: "/clubs", label: "Explore Student Clubs" },
  },
  {
    keywords: ["alumni", "yearbook", "graduate", "university", "destination", "scholarship"],
    reply: "Our graduates have earned top Pearson World Distinction medals and received acceptances to prestigious universities worldwide, including Imperial College London, NUS Singapore, University of Melbourne, and University of Manchester.",
    link: { href: "/yearbook", label: "Browse Alumni & Yearbook" },
  },
];

const initialMessages: Message[] = [
  {
    id: 0,
    role: "ai",
    text: "Mingalarpar! Welcome to Hinthar International School. I am your AI Admissions Assistant. How can I assist you with our Pearson Edexcel curriculums, campus admissions, or class schedules today?",
    time: "Just now",
  },
];

const quickChips = [
  "Our 4 Campuses",
  "Pearson Edexcel Tracks",
  "How to Apply for 2026",
  "Extracurricular Clubs",
  "Alumni University Placements",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const msg = textToSend.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: msg,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "ai",
          text: data.reply,
          time: getTime(),
          link: data.link,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback below
    }

    // Fallback static reply
    const q = msg.toLowerCase();
    let reply = "Thank you for inquiring! Hinthar International School operates across 4 campuses in Yangon (Ywarma, Shwe Padauk, Shwe Pone Nyet) and Mawlamyine. For direct counseling, call +95 9 894 332200.";
    let link: { href: string; label: string } | undefined = { href: "/admission", label: "Go to Admissions" };

    for (const kb of KNOWLEDGE_BASE) {
      if (kb.keywords.some((k) => q.includes(k))) {
        reply = kb.reply;
        link = kb.link;
        break;
      }
    }

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "ai",
      text: reply,
      time: getTime(),
      link,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <>
      <div
        id="chat-window"
        className={`fixed bottom-24 right-4 sm:right-8 z-[120] w-[calc(100%-2rem)] sm:w-[380px] max-h-[580px] h-[75vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none translate-y-6"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="bg-[#09234B] text-white p-4 flex justify-between items-center shrink-0 border-b border-[#FFC700]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFC700] text-[#09234B] flex items-center justify-center font-black shadow-sm">
              <span className="material-symbols-outlined text-xl font-bold">school</span>
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight">Hinthar AI Counselor</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-[#FFC700] uppercase tracking-wider font-bold">
                  Pearson Curriculum Advisor
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-1.5 rounded-full transition-colors text-white/80 hover:text-white"
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-xs">
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <div key={msg.id} className="flex gap-2.5 max-w-[88%] items-start">
                <div className="w-7 h-7 rounded-lg bg-[#E8F0FE] text-[#0E3B7D] flex items-center justify-center shrink-0 mt-0.5 border border-[#0E3B7D]/20">
                  <span className="material-symbols-outlined text-sm font-bold">smart_toy</span>
                </div>
                <div className="space-y-1.5">
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 text-slate-800 leading-relaxed">
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.link && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <Link
                          href={msg.link.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0E3B7D] hover:underline"
                        >
                          <span>{msg.link.label}</span>
                          <span className="material-symbols-outlined text-xs font-bold">arrow_forward</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 block pl-1">{msg.time}</span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex gap-2 max-w-[85%] ml-auto flex-col items-end">
                <div className="bg-[#0E3B7D] text-white p-3 rounded-2xl rounded-tr-sm shadow-sm font-medium">
                  <p>{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-400 pr-1">{msg.time}</span>
              </div>
            )
          )}

          {isTyping && (
            <div className="flex gap-2 items-center text-slate-500 text-[11px] pl-2">
              <span className="material-symbols-outlined text-xs animate-spin text-[#0E3B7D]">refresh</span>
              <span>Hinthar Counselor is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:border-[#0E3B7D] hover:text-[#0E3B7D] transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about admissions, subjects, fees..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] px-3.5 py-2 rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center font-bold border border-[#FFC700]"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-base font-bold">send</span>
            </button>
          </form>
        </div>
      </div>

      <button
        id="chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[120] bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white ring-2 ring-[#0E3B7D]/30"
        aria-label={isOpen ? "Close chat" : "Open admissions chat"}
      >
        <span className="material-symbols-outlined text-2xl font-bold group-hover:rotate-12 transition-transform">
          {isOpen ? "close" : "forum"}
        </span>
      </button>
    </>
  );
}
