import * as React from "react";
import { X, Beef } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WithdrawalRibbon } from "./WithdrawalRibbon";
import { getAnimalDetail } from "@/lib/api/dummy/animal-detail";

interface AnimalDetailModalProps {
  animalId: string;
  onClose: () => void;
}

export function AnimalDetailModal({ animalId, onClose }: AnimalDetailModalProps) {
  // Handle outside click to close
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["animal-detail", animalId],
    queryFn: () => getAnimalDetail(animalId)
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case "under_treatment": return "Under Treatment";
      case "healthy": return "Healthy";
      case "waiting": return "Waiting";
      default: return status;
    }
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "under_treatment": return "under_treatment";
      case "healthy": return "healthy";
      case "waiting": return "waiting";
      default: return "normal";
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[512px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-200">
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-4 border-b border-[var(--color-border)] flex justify-between items-start shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-[#557b4f] shadow-sm border border-[var(--color-border)]/50">
              {/* Using Beef as a fallback species icon, similar to AnimalTable */}
              <Beef size={24} />
            </div>
            
            <div className="flex flex-col">
              <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-0.5">
                Animal Details
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-display text-[var(--color-text)]">
                  {animalId}
                </h2>
                {detail && (
                  <Badge variant={getStatusVariant(detail.status)}>
                    {getStatusText(detail.status)}
                  </Badge>
                )}
              </div>
            </div>
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
            <div className="py-12 flex items-center justify-center text-[var(--color-text-muted)] animate-pulse">
              Loading animal details...
            </div>
          ) : isError || !detail ? (
            <div className="py-12 flex items-center justify-center text-red-500">
              Error loading details.
            </div>
          ) : (
            <>
              {/* Animal Information Section */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  ANIMAL INFORMATION
                </div>
                <div className="border border-[var(--color-border)] rounded-xl flex flex-col overflow-hidden text-sm">
                  
                  <div className="flex justify-between items-center p-3 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Breed</span>
                    <span className="font-bold text-[var(--color-text)]">{detail.breed}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Sex</span>
                    <span className="font-bold text-[var(--color-text)]">{detail.sex}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Date of Birth</span>
                    <span className="font-bold text-[var(--color-text)]">{detail.date_of_birth}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">Production Type</span>
                    <span className="font-bold text-[var(--color-text)]">{detail.production_type}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-[var(--color-text-muted)]">Registered On</span>
                    <span className="font-bold text-[var(--color-text)]">{detail.registered_on}</span>
                  </div>

                </div>
              </div>

              {/* Current Treatment Section (Conditional) */}
              {detail.current_treatment && (
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    CURRENT TREATMENT
                  </div>
                  <div className="bg-[#faecd1]/30 border border-[#faecd1] rounded-xl p-4 flex flex-col gap-1">
                    
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-[var(--color-text)]">{detail.current_treatment.drug}</span>
                      <Badge variant={detail.current_treatment.signed_badge.variant as BadgeVariant}>
                        {detail.current_treatment.signed_badge.text}
                      </Badge>
                    </div>

                    <div className="text-sm text-[var(--color-text-muted)]">
                      {detail.current_treatment.route} &middot; {detail.current_treatment.dosage}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {detail.current_treatment.administered_at}
                    </div>

                    {/* Conditional Withdrawal Ribbon */}
                    {detail.current_treatment.withdrawal && (
                      <div className="mt-4 pt-4 border-t border-[#faecd1]">
                        <div className="text-[10px] font-bold tracking-widest text-[#b67a28] uppercase mb-2">
                          WITHDRAWAL PERIOD
                        </div>
                        <WithdrawalRibbon 
                          doseTime={detail.current_treatment.withdrawal.dose_time}
                          nowPct={detail.current_treatment.withdrawal.now_pct}
                          clearLabel={detail.current_treatment.withdrawal.clear_label}
                          productMessage={detail.current_treatment.withdrawal.product_message}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex shrink-0 pb-safe sm:pb-4">
          <Button 
            className="flex-1 min-h-[44px] bg-[#f47b59] hover:bg-[#e46a4d] border-none text-white w-full" 
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
      </div>
    </div>
  );
}
