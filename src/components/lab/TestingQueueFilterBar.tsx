import * as React from "react";
import { Milk, Beef, Egg } from "lucide-react";

export type TestingQueueTab = "awaiting" | "ready";

interface TestingQueueFilterBarProps {
  activeTab: TestingQueueTab;
  onTabChange: (tab: TestingQueueTab) => void;
  productFilter: string;
  onProductChange: (product: string) => void;
  awaitingCount: number;
  readyCount: number;
}

const PRODUCT_FILTERS = [
  { id: "all", label: "All Products", icon: null },
  { id: "milk", label: "Milk", icon: Milk },
  { id: "meat", label: "Meat", icon: Beef },
  { id: "eggs", label: "Eggs", icon: Egg },
];

export function TestingQueueFilterBar({
  activeTab,
  onTabChange,
  productFilter,
  onProductChange,
  awaitingCount,
  readyCount,
}: TestingQueueFilterBarProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-b-none overflow-hidden mb-4 md:mb-0 shadow-sm z-20">
      {/* Tabs */}
      <div className="flex px-2 md:px-4 gap-1 pt-2 border-b border-[var(--color-border)]">
        {[
          { id: "awaiting" as TestingQueueTab, label: "Awaiting Receipt", count: awaitingCount },
          { id: "ready" as TestingQueueTab, label: "Ready for Testing", count: readyCount },
        ].map(({ id, label, count }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-semibold transition-colors border-b-2 -mb-px ${
                isActive
                  ? "text-[var(--color-primary-dark)] border-[var(--color-primary)] bg-[var(--color-bg)]"
                  : "text-[var(--color-text-muted)] border-transparent hover:bg-[var(--color-bg)]"
              }`}
            >
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {PRODUCT_FILTERS.map((f) => {
          const isActive = productFilter === f.id;
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              onClick={() => onProductChange(f.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border shrink-0 ${
                isActive
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {Icon && <Icon size={14} />}
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
