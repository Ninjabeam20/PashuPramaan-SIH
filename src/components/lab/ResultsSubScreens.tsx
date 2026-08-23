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
            {(item.tests || []).map((t) => (
              <CheckRow key={t.label} label={t.label} ok={t.ok} note={t.result} />
            ))}
          </div>
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
  item: any;
  onViewAssessment: () => void;
  onBack: () => void;
  onReleased: () => void;
  onHold: () => void;
}

export function VerificationScreen({ item, onViewAssessment, onBack, onReleased, onHold }: VerificationProps) {
  const [loading, setLoading] = React.useState(false);

  const handleVerify = async (action: "RELEASE" | "HOLD") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`http://localhost:8000/api/lab/results/${item.id}/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        if (action === "RELEASE") onReleased();
        else onHold();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] mt-3">Final Verification</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.id} · {item.product}</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-28 max-w-2xl mx-auto w-full flex flex-col items-center">
        <Badge variant="amber" className="mb-6 text-sm px-4 py-1.5">AWAITING VERIFICATION</Badge>

        <Card className="w-full mb-8 divide-y divide-[var(--color-border)] p-0">
          <div className="p-5">
            <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">Assessment Summary</h3>
            {(item.tests || []).map((t: any) => (
              <CheckRow key={t.label} label={t.label} ok={t.ok} note={t.result} />
            ))}
          </div>
          <div className="p-5 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={onViewAssessment}>Review Full Details</Button>
          </div>
        </Card>

        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed text-center max-w-md mb-8">
          Verify the assessment to finalize the laboratory report. The action is irreversible.
        </p>
        
        <div className="w-full flex gap-3">
          <Button variant="outline" className="flex-1 border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleVerify("HOLD")} disabled={loading}>
            Place On Hold
          </Button>
          <Button className="flex-1 bg-[var(--color-primary)]" onClick={() => handleVerify("RELEASE")} disabled={loading}>
            Approve / Release
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Released screen ───────────────────────────────────────────────── */

interface ReleasedProps {
  item: any;
  /** Navigates to /lab/reports — this is the onOpenReport callback from the source App.tsx */
  onReport: () => void;
  onDispatch: () => void;
  onBack: () => void;
}

export function ReleasedScreen({ item, onReport, onDispatch, onBack }: ReleasedProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] mt-3">Dispatch Eligible for Release</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 max-w-md mx-auto w-full space-y-5">
        <div className="flex flex-col items-center py-4">
          <div className="w-16 h-16 rounded-full bg-[var(--status-good-bg)] flex items-center justify-center mb-4">
            <Check size={32} strokeWidth={3} className="text-[var(--status-good-text)]" />
          </div>
          <Badge variant="good" className="text-sm px-4 py-1.5">CLEARED FOR DISPATCH</Badge>
        </div>

        <Card>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {[
              { l: "Dispatch ID", v: item.id, primary: true  },
              { l: "Sample ID",   v: item.sample,  primary: true  },
              { l: "Product",     v: item.product,        primary: false },
              { l: "Source",      v: item.source, primary: false },
            ].map(({ l, v, primary }) => (
              <div key={l}>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">{l}</p>
                <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 divide-y divide-[var(--color-border)]">
            {(item.tests || []).map((t: any) => (
              <CheckRow key={t.label} label={t.label} ok={t.ok} note={t.result} />
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Button className="w-full bg-[var(--color-primary)]" onClick={onReport}>View Official Report</Button>
          <Button className="w-full" variant="outline" onClick={onDispatch}>Go to Dispatch Details</Button>
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
  item: any;
  onBack: () => void;
}

export function HoldScreen({ item, onBack }: HoldProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <BackButton label="Back to Results" onClick={onBack} />
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Dispatch On Hold</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{item.id} · {item.sample}</p>
          </div>
          <Badge variant="red">ON HOLD</Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 max-w-md mx-auto w-full space-y-5">
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 divide-y divide-[var(--color-border)]">
            {(item.tests || []).map((t: any) => (
              <CheckRow key={t.label} label={t.label} ok={t.ok} note={t.result} />
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Required Next Step</p>
          <p className="text-sm text-[var(--color-text)] leading-relaxed">
            Veterinary and regulatory review is required before this dispatch can proceed.
          </p>
        </Card>

        <div className="flex flex-col gap-3 mt-4">
          <button onClick={onBack} className="text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1 text-center transition-colors">
            Back to Results
          </button>
        </div>
      </div>
    </div>
  );
}
