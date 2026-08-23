import { useState } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail" | "testing-workspace";
type ResultsView = "list" | "assessment" | "verification" | "released" | "hold";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const RESULTS = [
  {
    id: "MLK-2026-00124",
    product: "Raw Milk",
    source: "Shree Krishna Dairy",
    sample: "LAB-MLK-00981",
    date: "23 Aug 2026",
    tests: [
      { label: "Product Quality",        result: "COMPLIANT",     ok: true },
      { label: "Microbiological Safety", result: "COMPLIANT",     ok: true },
      { label: "Antimicrobial Residue",  result: "WITHIN LIMIT",  ok: true },
    ],
    status: "AWAITING VERIFICATION",
    statusColor: "amber",
    action: "Review Assessment →",
    outcome: "released",
  },
  {
    id: "MEAT-2026-00087",
    product: "Meat",
    source: "Green Valley Livestock",
    sample: "LAB-MT-00472",
    date: "23 Aug 2026",
    tests: [
      { label: "Product Quality",        result: "COMPLIANT",       ok: true },
      { label: "Microbiological Safety", result: "COMPLIANT",       ok: true },
      { label: "Antimicrobial Residue",  result: "REVIEW REQUIRED", ok: false },
    ],
    status: "ACTION REQUIRED",
    statusColor: "red",
    action: "Review →",
    outcome: "hold",
  },
  {
    id: "EGG-2026-00241",
    product: "Eggs",
    source: "Sunrise Poultry",
    sample: "LAB-EGG-01128",
    date: "22 Aug 2026",
    tests: [
      { label: "Physical Quality",       result: "COMPLIANT",    ok: true },
      { label: "Microbiological Safety", result: "COMPLIANT",    ok: true },
      { label: "Antimicrobial Residue",  result: "WITHIN LIMIT", ok: true },
    ],
    status: "VERIFIED",
    statusColor: "green",
    action: "View Report →",
    outcome: "released",
  },
];

const STATUS_FILTERS = ["All", "Awaiting Verification", "Verified", "Released", "On Hold"];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function pill(color: string) {
  switch (color) {
    case "amber":   return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    case "red":     return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "green":   return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    case "neutral": return "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]";
    default:        return "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]";
  }
}

function MobileHeader({ title, sub, onBack, backLabel, rightPill, rightPillColor }: {
  title: string; sub?: string; onBack?: () => void; backLabel?: string;
  rightPill?: string; rightPillColor?: string;
}) {
  return (
    <header
      className="bg-white border-b border-[#e4e0d8] px-4 pt-3 pb-3 flex-shrink-0 sticky top-0 z-30"
      style={{ paddingTop: "max(env(safe-area-inset-top,0px),12px)" }}
    >
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-[#6b7280] mb-2">
          <ArrowLeftIcon className="w-3.5 h-3.5" /> {backLabel || "Back"}
        </button>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontFamily: "var(--font-serif)" }} className="text-[19px] font-semibold text-[#1a2418] leading-tight">{title}</p>
          {sub && <p className="text-[12px] text-[#6b7280] mt-0.5">{sub}</p>}
        </div>
        {rightPill && (
          <span className={`text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-[7px] flex-shrink-0 mt-1 ${pill(rightPillColor || "neutral")}`}>
            {rightPill}
          </span>
        )}
      </div>
    </header>
  );
}

function CheckRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[#f3f1ec] last:border-b-0">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ok ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}>
        {ok
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,5 4.5,7.5 8.5,2.5" /></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="2" x2="5" y2="5.5"/><circle cx="5" cy="7.2" r="0.6" fill="#991b1b"/></svg>}
      </span>
      <div>
        <p className="text-[13px] font-medium text-[#1a2418]">{label}</p>
        {note && <p className="text-[11.5px] text-[#6b7280] mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

/* ─── Sub-screens ──────────────────────────────────────────────────────── */

function Assessment({ item, onBack, onSubmit, onNavigate }: {
  item: typeof RESULTS[0];
  onBack: () => void;
  onSubmit: () => void;
  onNavigate: (p: Page) => void;
}) {
  const [remarks, setRemarks] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const allOk = item.tests.every((t) => t.ok);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MobileHeader
        title={item.id}
        sub={`${item.product} · ${item.sample}`}
        onBack={onBack}
        backLabel="Back to Results"
        rightPill={item.status}
        rightPillColor={item.statusColor}
      />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-3">
        <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase px-0.5">Final Assessment</p>

        {/* Consolidated checklist */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden">
          {/* Traceability */}
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Traceability</p>
            <CheckRow label="Source and sample linked" ok={true} />
            <CheckRow label="Treatment history available" ok={true} />
          </div>
          <div className="h-px bg-[#f3f1ec] mx-4" />
          {/* Withdrawal */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Withdrawal Verification</p>
            <CheckRow label="Withdrawal period completed before dispatch" ok={true} />
          </div>
          <div className="h-px bg-[#f3f1ec] mx-4" />
          {/* Lab results */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Laboratory Results</p>
            {item.tests.map((t) => (
              <CheckRow key={t.label} label={`${t.label}`} ok={t.ok} note={t.result} />
            ))}
          </div>
          {/* Expandable detail */}
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full flex items-center justify-between px-4 py-3 border-t border-[#f3f1ec] text-[12.5px] font-medium text-[#2d5a27]"
          >
            View Detailed Results
            <ChevronIcon className={`w-4 h-4 transition-transform ${showDetail ? "rotate-180" : ""}`} />
          </button>
          {showDetail && (
            <div className="border-t border-[#f3f1ec] px-4 py-3 bg-[#faf9f6]">
              <div className="space-y-2">
                {[
                  { param: "Standard Plate Count",  val: "4,200 CFU/mL",   ok: true },
                  { param: "Coliform Screening",     val: "Not Detected",   ok: true },
                  { param: "Pathogen Screen",        val: "Not Detected",   ok: true },
                  { param: "Beta-lactam (MRL)",      val: "3.2 / 4.0 μg/kg", ok: true },
                  { param: "Fat",                    val: "3.8%",            ok: true },
                  { param: "SNF",                    val: "8.6%",            ok: true },
                ].map(({ param, val, ok }) => (
                  <div key={param} className="flex items-center justify-between">
                    <p className="text-[12px] text-[#6b7280]">{param}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[12px] font-semibold ${ok ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>{val}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-[#2d5a27]" : "bg-[#ef4444]"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assessment Outcome */}
        <div className={`rounded-[12px] border-2 px-4 py-4 ${allOk ? "border-[#2d5a27] bg-[#fafdf9]" : "border-[#fca5a5] bg-[#fff5f5]"}`}>
          <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Assessment Outcome</p>
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${allOk ? "bg-[#2d5a27]" : "bg-[#991b1b]"}`}>
              {allOk
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,8 6.5,11.5 13,4.5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="4" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.8" fill="white"/></svg>}
            </span>
            <p style={{ fontFamily: "var(--font-serif)" }} className={`text-[17px] font-semibold ${allOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
              {allOk ? "Eligible for Release" : "Hold Recommended"}
            </p>
          </div>
          <p className="text-[12.5px] text-[#6b7280] leading-relaxed">
            {allOk
              ? "All required traceability checks and laboratory assessments have been completed successfully."
              : "One or more laboratory results require regulatory review before this dispatch can proceed."}
          </p>
        </div>

        {/* Remarks */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4">
          <label className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase block mb-2">Laboratory Remarks <span className="font-normal">(optional)</span></label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks or observations before submitting…"
            rows={3}
            className="w-full bg-[#faf9f6] border border-[#e4e0d8] rounded-[9px] px-3.5 py-3 text-[13px] text-[#1a2418] focus:outline-none focus:border-[#7a9e72] placeholder:text-[#c5beb6] resize-none"
          />
        </div>
      </div>

      {/* Bottom actions */}
      <div
        className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom,12px)" }}
      >
        <button className="px-4 py-3 border border-[#e4e0d8] rounded-[12px] text-[13px] font-semibold text-[#6b7280]">
          Save Draft
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors"
        >
          Submit for Verification →
        </button>
      </div>
    </div>
  );
}

function Verification({ onView, onBack }: { onView: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MobileHeader title="Assessment Submitted" onBack={onBack} backLabel="Back to Results" />
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28 flex flex-col items-center text-center">
        <span className="text-[10.5px] font-semibold tracking-wider px-3 py-1.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] mb-5">
          AWAITING VERIFICATION
        </span>

        {/* Progress tracker */}
        <div className="w-full max-w-xs mb-7">
          {[
            { label: "Testing Complete",     state: "done" },
            { label: "Assessment Submitted", state: "done" },
            { label: "Verification",         state: "active" },
            { label: "Final Outcome",        state: "pending" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  s.state === "done"   ? "bg-[#2d5a27] border-[#2d5a27]"
                  : s.state === "active" ? "bg-white border-[#2d5a27]"
                  : "bg-white border-[#d1d5db]"
                }`}>
                  {s.state === "done"   && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6 5,9 10,3"/></svg>}
                  {s.state === "active" && <span className="w-3 h-3 rounded-full bg-[#2d5a27]" />}
                  {s.state === "pending" && <span className="w-2 h-2 rounded-full bg-[#d1d5db]" />}
                </div>
                {i < arr.length - 1 && <div className={`w-px h-8 my-1 ${s.state === "done" ? "bg-[#2d5a27]" : "bg-[#e4e0d8]"}`} />}
              </div>
              <div className="pt-1 pb-2 text-left">
                <p className={`text-[13px] font-semibold ${s.state === "pending" ? "text-[#9ca3af]" : "text-[#1a2418]"}`}>{s.label}</p>
                {s.state === "active" && <p className="text-[11px] text-[#f59e0b] font-semibold">In progress</p>}
                {s.state === "done"   && <p className="text-[11px] text-[#2d5a27]">Complete</p>}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-xs mb-6">
          This dispatch is awaiting authorised verification before its final status is issued.
        </p>

        <button onClick={onView} className="w-full max-w-xs py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] mb-3 active:bg-[#245021] transition-colors">
          View Assessment
        </button>
        <button onClick={onBack} className="text-[13px] font-medium text-[#6b7280]">Back to Results</button>
      </div>
    </div>
  );
}

function Released({ onReport, onDispatch, onBack }: { onReport: () => void; onDispatch: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MobileHeader title="Dispatch Eligible for Release" onBack={onBack} backLabel="Back to Results" />
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
        {/* Status */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#dcfce7] border-2 border-[#bbf7d0] flex items-center justify-center mb-3">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#2d5a27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,13 10,19 22,7"/></svg>
          </div>
          <span className="text-[11px] font-bold tracking-widest px-3 py-1.5 rounded-full bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
            CLEARED FOR DISPATCH
          </span>
        </div>

        {/* Dispatch meta */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4 mb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { l: "Dispatch ID", v: "MLK-2026-00124", g: true },
              { l: "Sample ID",   v: "LAB-MLK-00981",  g: true },
              { l: "Product",     v: "Raw Milk" },
              { l: "Source",      v: "Shree Krishna Dairy" },
            ].map(({ l, v, g }) => (
              <div key={l}>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                <p className={`text-[12.5px] font-semibold ${g ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary checklist */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-3 mb-3">
          {[
            { label: "Traceability",            note: "Complete" },
            { label: "Withdrawal Verification", note: "Passed" },
            { label: "Product Quality",         note: "Compliant" },
            { label: "Microbiological Safety",  note: "Compliant" },
            { label: "Antimicrobial Residue",   note: "Within Limit" },
          ].map((r) => <CheckRow key={r.label} label={r.label} ok={true} note={r.note} />)}
        </div>

        {/* Verified by */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-3.5 mb-4">
          <div className="flex justify-between mb-2">
            <p className="text-[12px] text-[#9ca3af]">Verified by</p>
            <p className="text-[12.5px] font-semibold text-[#1a2418]">Laboratory Authority</p>
          </div>
          <div className="flex justify-between">
            <p className="text-[12px] text-[#9ca3af]">Verified on</p>
            <p className="text-[12.5px] font-semibold text-[#1a2418]">23 Aug 2026 · 4:20 PM</p>
          </div>
        </div>

        <button onClick={onReport} className="w-full py-3 border border-[#2d5a27] text-[#2d5a27] text-[13px] font-bold rounded-[12px] mb-2.5 active:bg-[#eef2ed] transition-colors">
          View Laboratory Report
        </button>
        <button onClick={onDispatch} className="w-full py-3 border border-[#e4e0d8] text-[#4b5563] text-[13px] font-semibold rounded-[12px] mb-2.5 active:bg-[#f7f6f3] transition-colors">
          View Dispatch
        </button>
        <button onClick={onBack} className="w-full text-center text-[12.5px] font-medium text-[#9ca3af] py-2">Back to Results</button>
      </div>
    </div>
  );
}

function Hold({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <MobileHeader
        title="Dispatch On Hold"
        sub="MEAT-2026-00087 · LAB-MT-00472"
        onBack={onBack}
        backLabel="Back to Results"
        rightPill="ON HOLD"
        rightPillColor="red"
      />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {/* Reason banner */}
        <div className="bg-[#fff5f5] border border-[#fecaca] rounded-[12px] px-4 py-3.5 mb-3 flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#fee2e2] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#991b1b" strokeWidth="1.8" strokeLinecap="round"><line x1="5" y1="2" x2="5" y2="5.5"/><circle cx="5" cy="7.5" r="0.6" fill="#991b1b"/></svg>
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-[#991b1b] mb-0.5">Reason for Hold</p>
            <p className="text-[12.5px] text-[#991b1b] leading-relaxed">Antimicrobial residue result requires further review.</p>
          </div>
        </div>

        {/* Assessment summary */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-3 mb-3">
          {[
            { label: "Traceability",            ok: true,  note: "Complete" },
            { label: "Withdrawal Verification", ok: true,  note: "Passed" },
            { label: "Product Quality",         ok: true,  note: "Compliant" },
            { label: "Microbiological Safety",  ok: true,  note: "Compliant" },
            { label: "Antimicrobial Residue",   ok: false, note: "Review Required" },
          ].map((r) => <CheckRow key={r.label} label={r.label} ok={r.ok} note={r.note} />)}
        </div>

        {/* Required next step */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4 mb-4">
          <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Required Next Step</p>
          <p className="text-[13px] text-[#4b5563] leading-relaxed">
            Veterinary and regulatory review is required before this dispatch can proceed.
          </p>
        </div>

        <button className="w-full py-3 bg-[#2d5a27] text-white text-[13px] font-bold rounded-[12px] mb-2.5 active:bg-[#245021] transition-colors">
          View Detailed Results
        </button>
        <button className="w-full py-3 border border-[#e4e0d8] text-[#4b5563] text-[13px] font-semibold rounded-[12px] mb-2.5 active:bg-[#f7f6f3] transition-colors">
          View Linked Treatment
        </button>
        <button onClick={onBack} className="w-full text-center text-[12.5px] font-medium text-[#9ca3af] py-2">Back to Results</button>
      </div>
    </div>
  );
}

/* ─── Main Results page ─────────────────────────────────────────────────── */

export default function Results({
  onNavigate,
  onOpenReport,
}: {
  onNavigate: (p: Page) => void;
  onOpenReport?: () => void;
}) {
  const [view, setView] = useState<ResultsView>("list");
  const [selected, setSelected] = useState(RESULTS[0]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = RESULTS.filter((r) => {
    const matchFilter = filter === "All" ||
      (filter === "Awaiting Verification" && r.status === "AWAITING VERIFICATION") ||
      (filter === "Verified" && r.status === "VERIFIED") ||
      (filter === "On Hold" && r.status === "ACTION REQUIRED");
    const matchSearch = !search || [r.id, r.sample, r.source].some((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );
    return matchFilter && matchSearch;
  });

  function open(item: typeof RESULTS[0]) {
    setSelected(item);
    setView(item.outcome === "hold" ? "hold" : "assessment");
  }

  if (view === "assessment") return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <Assessment item={selected} onBack={() => setView("list")} onSubmit={() => setView("verification")} onNavigate={onNavigate} />
      <BottomNav active="results" onNavigate={onNavigate as any} />
    </div>
  );

  if (view === "verification") return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <Verification onView={() => setView("assessment")} onBack={() => setView("list")} />
      <BottomNav active="results" onNavigate={onNavigate as any} />
    </div>
  );

  if (view === "released") return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <Released
        onReport={() => onOpenReport ? onOpenReport() : onNavigate("reports")}
        onDispatch={() => onNavigate("dispatch-detail")}
        onBack={() => setView("list")}
      />
      <BottomNav active="results" onNavigate={onNavigate as any} />
    </div>
  );

  if (view === "hold") return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <Hold onBack={() => setView("list")} />
      <BottomNav active="results" onNavigate={onNavigate as any} />
    </div>
  );

  /* ── List view ── */
  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <header
        className="bg-white border-b border-[#e4e0d8] px-4 pt-3 pb-3 flex-shrink-0 sticky top-0 z-30"
        style={{ paddingTop: "max(env(safe-area-inset-top,0px),12px)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase">Laboratory Operations</p>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418]">Laboratory Results</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full">
              <BellIcon className="w-5 h-5 text-[#6b7280]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f59e0b] border-2 border-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#eef2ed] border border-[#c5d4c2] flex items-center justify-center">
              <span style={{ fontFamily: "var(--font-serif)" }} className="text-[11px] font-semibold text-[#2d5a27]">PS</span>
            </div>
          </div>
        </div>
        {/* Search */}
        <div className="relative mb-2.5">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dispatch ID, sample or farm…"
            className="w-full bg-[#faf9f6] border border-[#e4e0d8] rounded-[9px] pl-9 pr-3 py-2 text-[13px] text-[#1a2418] placeholder:text-[#b0a99f] focus:outline-none focus:border-[#7a9e72]"
          />
        </div>
        {/* Status filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                filter === f ? "bg-[#2d5a27] text-white border-[#2d5a27]" : "bg-white text-[#6b7280] border-[#e4e0d8]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-3">
        <p className="text-[12px] text-[#9ca3af] px-0.5">{filtered.length} results</p>
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[13.5px] font-bold text-[#2d5a27]">{item.id}</p>
                <p className="text-[11.5px] text-[#6b7280]">{item.product} · {item.source}</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">Sample: <span className="text-[#4b5563] font-medium">{item.sample}</span></p>
              </div>
              <span className={`text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] flex-shrink-0 ml-2 ${pill(item.statusColor)}`}>
                {item.status}
              </span>
            </div>
            {/* Test results */}
            <div className="space-y-1.5 mb-3">
              {item.tests.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <p className="text-[12px] text-[#4b5563]">{t.label}</p>
                  <span className={`text-[10.5px] font-semibold ${t.ok ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
                    {t.ok ? "✓" : "!"} {t.result}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#f3f1ec] pt-3 flex justify-end">
              <button
                onClick={() => open(item)}
                className="text-[12.5px] font-semibold text-[#2d5a27]"
              >
                {item.action}
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav active="results" onNavigate={onNavigate as any} />
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,6 8,10 12,6"/></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="6.5" r="4"/><line x1="9.5" y1="9.5" x2="13" y2="13"/></svg>;
}
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3a5 5 0 0 1 5 5v3.5l1.5 2H3.5L5 11.5V8a5 5 0 0 1 5-5z"/><path d="M8.5 16a1.5 1.5 0 0 0 3 0"/></svg>;
}
