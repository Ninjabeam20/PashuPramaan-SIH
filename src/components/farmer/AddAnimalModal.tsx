import * as React from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const TYPE_OPTIONS = [
  { label: "Cow", value: "Cow" },
  { label: "Buffalo", value: "Buffalo" },
  { label: "Goat", value: "Goat" },
  { label: "Sheep", value: "Sheep" },
  { label: "Pig", value: "Pig" },
  { label: "Poultry / Flock", value: "Poultry" },
  { label: "Other", value: "Other" },
];

const SEX_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const PRODUCTION_OPTIONS = [
  { label: "Dairy", value: "Dairy" },
  { label: "Meat", value: "Meat" },
  { label: "Dual", value: "Dual" },
];

const animalSchema = z.object({
  type: z.string().min(1, "Animal type is required"),
  id: z.string().min(1, "ID is required"),
  breed: z.string().optional(),
  sex: z.string().min(1, "Sex is required"),
  dob: z.string().optional(),
  productionType: z.string().min(1, "Production type is required"),
});

export type AnimalFormData = z.infer<typeof animalSchema>;

interface AddAnimalModalProps {
  existingIds: string[];
  onClose: () => void;
  onSubmit: (data: AnimalFormData) => void;
}

export function AddAnimalModal({ existingIds, onClose, onSubmit }: AddAnimalModalProps) {
  const [formData, setFormData] = React.useState<Partial<AnimalFormData>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const isFlock = formData.type === "Poultry";

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

  const handleChange = (field: keyof AnimalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    try {
      const parsed = animalSchema.parse(formData);
      
      // Additional dup ID check
      if (existingIds.includes(parsed.id)) {
        setErrors(prev => ({ ...prev, id: "This ID is already registered" }));
        return;
      }
      
      onSubmit(parsed);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setErrors(newErrors);
      }
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
        <div className="sticky top-0 z-10 bg-[var(--color-surface)] sm:rounded-t-2xl rounded-t-2xl px-6 pt-5 pb-3 border-b border-[var(--color-border)] flex justify-between items-start shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold font-display text-[var(--color-text)] mb-0.5">
              Add Animal
            </h2>
            <div className="text-xs text-[var(--color-text-muted)]">
              Register a new animal or flock
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
        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Animal Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              ANIMAL / FLOCK TYPE
            </label>
            <Select 
              options={TYPE_OPTIONS} 
              value={formData.type} 
              onChange={(val) => handleChange("type", val)}
              placeholder="Select type"
            />
            {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            {/* ID */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                {isFlock ? "FLOCK ID" : "ANIMAL / EAR TAG ID"}
              </label>
              <Input 
                value={formData.id || ""}
                onChange={(e) => handleChange("id", e.target.value)}
                placeholder={isFlock ? "e.g. P-01" : "e.g. MP-110"}
              />
              {errors.id && <span className="text-xs text-red-500">{errors.id}</span>}
            </div>
            
            {/* Breed */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                BREED
              </label>
              <Input 
                value={formData.breed || ""}
                onChange={(e) => handleChange("breed", e.target.value)}
                placeholder="e.g. Gir, Murrah"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            {/* Sex */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                SEX
              </label>
              <Select 
                options={SEX_OPTIONS} 
                value={formData.sex} 
                onChange={(val) => handleChange("sex", val)}
                placeholder="Select sex"
              />
              {errors.sex && <span className="text-xs text-red-500">{errors.sex}</span>}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1.5 flex-1 relative">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                DATE OF BIRTH / AGE
              </label>
              <Input 
                type="date"
                value={formData.dob || ""}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Production Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              PRODUCTION TYPE
            </label>
            <Select 
              options={PRODUCTION_OPTIONS} 
              value={formData.productionType} 
              onChange={(val) => handleChange("productionType", val)}
              placeholder="Select production type"
            />
            {errors.productionType && <span className="text-xs text-red-500">{errors.productionType}</span>}
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
            className="flex-1 sm:flex-none min-h-[44px] bg-[#f47b59] hover:bg-[#e46a4d] border-none text-white w-full sm:w-auto" 
            onClick={handleSubmit}
          >
            Add Animal
          </Button>
        </div>
        
      </div>
    </div>
  );
}
