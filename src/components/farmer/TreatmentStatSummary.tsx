import * as React from "react";

interface TreatmentStatSummaryProps {
  stats: {
    active_treatments: number;
    withdrawal_ongoing: number;
    awaiting_vet_unsigned: number;
    completed: number;
  };
}

export function TreatmentStatSummary({ stats }: TreatmentStatSummaryProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full flex-1 md:divide-x md:divide-[var(--color-border)] gap-y-6 md:gap-y-0">
        
        <div className="flex flex-col pr-4 sm:pr-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e2ead8] text-[#557b4f] flex items-center justify-center font-bold text-lg">
              {stats.active_treatments}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Active Treatments</div>
          </div>
        </div>

        <div className="flex flex-col pl-4 sm:px-6 border-l border-[var(--color-border)] md:border-l-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#faecd1] text-[#b67a28] flex items-center justify-center font-bold text-lg">
              {stats.withdrawal_ongoing}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Withdrawal Ongoing</div>
          </div>
        </div>

        <div className="flex flex-col pr-4 sm:px-6 border-t md:border-t-0 border-[var(--color-border)] pt-4 md:pt-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f3e8ff] text-[#7c3aed] flex items-center justify-center font-bold text-lg">
              {stats.awaiting_vet_unsigned}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Awaiting Vet / Unsigned</div>
          </div>
        </div>

        <div className="flex flex-col pl-4 sm:px-6 border-t md:border-t-0 border-l border-[var(--color-border)] pt-4 md:pt-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-muted)] flex items-center justify-center font-bold text-lg border border-[var(--color-border)]/50">
              {stats.completed}
            </div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Completed</div>
          </div>
        </div>

      </div>
    </div>
  );
}
