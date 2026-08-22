import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCaseDetail } from "@/lib/api/dummy/vet-case-detail";

interface CaseDetailModalProps {
  caseId: string;
  actionText: string;
  onClose: () => void;
}

export function CaseDetailModal({ caseId, actionText, onClose }: CaseDetailModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["case-detail", caseId],
    queryFn: () => getCaseDetail(caseId),
  });

  // Handle outside click to close
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Prevent background scrolling when open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Determine button state from actionText
  // Action text might include an arrow (e.g., "Review & Sign \u2192")
  const cleanActionText = actionText.replace(/[\u2192\u2190]/g, "").trim();
  const isSignAction = cleanActionText.includes("Sign") || cleanActionText.includes("Countersign");
  const showPrimaryAction = cleanActionText !== "View" && cleanActionText !== "Close";

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[512px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-200">
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-3 border-b border-[var(--color-border)] flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            {isLoading ? (
              <>
                <div className="h-3 w-16 bg-[var(--color-border)] animate-pulse rounded mb-1" />
                <div className="h-6 w-40 bg-[var(--color-border)] animate-pulse rounded" />
              </>
            ) : (
              <>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-0.5">
                  {data?.label}
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {data?.title}
                </h2>
              </>
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
        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2"><div className="h-3 w-20 bg-[var(--color-border)] animate-pulse rounded"/><div className="h-4 w-32 bg-[var(--color-border)] animate-pulse rounded"/></div>
                <div className="flex-1 space-y-2"><div className="h-3 w-16 bg-[var(--color-border)] animate-pulse rounded"/><div className="h-4 w-24 bg-[var(--color-border)] animate-pulse rounded"/></div>
              </div>
              <div className="h-10 w-full bg-[var(--color-border)] animate-pulse rounded" />
              <div className="h-24 w-full bg-[var(--color-border)] animate-pulse rounded" />
            </div>
          ) : isError || !data ? (
            <div className="text-red-500 py-4">Failed to load case details.</div>
          ) : (
            <>
              {/* Animal & Farm */}
              <div className="flex gap-4 sm:gap-8">
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] text-[var(--color-text-muted)] mb-1">Animal / Flock</div>
                  <div className="font-bold text-sm text-[var(--color-text)]">{data.animal.id}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{data.animal.species_type}</div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] text-[var(--color-text-muted)] mb-1">Farm</div>
                  <div className="font-bold text-sm text-[var(--color-text)]">{data.farm_name}</div>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <div className="text-[10px] text-[var(--color-text-muted)]">Status</div>
                <div className="flex flex-wrap gap-2">
                  {data.status_badges.map((b, i) => (
                    <Badge key={i} variant={b.variant as BadgeVariant} dot={b.dot}>
                      {b.text}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Linked Health Event */}
              {data.health_event && (
                <div className="bg-[#FAF8F3] border border-[var(--color-border)] rounded-lg p-4 flex flex-col">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                    LINKED HEALTH EVENT
                  </div>
                  <div className="font-bold text-sm text-[var(--color-text)]">
                    {data.health_event.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Onset: {data.health_event.onset}
                  </div>
                </div>
              )}

              {/* Prescription */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  PRESCRIPTION
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Drug</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.drug}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Route</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.route}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Dose</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.dose}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Frequency</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.frequency}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Duration</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.duration}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[10px] text-[var(--color-text-muted)]">Reason</div>
                    <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.reason}</div>
                  </div>
                </div>
              </div>

              {/* Stewardship */}
              {data.stewardship && (data.stewardship.aware_badge || data.stewardship.cia_badge) && (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    STEWARDSHIP
                  </div>
                  <div className="flex gap-4">
                    {data.stewardship.aware_badge && (
                      <div className="bg-[var(--color-bg)] rounded-lg p-2 flex flex-col gap-1 items-center min-w-[70px]">
                        <span className="text-[10px] text-[var(--color-text-muted)]">AWaRe</span>
                        <Badge variant={data.stewardship.aware_badge.variant as BadgeVariant}>
                          {data.stewardship.aware_badge.text}
                        </Badge>
                      </div>
                    )}
                    {data.stewardship.cia_badge && (
                      <div className="bg-[var(--color-bg)] rounded-lg p-2 flex flex-col gap-1 items-center min-w-[70px]">
                        <span className="text-[10px] text-[var(--color-text-muted)]">CIA</span>
                        <Badge variant={data.stewardship.cia_badge.variant as BadgeVariant}>
                          {data.stewardship.cia_badge.text}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Treatment History */}
              {data.treatment_history && (
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    TREATMENT HISTORY
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]">
                      <div className="text-sm text-[var(--color-text-muted)]">
                        Previous episode
                      </div>
                      <Badge variant={data.treatment_history.outcome_badge.variant as BadgeVariant}>
                        {data.treatment_history.outcome_badge.text}
                      </Badge>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">
                      Treatment completed &middot; {data.treatment_history.completed_date}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex gap-3 shrink-0 pb-safe sm:pb-4">
          {showPrimaryAction && (
            <Button 
              className={`flex-1 min-h-[44px] ${isSignAction ? 'bg-[var(--color-accent-vet)] hover:bg-[#c25d31] border-none text-white' : ''}`} 
              onClick={() => {
                console.log(`Action: ${cleanActionText} on case: ${caseId}`);
              }}
              disabled={isLoading}
            >
              {cleanActionText}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
      </div>
    </div>
  );
}
