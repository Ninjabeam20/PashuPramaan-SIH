import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface EmergencyAlertBannerProps {
  alert: {
    farm: string;
    animal_flock: string;
    drug: string;
    administered_at: string;
    badge: string;
  };
  onReviewClick?: (caseId: string, actionText: string) => void;
}

export function EmergencyAlertBanner({ alert, onReviewClick }: EmergencyAlertBannerProps) {
  if (!alert) return null;

  return (
    <div className="bg-[var(--status-high-bg)] border border-[var(--status-high-text)]/20 rounded-xl p-4 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 relative">
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
        onClick={() => onReviewClick?.(alert.animal_flock, "Review & Countersign \u2192")}
      >
        Review & Countersign &rarr;
      </button>
    </div>
  );
}
