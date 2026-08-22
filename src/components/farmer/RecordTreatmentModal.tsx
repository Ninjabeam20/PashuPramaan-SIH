import * as React from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PrescriptionOption } from "@/lib/api/dummy/treatments";

interface AnimalItem {
  id: string;
  type: string;
}

interface RecordTreatmentModalProps {
  animals: AnimalItem[];
  prescriptions: PrescriptionOption[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function RecordTreatmentModal({ animals, prescriptions, onClose, onSubmit }: RecordTreatmentModalProps) {
  const [step, setStep] = React.useState(1);
  const [selectedAnimalIds, setSelectedAnimalIds] = React.useState<string[]>([]);
  const [selectedRxId, setSelectedRxId] = React.useState<string | null>(null);
  const [timing, setTiming] = React.useState<"now" | "backdated">("now");
  const [backdatedTime, setBackdatedTime] = React.useState("");

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

  const toggleAnimal = (id: string) => {
    setSelectedAnimalIds(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleFinalSubmit = () => {
    const rx = prescriptions.find(p => p.id === selectedRxId);
    onSubmit({
      animalIds: selectedAnimalIds,
      prescription: rx,
      timing,
      backdatedTime: timing === "backdated" ? backdatedTime : new Date().toISOString()
    });
  };

  const stepLabels = ["Who", "What", "When"];

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[512px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-200">
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-0 border-b border-[var(--color-border)] flex flex-col shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-0.5">
                Record Treatment
              </h2>
              <div className="text-xs text-[var(--color-text-muted)]">
                Step {step} of 3 &mdash; {stepLabels[step - 1]}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mb-0 pb-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#358a6f]' : 'bg-[var(--color-border)]'}`} 
              />
            ))}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col">
          
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                Select the animal(s) or flock for this treatment.
              </p>
              <div className="flex flex-col gap-2">
                {animals.map(animal => {
                  const isChecked = selectedAnimalIds.includes(animal.id);
                  return (
                    <div 
                      key={animal.id} 
                      onClick={() => toggleAnimal(animal.id)}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors ${
                        isChecked ? 'border-[#358a6f] bg-[#e2ead8]/30' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-[#358a6f] border-[#358a6f] text-white' : 'border-gray-300'}`}>
                        {isChecked && <Check size={14} />}
                      </div>
                      <span className="font-medium text-sm text-[var(--color-text)]">{animal.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                Select a signed prescription or log an emergency treatment.
              </p>
              <div className="flex flex-col gap-2">
                {prescriptions.map(rx => {
                  const isSelected = selectedRxId === rx.id;
                  const isEmergency = rx.is_emergency_exception;
                  return (
                    <div 
                      key={rx.id} 
                      onClick={() => setSelectedRxId(rx.id)}
                      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors ${
                        isSelected 
                          ? (isEmergency ? 'border-[#7c3aed] bg-[#f3e8ff]/30' : 'border-[#358a6f] bg-[#e2ead8]/30')
                          : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected 
                          ? (isEmergency ? 'border-[#7c3aed]' : 'border-[#358a6f]')
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${isEmergency ? 'bg-[#7c3aed]' : 'bg-[#358a6f]'}`} />}
                      </div>
                      
                      <div className="flex flex-1 items-center justify-between gap-2 flex-wrap text-sm text-[var(--color-text)]">
                        {isEmergency ? (
                          <>
                            <span className="font-medium text-[#7c3aed]">{rx.drug_name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#7c3aed] text-[10px] font-bold uppercase">Exception</span>
                          </>
                        ) : (
                          <span>
                            {rx.drug_name} &mdash; {rx.dosage} &middot; {rx.route} &middot; {rx.rx_id ? `Vet Rx #${rx.rx_id}` : `Pending Signature`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  When was this treatment administered?
                </p>
                
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => setTiming("now")}
                    className={`flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-colors ${
                      timing === "now" ? 'border-[#358a6f] bg-[#e2ead8]/30' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${timing === "now" ? 'border-[#358a6f]' : 'border-gray-300'}`}>
                        {timing === "now" && <div className="w-2.5 h-2.5 rounded-full bg-[#358a6f]" />}
                      </div>
                      <span className="font-medium text-sm text-[var(--color-text)]">Now</span>
                    </div>
                    <div className="ml-8 text-xs text-[var(--color-text-muted)]">Withdrawal clock starts from right now</div>
                  </div>

                  <div 
                    onClick={() => setTiming("backdated")}
                    className={`flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition-colors ${
                      timing === "backdated" ? 'border-[#358a6f] bg-[#e2ead8]/30' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${timing === "backdated" ? 'border-[#358a6f]' : 'border-gray-300'}`}>
                        {timing === "backdated" && <div className="w-2.5 h-2.5 rounded-full bg-[#358a6f]" />}
                      </div>
                      <span className="font-medium text-sm text-[var(--color-text)]">Backdated (up to 72 hrs)</span>
                    </div>
                    <div className="ml-8 text-xs text-[var(--color-text-muted)]">Clock starts from the actual administration time</div>
                    
                    {/* Note: This conditionally renders when backdated is selected */}
                    {timing === "backdated" && (
                      <div className="ml-8 mt-3">
                        <Input 
                          type="datetime-local" 
                          value={backdatedTime} 
                          onChange={e => setBackdatedTime(e.target.value)} 
                          className="bg-white max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] leading-relaxed">
                The withdrawal window will be calculated by the system based on the selected product and administration time.
              </div>
            </div>
          )}

        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex gap-3 shrink-0 pb-safe sm:pb-4 justify-between items-center">
          {step === 1 ? (
            <Button 
              variant="outline" 
              className="min-h-[44px] bg-[var(--color-bg)] w-auto min-w-[100px]" 
              onClick={onClose}
            >
              Cancel
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="min-h-[44px] bg-[var(--color-bg)] w-auto min-w-[100px]" 
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button 
              className={`min-h-[44px] border-none text-white w-auto min-w-[100px] transition-colors ${
                (step === 1 && selectedAnimalIds.length === 0) || (step === 2 && !selectedRxId)
                  ? 'bg-[#f47b59]/50 cursor-not-allowed'
                  : 'bg-[#f47b59] hover:bg-[#e46a4d]'
              }`}
              onClick={handleNext}
              disabled={(step === 1 && selectedAnimalIds.length === 0) || (step === 2 && !selectedRxId)}
            >
              Next &rarr;
            </Button>
          ) : (
            <Button 
              className="min-h-[44px] bg-[#358a6f] hover:bg-[#286652] border-none text-white flex-1 ml-4"
              onClick={handleFinalSubmit}
            >
              Start Withdrawal Clock
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
}
