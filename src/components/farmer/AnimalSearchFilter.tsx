import * as React from "react";
import { Search } from "lucide-react";

export type AnimalFilter = "All" | "Cows" | "Buffaloes" | "Goats" | "Under Treatment";

interface AnimalSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFilter: AnimalFilter;
  setSelectedFilter: (val: AnimalFilter) => void;
}

export function AnimalSearchFilter({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }: AnimalSearchFilterProps) {
  const filters: AnimalFilter[] = ["All", "Cows", "Buffaloes", "Goats", "Under Treatment"];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-[var(--color-border)]">
      <div className="relative w-full lg:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search by animal ID"
          className="block w-full pl-9 pr-3 py-2.5 min-h-[44px] border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow placeholder:text-[var(--color-text-muted)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-md border transition-colors ${
                isActive 
                  ? "bg-[#e2ead8] text-[#358a6f] border-[#e2ead8]" 
                  : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
