/**
 * ResultsSubScreens.tsx
 *
 * Contains the Assessment, Verification, Released, and Hold sub-screens
 * that the Results page navigates between. Each is a standalone component
 * so Results/page.tsx stays clean and readable.
 */
"use client";

import * as React from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LabResult } from "@/lib/api/dummy/lab-results";

/* ─── Shared helpers ─────────────────────────────────────────────────── */

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}

function CheckRow({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          ok ? "bg-[var(--status-good-bg)]" : "bg-[var(--status-high-bg)]"
        }`}
      >
        {ok ? (
          <Check size={11} strokeWidth={3} className="text-[var(--status-good-text)]" />
        ) : (
          <AlertTriangle size={11} strokeWidth={2.5} className="text-[var(--status-high-text)]" />
        )}
      </span>
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        {note && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

/* ─── Assessment screen ─────────────────────────────────────────────── */

interface AssessmentProps {
  item: LabResult;
  onBack: () => void;
  onSubmit: () => void;
}

export function AssessmentScreen({ item, onBack, onSubmit }: AssessmentProps) {
  const [remarks, setRemarks] = React.useState("");
  const [showDetail, setShowDetail] = React.useState(false);
  const allOk = item.tests.every((t) => t.ok);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <div className="flex items-start justify-between mt-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">Final Assessment</p>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">{item.id}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.product} · {item.sample}</p>
          </div>
          <Badge variant={item.statusColor as BadgeVariant}>{item.status}</Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 max-w-2xl mx-auto w-full space-y-5">

        {/* Consolidated checklist */}
        <Card className="p-0 overflow-hidden divide-y divide-[var(--color-border)]">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Traceability</p>
            <CheckRow label="Source and sample linked" ok={true} />
            <CheckRow label="Treatment history available" ok={true} />
          </div>
          <div className="px-5 pt-4 pb-3">
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Withdrawal Verification</p>
            <CheckRow label="Withdrawal period completed before dispatch" ok={true} />
          </div>
          <div className="px-5 pt-4 pb-3">
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Laboratory Results</p>
            {item.tests.map((t) => (
              <CheckRow key={t.label} label={t.label} ok={t.ok} note={t.result} />
            ))}
          </div>
          {/* Expandable detailed results */}
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors"
          >
            View Detailed Results
            {showDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showDetail && (
            <div className="px-5 py-4 bg-[var(--color-bg)] space-y-3">
              {[
                { param: "Standard Plate Count", val: "4,200 CFU/mL",    ok: true  },
                { param: "Coliform Screening",    val: "Not Detected",    ok: true  },
                { param: "Pathogen Screen",        val: "Not Detected",    ok: true  },
                { param: "Beta-lactam (MRL)",      val: "3.2 / 4.0 μg/kg", ok: true },
                { param: "Fat",                    val: "3.8%",            ok: true  },
                { param: "SNF",                    val: "8.6%",            ok: true  },
              ].map(({ param, val, ok }) => (
                <div key={param} className="flex items-center justify-between">
                  <p className="text-xs text-[var(--color-text-muted)]">{param}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${ok ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>{val}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-[var(--status-good-text)]" : "bg-[var(--status-high-text)]"}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assessment outcome */}
        <div
          className={`rounded-2xl border-2 px-5 py-5 ${
            allOk
              ? "border-[var(--color-primary)] bg-[var(--status-good-bg)]/30"
              : "border-red-300 bg-red-50"
          }`}
        >
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Assessment Outcome</p>
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                allOk ? "bg-[var(--color-primary)]" : "bg-red-700"
              }`}
            >
              {allOk ? (
                <Check size={18} strokeWidth={3} className="text-white" />
              ) : (
                <AlertTriangle size={18} strokeWidth={2} className="text-white" />
              )}
            </span>
            <h2 className={`font-display text-xl font-semibold ${allOk ? "text-[var(--color-primary)]" : "text-red-800"}`}>
              {allOk ? "Eligible for Release" : "Hold Recommended"}
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {allOk
              ? "All required traceability checks and laboratory assessments have been completed successfully."
              : "One or more laboratory results require regulatory review before this dispatch can proceed."}
          </p>
        </div>

        {/* Remarks */}
        <Card>
          <label className="block text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">
            Laboratory Remarks <span className="font-normal">(optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks or observations before submitting…"
            rows={3}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--color-text-muted)]"
          />
        </Card>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 z-30 md:relative md:bottom-auto shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        <Button variant="outline" className="px-6">Save Draft</Button>
        <Button className="flex-1" onClick={onSubmit}>Submit for Verification →</Button>
      </div>
    </div>
  );
}

/* ─── Verification screen ───────────────────────────────────────────── */

interface VerificationProps {
  onViewAssessment: () => void;
  onBack: () => void;
  onReleased: () => void;
}

const VERIFICATION_STAGES = [
  { label: "Testing Complete",     state: "done"    as const },
  { label: "Assessment Submitted", state: "done"    as const },
  { label: "Verification",         state: "active"  as const },
  { label: "Final Outcome",        state: "pending" as const },
];

