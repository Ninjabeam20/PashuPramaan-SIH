import { useState } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail";

const PRODUCT_FILTERS = [
  { id: "all", label: "All" },
  { id: "milk", label: "Milk" },
  { id: "meat", label: "Meat" },
  { id: "eggs", label: "Eggs" },
];

const DISPATCHES = [
  {
    id: "MLK-2026-00124",
    date: "22 Aug · 10:30 AM",
    product: "Milk",
    productSub: "Raw milk",
    source: "Shree Krishna Dairy",
    sourceSub: "Animal: MP-104",
    sample: "LAB-MLK-00981",
    sampleStatus: "Received",
    sampleColor: "green",
    risk: "MODERATE",
    riskColor: "amber",
    status: "READY FOR TESTING",
    statusColor: "amber",
    action: "View →",
    clickable: true,
  },
  {
    id: "MEAT-2026-00087",
    date: "22 Aug · 08:45 AM",
    product: "Meat",
    productSub: "Batch M-42",
    source: "Green Valley Livestock",
    sourceSub: "Batch: M-42",
    sample: "LAB-MT-00472",
    sampleStatus: "Testing",
    sampleColor: "blue",
    risk: "HIGH",
    riskColor: "red",
    status: "IN PROGRESS",
    statusColor: "sage",
    action: "Continue →",
    clickable: false,
  },
  {
    id: "EGG-2026-00241",
    date: "21 Aug · 04:20 PM",
    product: "Eggs",
    productSub: "Flock dispatch",
    source: "Sunrise Poultry",
    sourceSub: "Flock: FLK-2026-042",
    sample: "LAB-EGG-01128",
    sampleStatus: "Complete",
    sampleColor: "green",
    risk: "LOW",
    riskColor: "green",
    status: "AWAITING VERIFICATION",
    statusColor: "amber",
    action: "Review →",
    clickable: false,
  },
  {
    id: "MLK-2026-00118",
    date: "21 Aug · 11:15 AM",
    product: "Milk",
    productSub: "Raw milk",
    source: "Mahalaxmi Dairy",
    sourceSub: "Animal: MP-087",
    sample: "LAB-MLK-00972",
    sampleStatus: "Complete",
    sampleColor: "green",
    risk: "LOW",
    riskColor: "green",
    status: "COMPLETED",
    statusColor: "green",
    action: "View Report →",
    clickable: false,
  },
  {
    id: "MEAT-2026-00072",
    date: "20 Aug · 02:00 PM",
    product: "Meat",
    productSub: "Batch M-18",
    source: "Raj Farms",
    sourceSub: "Batch: M-18",
    sample: "LAB-MT-00461",
    sampleStatus: "On Hold",
    sampleColor: "red",
    risk: "HIGH",
    riskColor: "red",
    status: "ON HOLD",
    statusColor: "red",
    action: "Review →",
    clickable: false,
  },
];

function pill(color: string) {
  switch (color) {
    case "amber": return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    case "red":   return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "green": return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    case "sage":  return "bg-[#eef2ed] text-[#2d5a27] border border-[#c5d4c2]";
    case "blue":  return "bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]";
    default:      return "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]";
  }
}

function dotColor(color: string) {
  switch (color) {
    case "green": return "bg-[#2d5a27]";
    case "amber": return "bg-[#f59e0b]";
    case "red":   return "bg-[#ef4444]";
    case "blue":  return "bg-[#3b82f6]";
    default:      return "bg-[#9ca3af]";
  }
}

export default function Dispatches({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [activeProduct, setActiveProduct] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = DISPATCHES.filter((d) => {
    const matchProduct = activeProduct === "all" || d.product.toLowerCase() === activeProduct;
    const matchSearch = !search || [d.id, d.source, d.sample].some((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );
    return matchProduct && matchSearch;
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-[#e4e0d8] flex items-center justify-between px-4 h-14 flex-shrink-0 z-30">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase leading-none">Laboratory Operations</p>
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418] leading-tight">
            Dispatches
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full">
            <BellIcon className="w-5 h-5 text-[#6b7280]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f59e0b] border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#eef2ed] border border-[#c5d4c2] flex items-center justify-center">
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[11px] font-semibold text-[#2d5a27]">PS</span>
          </div>
        </div>
      </header>

      {/* Sticky search + filters */}
      <div className="bg-[#faf9f6] sticky top-0 z-20 border-b border-[#f3f1ec] px-4 pt-3 pb-3 space-y-2.5">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dispatch ID, farm, sample…"
            className="w-full bg-white border border-[#e4e0d8] rounded-[10px] pl-9 pr-4 py-2.5 text-[13px] text-[#1a2418] placeholder:text-[#b0a99f] focus:outline-none focus:border-[#7a9e72]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {PRODUCT_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveProduct(id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                activeProduct === id
                  ? "bg-[#2d5a27] text-white"
                  : "bg-white border border-[#e4e0d8] text-[#6b7280]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex border-b border-[#f3f1ec] bg-white">
        {[
          { v: "48", l: "Total" },
          { v: "12", l: "Ready" },
          { v: "18", l: "In Progress" },
          { v: "4", l: "Attention" },
        ].map(({ v, l }) => (
          <div key={l} className="flex-1 py-3 text-center border-r border-[#f3f1ec] last:border-r-0">
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418] leading-none">{v}</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Dispatch cards */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[#9ca3af]">No dispatches found.</div>
        )}
        {filtered.map((d) => (
          <div
            key={d.id}
            onClick={() => d.clickable && onNavigate("dispatch-detail")}
            className={`bg-white border border-[#e4e0d8] rounded-[12px] p-4 ${d.clickable ? "cursor-pointer active:bg-[#faf9f6]" : ""}`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[13.5px] font-bold text-[#2d5a27]">{d.id}</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">{d.date}</p>
              </div>
              <span className={`text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] ${pill(d.statusColor)}`}>
                {d.status}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Product</p>
                <p className="text-[12.5px] font-medium text-[#1a2418]">{d.product}</p>
                <p className="text-[11px] text-[#9ca3af]">{d.productSub}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Source</p>
                <p className="text-[12.5px] font-medium text-[#1a2418]">{d.source}</p>
                <p className="text-[11px] text-[#9ca3af]">{d.sourceSub}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Sample</p>
                <p className="text-[12px] text-[#4b5563]">{d.sample}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor(d.sampleColor)}`} />
                  <span className="text-[11px] text-[#6b7280]">{d.sampleStatus}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Risk Level</p>
                <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-[5px] ${pill(d.riskColor)}`}>
                  {d.risk}
                </span>
              </div>
            </div>

            {/* Action row */}
            <div className="border-t border-[#f3f1ec] pt-3 flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); if (d.clickable) onNavigate("dispatch-detail"); }}
                className="text-[12.5px] font-semibold text-[#2d5a27]"
              >
                {d.action}
              </button>
            </div>
          </div>
        ))}
        <p className="text-center text-[12px] text-[#9ca3af] py-2">Showing 1–5 of 48 dispatches</p>
      </div>

      <BottomNav active="dispatches" onNavigate={onNavigate as any} />
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="6.5" r="4" /><line x1="9.5" y1="9.5" x2="13" y2="13" />
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
