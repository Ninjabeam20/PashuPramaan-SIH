import * as React from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { VetOption } from "@/lib/api/dummy/vets";

interface AnimalItem {
  id: string;
  type: string;
}

interface BookVetModalProps {
  animals: AnimalItem[];
  vets: VetOption[];
  onClose: () => void;
}

export function BookVetModal({ animals, vets, onClose }: BookVetModalProps) {
  const [selectedAnimalIds, setSelectedAnimalIds] = React.useState<string[]>([]);
  const [selectedVetId, setSelectedVetId] = React.useState<string>("");
  const [reason, setReason] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

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

  const isFormValid = selectedAnimalIds.length > 0 && selectedVetId && reason.trim().length > 0 && preferredDate;

  const handleSubmit = () => {
    if (!isFormValid) return;
    
    // Dummy / client-side only - no real booking is created
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const vetOptions = (vets || []).map(vet => ({
    label: `${vet.name} — ${vet.designation}`,
    value: vet.id
  }));

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
            <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-0.5">
              Book a Vet
            </h2>
            <div className="text-xs text-[var(--color-text-muted)]">
              Request a vet visit for your farm.
            </div>
          </div>
          {!isSuccess && (
            <button 
              onClick={onClose}
              className="p-1 -mr-1 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {isSuccess ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#e2ead8] text-[#358a6f] flex items-center justify-center mb-2">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text)]">Vet visit requested</h3>
            <p className="text-sm text-[var(--color-text-muted)]">We have notified the veterinarian.</p>
          </div>
        ) : (
          <>
            {/* Content Area - Scrollable */}
            <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  ANIMAL(S) / FLOCK
                </label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {(animals || []).map(animal => {
                    const isChecked = selectedAnimalIds.includes(animal.id);
                    return (
                      <div 
                        key={animal.id} 
                        onClick={() => toggleAnimal(animal.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          isChecked ? 'border-[#358a6f] bg-[#e2ead8]/30' : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-[#358a6f] border-[#358a6f] text-white' : 'border-gray-300'}`}>
                          {isChecked && <Check size={14} />}
                        </div>
                        <span className="font-medium text-sm text-[var(--color-text)]">{animal.id} - {animal.type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  VETERINARIAN
                </label>
                <Select 
                  options={vetOptions} 
                  value={selectedVetId} 
                  onChange={(val) => setSelectedVetId(val)}
                  placeholder="Select a veterinarian"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  REASON FOR VISIT
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue or reason for this visit"
                  className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                  PREFERRED DATE
                </label>
                <Input 
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={todayStr}
                  className="w-full"
                />
              </div>

            </div>

            {/* Footer - Sticky */}
            <div className="sticky bottom-0 z-10 bg-[var(--color-surface)] sm:rounded-b-2xl border-t border-[var(--color-border)] p-4 flex gap-3 shrink-0 pb-safe sm:pb-4 sm:justify-end">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none min-h-[44px] bg-[var(--color-bg)] w-full sm:w-auto" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                className={`flex-1 sm:flex-none min-h-[44px] border-none text-white w-full sm:w-auto transition-colors ${
                  isFormValid ? 'bg-[#f47b59] hover:bg-[#e46a4d]' : 'bg-[#f47b59]/50 cursor-not-allowed'
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Book Visit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
