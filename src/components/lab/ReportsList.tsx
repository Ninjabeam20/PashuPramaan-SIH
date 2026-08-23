import * as React from "react";
import { Milk, Beef, Egg, Check, AlertTriangle } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LabReport, ReportsSummary } from "@/lib/api/dummy/lab-reports";

const DATE_RANGES = ["All Dates", "Today", "This Week", "This Month"];
const PRODUCT_FILTERS = ["All Products", "Milk", "Meat", "Eggs"];
const STATUS_FILTERS = ["All", "Cleared", "On Hold", "Awaiting"];

const DOT_COLOR: Record<string, string> = {
  neutral: "bg-[var(--color-text-muted)]",
  green:   "bg-[var(--status-good-text)]",
  red:     "bg-[var(--status-high-text)]",
  amber:   "bg-amber-500",
};

interface ReportsListProps {
  reports: LabReport[];
  summary: ReportsSummary[];
  dateFilter: string;
  onDateFilterChange: (v: string) => void;
  productFilter: string;
  onProductFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onOpen: (r: LabReport) => void;
}

export function ReportsList({
  reports,
  summary,
  dateFilter,
  onDateFilterChange,
  productFilter,
  onProductFilterChange,
  statusFilter,
  onStatusFilterChange,
  onOpen,
}: ReportsListProps) {
  return (
    <div className="space-y-0">
      {/* Summary strip — sits flush under the header filter bar on desktop */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl md:rounded-b-none mb-4 md:mb-0 shadow-sm overflow-hidden">
        {summary.map(({ v, l, color }) => (
          <div key={l} className="flex-1 py-3.5 text-center border-r border-[var(--color-border)] last:border-0">
            <p className="font-display text-xl font-bold text-[var(--color-text)] leading-none">{v}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[color]}`} />
              <p className="text-[10px] font-semibold tracking-wider text-[var(--color-text-muted)] uppercase">{l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter chips + product toggles */}
      <div className="bg-[var(--color-surface)] md:rounded-none border border-[var(--color-border)] md:border-t-0 rounded-2xl md:rounded-b-2xl overflow-hidden mb-6 md:mb-0 shadow-sm">
        {/* Date + product filter strip */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-[var(--color-border)]">
          {DATE_RANGES.map((f) => (
            <button
              key={f}
              onClick={() => onDateFilterChange(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                dateFilter === f
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="w-px self-stretch bg-[var(--color-border)] mx-1 shrink-0" />
          {PRODUCT_FILTERS.slice(1).map((f) => (
            <button
              key={f}
              onClick={() => onProductFilterChange(productFilter === f ? "All Products" : f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                productFilter === f
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Status chips */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => onStatusFilterChange(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusFilter === f
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Report cards grid */}
      {reports.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-text-muted)] mt-6">
          No reports match your current filters.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-5 hover:shadow-md transition-shadow">
              {/* Card header */}
              <div className="flex items-start justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <div>
                  <p className="text-sm font-bold text-[var(--color-primary)]">{r.id}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{r.product} · {r.source}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{r.date}</p>
                </div>
                <Badge variant={r.statusColor as BadgeVariant} className="shrink-0 ml-2">{r.status}</Badge>
              </div>

              {/* MRL preview mini-bar */}
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[var(--color-text-muted)]">MRL · {r.mrl.drug}</p>
                  <span className={`text-xs font-bold ${r.mrl.verdictOk ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                    {r.mrl.measured}/{r.mrl.limit} {r.mrl.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.mrl.verdictOk ? "bg-[var(--color-primary)]" : "bg-red-500"}`}
                    style={{ width: `${Math.min(r.mrl.ratio * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-xs font-bold mt-1.5 ${r.mrl.verdictOk ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                  {(r.mrl.ratio * 100).toFixed(0)}% of MRL · {r.mrl.verdict}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                <p className="text-xs text-[var(--color-text-muted)]">Ref: {r.refNo}</p>
                <button
                  onClick={() => onOpen(r)}
                  className="text-sm font-bold text-[var(--color-primary)] hover:underline transition-colors"
                >
                  View Report →
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
