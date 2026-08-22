import * as React from "react";
import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";

export type TreatmentFilter = "All" | "Active" | "Withdrawal" | "Completed" | "Unsigned";

interface TreatmentSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFilter: TreatmentFilter;
  setSelectedFilter: (val: TreatmentFilter) => void;
  speciesFilter: string;
  setSpeciesFilter: (val: string) => void;
}

export function TreatmentSearchFilter({ 
  searchQuery, 
  setSearchQuery, 
  selectedFilter, 
  setSelectedFilter,
  speciesFilter,
  setSpeciesFilter
}: TreatmentSearchFilterProps) {
  const filters: TreatmentFilter[] = ["All", "Active", "Withdrawal", "Completed", "Unsigned"];

  const speciesOptions = [
    { label: "All Species", value: "All" },
    { label: "Cow", value: "Cow" },
    { label: "Buffalo", value: "Buffalo" },
    { label: "Goat", value: "Goat" },
    { label: "Poultry", value: "Poultry" }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-[var(--color-border)]">
      
      {/* Search Input */}
      <div className="relative w-full lg:max-w-xs shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search by animal or medicine"
          className="block w-full pl-9 pr-3 py-2.5 min-h-[44px] border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow placeholder:text-[var(--color-text-muted)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        {/* Pill Filters */}
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

        {/* Species Select */}
        <div className="w-full sm:w-40 shrink-0">
          <Select 
            options={speciesOptions}
            value={speciesFilter}
            onChange={setSpeciesFilter}
          />
        </div>
      </div>
    </div>
  );
}
