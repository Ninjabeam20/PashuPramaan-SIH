import * as React from "react";
import { Button } from "@/components/ui/Button";

interface FarmStatSummaryProps {
  stats: {
    total_animals: number;
    cows_count: number;
    buffaloes_count: number;
    goats_count: number;
    under_treatment_count: number;
  };
  onAddClick?: () => void;
}

export function FarmStatSummary({ stats, onAddClick }: FarmStatSummaryProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full lg:w-auto flex-1 md:divide-x md:divide-[var(--color-border)] gap-y-6 md:gap-y-0">
        <div className="flex flex-col pr-4">
          <div className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-1">{stats.total_animals}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Total Animals</div>
        </div>
        <div className="flex flex-col md:px-4 pl-4 md:pl-4 border-l border-[var(--color-border)] md:border-l-0">
          <div className="text-3xl sm:text-4xl font-bold text-[#358a6f] mb-1">{stats.cows_count}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Cows</div>
        </div>
        <div className="flex flex-col pr-4 sm:px-4 sm:border-l sm:border-[var(--color-border)] md:border-l-0">
          <div className="text-3xl sm:text-4xl font-bold text-[#358a6f] mb-1">{stats.buffaloes_count}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Buffaloes</div>
        </div>
        <div className="flex flex-col px-4 pl-4 sm:border-l-0 md:border-l border-l border-[var(--color-border)]">
          <div className="text-3xl sm:text-4xl font-bold text-[#358a6f] mb-1">{stats.goats_count}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Goats</div>
        </div>
        <div className="flex flex-col pr-4 sm:px-4 sm:border-l sm:border-[var(--color-border)] col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
          <div className="text-3xl sm:text-4xl font-bold text-[#d97706] mb-1">{stats.under_treatment_count}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Under Treatment</div>
        </div>
      </div>
      
      <div className="w-full lg:w-auto shrink-0">
        <Button 
          className="w-full lg:w-auto bg-[#f47b59] hover:bg-[#e46a4d] text-white border-none gap-2 font-bold min-h-[44px]"
          onClick={onAddClick}
        >
          <span className="text-lg leading-none">+</span> Add Animal
        </Button>
      </div>
    </div>
  );
}
