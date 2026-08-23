import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { WithdrawalRibbon } from "./WithdrawalRibbon";
import { TreatmentItem } from "@/lib/api/dummy/treatments";

export function TreatmentList({ treatments, onViewAction }: { treatments: TreatmentItem[], onViewAction?: (id: string) => void }) {
  const safeTreatments = treatments || [];
  if (safeTreatments.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
        No treatments found matching your filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[var(--color-border)]">
      {safeTreatments.map((treatment) => (
        <TreatmentRow key={treatment.id} treatment={treatment} onViewAction={onViewAction} />
      ))}
    </div>
  );
}

function TreatmentRow({ treatment, onViewAction }: { treatment: TreatmentItem, onViewAction?: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 hover:bg-[var(--color-bg)] transition-colors">
      
      {/* Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center flex-wrap gap-2 text-sm">
            <span className="font-bold text-[var(--color-text)]">{treatment.animal_flock}</span>
            <span className="text-[var(--color-text-muted)]">&middot;</span>
            <span className="text-[var(--color-text-muted)]">{treatment.species}</span>
            {treatment.feed_batch && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#f2e2d0]/50 text-[#a47b53]">
                {treatment.feed_batch}
              </span>
            )}
          </div>
          
          {/* Drug Line */}
          <div className="text-sm">
            <span className="font-bold text-[var(--color-text)]">{treatment.drug_name}</span>
            <span className="text-[var(--color-text-muted)] mx-1">&middot;</span>
            <span className="text-[var(--color-text-muted)]">{treatment.route_dosage}</span>
          </div>
          
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {treatment.administered_time}
          </div>
        </div>

        {/* Badges Stack */}
        <div className="flex sm:flex-col flex-wrap sm:items-end gap-2 shrink-0">
          {(treatment.badges || []).map((badge, idx) => (
            <Badge key={idx} variant={badge.variant as BadgeVariant}>
              {badge.text}
            </Badge>
          ))}
        </div>
      </div>

      {/* Withdrawal Ribbon (if active) */}
      {treatment.withdrawal && treatment.status === "Withdrawal" && (
        <div className="mt-2 w-full sm:w-2/3">
          <WithdrawalRibbon 
            doseTime={treatment.withdrawal.dose_time}
            nowPct={treatment.withdrawal.now_pct}
            clearLabel={treatment.withdrawal.clear_label}
            productMessage={treatment.withdrawal.product_message}
          />
        </div>
      )}

      {/* View Details Link */}
      <div className="flex justify-end mt-2">
        <button 
          className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center min-h-[44px] sm:min-h-0"
          onClick={() => onViewAction?.(treatment.id)}
        >
          View details &rarr;
        </button>
      </div>

    </div>
  );
}
