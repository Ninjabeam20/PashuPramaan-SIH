"use client";

import * as React from "react";
import { ArrowLeft, Check, AlertTriangle, ChevronDown, ChevronUp, Printer, Download, Share2 } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LabReport } from "@/lib/api/dummy/lab-reports";

/* ─── Shared helper ────────────────────────────────────────────────── */

function AssessmentIcon({ ok }: { ok: boolean }) {
  return (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-[var(--status-good-bg)]" : "bg-[var(--status-high-bg)]"}`}>
      {ok
        ? <Check size={11} strokeWidth={3} className="text-[var(--status-good-text)]" />
        : <AlertTriangle size={11} strokeWidth={2.5} className="text-[var(--status-high-text)]" />}
    </span>
  );
}

/* ─── Report Detail (official document view) ────────────────────────── */

interface ReportDetailProps {
  report: LabReport;
  onBack: () => void;
}

export function ReportDetail({ report, onBack }: ReportDetailProps) {
  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 sticky top-0 z-20 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-3"
        >
          <ArrowLeft size={14} />
          Back to Reports
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              Laboratory Assessment Report
            </p>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">{report.id}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{report.product} · {report.source}</p>
          </div>
          <Badge variant={report.statusColor as BadgeVariant}>{report.status}</Badge>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 max-w-2xl mx-auto w-full space-y-5">

        {/* Report identity grid */}
        <Card>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {[
              { l: "Dispatch ID",  v: report.id,          primary: true  },
              { l: "Sample ID",    v: report.sample,       primary: true  },
              { l: "Product",      v: report.productSub,   primary: false },
              { l: "Source",       v: report.source,       primary: false },
              { l: "Animal/Flock", v: report.animal,       primary: false },
              { l: "Ref. No.",     v: report.refNo,        primary: false },
              { l: "Date",         v: report.date,         primary: false },
              { l: "Verified By",  v: report.verifiedBy,   primary: false },
            ].map(({ l, v, primary }) => (
              <div key={l}>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">{l}</p>
                <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Antimicrobial treatment & withdrawal */}
        <Card>
          <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">
            Antimicrobial Treatment &amp; Withdrawal
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Drug</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">{report.withdrawal.drug}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Last Administered</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">{report.withdrawal.administered}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Withdrawal Completed</p>
              <p className="text-sm font-semibold text-[var(--color-text)]">{report.withdrawal.completed}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p>
              <p className={`text-sm font-bold ${report.withdrawal.status.includes("Completed") ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                {report.withdrawal.status}
              </p>
            </div>
          </div>
        </Card>

        {/* Assessment summary with expandable raw values */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">Assessment Summary</p>
            <div className="divide-y divide-[var(--color-border)]">
              {report.assessments.map((a) => (
                <div key={a.label} className="flex items-start justify-between py-3 gap-4">
                  <div className="flex items-center gap-3">
                    <AssessmentIcon ok={a.ok} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{a.label}</p>
                      {showRaw && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{a.detail}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${a.ok ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                    {a.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-5 py-3.5 border-t border-[var(--color-border)] text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors"
          >
            {showRaw ? "Hide" : "View"} Raw Test Values
            {showRaw ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </Card>

        {/* MRL Score Card */}
        <div className={`rounded-2xl border-2 px-5 py-5 ${report.mrl.verdictOk ? "border-[var(--color-primary)] bg-[var(--status-good-bg)]/20" : "border-red-300 bg-red-50"}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase">MRL Assessment</p>
            <Badge variant={report.mrl.verdictOk ? "good" : "red"}>{report.mrl.verdict}</Badge>
          </div>

          <p className="text-sm font-bold text-[var(--color-text)] mb-4">{report.mrl.drug}</p>

          {/* Visual MRL bar */}
          <div className="mb-4">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs text-[var(--color-text-muted)]">Measured</span>
              <span className="text-xs text-[var(--color-text-muted)]">MRL Limit</span>
            </div>
            <div className="relative h-3 bg-[var(--color-border)] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all ${report.mrl.verdictOk ? "bg-[var(--color-primary)]" : "bg-red-500"}`}
                style={{ width: `${Math.min(report.mrl.ratio * 100, 100)}%` }}
              />
              {/* MRL limit tick */}
              <div className="absolute top-0 right-0 h-full w-0.5 bg-[var(--color-text-muted)] opacity-50" />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-base font-bold ${report.mrl.verdictOk ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                {report.mrl.measured} {report.mrl.unit}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                Limit: {report.mrl.limit} {report.mrl.unit}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-text-muted)]">Measured / MRL ratio</span>
            <span className={`text-lg font-bold ${report.mrl.verdictOk ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
              {(report.mrl.ratio * 100).toFixed(0)}%
              <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">of limit</span>
            </span>
          </div>
        </div>

        {/* Final outcome */}
        <div className={`rounded-2xl px-5 py-4 flex items-center gap-4 ${report.outcomeOk ? "bg-[var(--status-good-bg)] border border-[var(--status-good-border)]" : "bg-red-50 border border-red-200"}`}>
          <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${report.outcomeOk ? "bg-[var(--color-primary)]" : "bg-red-700"}`}>
            {report.outcomeOk
              ? <Check size={20} strokeWidth={3} className="text-white" />
              : <AlertTriangle size={18} strokeWidth={2} className="text-white" />}
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Final Outcome</p>
            <p className={`font-display text-lg font-semibold ${report.outcomeOk ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
              {report.outcome}
            </p>
            {report.verifiedOn !== "—" && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Verified {report.verifiedOn}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document action bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-2.5 z-30 md:relative md:bottom-auto shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
          <Printer size={15} />
          Print
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <Download size={15} />
          Download
        </Button>
        <Button className="flex-1 gap-2">
          <Share2 size={15} />
          Share
        </Button>
      </div>
    </div>
  );
}
