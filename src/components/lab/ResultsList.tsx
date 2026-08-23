import * as React from "react";
import { Search } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LabResult } from "@/lib/api/dummy/lab-results";

const STATUS_FILTERS = ["All", "Awaiting Verification", "Verified", "Released", "On Hold"];

interface ResultsListProps {
  results: LabResult[];
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  onOpen: (item: LabResult) => void;
}

export function ResultsList({
  results,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onOpen,
}: ResultsListProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dispatch ID, sample or farm…"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
        />
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-[var(--color-text-muted)] -mt-2">{results.length} result{results.length !== 1 ? "s" : ""}</p>

      {/* Cards */}
      {results.length === 0 ? (
        <div className="text-center py-16 text-sm text-[var(--color-text-muted)]">
          No results found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(results || []).map((item) => (
            <Card key={item.id} className="p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <div>
                  <p className="text-sm font-bold text-[var(--color-primary)]">{item.id}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.product} · {item.source}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Sample: <span className="font-semibold text-[var(--color-text)]">{item.sample}</span>
                  </p>
                </div>
                <Badge variant={item.statusColor as BadgeVariant} className="shrink-0 ml-2">
                  {item.status}
                </Badge>
              </div>

              {/* Test results inline */}
              <div className="space-y-2 mb-4">
                {(item.tests || []).map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-muted)]">{t.label}</p>
                    <span className={`text-xs font-bold ${t.ok ? "text-[var(--status-good-text)]" : "text-[var(--status-high-text)]"}`}>
                      {t.ok ? "✓" : "!"} {t.result}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="border-t border-[var(--color-border)] pt-3 flex justify-end">
                <button
                  onClick={() => onOpen(item)}
                  className="text-sm font-bold text-[var(--color-primary)] hover:underline transition-colors"
                >
                  {item.action}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
