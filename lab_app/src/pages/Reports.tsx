import { useState } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail" | "testing-workspace";
type ReportsView = "list" | "detail";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const SUMMARY = [
  { v: "128", l: "Completed",          color: "neutral" },
  { v: "112", l: "Released",           color: "green" },
  { v: "6",   l: "On Hold",            color: "red" },
  { v: "10",  l: "Awaiting Verif.",    color: "amber" },
];

const REPORTS_DATA = [
  {
    id: "MLK-2026-00124",
    product: "Milk",
    productSub: "Raw Milk",
    source: "Shree Krishna Dairy",
    sample: "LAB-MLK-00981",
    animal: "MP-104",
    date: "23 Aug 2026",
    status: "CLEARED",
    statusColor: "green",
    refNo: "LAB-REF-2026-00124",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "23 Aug 2026 · 4:20 PM",
    assessments: [
      { label: "Product Quality",        result: "Compliant",    ok: true, detail: "Fat 3.8% · SNF 8.6% · Acidity Normal · No adulteration" },
      { label: "Microbiological Safety", result: "Compliant",    ok: true, detail: "SPC 4,200 CFU/mL · Coliform ND · Pathogen ND" },
      { label: "Antimicrobial Residue",  result: "Within Limit", ok: true, detail: "Beta-lactam · Tetracycline screened" },
    ],
    mrl: {
      drug: "Amoxicillin (Beta-lactam)",
      measured: 3.2,
      limit: 4.0,
      unit: "μg/kg",
      ratio: 0.80,
      verdict: "WITHIN MRL",
      verdictOk: true,
    },
    withdrawal: { drug: "Amoxicillin", administered: "15 Aug 2026", completed: "20 Aug 2026", status: "Completed before dispatch" },
    outcome: "CLEARED FOR DISPATCH",
    outcomeOk: true,
  },
  {
    id: "MEAT-2026-00087",
    product: "Meat",
    productSub: "Batch M-42",
    source: "Green Valley Livestock",
    sample: "LAB-MT-00472",
    animal: "Batch M-42",
    date: "23 Aug 2026",
    status: "ON HOLD",
    statusColor: "red",
    refNo: "LAB-REF-2026-00087",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "—",
    assessments: [
      { label: "Product Quality",        result: "Compliant",       ok: true,  detail: "pH 5.7 · Appearance normal · Odour normal" },
      { label: "Microbiological Safety", result: "Compliant",       ok: true,  detail: "Aerobic count within range · E. coli ND · Salmonella ND" },
      { label: "Antimicrobial Residue",  result: "Review Required", ok: false, detail: "Tetracycline detected above threshold" },
    ],
    mrl: {
      drug: "Tetracycline",
      measured: 220,
      limit: 100,
      unit: "μg/kg",
      ratio: 2.20,
      verdict: "EXCEEDS MRL",
      verdictOk: false,
    },
    withdrawal: { drug: "Oxytetracycline", administered: "10 Aug 2026", completed: "18 Aug 2026", status: "Disputed — review required" },
    outcome: "ON HOLD",
    outcomeOk: false,
  },
  {
    id: "EGG-2026-00241",
    product: "Eggs",
    productSub: "Flock dispatch",
    source: "Sunrise Poultry",
    sample: "LAB-EGG-01128",
    animal: "FLK-2026-042",
    date: "22 Aug 2026",
    status: "CLEARED",
    statusColor: "green",
    refNo: "LAB-REF-2026-00241",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "22 Aug 2026 · 3:45 PM",
    assessments: [
      { label: "Physical Quality",       result: "Compliant",    ok: true, detail: "Avg weight 62g · Shell integrity 100% · Cleanliness acceptable" },
      { label: "Microbiological Safety", result: "Compliant",    ok: true, detail: "No significant pathogen detected" },
      { label: "Antimicrobial Residue",  result: "Within Limit", ok: true, detail: "Enrofloxacin screened" },
    ],
    mrl: {
      drug: "Enrofloxacin",
      measured: 0.06,
      limit: 0.1,
      unit: "mg/kg",
      ratio: 0.60,
      verdict: "WITHIN MRL",
      verdictOk: true,
    },
    withdrawal: { drug: "Enrofloxacin", administered: "8 Aug 2026", completed: "18 Aug 2026", status: "Completed before dispatch" },
    outcome: "CLEARED FOR DISPATCH",
    outcomeOk: true,
  },
];

