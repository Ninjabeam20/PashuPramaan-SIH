import * as React from "react";
import { Check, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DispatchItem } from "@/lib/api/dummy/dispatch";

export function DispatchTable({ items, onViewAction }: { items: DispatchItem[], onViewAction?: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
        No dispatches found.
      </div>
    );
  }

  const getStatusBadge = (status: DispatchItem["status"] | "lab_pending") => {
    switch (status) {
      case "cleared":
        return (
          <Badge variant="cleared">
            <Check size={12} strokeWidth={3} />
            Cleared
          </Badge>
        );
      case "withdrawal":
        return (
          <Badge variant="withdrawal">
            <Hourglass size={12} strokeWidth={3} />
            Withdrawal
          </Badge>
        );
      case "blocked":
        return (
          <Badge variant="blocked">
            <div className="w-2 h-2 rounded-full bg-current" />
            Blocked
          </Badge>
        );
      case "lab_pending":
        return (
          <Badge variant="blocked" className="bg-amber-100 text-amber-800 border-amber-300">
            <Hourglass size={12} strokeWidth={3} />
            Lab Result Pending
          </Badge>
        );
    }
  };

  return (
    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden shadow-sm">
      {/* Desktop Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
        <div className="col-span-2">DISPATCH ID</div>
        <div className="col-span-2">PRODUCT</div>
        <div className="col-span-3">ANIMAL / FLOCK</div>
        <div className="col-span-2">DATE</div>
        <div className="col-span-3">STATUS</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {(items || []).map((item, idx) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 p-4 sm:px-5 sm:py-4 hover:bg-[var(--color-bg)] transition-colors items-start sm:items-center"
          >
            <div className="flex items-center justify-between w-full sm:w-auto sm:col-span-2">
              <span className="font-bold text-sm text-[var(--color-text)]">{item.id}</span>
              {/* Mobile only status */}
              <div className="sm:hidden">
                {getStatusBadge(item.status)}
              </div>
            </div>
            
            <div className="flex items-center sm:col-span-2 text-sm text-[var(--color-text-muted)]">
              {item.product}
            </div>

            <div className="flex items-center sm:col-span-3 text-sm text-[var(--color-text-muted)]">
              {item.animal_flock}
            </div>

            <div className="flex items-center sm:col-span-2 text-sm text-[var(--color-text-muted)]">
              {item.date}
            </div>

            <div className="hidden sm:flex items-center justify-between sm:col-span-3">
              {getStatusBadge(item.status)}
              <button 
                className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] min-h-[44px] sm:min-h-0 flex items-center"
                onClick={() => onViewAction?.(item.id)}
              >
                View &rarr;
              </button>
            </div>
            
            <div className="sm:hidden w-full flex justify-end border-t border-[var(--color-border)] pt-3 mt-2">
              <button 
                className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] min-h-[44px] flex items-center"
                onClick={() => onViewAction?.(item.id)}
              >
                View &rarr;
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
