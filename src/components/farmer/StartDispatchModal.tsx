import * as React from "react";
import { X, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { checkDispatchSafety, DispatchSafetyOutcome } from "@/lib/api/dummy/dispatch";
import { AnimalItem } from "@/components/farmer/AnimalTable";

interface StartDispatchModalProps {
  animals: AnimalItem[]; // passed from getFarmDetail
  onClose: () => void;
  onSuccess: (dispatchData: any) => void;
}

export function StartDispatchModal({ animals, onClose, onSuccess }: StartDispatchModalProps) {
  const [step, setStep] = React.useState(1);
  const [selectedProduct, setSelectedProduct] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAnimalIds, setSelectedAnimalIds] = React.useState<string[]>([]);
  
  const [isChecking, setIsChecking] = React.useState(false);
  const [safetyOutcome, setSafetyOutcome] = React.useState<DispatchSafetyOutcome | null>(null);

  const backdropRef = React.useRef<HTMLDivElement>(null);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleNext = async () => {
    if (step === 2) {
      // Transition to step 3 involves fetching the safety outcome
      setIsChecking(true);
      setStep(3);
      try {
        const outcome = await checkDispatchSafety(selectedProduct!, selectedAnimalIds);
        setSafetyOutcome(outcome);
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    } else {
      setStep(s => Math.min(s + 1, 3));
    }
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleGenerate = () => {
    // Move to step 4 (result screen)
    setStep(4);
  };

  const handleCloseFinal = () => {
    onSuccess({
      id: `PP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      product: selectedProduct,
      animal_flock: selectedAnimalIds.length === 1 ? selectedAnimalIds[0] : `${selectedAnimalIds.length} animals`,
      date: "Today",
      status: "cleared"
    });
  };

  // Step 4: Result Screen
  if (step === 4) {
    const passportId = `PP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4" ref={backdropRef} onClick={handleBackdropClick}>
        <div className="bg-[var(--color-surface)] w-full sm:max-w-[440px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#1e6147] text-white flex items-center justify-center shrink-0">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1e6147]">Dispatch Cleared</h2>
                <div className="text-sm text-[var(--color-text-muted)]">PashuPramaan Passport</div>
              </div>
            </div>
            <button onClick={handleCloseFinal} className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">PRODUCT</div>
                <div className="font-bold text-sm text-[var(--color-text)]">{selectedProduct}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">FARM</div>
                <div className="font-bold text-sm text-[var(--color-text)]">Shree Krishna Dairy</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">ANIMAL / FLOCK</div>
                <div className="font-bold text-sm text-[var(--color-text)]">{selectedAnimalIds.join(", ")}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">DISPATCH DATE</div>
                <div className="font-bold text-sm text-[var(--color-text)]">22 Aug 2026</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">WITHDRAWAL</div>
                <div className="font-bold text-sm text-[#358a6f]">Cleared</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">MRL</div>
                <div className="font-bold text-sm text-[#358a6f]">Within Limit</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">PRESCRIPTION</div>
                <div className="font-bold text-sm text-[#358a6f]">Vet Signed</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">LAB</div>
                <div className="font-bold text-sm text-[var(--color-text)]">No assay on file</div>
              </div>
            </div>

            <div className="bg-[var(--color-bg)] rounded-xl p-6 flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-[#e2ead8] rounded-xl flex items-center justify-center">
                {/* Dummy QR placeholder */}
                <div className="w-12 h-12 border-4 border-[#a6bca2] rounded grid grid-cols-2 gap-1 p-1">
                  <div className="bg-[#a6bca2] rounded-sm" /><div className="bg-[#a6bca2] rounded-sm" />
                  <div className="bg-[#a6bca2] rounded-sm" /><div className="bg-[#a6bca2] rounded-sm" />
                </div>
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">Scan to Verify</div>
              <div className="font-bold text-sm text-[var(--color-text)]">Passport ID: {passportId}</div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button className="flex-1 bg-[#1e6147] hover:bg-[#164a35] text-white min-h-[44px]" onClick={() => { console.log("View Passport"); handleCloseFinal(); }}>
                View Passport
              </Button>
              <Button variant="outline" className="flex-1 bg-[var(--color-bg)] min-h-[44px]" onClick={handleCloseFinal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-3: Main Wizard Chrome
  const stepLabels = ["Select Product", "Select Animal / Flock", "Safety Check"];
  const products = [
    { id: "Milk", icon: "🥛" }, // Simplified icons for mock
    { id: "Meat", icon: "🥩" },
    { id: "Eggs", icon: "🥚" }
  ];

  const filteredAnimals = animals.filter(a => a.id.toLowerCase().includes(searchQuery.toLowerCase()) || a.type.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[512px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-0 border-b border-[var(--color-border)] flex flex-col shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-0.5">Start New Dispatch</h2>
              <div className="text-xs text-[var(--color-text-muted)]">Step {step} of 3 &mdash; {stepLabels[step - 1]}</div>
            </div>
            <button onClick={onClose} className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-2 mb-0 pb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#1e6147]' : 'bg-[var(--color-border)]'}`} />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col">
          
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--color-text-muted)]">Which product are you dispatching from this farm?</p>
              <div className="grid grid-cols-3 gap-3">
                {products.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedProduct === p.id ? 'border-[#358a6f] bg-[#e2ead8]/30' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <div className="text-3xl grayscale opacity-80">{p.icon}</div>
                    <span className="font-bold text-sm text-[var(--color-text)]">{p.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[var(--color-text-muted)]">Select the animal or flock for this dispatch.</p>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search by Animal / Flock ID"
                  className="block w-full pl-9 pr-3 py-2.5 min-h-[44px] border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[#358a6f] focus:border-transparent transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredAnimals.map(animal => {
                  const isChecked = selectedAnimalIds.includes(animal.id);
                  return (
                    <div 
                      key={animal.id} 
                      onClick={() => {
                        setSelectedAnimalIds(prev => prev.includes(animal.id) ? prev.filter(id => id !== animal.id) : [...prev, animal.id])
                      }}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-[#358a6f] border-[#358a6f] text-white' : 'border-gray-300'}`}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <span className="font-bold text-sm text-[var(--color-text)]">{animal.id}</span>
                      </div>
                      <span className="text-sm text-[var(--color-text-muted)]">{animal.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              {isChecking || !safetyOutcome ? (
                <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] animate-pulse gap-2">
                  <div className="w-8 h-8 rounded-full border-4 border-[#358a6f] border-t-transparent animate-spin" />
                  <p>Running safety checks...</p>
                </div>
              ) : (
                <>
                  {/* Top Banner */}
                  <div className={`p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${
                    safetyOutcome.eligible ? 'bg-[#e2ead8] text-[#1e6147]' : 'bg-[#fce8e8] text-[#c93f4e]'
                  }`}>
                    {safetyOutcome.eligible ? (
                      <><Check size={18} strokeWidth={3} /> Eligible for Dispatch</>
                    ) : (
                      <><X size={18} strokeWidth={3} /> Not Eligible for Dispatch</>
                    )}
                  </div>

                  {/* Hard Safety Gates */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                      HARD SAFETY GATES
                    </div>
                    
                    {/* Withdrawal */}
                    <div className={`p-4 rounded-xl border flex justify-between items-center ${
                      safetyOutcome.withdrawal.status === "cleared" ? 'bg-[#e2ead8]/40 border-[#e2ead8]' : 'bg-[#fce8e8]/40 border-[#fce8e8]'
                    }`}>
                      <div className={`flex items-center gap-2 font-bold ${
                        safetyOutcome.withdrawal.status === "cleared" ? 'text-[#1e6147]' : 'text-[#c93f4e]'
                      }`}>
                        {safetyOutcome.withdrawal.status === "cleared" ? <Check size={18} /> : <X size={18} />}
                        Withdrawal
                      </div>
                      <div className={`text-xs font-bold uppercase tracking-wide ${
                        safetyOutcome.withdrawal.status === "cleared" ? 'text-[#1e6147]' : 'text-[#c93f4e]'
                      }`}>
                        {safetyOutcome.withdrawal.detail}
                      </div>
                    </div>

                    {/* MRL */}
                    {safetyOutcome.mrl && (
                      <div className={`p-4 rounded-xl border flex flex-col gap-1 ${
                        safetyOutcome.mrl.status === "within_limit" ? 'bg-[#e2ead8]/40 border-[#e2ead8]' : 'bg-[#fce8e8]/40 border-[#fce8e8]'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className={`flex items-center gap-2 font-bold ${
                            safetyOutcome.mrl.status === "within_limit" ? 'text-[#1e6147]' : 'text-[#c93f4e]'
                          }`}>
                            {safetyOutcome.mrl.status === "within_limit" ? <Check size={18} /> : <X size={18} />}
                            MRL
                          </div>
                          <div className={`text-xs font-bold uppercase tracking-wide ${
                            safetyOutcome.mrl.status === "within_limit" ? 'text-[#1e6147]' : 'text-[#c93f4e]'
                          }`}>
                            {safetyOutcome.mrl.status === "within_limit" ? 'WITHIN LIMIT' : 'EXCEEDED'}
                          </div>
                        </div>
                        <div className={`text-xs mt-1 ${safetyOutcome.mrl.status === "within_limit" ? 'text-[#358a6f]' : 'text-[#c93f4e]'}`}>
                          Lab Result: <span className="font-bold">{safetyOutcome.mrl.lab_result_ppm} ppm</span> &nbsp;&nbsp; Permitted: {safetyOutcome.mrl.permitted_ppm} ppm
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supporting Info */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                      SUPPORTING INFORMATION
                    </div>
                    <div className="border border-[var(--color-border)] rounded-xl flex flex-col text-sm">
                      <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
                        <span className="text-[var(--color-text-muted)]">Prescription</span>
                        {safetyOutcome.prescription.signed ? (
                          <Badge variant="vet_signed">Vet Signed</Badge>
                        ) : (
                          <Badge variant="unsigned_emergency">Unsigned</Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center p-4">
                        <span className="text-[var(--color-text-muted)]">Lab Assay</span>
                        <span className={safetyOutcome.lab_assay.available ? "text-[#1e6147] font-medium" : "text-[var(--color-text-muted)]"}>
                          {safetyOutcome.lab_assay.available ? "Lab result available" : "No lab assay on file"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex gap-3 shrink-0 pb-safe sm:pb-4 justify-between items-center">
          {step === 1 ? (
            <Button variant="outline" className="min-h-[44px] bg-[var(--color-bg)] w-auto min-w-[100px]" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <Button variant="outline" className="min-h-[44px] bg-[var(--color-bg)] w-auto min-w-[100px]" onClick={handleBack} disabled={isChecking}>
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button 
              className={`min-h-[44px] border-none text-white w-auto min-w-[100px] transition-colors ${
                (step === 1 && !selectedProduct) || (step === 2 && selectedAnimalIds.length === 0)
                  ? 'bg-[#f47b59]/50 cursor-not-allowed'
                  : 'bg-[#f47b59] hover:bg-[#e46a4d]'
              }`}
              onClick={handleNext}
              disabled={(step === 1 && !selectedProduct) || (step === 2 && selectedAnimalIds.length === 0)}
            >
              Next &rarr;
            </Button>
          ) : (
            <Button 
              className={`min-h-[44px] border-none flex-1 ml-4 ${
                safetyOutcome?.eligible ? 'bg-[#1e6147] hover:bg-[#164a35] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed'
              }`}
              onClick={handleGenerate}
              disabled={!safetyOutcome?.eligible || isChecking}
            >
              {safetyOutcome?.eligible ? "Generate PashuPramaan Passport" : "Resolve blocked gates before dispatching"}
            </Button>
          )}
        </div>
        
      </div>
    </div>
  );
}