const DATE_RANGES = ["All Dates", "Today", "This Week", "This Month"];
const PRODUCT_FILTERS = ["All Products", "Milk", "Meat", "Eggs"];
const STATUS_FILTERS_R = ["All", "Cleared", "On Hold", "Awaiting"];

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function pill(color: string) {
  switch (color) {
    case "green":   return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    case "red":     return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "amber":   return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    default:        return "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]";
  }
}

function dotColor(color: string) {
  switch (color) {
    case "green":   return "bg-[#2d5a27]";
    case "red":     return "bg-[#ef4444]";
    case "amber":   return "bg-[#f59e0b]";
    default:        return "bg-[#d1d5db]";
  }
}

/* ─── Report Detail (official document view) ────────────────────────────── */

function ReportDetail({ report, onBack }: { report: typeof REPORTS_DATA[0]; onBack: () => void }) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header
        className="bg-white border-b border-[#e4e0d8] px-4 pt-3 pb-3 sticky top-0 z-30 flex-shrink-0"
        style={{ paddingTop: "max(env(safe-area-inset-top,0px),12px)" }}
      >
        <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-[#6b7280] mb-2">
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Reports
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase mb-0.5">Laboratory Assessment Report</p>
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-[19px] font-semibold text-[#1a2418]">{report.id}</p>
            <p className="text-[11.5px] text-[#6b7280]">{report.product} · {report.source}</p>
          </div>
          <span className={`text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-[7px] flex-shrink-0 mt-1 ${pill(report.statusColor)}`}>
            {report.status}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-3">

        {/* Report identity */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { l: "Dispatch ID",  v: report.id,        g: true },
              { l: "Sample ID",    v: report.sample,    g: true },
              { l: "Product",      v: report.productSub },
              { l: "Source",       v: report.source },
              { l: "Animal/Flock", v: report.animal },
              { l: "Ref. No.",     v: report.refNo },
              { l: "Date",         v: report.date },
              { l: "Verified By",  v: report.verifiedBy },
            ].map(({ l, v, g }) => (
              <div key={l}>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                <p className={`text-[12.5px] font-medium ${g ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawal context */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4">
          <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-3">Antimicrobial Treatment & Withdrawal</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <div><p className="text-[10px] text-[#9ca3af]">Drug</p><p className="text-[12.5px] font-medium text-[#1a2418]">{report.withdrawal.drug}</p></div>
            <div><p className="text-[10px] text-[#9ca3af]">Last Administered</p><p className="text-[12.5px] font-medium text-[#1a2418]">{report.withdrawal.administered}</p></div>
            <div><p className="text-[10px] text-[#9ca3af]">Withdrawal Completed</p><p className="text-[12.5px] font-medium text-[#1a2418]">{report.withdrawal.completed}</p></div>
            <div><p className="text-[10px] text-[#9ca3af]">Status</p><p className={`text-[12px] font-semibold ${report.withdrawal.status.includes("Completed") ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>{report.withdrawal.status}</p></div>
          </div>
        </div>

        {/* Assessment summary */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-3">Assessment Summary</p>
            {report.assessments.map((a) => (
              <div key={a.label} className="flex items-start justify-between py-2.5 border-b border-[#f3f1ec] last:border-0 gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${a.ok ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}>
                    {a.ok
                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,5 4.5,7.5 8.5,2.5"/></svg>
                      : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="2" x2="5" y2="5.5"/><circle cx="5" cy="7.2" r="0.6" fill="#991b1b"/></svg>}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-[#1a2418]">{a.label}</p>
                    {showRaw && <p className="text-[11px] text-[#9ca3af] mt-0.5">{a.detail}</p>}
                  </div>
                </div>
                <span className={`text-[11px] font-semibold flex-shrink-0 ${a.ok ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>{a.result}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-4 py-3 border-t border-[#f3f1ec] text-[12.5px] font-medium text-[#2d5a27]"
          >
            {showRaw ? "Hide" : "View"} Raw Test Values
            <ChevronIcon className={`w-4 h-4 transition-transform ${showRaw ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* ── MRL Score Card ── */}
        <div className={`rounded-[12px] border-2 px-4 py-4 ${report.mrl.verdictOk ? "border-[#2d5a27] bg-[#fafdf9]" : "border-[#fca5a5] bg-[#fff5f5]"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase">MRL Assessment</p>
            <span className={`text-[10.5px] font-bold tracking-wide px-2.5 py-1 rounded-[6px] ${
              report.mrl.verdictOk
                ? "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]"
                : "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]"
            }`}>
              {report.mrl.verdict}
            </span>
          </div>

          <p className="text-[13px] font-semibold text-[#1a2418] mb-3">{report.mrl.drug}</p>

          {/* MRL bar */}
          <div className="mb-3">
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-[11px] text-[#9ca3af]">Measured</span>
              <span className="text-[11px] text-[#9ca3af]">MRL Limit</span>
            </div>
            <div className="relative h-3 bg-[#f3f4f6] rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${report.mrl.verdictOk ? "bg-[#2d5a27]" : "bg-[#ef4444]"}`}
                style={{ width: `${Math.min(report.mrl.ratio * 100, 100)}%` }}
              />
              {/* MRL limit marker */}
              <div className="absolute top-0 right-0 h-full w-0.5 bg-[#9ca3af]" style={{ right: "0%" }} />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[13px] font-bold ${report.mrl.verdictOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
                {report.mrl.measured} {report.mrl.unit}
              </span>
              <span className="text-[12px] text-[#6b7280] font-medium">
                Limit: {report.mrl.limit} {report.mrl.unit}
              </span>
            </div>
          </div>

          {/* Ratio */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e4e0d8]">
            <span className="text-[12px] text-[#6b7280]">Measured / MRL ratio</span>
            <span className={`text-[14px] font-bold ${report.mrl.verdictOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
              {(report.mrl.ratio * 100).toFixed(0)}%
              <span className="text-[11px] font-normal text-[#9ca3af] ml-1">of limit</span>
            </span>
          </div>
        </div>

        {/* Final outcome */}
        <div className={`rounded-[12px] px-4 py-4 flex items-center gap-3 ${report.outcomeOk ? "bg-[#eef2ed] border border-[#c5d4c2]" : "bg-[#fee2e2] border border-[#fca5a5]"}`}>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${report.outcomeOk ? "bg-[#2d5a27]" : "bg-[#991b1b]"}`}>
            {report.outcomeOk
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,8 6.5,11.5 13,4.5"/></svg>
              : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="4" x2="8" y2="9"/><circle cx="8" cy="11.5" r="0.8" fill="white"/></svg>}
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Final Outcome</p>
            <p style={{ fontFamily: "var(--font-serif)" }} className={`text-[16px] font-semibold ${report.outcomeOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
              {report.outcome}
            </p>
            {report.verifiedOn !== "—" && (
              <p className="text-[11px] text-[#9ca3af] mt-0.5">Verified {report.verifiedOn}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-2.5"
        style={{ paddingBottom: "env(safe-area-inset-bottom,12px)" }}
      >
        <button className="flex-1 py-3 border border-[#e4e0d8] rounded-[11px] text-[12.5px] font-semibold text-[#4b5563] flex items-center justify-center gap-1.5">
          <PrintIcon className="w-4 h-4 text-[#9ca3af]" /> Print
        </button>
        <button className="flex-1 py-3 border border-[#e4e0d8] rounded-[11px] text-[12.5px] font-semibold text-[#4b5563] flex items-center justify-center gap-1.5">
          <DownloadIcon className="w-4 h-4 text-[#9ca3af]" /> Download
        </button>
        <button className="flex-1 py-3 bg-[#2d5a27] text-white rounded-[11px] text-[12.5px] font-bold flex items-center justify-center gap-1.5">
          <ShareIcon className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}

/* ─── Main Reports page ─────────────────────────────────────────────────── */

export default function Reports({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [view, setView] = useState<ReportsView>("list");
  const [selected, setSelected] = useState(REPORTS_DATA[0]);
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [productFilter, setProductFilter] = useState("All Products");
  const [statusFilter, setStatusFilter] = useState("All");

  if (view === "detail") return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <ReportDetail report={selected} onBack={() => setView("list")} />
      <BottomNav active="reports" onNavigate={onNavigate as any} />
    </div>
  );

  const filtered = REPORTS_DATA.filter((r) => {
    const matchProduct = productFilter === "All Products" || r.product === productFilter;
    const matchStatus = statusFilter === "All" ||
      (statusFilter === "Cleared" && r.status === "CLEARED") ||
      (statusFilter === "On Hold" && r.status === "ON HOLD");
    return matchProduct && matchStatus;
  });

  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <header
        className="bg-white border-b border-[#e4e0d8] px-4 pt-3 pb-3 sticky top-0 z-30"
        style={{ paddingTop: "max(env(safe-area-inset-top,0px),12px)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase">Laboratory Operations</p>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418]">Laboratory Reports</h1>
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
        {/* Filters row */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {DATE_RANGES.map((f) => (
            <button key={f} onClick={() => setDateFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                dateFilter === f ? "bg-[#2d5a27] text-white border-[#2d5a27]" : "bg-white text-[#6b7280] border-[#e4e0d8]"
              }`}>{f}</button>
          ))}
          <div className="w-px h-5 bg-[#e4e0d8] flex-shrink-0 self-center" />
          {PRODUCT_FILTERS.slice(1).map((f) => (
            <button key={f} onClick={() => setProductFilter(productFilter === f ? "All Products" : f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                productFilter === f ? "bg-[#2d5a27] text-white border-[#2d5a27]" : "bg-white text-[#6b7280] border-[#e4e0d8]"
              }`}>{f}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-0 border-b border-[#e4e0d8] bg-white">
          {SUMMARY.map(({ v, l, color }) => (
            <div key={l} className="py-3.5 text-center border-r border-[#f3f1ec] last:border-r-0">
              <p style={{ fontFamily: "var(--font-serif)" }} className="text-[20px] font-semibold text-[#1a2418] leading-none">{v}</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor(color)}`} />
                <p className="text-[9.5px] text-[#9ca3af]">{l}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-[#f3f1ec] bg-white">
          {STATUS_FILTERS_R.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-colors ${
                statusFilter === f ? "bg-[#2d5a27] text-white border-[#2d5a27]" : "bg-white text-[#6b7280] border-[#e4e0d8]"
              }`}>{f}</button>
          ))}
        </div>

        {/* Report cards */}
        <div className="px-4 pt-4 space-y-3 pb-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#2d5a27]">{r.id}</p>
                  <p className="text-[11.5px] text-[#6b7280]">{r.product} · {r.source}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">{r.date}</p>
                </div>
                <span className={`text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] flex-shrink-0 ml-2 ${pill(r.statusColor)}`}>
                  {r.status}
                </span>
              </div>

              {/* MRL score preview */}
              <div className="bg-[#faf9f6] border border-[#f3f1ec] rounded-[8px] px-3 py-2.5 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10.5px] text-[#9ca3af]">MRL · {r.mrl.drug}</p>
                  <span className={`text-[10px] font-bold ${r.mrl.verdictOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
                    {r.mrl.measured}/{r.mrl.limit} {r.mrl.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-[#e4e0d8] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.mrl.verdictOk ? "bg-[#2d5a27]" : "bg-[#ef4444]"}`}
                    style={{ width: `${Math.min(r.mrl.ratio * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-[10.5px] font-semibold mt-1 ${r.mrl.verdictOk ? "text-[#2d5a27]" : "text-[#991b1b]"}`}>
                  {(r.mrl.ratio * 100).toFixed(0)}% of MRL · {r.mrl.verdict}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#f3f1ec] pt-3">
                <p className="text-[11.5px] text-[#9ca3af]">Ref: {r.refNo}</p>
                <button
                  onClick={() => { setSelected(r); setView("detail"); }}
                  className="text-[12.5px] font-semibold text-[#2d5a27]"
                >
                  View Report →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="reports" onNavigate={onNavigate as any} />
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
function BellIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3a5 5 0 0 1 5 5v3.5l1.5 2H3.5L5 11.5V8a5 5 0 0 1 5-5z"/><path d="M8.5 16a1.5 1.5 0 0 0 3 0"/></svg>;
}
function PrintIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="10" height="7" rx="1"/><path d="M5 6V3h6v3"/><line x1="5" y1="10" x2="11" y2="10"/><line x1="5" y1="12" x2="9" y2="12"/></svg>;
}
function DownloadIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h10"/><path d="M8 2v7M5 7l3 3 3-3"/></svg>;
}
function ShareIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="3" r="1.5"/><circle cx="12" cy="13" r="1.5"/><circle cx="4" cy="8" r="1.5"/><line x1="10.5" y1="3.8" x2="5.5" y2="7.2"/><line x1="10.5" y1="12.2" x2="5.5" y2="8.8"/></svg>;
}
