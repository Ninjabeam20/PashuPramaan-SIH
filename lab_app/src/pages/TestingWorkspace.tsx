import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail" | "testing-workspace";
type WorkspaceView = "form" | "review" | "next";

const ASSESSMENTS = [
  { num: 1, label: "Product Quality",        state: "done" },
  { num: 2, label: "Microbiological Safety", state: "active" },
  { num: 3, label: "Antimicrobial Residue",  state: "pending" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function Seg({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-[8px] border border-[#e4e0d8] overflow-hidden bg-[#faf9f6] p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 text-[13px] font-semibold rounded-[6px] transition-colors ${
            value === opt
              ? "bg-white text-[#1a2418] shadow-sm border border-[#e4e0d8]"
              : "text-[#9ca3af]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ResultBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#166534]">
      <span className="w-3.5 h-3.5 rounded-full bg-[#dcfce7] flex items-center justify-center">
        <CheckMiniIcon />
      </span>
      Within Range
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#92400e]">
      <span className="w-3.5 h-3.5 rounded-full bg-[#fef3c7] flex items-center justify-center">
        <WarnMiniIcon />
      </span>
      Requires Review
    </span>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

export default function TestingWorkspace({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [view, setView] = useState<WorkspaceView>("form");
  const [plateCount, setPlateCount] = useState("");
  const [coliform, setColiform] = useState("Not Detected");
  const [pathogen, setPathogen] = useState("Not Detected");
  const [organism, setOrganism] = useState("");
  const [notes, setNotes] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [completedTwo, setCompletedTwo] = useState(false);

  const plateOk = plateCount !== "" && Number(plateCount) < 100000;

  function saveDraft() {
    setDraftSaved(true);
  }

  useEffect(() => {
    if (!draftSaved) return;
    const t = setTimeout(() => setDraftSaved(false), 3000);
    return () => clearTimeout(t);
  }, [draftSaved]);

  /* ── REVIEW screen ── */
  if (view === "review") {
    return (
      <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
        <PageHeader onBack={() => setView("form")} backLabel="Continue Editing" />
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-40">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase mb-1">Review</p>
          <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[22px] font-semibold text-[#1a2418] mb-1">
            Microbiological Results
          </h2>
          <p className="text-[13px] text-[#6b7280] mb-5">Confirm findings before marking this test complete.</p>

          <div className="bg-white border border-[#e4e0d8] rounded-[12px] divide-y divide-[#f3f1ec] mb-4">
            {[
              { label: "Standard Plate Count", value: plateCount ? `${Number(plateCount).toLocaleString()} CFU/mL` : "—", ok: plateOk },
              { label: "Coliform Screening",   value: coliform,       ok: coliform === "Not Detected" },
              { label: "Pathogen Screen",      value: pathogen + (pathogen === "Detected" && organism ? ` — ${organism}` : ""), ok: pathogen === "Not Detected" },
            ].map(({ label, value, ok }) => (
              <div key={label} className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-[#9ca3af]">{label}</p>
                  <p className="text-[13.5px] font-semibold text-[#1a2418]">{value}</p>
                </div>
                <ResultBadge ok={ok} />
              </div>
            ))}
            {notes && (
              <div className="px-4 py-3.5">
                <p className="text-[12px] text-[#9ca3af] mb-0.5">Laboratory Notes</p>
                <p className="text-[13px] text-[#4b5563] leading-relaxed">{notes}</p>
              </div>
            )}
          </div>

          <div className="bg-[#eef2ed] border border-[#c5d4c2] rounded-[12px] px-4 py-3.5 flex items-center justify-between mb-1">
            <p className="text-[12.5px] font-semibold text-[#2d5a27]">Overall Test Assessment</p>
            <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-[6px] bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
              COMPLIANT
            </span>
          </div>
        </div>

        <div
          className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-3"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
        >
          <button
            onClick={() => setView("form")}
            className="px-4 py-3 border border-[#e4e0d8] rounded-[12px] text-[13px] font-semibold text-[#6b7280]"
          >
            ← Edit
          </button>
          <button
            onClick={() => { setCompletedTwo(true); setView("next"); }}
            className="flex-1 py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors"
          >
            Confirm & Complete →
          </button>
        </div>
        <BottomNav active="testing-queue" onNavigate={onNavigate as any} />
      </div>
    );
  }

  /* ── NEXT TEST screen ── */
  if (view === "next") {
    return (
      <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
        <PageHeader onBack={() => onNavigate("testing-queue")} backLabel="Back to Testing Queue" />

        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-28">
          {/* Updated progress */}
          <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold text-[#1a2418]">Required Assessments</p>
              <p className="text-[11.5px] font-semibold text-[#2d5a27]">2 of 3 Complete</p>
            </div>
            <ProgressTracker stages={[
              { label: "Product Quality",        state: "done" },
              { label: "Microbiological Safety", state: "done" },
              { label: "Antimicrobial Residue",  state: "active" },
            ]} />
          </div>

          {/* Success notice */}
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[12px] px-4 py-3.5 flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-4 h-4 text-white" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#166534]">Microbiological Safety — Completed</p>
              <p className="text-[11.5px] text-[#166534]">All findings recorded and marked compliant.</p>
            </div>
          </div>

          {/* Next test card */}
          <p className="text-[11px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase mb-2 px-0.5">Next Required Assessment</p>
          <div className="bg-white border-2 border-[#2d5a27] rounded-[12px] p-4 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#9ca3af] mb-1">TEST 03 OF 03</p>
                <h3 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418]">
                  Antimicrobial Residue
                </h3>
              </div>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]">
                PENDING
              </span>
            </div>
            <p className="text-[12.5px] text-[#6b7280] leading-relaxed mb-3">
              Targeted residue testing is required based on the linked antimicrobial treatment history.
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-[6px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] mb-4">
              <TriggerIcon className="w-3 h-3" />
              Triggered by treatment history
            </span>
            <div className="space-y-1.5 text-[12px] text-[#6b7280]">
              {["Beta-lactam screen", "Tetracycline screen", "Targeted residue analysis"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#c5d4c2]" />{t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-3"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
        >
          <button
            onClick={() => onNavigate("testing-queue")}
            className="px-4 py-3 border border-[#e4e0d8] rounded-[12px] text-[13px] font-semibold text-[#6b7280]"
          >
            Queue
          </button>
          <button className="flex-1 py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors">
            Start Residue Test →
          </button>
        </div>
        <BottomNav active="testing-queue" onNavigate={onNavigate as any} />
      </div>
    );
  }

  /* ── MAIN FORM ── */
  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="bg-white border-b border-[#e4e0d8] px-4 pt-3 pb-3 flex-shrink-0 sticky top-0 z-30"
        style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onNavigate("testing-queue")}
            className="flex items-center gap-1 text-[12.5px] text-[#6b7280]"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Testing Queue
          </button>
          <button onClick={() => setShowContext(!showContext)} className="flex items-center gap-1 text-[12px] text-[#2d5a27] font-semibold">
            <InfoIcon className="w-4 h-4" />
            Sample Details
          </button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase">Laboratory Testing</p>
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-[19px] font-semibold text-[#1a2418] leading-tight">
              MLK-2026-00124
            </p>
            <p className="text-[11.5px] text-[#6b7280]">Raw Milk · <span className="text-[#2d5a27] font-medium">LAB-MLK-00981</span></p>
          </div>
          <span className="text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-[7px] bg-[#eef2ed] text-[#2d5a27] border border-[#c5d4c2] mt-1 flex-shrink-0">
            READY FOR TESTING
          </span>
        </div>
      </header>

      {/* Collapsible context */}
      {showContext && (
        <div className="bg-[#fafdf9] border-b border-[#e4e0d8] px-4 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
            {[
              { l: "Dispatch", v: "MLK-2026-00124", g: true },
              { l: "Sample",   v: "LAB-MLK-00981",  g: true },
              { l: "Product",  v: "Raw Milk" },
              { l: "Source",   v: "Shree Krishna Dairy" },
              { l: "Animal",   v: "MP-104" },
              { l: "Condition", v: "✓ Acceptable" },
              { l: "Received Temp", v: "4.2°C" },
              { l: "Risk Level", v: "MODERATE" },
            ].map(({ l, v, g }) => (
              <div key={l}>
                <p className="text-[9.5px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                <p className={`text-[12px] font-medium ${g ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[9px] px-3 py-2.5">
            <p className="text-[11.5px] font-semibold text-[#92400e] mb-0.5">Antimicrobial Context</p>
            <p className="text-[11.5px] text-[#92400e]">Amoxicillin · Last administered 15 Aug 2026</p>
            <p className="text-[11px] text-[#b45309] mt-0.5">✓ Withdrawal completed before dispatch. Residue testing still required.</p>
          </div>
        </div>
      )}

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-3">

        {/* Assessment progress */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12.5px] font-semibold text-[#1a2418]">Required Assessments</p>
            <p className="text-[11.5px] font-semibold text-[#2d5a27]">1 of 3 Complete</p>
          </div>
          <ProgressTracker stages={ASSESSMENTS.map((a) => ({ label: a.label, state: a.state as any }))} />
        </div>

        {/* Draft saved toast */}
        {draftSaved && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#eef2ed] border border-[#c5d4c2] rounded-[10px]">
            <CheckIcon className="w-4 h-4 text-[#2d5a27]" />
            <p className="text-[12.5px] font-semibold text-[#2d5a27]">Draft saved · <span className="font-normal text-[#6b7280]">Just now</span></p>
          </div>
        )}

        {/* Active test card */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] overflow-hidden">
          <div className="border-l-4 border-[#2d5a27] px-4 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#9ca3af] mb-0.5">TEST 02 OF 03</p>
                <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[20px] font-semibold text-[#1a2418]">
                  Microbiological Safety
                </h2>
                <p className="text-[12.5px] text-[#6b7280] mt-0.5">Record the laboratory findings for this sample.</p>
              </div>
              <span className="text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] flex-shrink-0 ml-3 mt-0.5">
                IN PROGRESS
              </span>
            </div>
          </div>

          <div className="px-4 pb-5 space-y-5 pt-1">

            {/* Param 1: Standard Plate Count */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1a2418]">Standard Plate Count</label>
                {plateCount !== "" && <ResultBadge ok={plateOk} />}
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="number"
                  value={plateCount}
                  onChange={(e) => setPlateCount(e.target.value)}
                  placeholder="Enter count"
                  className="flex-1 bg-[#faf9f6] border border-[#e4e0d8] rounded-[9px] px-3.5 py-3 text-[15px] font-medium text-[#1a2418] focus:outline-none focus:border-[#7a9e72] focus:ring-2 focus:ring-[#eef2ed] placeholder:text-[#c5beb6]"
                />
                <span className="text-[12.5px] font-medium text-[#9ca3af] bg-[#f7f6f3] border border-[#e4e0d8] rounded-[9px] px-3 py-3 flex-shrink-0">
                  CFU/mL
                </span>
              </div>
              <p className="text-[11px] text-[#9ca3af] mt-1.5 ml-0.5">Reference: within configured laboratory limits</p>
            </div>

            <div className="h-px bg-[#f3f1ec]" />

            {/* Param 2: Coliform Screening */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[13px] font-semibold text-[#1a2418]">Coliform Screening</label>
                <ResultBadge ok={coliform === "Not Detected"} />
              </div>
              <Seg value={coliform} options={["Detected", "Not Detected"]} onChange={setColiform} />
            </div>

            <div className="h-px bg-[#f3f1ec]" />

            {/* Param 3: Pathogen Screen */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[13px] font-semibold text-[#1a2418]">Pathogen Screen</label>
                <ResultBadge ok={pathogen === "Not Detected"} />
              </div>
              <Seg value={pathogen} options={["Detected", "Not Detected"]} onChange={setPathogen} />
              {pathogen === "Detected" && (
                <div className="mt-3 bg-[#fef3c7] border border-[#fde68a] rounded-[10px] p-3">
                  <label className="text-[11.5px] font-semibold text-[#92400e] block mb-1.5">Organism identified</label>
                  <input
                    type="text"
                    value={organism}
                    onChange={(e) => setOrganism(e.target.value)}
                    placeholder="Select or enter organism…"
                    className="w-full bg-white border border-[#fde68a] rounded-[8px] px-3 py-2.5 text-[13px] text-[#1a2418] focus:outline-none focus:border-[#f59e0b] placeholder:text-[#c5beb6]"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-[#f3f1ec]" />

            {/* Lab notes */}
            <div>
              <label className="text-[12.5px] font-semibold text-[#6b7280] block mb-1.5">Laboratory Notes <span className="font-normal text-[#9ca3af]">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add observations or testing notes…"
                rows={3}
                className="w-full bg-[#faf9f6] border border-[#e4e0d8] rounded-[9px] px-3.5 py-3 text-[13px] text-[#1a2418] focus:outline-none focus:border-[#7a9e72] placeholder:text-[#c5beb6] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Completed test — Product Quality summary (collapsed reference) */}
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-4 py-3.5 flex items-center justify-between opacity-70">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#2d5a27] flex items-center justify-center flex-shrink-0">
              <CheckIcon className="w-3 h-3 text-white" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-[#1a2418]">Product Quality</p>
              <p className="text-[11px] text-[#9ca3af]">Test 01 · Completed</p>
            </div>
          </div>
          <button className="text-[12px] font-medium text-[#2d5a27]">View →</button>
        </div>

      </div>

      {/* Sticky bottom action bar */}
      <div
        className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
      >
        <button
          onClick={saveDraft}
          className="px-4 py-3 border border-[#e4e0d8] rounded-[12px] text-[13px] font-semibold text-[#6b7280] hover:bg-[#f7f6f3] transition-colors"
        >
          Save Draft
        </button>
        <button
          onClick={() => setView("review")}
          className="flex-1 py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors"
        >
          Complete Test →
        </button>
      </div>

      <BottomNav active="testing-queue" onNavigate={onNavigate as any} />
    </div>
  );
}

/* ─── Shared sub-components ──────────────────────────────────────────── */

function PageHeader({ onBack, backLabel }: { onBack: () => void; backLabel: string }) {
  return (
    <header
      className="bg-white border-b border-[#e4e0d8] px-4 py-3 flex-shrink-0 sticky top-0 z-30"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}
    >
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] text-[#6b7280] mb-1.5">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        {backLabel}
      </button>
      <div className="flex items-center gap-2">
        <p style={{ fontFamily: "var(--font-serif)" }} className="text-[17px] font-semibold text-[#1a2418]">MLK-2026-00124</p>
        <span className="text-[11px] text-[#9ca3af]">·</span>
        <p className="text-[12.5px] text-[#6b7280]">LAB-MLK-00981</p>
      </div>
    </header>
  );
}

function ProgressTracker({ stages }: { stages: { label: string; state: "done" | "active" | "pending" }[] }) {
  return (
    <div className="flex items-center gap-0">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 ${
              s.state === "done"   ? "bg-[#2d5a27] border-[#2d5a27]"
              : s.state === "active" ? "bg-white border-[#2d5a27]"
              : "bg-white border-[#d1d5db]"
            }`}>
              {s.state === "done"   && <CheckIcon className="w-3 h-3 text-white" />}
              {s.state === "active" && <span className="w-2 h-2 rounded-full bg-[#2d5a27]" />}
              {s.state === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-[#d1d5db]" />}
            </div>
            <p className={`text-[10px] font-semibold text-center leading-tight px-0.5 ${
              s.state === "done"   ? "text-[#2d5a27]"
              : s.state === "active" ? "text-[#1a2418]"
              : "text-[#9ca3af]"
            }`}>{s.label}</p>
          </div>
          {i < stages.length - 1 && (
            <div className={`flex-1 h-px mx-0.5 mb-3.5 ${s.state === "done" ? "bg-[#2d5a27]" : "bg-[#e4e0d8]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────── */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,8 6.5,11.5 13,4.5" />
    </svg>
  );
}
function CheckMiniIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#166534]">
      <polyline points="1.5,4 3.5,6 6.5,2" />
    </svg>
  );
}
function WarnMiniIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-[#92400e]">
      <line x1="4" y1="1.5" x2="4" y2="4.5" /><circle cx="4" cy="6.2" r="0.5" fill="currentColor" />
    </svg>
  );
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" /><line x1="8" y1="7" x2="8" y2="11" strokeWidth="1.8" /><circle cx="8" cy="5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function TriggerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 1L2 7h4l-1 4 5-6H6z" />
    </svg>
  );
}
