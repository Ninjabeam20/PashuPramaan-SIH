import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

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
    <Card className="flex flex-col p-5 md:p-6 h-full">
      <h3 className="font-bold text-[var(--color-text)] mb-6">Recent treatment outcomes</h3>
      
      <div className="flex flex-col divide-y divide-[var(--color-border)] -my-4">
        {outcomes.map((item, i) => (
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
        ))}
      </div>
    </Card>
  );
}
