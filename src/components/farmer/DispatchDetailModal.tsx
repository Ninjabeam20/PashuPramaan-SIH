import * as React from "react";
import { X, Check, Hourglass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDispatchDetail } from "@/lib/api/dummy/dispatch";
import { TreatmentTimeline } from "@/components/farmer/TreatmentTimeline";
import { Button } from "@/components/ui/Button";

interface DispatchDetailModalProps {
  dispatchId: string;
  onClose: () => void;
}

export function DispatchDetailModal({ dispatchId, onClose }: DispatchDetailModalProps) {
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["dispatch-detail", dispatchId],
    queryFn: () => getDispatchDetail(dispatchId)
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[480px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-200">
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-4 border-b border-[var(--color-border)] flex justify-between items-start shrink-0">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Dispatch Details
            </div>
            <h2 className="text-xl font-bold font-display text-[var(--color-text)]">
              {dispatchId}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-8">
          
          {isLoading ? (
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="grid grid-cols-2 gap-6">
                <div className="h-10 bg-[var(--color-border)] rounded" />
                <div className="h-10 bg-[var(--color-border)] rounded" />
              </div>
              <div className="h-24 bg-[var(--color-border)] rounded mt-4" />
            </div>
          ) : isError || !detail ? (
            <div className="py-12 flex items-center justify-center text-[var(--status-high-text)]">
              Error loading details.
            </div>
          ) : (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Product
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.product}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Animal / Flock
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.animal_flock}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Date
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm">
                    {detail.date}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                    Status
                  </div>
                  <div className="font-bold text-[var(--color-text)] text-sm capitalize">
                    {detail.status}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex flex-col gap-4">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  Timeline
                </div>
                <TreatmentTimeline steps={detail.timeline as any} />
              </div>

              {/* Conditional Section */}
              <div className="mt-2">
                {detail.status === "cleared" && detail.cleared_checklist && (
                  <div className="flex flex-col gap-3">
                    {detail.cleared_checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#358a6f] font-medium text-sm">
                        <Check size={16} strokeWidth={2.5} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {detail.status === "withdrawal" && detail.withdrawal_detail && (
                  <div className="bg-[#faecd1]/30 border border-[#faecd1] rounded-xl p-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[#b67a28] font-bold mb-1">
                      <Hourglass size={18} strokeWidth={2.5} />
                      Withdrawal Active
                    </div>
                    <div className="text-sm text-[#b67a28] font-medium">
                      {detail.withdrawal_detail.clears_label}
                    </div>
                  </div>
                )}

                {detail.status === "blocked" && detail.blocked_detail && (
                  <div className="bg-[#fce8e8]/50 border border-[#fce8e8] rounded-xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 text-[#c93f4e] font-bold mb-2">
                      <div className="w-4 h-4 rounded-full bg-[#c93f4e] flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      Dispatch Blocked
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {detail.blocked_detail.failed_gates.map((gate, i) => (
                        <div key={i} className="text-sm text-[#c93f4e]">
                          {gate.message}
                        </div>
                      ))}
                    </div>

                    {detail.blocked_detail.warnings && detail.blocked_detail.warnings.length > 0 && (
                      <>
                        <div className="w-full h-px bg-[#fce8e8] my-4" />
                        <div className="text-[10px] font-bold tracking-widest text-[#a85c65] uppercase mb-2">
                          Supporting Information
                        </div>
                        <div className="flex flex-col gap-2">
                          {detail.blocked_detail.warnings.map((warn, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-[#7c3aed]">
                              <span className="font-bold">{warn.icon}</span>
                              {warn.message}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex gap-3 shrink-0 pb-safe sm:pb-4 items-center">
          {detail?.status === "withdrawal" && (
            <Button 
              variant="outline" 
              className="min-h-[44px] bg-[var(--color-bg)] flex-1 text-[#358a6f]" 
              onClick={() => console.log(`View treatment: ${detail.withdrawal_detail?.treatment_id}`)}
            >
              View Treatment
            </Button>
          )}
          <Button 
            className="flex-1 min-h-[44px] bg-[#f47b59] hover:bg-[#e46a4d] border-none text-white"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
      </div>
    </div>
  );
}
