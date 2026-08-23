import * as React from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { WithdrawalRibbon } from "./WithdrawalRibbon";
import { TreatmentTimeline } from "./TreatmentTimeline";
import { getTreatmentDetail } from "@/lib/api/dummy/treatments";

interface TreatmentDetailPanelProps {
  treatmentId: string;
  onClose: () => void;
}

export function TreatmentDetailPanel({ treatmentId, onClose }: TreatmentDetailPanelProps) {
  // Handle outside click to close
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["treatment-detail", treatmentId],
    queryFn: () => getTreatmentDetail(treatmentId)
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex sm:justify-end bg-black/20 backdrop-blur-sm justify-end sm:items-stretch items-end"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[var(--color-surface)] w-full sm:w-[560px] h-[85vh] sm:h-full flex flex-col shadow-2xl rounded-t-2xl sm:rounded-none animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
      >
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-none rounded-t-2xl px-6 pt-6 pb-4 border-b border-[var(--color-border)] flex justify-between items-start shrink-0">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Treatment Detail
            </div>
            {detail ? (
              <h2 className="text-2xl font-bold font-display text-[var(--color-text)]">
                {detail.animal_id} &middot; {detail.species}
              </h2>
            ) : (
              <div className="h-8 w-48 bg-[var(--color-border)] animate-pulse rounded" />
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-8 pb-12">
          
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="h-6 w-32 bg-[var(--color-border)] rounded" />
              <div className="grid grid-cols-2 gap-6">
                <div className="h-10 bg-[var(--color-border)] rounded" />
                <div className="h-10 bg-[var(--color-border)] rounded" />
              </div>
            </div>
          ) : isError || !detail ? (
            <div className="py-12 flex items-center justify-center text-red-500">
              Error loading details.
            </div>
          ) : (
            <>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {(detail.status_badges || []).map((badge, idx) => (
                  <Badge key={idx} variant={badge.variant as BadgeVariant}>
                    {badge.text}
                  </Badge>
                ))}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Medicine
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.medicine}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Route
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.route}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Dose
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.dose}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Administered
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.administered_at}
                  </div>
                </div>

                <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Reason
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.reason}
                  </div>
                </div>
              </div>

              {/* Withdrawal Period Card */}
              {detail.withdrawal && (
                <div className="bg-[#faecd1]/30 border border-[#faecd1] rounded-xl p-5 flex flex-col gap-2">
                  <div className="text-[10px] font-bold tracking-widest text-[#b67a28] uppercase mb-1">
                    Withdrawal Period
                  </div>
                  <WithdrawalRibbon 
                    doseTime={detail.withdrawal.dose_time}
                    nowPct={detail.withdrawal.now_pct}
                    clearLabel={detail.withdrawal.clear_label}
                    productMessage={detail.withdrawal.product_message}
                  />
                </div>
              )}

              {/* Timeline */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  Timeline
                </div>
                <TreatmentTimeline steps={detail.timeline || []} />
              </div>
            </>
          )}

        </div>
        
      </div>
    </div>
  );
}
