import * as React from "react";
import { Search } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface PrescriptionsFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedFilter: string;
  onFilterChange: (id: string) => void;
  filterOptions: FilterOption[];
}

export function PrescriptionsFilterBar({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filterOptions
}: PrescriptionsFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Search Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-[var(--color-text-muted)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prescriptions..."
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar gap-2">
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors shrink-0
                ${isActive 
                  ? "bg-[#2d4b29] text-white border-[#2d4b29]" 
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                }`}
            >
              {opt.label}
              <span 
                className={`flex items-center justify-center min-w-[20px] h-[20px] rounded-full text-[10px] px-1.5
                  ${isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                  }`}
              >
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
