import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail";

const SUMMARY_CARDS = [
  { value: "12", label: "Awaiting Receipt", sub: "3 high priority", color: "amber" },
  { value: "18", label: "Tests in Progress", sub: "11 dispatches", color: "neutral" },
  { value: "7", label: "Awaiting Verification", sub: "Ready for review", color: "amber" },
  { value: "2", label: "On Hold", sub: "Action required", color: "red" },
];

const ATTENTION_ITEMS = [
  {
    id: "MLK-2026-00124", type: "MILK",
    title: "Shree Krishna Dairy",
    desc: "Beta-lactam residue testing required.",
    status: "HIGH PRIORITY", statusColor: "amber",
    action: "Start Testing →",
    page: "dispatch-detail",
  },
  {
    id: "MEAT-2026-00087", type: "MEAT",
    title: "Green Valley Livestock",
    desc: "Withdrawal verification requires review.",
    status: "REVIEW REQUIRED", statusColor: "red",
    action: "View Dispatch →",
    page: "dispatches",
  },
  {
    id: "EGG-2026-00241", type: "EGGS",
    title: "Sunrise Poultry",
    desc: "Assessment is awaiting verification.",
    status: "ACTION REQUIRED", statusColor: "amber",
    action: "Review Results →",
    page: "dispatches",
  },
];

const ACTIVITY = [
  { text: "Result submitted for MLK-2026-00118", time: "10 min ago", icon: "check" },
  { text: "Sample LAB-00921 received and registered", time: "1 hour ago", icon: "inbox" },
  { text: "MEAT-2026-00072 placed on hold", time: "Yesterday", icon: "hold" },
  { text: "EGG-2026-00217 cleared for dispatch", time: "Yesterday", icon: "dispatch" },
];

function pill(color: string) {
  switch (color) {
    case "amber": return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    case "red":   return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "green": return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    default:      return "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]";
  }
}

function dot(color: string) {
  switch (color) {
    case "amber": return "bg-[#f59e0b]";
    case "red":   return "bg-[#ef4444]";
    default:      return "bg-[#d1d5db]";
  }
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-[#e4e0d8] flex items-center justify-between px-4 h-14 flex-shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-[#2d5a27] flex items-center justify-center">
            <LeafIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[14px] font-semibold text-[#1a2418]">
              PashuPramaan
            </span>
            <span className="block text-[9px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase leading-none">
              Laboratory
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full">
            <BellIcon className="w-5 h-5 text-[#6b7280]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f59e0b] border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#eef2ed] border border-[#c5d4c2] flex items-center justify-center">
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[11px] font-semibold text-[#2d5a27]">PS</span>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Greeting */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-[12px] text-[#9ca3af] font-medium mb-0.5">Good morning, Dr. Priya · Sat 23 Aug 2026</p>
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[24px] font-semibold text-[#1a2418] leading-tight">
            Laboratory Dashboard
          </h1>
          <p className="text-[13px] text-[#6b7280] mt-1">Monitor samples and verify livestock dispatches.</p>
        </div>

        {/* Summary cards — horizontal scroll */}
        <div className="px-4 mb-5">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {SUMMARY_CARDS.map((card, i) => (
              <div
                key={i}
                className="snap-start flex-shrink-0 w-36 bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span style={{ fontFamily: "var(--font-serif)" }} className="text-[30px] font-semibold text-[#1a2418] leading-none">
                    {card.value}
                  </span>
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot(card.color)}`} />
                </div>
                <p className="text-[12px] font-semibold text-[#1a2418] leading-tight mb-0.5">{card.label}</p>
                <p className="text-[11px] text-[#9ca3af]">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Your Attention */}
        <div className="px-4 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418]">
              Needs Your Attention
            </h2>
          </div>
          <div className="space-y-3">
            {ATTENTION_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold text-[#6b7280]">{item.id}</span>
                  <span className="text-[#e4e0d8]">·</span>
                  <span className="text-[10px] font-bold tracking-wider text-[#9ca3af]">{item.type}</span>
                </div>
                <p className="text-[14px] font-semibold text-[#1a2418] mb-1">{item.title}</p>
                <p className="text-[12.5px] text-[#6b7280] mb-3 leading-relaxed">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-[6px] ${pill(item.statusColor)}`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => onNavigate(item.page as Page)}
                    className="text-[12.5px] font-semibold text-[#2d5a27]"
                  >
                    {item.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 mb-4">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418] mb-3">
            Recent Activity
          </h2>
          <div className="bg-white border border-[#e4e0d8] rounded-[12px] divide-y divide-[#f3f1ec]">
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <ActivityIcon type={item.icon} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-[#1a2418] font-medium leading-snug">{item.text}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate as any} />
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, string> = {
    check: "bg-[#dcfce7] text-[#166534]",
    inbox: "bg-[#eff6ff] text-[#1e40af]",
    hold: "bg-[#fee2e2] text-[#991b1b]",
    dispatch: "bg-[#dcfce7] text-[#166534]",
  };
  return (
    <span className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${map[type] || "bg-[#f3f4f6]"}`}>
      {type === "check" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3" /></svg>}
      {type === "inbox" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="2" width="10" height="8" rx="1" /><path d="M1 7h3l1 2h2l1-2h3" /></svg>}
      {type === "hold" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="2" x2="6" y2="7" /><circle cx="6" cy="9.5" r="0.8" fill="currentColor" /></svg>}
      {type === "dispatch" && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h8M7 3.5l2.5 2.5L7 8.5" /></svg>}
    </span>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2C13 2 13 9 8 11C5 12.5 3 11 3 11" /><path d="M3 14C3 14 5 10 8 9" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3a5 5 0 0 1 5 5v3.5l1.5 2H3.5L5 11.5V8a5 5 0 0 1 5-5z" /><path d="M8.5 16a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
