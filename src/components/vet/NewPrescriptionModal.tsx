import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getDrugsList } from "@/lib/api/dummy/vet-prescriptions";

interface NewPrescriptionModalProps {
  onClose: () => void;
  onSave: (prescription: any) => void;
  nextRxId: string;
}

export function NewPrescriptionModal({ onClose, onSave, nextRxId }: NewPrescriptionModalProps) {
  const { data: drugs = [] } = useQuery({
    queryKey: ["vet-drugs"],
    queryFn: getDrugsList,
  });

  const [formData, setFormData] = React.useState({
    farm: "",
    animalFlock: "",
    diagnosis: "",
    drug: "",
    dose: "",
    unit: "",
    route: "",
    frequency: "",
    duration: "",
    reason: "",
    aware: "",
    cia: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-populate AWaRe and CIA when a drug is selected
      if (name === "drug") {
        const selectedDrug = drugs.find((d: any) => d.id === value);
        if (selectedDrug) {
          next.aware = selectedDrug.awareClass || "";
          next.cia = selectedDrug.isCia || false;
        } else {
          next.aware = "";
          next.cia = false;
        }
      }
      
      return next;
    });
  };

  const handleSave = () => {
    // Client-side validation could go here
    onSave({
      rx_id: nextRxId,
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[600px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-start border-b border-[var(--color-border)] shrink-0">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              {nextRxId}
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">New Prescription</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Farm</label>
              <select 
                name="farm"
                value={formData.farm}
                onChange={handleChange}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              >
                <option value="">Select farm</option>
                <option value="Shanti Dairy">Shanti Dairy</option>
                <option value="Shree Krishna Dairy">Shree Krishna Dairy</option>
                <option value="Meena Poultry">Meena Poultry</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Animal / Flock ID</label>
              <input 
                name="animalFlock"
                value={formData.animalFlock}
                onChange={handleChange}
                placeholder="e.g. MP-121"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--color-text)]">Diagnosis / Clinical condition</label>
            <input 
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Clinical mastitis"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--color-text)]">Drug</label>
            <select 
              name="drug"
              value={formData.drug}
              onChange={handleChange}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
            >
              <option value="">Select a drug</option>
              {drugs.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} {d.formulation ? `(${d.formulation})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Dose</label>
              <input 
                name="dose"
                type="number"
                value={formData.dose}
                onChange={handleChange}
                placeholder="10"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Unit</label>
              <input 
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder=" "
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Route</label>
              <select 
                name="route"
                value={formData.route}
                onChange={handleChange}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              >
                <option value="">Select</option>
                <option value="Oral">Oral</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intravenous">Intravenous</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Frequency</label>
              <select 
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              >
                <option value="">Select</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)]">Duration</label>
              <input 
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 days"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[var(--color-text)]">Reason (optional)</label>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Clinical reason for this prescription"
              rows={3}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[var(--color-text)] opacity-70">AWaRe classification</label>
              <select 
                name="aware"
                value={formData.aware}
                disabled
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm opacity-70 cursor-not-allowed"
              >
                <option value="">Not specified</option>
                <option value="ACCESS">ACCESS</option>
                <option value="WATCH">WATCH</option>
                <option value="RESERVE">RESERVE</option>
              </select>
            </div>
            <div className="flex-1 flex items-start gap-3 sm:pb-2 opacity-70">
              <input 
                type="checkbox"
                id="cia_checkbox"
                name="cia"
                checked={formData.cia}
                disabled
                className="mt-1 w-4 h-4 text-[var(--color-primary)] rounded border-[var(--color-border)] focus:ring-[var(--color-primary)] cursor-not-allowed"
              />
              <label htmlFor="cia_checkbox" className="flex flex-col cursor-not-allowed">
                <span className="text-sm font-bold text-[var(--color-text)]">CIA drug</span>
                <span className="text-xs text-[var(--color-text-muted)]">Critically important antimicrobial</span>
              </label>
            </div>
          </div>

          {/* Callout */}
          <div className="bg-[#fcf8f6] rounded-xl p-4 text-sm text-[var(--color-text-muted)]">
            Prescription saved with status <span className="text-[#de6a38] font-bold">SIGN</span> — signature required in a separate step.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-border)] flex gap-3 shrink-0 pb-safe sm:pb-5">
          <Button 
            className="flex-1 bg-[#d96c42] hover:bg-[#c25d31] text-white border-none min-h-[44px]"
            onClick={handleSave}
            disabled={!formData.farm || !formData.animalFlock || !formData.diagnosis || !formData.drug}
          >
            Save Prescription
          </Button>
          <Button 
            variant="outline"
            className="flex-1 min-h-[44px]"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
