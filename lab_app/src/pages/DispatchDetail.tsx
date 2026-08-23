import { useState } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail";

const STAGES = [
  { label: "Created", state: "done" },
  { label: "Received", state: "done" },
  { label: "Testing", state: "active" },
  { label: "Verification", state: "upcoming" },
  { label: "Assessment", state: "upcoming" },
];

const TESTS = [
  {
    num: "01",
    title: "Product Quality",
    checks: ["Fat", "SNF", "Acidity", "Adulteration screen"],
    status: "COMPLETED",
    statusColor: "green",
    action: "View Results →",
    active: false,
    badge: null,
  },
  {
    num: "02",
    title: "Microbiological Safety",
    checks: ["Standard plate count", "Coliform screening", "Pathogen screen"],
    status: "IN PROGRESS",
    statusColor: "amber",
    action: "Continue Testing →",
    active: true,
    badge: null,
  },
  {
    num: "03",
    title: "Antimicrobial Residue",
    checks: ["Beta-lactam screen", "Targeted residue analysis"],
    status: "PENDING",
    statusColor: "neutral",
    action: "Start Test →",
    active: false,
    badge: "Triggered by treatment history",
  },
];

const ASSESSMENT = [
  { label: "Traceability", status: "Complete", color: "green" },
  { label: "Withdrawal Check", status: "Passed", color: "green" },
  { label: "Product Quality", status: "Complete", color: "green" },
  { label: "Microbiological Safety", status: "In Progress", color: "amber" },
  { label: "Residue Testing", status: "Pending", color: "neutral" },
];

const ACTIVITY = [
  { time: "12:10 PM", title: "Microbiological testing started", desc: "Status updated to In Progress.", icon: "active" },
  { time: "11:20 AM", title: "Product quality testing completed", desc: "Results submitted by Dr. Priya Sharma.", icon: "done" },
  { time: "11:05 AM", title: "Sample received and registered", desc: "LAB-MLK-00981 linked to this dispatch.", icon: "done" },
  { time: "10:30 AM", title: "Dispatch created", desc: "Milk dispatch submitted from Shree Krishna Dairy.", icon: "neutral" },
];

function pill(color: string) {
  switch (color) {
    case "amber":   return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    case "red":     return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "green":   return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    case "neutral": return "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]";
    default:        return "bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]";
  }
}

function statusColor(color: string) {
  switch (color) {
    case "green":   return "text-[#2d5a27]";
    case "amber":   return "text-[#92400e]";
    default:        return "text-[#9ca3af]";
  }
}

