import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface WorkloadSummaryProps {
  workload: {
    awaiting_signature: number;
    unsigned_emergency: number;
    follow_up: number;
    stewardship_review: number;
    status: string;
  };
}

export function WorkloadSummary({ workload }: WorkloadSummaryProps) {
  return (
    <Card className="flex flex-col p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          YOUR WORKLOAD
        </div>
        {workload.status === "action_needed" && (
          <Badge variant="action_needed">ACTION NEEDED</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-2">
        <div className="flex flex-col">
          <div className="text-3xl font-bold text-[var(--color-accent-vet)] mb-1">{workload.awaiting_signature}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Awaiting signature</div>
        </div>
        <div className="flex flex-col border-l-2 border-[var(--color-border)] pl-3 md:pl-4">
          <div className="text-3xl font-bold text-[var(--status-high-text)] mb-1">{workload.unsigned_emergency}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Unsigned emergency</div>
        </div>
        <div className="flex flex-col border-l-0 md:border-l-2 border-[var(--color-border)] md:pl-4 pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
          <div className="text-3xl font-bold text-[var(--color-accent-vet)] mb-1">{workload.follow_up}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Follow-up</div>
        </div>
        <div className="flex flex-col border-l-2 border-[var(--color-border)] pl-3 md:pl-4 pt-4 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0">
          <div className="text-3xl font-bold text-[#7c3aed] mb-1">{workload.stewardship_review}</div>
          <div className="text-xs text-[var(--color-text-muted)] font-medium">Stewardship review</div>
        </div>
      </div>
    </Card>
  );
}
