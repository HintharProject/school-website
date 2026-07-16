"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  time: string;
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const initialMessages: Message[] = [
  {
    id: 0,
    role: "ai",
    text: "Hello! I'm the Hinthar AI assistant. How can I help you today?",
    time: "Just now",
  },
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: msg,
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mock AI reply after 1 second
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: `Thank you for your message! Our team will get back to you shortly regarding "${msg}".`,
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <>
      {/* ── Chat Window ─────────────────────────────────────────── */}
      <div
        id="chat-window"
        className={`fixed bottom-28 right-8 z-[120] w-[calc(100%-4rem)] sm:w-96 max-h-[500px] h-[70vh] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isOpen ? "visible-chat" : "hidden-chat"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="bg-primary-container p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div>
              <h4
                className="text-sm font-bold tracking-wider"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Hinthar AI Assistant
              </h4>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[10px] opacity-80 uppercase tracking-tighter">
                  Online
                </span>
              </div>
            </div>
          </div>
          <button
            id="chat-close"
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages */}
        <div
          id="chat-messages"
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low"
        >
          {messages.map((msg) =>
            msg.role === "ai" ? (
              <div key={msg.id} className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm">
                    smart_toy
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant">
                  <p className="text-sm text-on-surface">{msg.text}</p>
                  <span className="text-[10px] text-on-surface-variant opacity-60 mt-1 block">
                    {msg.time}
                  </span>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse"
              >
                <div className="bg-primary-container p-3 rounded-2xl rounded-tr-none shadow-sm text-white">
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-[10px] opacity-60 mt-1 block text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-surface border-t border-outline-variant shrink-0">
          <form id="chat-form" className="flex gap-2" onSubmit={handleSubmit}>
            <input
              className="flex-1 bg-surface-container-high border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-container focus:outline-none"
              placeholder="Type your message..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary-container text-white p-2 rounded-lg hover:bg-primary transition-colors flex items-center justify-center"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── FAB Button ──────────────────────────────────────────── */}
      <button
        id="chat-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-8 right-8 z-[120] bg-primary-container text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all overflow-hidden"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <span className="material-symbols-outlined text-3xl" id="chat-fab-icon">
          {isOpen ? "close" : "chat"}
        </span>
      </button>
    </>
  );
}
