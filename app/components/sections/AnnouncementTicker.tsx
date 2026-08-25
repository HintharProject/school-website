import { DEFAULT_ANNOUNCEMENTS } from "@/lib/content/defaults";

export default function AnnouncementTicker({
  messages = DEFAULT_ANNOUNCEMENTS,
}: {
  messages?: string[];
}) {
  return (
    <section
      aria-label="School announcements"
      className="relative z-20 w-full bg-[#040E1E] text-white py-3 overflow-hidden flex items-center border-y border-[#FFC700]/20"
    >
      <div className="shrink-0 flex items-center gap-2 pl-6 pr-4 py-0.5 z-30 bg-[#040E1E]">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFC700] text-[#09234B] text-[10px] font-black uppercase tracking-wider shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#09234B] animate-ping" />
          Announcement
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...messages, ...messages].map((msg, idx) => (
            <span key={idx} className="inline-flex items-center mx-8 text-xs font-semibold text-slate-200">
              <span>{msg}</span>
              <span className="text-[#FFC700] ml-8 font-bold">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