export function VerificationScreen({ onViewAssessment, onBack, onReleased }: VerificationProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] mt-3">Assessment Submitted</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-28 max-w-md mx-auto w-full flex flex-col items-center text-center">
        <Badge variant="amber" className="mb-8 text-sm px-4 py-1.5">AWAITING VERIFICATION</Badge>

        {/* Vertical progress tracker */}
        <div className="w-full max-w-xs mb-8 text-left">
          {VERIFICATION_STAGES.map((s, i, arr) => (
            <div key={s.label} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    s.state === "done"
                      ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                      : s.state === "active"
                      ? "bg-[var(--color-surface)] border-[var(--color-primary)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]"
                  }`}
                >
                  {s.state === "done" && <Check size={13} strokeWidth={3} className="text-white" />}
                  {s.state === "active" && <span className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />}
                  {s.state === "pending" && <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                </div>
                {i < arr.length - 1 && (
                  <div className={`w-px h-10 my-1 ${s.state === "done" ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
                )}
              </div>
              <div className="pt-1 pb-2">
                <p className={`text-sm font-semibold ${s.state === "pending" ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>
                  {s.label}
                </p>
                {s.state === "active" && <p className="text-xs font-semibold text-amber-600 mt-0.5">In progress</p>}
                {s.state === "done" && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Complete</p>}
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs mb-8">
          This dispatch is awaiting authorised verification before its final status is issued.
        </p>

        <div className="w-full flex flex-col gap-3">
          {/* Simulate completing verification for demo purposes */}
          <Button className="w-full" onClick={onReleased}>View Assessment</Button>
          <button onClick={onBack} className="text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1 transition-colors">
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Released screen ───────────────────────────────────────────────── */

interface ReleasedProps {
  /** Navigates to /lab/reports — this is the onOpenReport callback from the source App.tsx */
  onReport: () => void;
  onDispatch: () => void;
  onBack: () => void;
}

export function ReleasedScreen({ onReport, onDispatch, onBack }: ReleasedProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] mt-3">Dispatch Eligible for Release</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 max-w-md mx-auto w-full space-y-5">
        {/* Status indicator */}
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-[var(--status-good-bg)] flex items-center justify-center mb-4">
            <Check size={32} strokeWidth={3} className="text-[var(--status-good-text)]" />
          </div>
          <Badge variant="good" className="text-sm px-4 py-1.5">CLEARED FOR DISPATCH</Badge>
        </div>

        {/* Dispatch meta */}
        <Card>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {[
              { l: "Dispatch ID", v: "MLK-2026-00124", primary: true  },
              { l: "Sample ID",   v: "LAB-MLK-00981",  primary: true  },
              { l: "Product",     v: "Raw Milk",        primary: false },
              { l: "Source",      v: "Shree Krishna Dairy", primary: false },
            ].map(({ l, v, primary }) => (
              <div key={l}>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">{l}</p>
                <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary checklist */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 divide-y divide-[var(--color-border)]">
            {[
              { label: "Traceability",            note: "Complete"     },
              { label: "Withdrawal Verification", note: "Passed"       },
              { label: "Product Quality",         note: "Compliant"    },
              { label: "Microbiological Safety",  note: "Compliant"    },
              { label: "Antimicrobial Residue",   note: "Within Limit" },
            ].map((r) => (
              <CheckRow key={r.label} label={r.label} ok={true} note={r.note} />
            ))}
          </div>
        </Card>

        {/* Verified by */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--color-text-muted)]">Verified by</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">Laboratory Authority</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--color-text-muted)]">Verified on</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">23 Aug 2026 · 4:20 PM</p>
            </div>
          </div>
        </Card>

        {/* Actions — onReport navigates to /lab/reports (the onOpenReport callback from source) */}
        <div className="flex flex-col gap-3 pt-2">
          <Button className="w-full" variant="outline" onClick={onReport}>View Laboratory Report</Button>
          <Button className="w-full" variant="outline" onClick={onDispatch}>View Dispatch</Button>
          <button onClick={onBack} className="text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1 text-center transition-colors">
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Hold screen ───────────────────────────────────────────────────── */

interface HoldProps {
  onBack: () => void;
}

export function HoldScreen({ onBack }: HoldProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Dispatch On Hold</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">MEAT-2026-00087 · LAB-MT-00472</p>
          </div>
          <Badge variant="red">ON HOLD</Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 max-w-md mx-auto w-full space-y-5">
        {/* Reason banner */}
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={13} strokeWidth={2.5} className="text-red-700" />
          </span>
          <div>
            <p className="text-sm font-bold text-red-800 mb-1">Reason for Hold</p>
            <p className="text-sm text-red-700 leading-relaxed">Antimicrobial residue result requires further review.</p>
          </div>
        </div>

        {/* Assessment summary */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 divide-y divide-[var(--color-border)]">
            {[
              { label: "Traceability",            ok: true,  note: "Complete"        },
              { label: "Withdrawal Verification", ok: true,  note: "Passed"          },
              { label: "Product Quality",         ok: true,  note: "Compliant"       },
              { label: "Microbiological Safety",  ok: true,  note: "Compliant"       },
              { label: "Antimicrobial Residue",   ok: false, note: "Review Required" },
            ].map((r) => (
              <CheckRow key={r.label} label={r.label} ok={r.ok} note={r.note} />
            ))}
          </div>
        </Card>

        {/* Required next step */}
        <Card>
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Required Next Step</p>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">
            Veterinary and regulatory review is required before this dispatch can proceed.
          </p>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="w-full">View Detailed Results</Button>
          <Button className="w-full" variant="outline">View Linked Treatment</Button>
          <button onClick={onBack} className="text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1 text-center transition-colors">
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}
