import * as React from "react";
import { Search, Milk, Beef, Egg, CircleHelp } from "lucide-react";
import { Select } from "@/components/ui/Select";

interface LabDispatchesFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedProduct: string;
  onProductChange: (id: string) => void;
  selectedStatus: string;
  onStatusChange: (id: string) => void;
  selectedRisk: string;
  onRiskChange: (id: string) => void;
}

const PRODUCT_FILTERS = [
  { id: "all", label: "All Dispatches", icon: null },
  { id: "milk", label: "Milk", icon: Milk },
  { id: "meat", label: "Meat", icon: Beef },
  { id: "eggs", label: "Eggs", icon: Egg },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "awaiting_receipt", label: "Awaiting Receipt" },
  { value: "ready_for_testing", label: "Ready for Testing" },
  { value: "in_progress", label: "Testing in Progress" },
  { value: "awaiting_verification", label: "Awaiting Verification" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

const RISK_OPTIONS = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

export function LabDispatchesFilterBar({
  searchQuery,
  onSearchChange,
  selectedProduct,
  onProductChange,
  selectedStatus,
  onStatusChange,
  selectedRisk,
  onRiskChange,
}: LabDispatchesFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-[var(--color-text-muted)]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Dispatch ID, Sample ID, Farm or Animal/Flock ID"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide gap-2">
          {PRODUCT_FILTERS.map((opt) => {
            const isActive = selectedProduct === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => onProductChange(opt.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold transition-colors shrink-0
                  ${isActive 
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" 
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  }`}
              >
                {Icon && <Icon size={16} />}
                {opt.label}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-40">
            <Select 
              value={selectedStatus} 
              onChange={onStatusChange} 
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-40">
            <Select 
              value={selectedRisk} 
              onChange={onRiskChange} 
              options={RISK_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