export default function DispatchDetail({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (id: string) => setOpenSection(openSection === id ? null : id);

  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-white border-b border-[#e4e0d8] flex items-center gap-3 px-4 h-14 flex-shrink-0 z-30">
        <button
          onClick={() => onNavigate("dispatches")}
          className="w-8 h-8 flex items-center justify-center rounded-full -ml-1"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#4b5563]" />
        </button>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418] leading-tight truncate">
            MLK-2026-00124
          </p>
          <p className="text-[10px] text-[#9ca3af] leading-none">Milk Dispatch · Shree Krishna Dairy</p>
        </div>
        <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] flex-shrink-0">
          IN PROGRESS
        </span>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">

        {/* Hero card */}
        <div className="mx-4 mt-4 bg-white border border-[#e4e0d8] rounded-[12px] p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase mb-1">Dispatch Assessment</p>
              <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[22px] font-semibold text-[#1a2418]">
                MLK-2026-00124
              </h1>
              <p className="text-[12px] text-[#6b7280] mt-0.5">22 Aug 2026 · 10:30 AM</p>
            </div>
            <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[8px] px-3 py-2 text-right">
              <p className="text-[9px] font-bold tracking-wider text-[#92400e] uppercase">Risk</p>
              <p className="text-[14px] font-bold text-[#92400e]">MODERATE</p>
            </div>
          </div>

          {/* Workflow stages */}
          <div className="flex items-center gap-0 overflow-x-auto pb-1 -mx-1 px-1">
            {STAGES.map((stage, i) => (
              <div key={stage.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 52 }}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 ${
                    stage.state === "done"   ? "bg-[#2d5a27] border-[#2d5a27]"
                    : stage.state === "active" ? "bg-white border-[#2d5a27]"
                    : "bg-white border-[#d1d5db]"
                  }`}>
                    {stage.state === "done"   && <CheckIcon className="w-3 h-3 text-white" />}
                    {stage.state === "active" && <span className="w-2 h-2 rounded-full bg-[#2d5a27]" />}
                    {stage.state === "upcoming" && <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db]" />}
                  </div>
                  <p className={`text-[9px] font-medium text-center leading-tight ${
                    stage.state === "done" ? "text-[#2d5a27]"
                    : stage.state === "active" ? "text-[#1a2418] font-semibold"
                    : "text-[#9ca3af]"
                  }`}>{stage.label}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`flex-1 h-px mx-0.5 mb-3.5 ${stage.state === "done" ? "bg-[#2d5a27]" : "bg-[#e4e0d8]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch Overview */}
        <div className="mx-4 mt-3 bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden">
          <button onClick={() => toggle("overview")} className="w-full flex items-center justify-between px-4 py-3.5">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418]">Dispatch Overview</h2>
            <ChevronIcon className={`w-4 h-4 text-[#9ca3af] transition-transform ${openSection === "overview" ? "rotate-180" : ""}`} />
          </button>
          {openSection === "overview" && (
            <div className="border-t border-[#f3f1ec] px-4 py-4 grid grid-cols-2 gap-x-4 gap-y-3.5">
              {[
                { l: "Product", v: "Raw Milk" },
                { l: "Quantity", v: "850 L" },
                { l: "Source Farm", v: "Shree Krishna Dairy" },
                { l: "Linked Animal", v: "MP-104" },
                { l: "Dispatch Date", v: "22 Aug 2026" },
                { l: "Dispatch Time", v: "10:30 AM" },
                { l: "Dispatch ID", v: "MLK-2026-00124", green: true },
                { l: "Sample ID", v: "LAB-MLK-00981", green: true },
              ].map(({ l, v, green }) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                  <p className={`text-[12.5px] font-medium ${green ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Antimicrobial Traceability */}
        <div className="mx-4 mt-3 bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden border-l-4 border-l-[#2d5a27]">
          <button onClick={() => toggle("amr")} className="w-full flex items-center justify-between px-4 py-3.5">
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418] text-left">
                Antimicrobial Traceability
              </h2>
              <p className="text-[11px] text-[#6b7280] text-left">Treatment history for MP-104</p>
            </div>
            <ChevronIcon className={`w-4 h-4 text-[#9ca3af] flex-shrink-0 transition-transform ${openSection === "amr" ? "rotate-180" : ""}`} />
          </button>
          {openSection === "amr" && (
            <div className="border-t border-[#f3f1ec] px-4 py-4">
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Animal</p>
                  <p className="text-[12.5px] font-semibold text-[#1a2418]">MP-104 · Holstein Cow</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Condition</p>
                  <p className="text-[12.5px] font-medium text-[#1a2418]">Clinical Mastitis</p>
                </div>
              </div>
              {/* Treatment */}
              <div className="bg-[#faf9f6] border border-[#e4e0d8] rounded-[10px] p-3 mb-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[13px] font-semibold text-[#1a2418]">Amoxicillin</p>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-[5px] bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe]">ACCESS</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-[#9ca3af]">Last administered</p>
                    <p className="text-[12px] font-medium text-[#4b5563]">15 Aug 2026</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9ca3af]">Withdrawal end</p>
                    <p className="text-[12px] font-medium text-[#4b5563]">20 Aug 2026</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[5px] bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                    COMPLETED BEFORE DISPATCH
                  </span>
                </div>
              </div>
              {/* Verification notice */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] p-3">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-[#166534] mb-1">Withdrawal verification passed</p>
                    <p className="text-[11.5px] text-[#166534] leading-relaxed">
                      Withdrawal period completed before dispatch. <span className="font-semibold">Residue testing still required for analytical confirmation.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Required Test Plan */}
        <div className="mx-4 mt-3">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[17px] font-semibold text-[#1a2418] mb-2.5 px-0.5">
            Required Test Plan
          </h2>
          <div className="space-y-2.5">
            {TESTS.map((test) => (
              <div
                key={test.num}
                className={`bg-white border rounded-[12px] p-4 ${test.active ? "border-[#2d5a27]" : "border-[#e4e0d8]"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold tracking-[0.1em] ${test.active ? "text-[#2d5a27]" : "text-[#9ca3af]"}`}>
                      TEST {test.num}
                    </span>
                    {test.badge && (
                      <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-[4px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                        {test.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-[5px] ${pill(test.statusColor)}`}>
                    {test.status}
                  </span>
                </div>
                <p className="text-[13.5px] font-semibold text-[#1a2418] mb-2">{test.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
                  {test.checks.map((c) => (
                    <span key={c} className="flex items-center gap-1.5 text-[11.5px] text-[#6b7280]">
                      <span className="w-1 h-1 rounded-full bg-[#c5d4c2]" />{c}
                    </span>
                  ))}
                </div>
                <button className={`text-[12.5px] font-semibold ${
                  test.statusColor === "green" ? "text-[#2d5a27]"
                  : test.statusColor === "amber" ? "text-[#92400e]"
                  : "text-[#9ca3af]"
                }`}>
                  {test.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="mx-4 mt-3 bg-white border border-[#e4e0d8] rounded-[12px] p-4">
          <h3 style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418] mb-3">
            Assessment Summary
          </h3>
          <div className="space-y-2.5 mb-3">
            {ASSESSMENT.map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-[12.5px] text-[#4b5563]">{label}</p>
                <p className={`text-[12px] font-semibold ${statusColor(color)}`}>{status}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#f3f1ec] pt-3">
            <p className="text-[11.5px] text-[#6b7280]">2 of 3 required test categories are complete or active.</p>
          </div>
        </div>

        {/* Laboratory Notes */}
        <div className="mx-4 mt-3 bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden">
          <button onClick={() => toggle("notes")} className="w-full flex items-center justify-between px-4 py-3.5">
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418]">Laboratory Notes</h2>
            <ChevronIcon className={`w-4 h-4 text-[#9ca3af] transition-transform ${openSection === "notes" ? "rotate-180" : ""}`} />
          </button>
          {openSection === "notes" && (
            <div className="border-t border-[#f3f1ec] px-4 py-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { l: "Sample Condition", v: "Acceptable" },
                { l: "Temperature", v: "4.2°C" },
                { l: "Container", v: "Intact" },
                { l: "Received By", v: "Dr. Priya Sharma" },
                { l: "Received", v: "22 Aug · 11:05 AM" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                  <p className="text-[12.5px] font-medium text-[#1a2418]">{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="mx-4 mt-3 bg-white border border-[#e4e0d8] rounded-[12px] p-4 mb-2">
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[15px] font-semibold text-[#1a2418] mb-4">Activity</h2>
          <div>
            {ACTIVITY.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.icon === "done"   ? "bg-[#2d5a27] border-[#2d5a27]"
                    : item.icon === "active" ? "bg-white border-[#2d5a27]"
                    : "bg-white border-[#d1d5db]"
                  }`}>
                    {item.icon === "done"   && <CheckIcon className="w-3 h-3 text-white" />}
                    {item.icon === "active" && <span className="w-2 h-2 rounded-full bg-[#2d5a27]" />}
                    {item.icon === "neutral" && <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db]" />}
                  </div>
                  {i < ACTIVITY.length - 1 && (
                    <div className="w-px flex-1 bg-[#f3f1ec] my-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                <div className="pb-4 min-w-0">
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase">{item.time}</p>
                  <p className="text-[13px] font-semibold text-[#1a2418] mt-0.5">{item.title}</p>
                  <p className="text-[12px] text-[#6b7280] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom action */}
      <div
        className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
      >
        <button
          onClick={() => onNavigate("testing-workspace")}
          className="w-full py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors"
        >
          Continue Testing →
        </button>
      </div>

      <BottomNav active="dispatches" onNavigate={onNavigate as any} />
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4L7 10l6 6" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,8 6.5,11.5 13,4.5" />
    </svg>
  );
}
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,6 8,10 12,6" />
    </svg>
  );
}
