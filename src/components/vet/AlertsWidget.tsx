import * as React from "react";
import { TriangleAlert, BellOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ListWidget } from "./ListWidget";

interface Alert {
  id: string;
  farm: string;
  animal_flock: string;
  drug: string;
  administered_at: string;
  badge: string;
}

interface AlertsWidgetProps {
  alerts: Alert[];
  onReviewClick?: (caseId: string, actionText: string) => void;
}

export function AlertsWidget({ alerts = [], onReviewClick }: AlertsWidgetProps) {
  return (
    <ListWidget
      items={alerts}
      emptyIcon={BellOff}
      emptyText="No alerts"
      maxVisible={2}
      modalTitle="All Alerts"
      viewAllText={(count) => `View all ${count} alerts`}
      title={
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            ALERTS
          </div>
          {alerts.length > 0 && <Badge variant="unsigned_emergency">{alerts.length}</Badge>}
        </div>
      }
      renderItem={(alert, i, isModal, closeModal) => (
        <div key={alert.id} className="bg-[var(--status-high-bg)] border border-[var(--status-high-text)]/20 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 relative">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--status-high-text)] shrink-0">
              <TriangleAlert size={18} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-bold text-[var(--status-high-text)] text-sm">
                Emergency administration needs countersignature
              </div>
              <div className="text-xs text-[var(--status-high-text)]">
                {alert.farm} &middot; {alert.animal_flock}<br/>
                {alert.drug} &middot; administered {alert.administered_at}
              </div>
              <div className="mt-1">
                <Badge variant="unsigned_emergency" dot>
                  UNSIGNED EMERGENCY
                </Badge>
              </div>
            </div>
          </div>
          <button 
            className="text-[var(--status-high-text)] font-semibold text-xs hover:underline whitespace-nowrap self-start mt-2 md:mt-0 min-h-[44px] md:min-h-0 flex items-center"
            onClick={() => {
              if (isModal) closeModal();
              onReviewClick?.(alert.animal_flock, "Review & Countersign \u2192");
            }}
          >
            Review & Countersign &rarr;
          </button>
        </div>
      )}
    />
  );
}
