import * as React from "react";
import { Activity } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { ListWidget } from "./ListWidget";

interface OutcomeItem {
  animal_flock: string;
  diagnosis: string;
  detail: string;
  outcome_badge: {
    text: string;
    variant: string;
  };
}

export function RecentOutcomes({ outcomes }: { outcomes: OutcomeItem[] }) {
  return (
    <ListWidget
      items={outcomes}
      emptyIcon={Activity}
      emptyText="No recent outcomes"
      maxVisible={4}
      modalTitle="All Recent Treatment Outcomes"
      viewAllText={(count) => `View all ${count} outcomes`}
      containerClassName="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm"
      listClassName="px-5 pb-5 md:px-6 md:pb-6 flex flex-col divide-y divide-[var(--color-border)] flex-1"
      modalListClassName="px-6 py-1 overflow-y-auto flex-1 flex flex-col divide-y divide-[var(--color-border)]"
      title={
        <div className="px-5 pt-5 pb-2 md:px-6 md:pt-6">
          <h3 className="font-bold text-[var(--color-text)]">Recent treatment outcomes</h3>
        </div>
      }
      renderItem={(item, i) => (
        <div key={i} className="py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="text-sm text-[var(--color-text)]">
              <span className="font-bold">{item.animal_flock}</span> - {item.diagnosis}
            </div>
            {item.detail && (
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.detail}</div>
            )}
          </div>
          <div className="shrink-0">
            <Badge variant={item.outcome_badge.variant as BadgeVariant}>
              {item.outcome_badge.text}
            </Badge>
          </div>
        </div>
      )}
    />
  );
}
