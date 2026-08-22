"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface AddMedicineStockModalProps {
  medicines: string[];
  onClose: () => void;
  onSubmit: (medicineName: string, quantity: number, unit: string) => void;
}

export function AddMedicineStockModal({ medicines, onClose, onSubmit }: AddMedicineStockModalProps) {
  const [medicine, setMedicine] = React.useState(medicines[0] || "");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("vials");
  
  // Format date as DD-MM-YYYY for input (wait, standard HTML date input uses YYYY-MM-DD, let's stick to standard and assume formatting happens in presentation)
  const [dateReceived, setDateReceived] = React.useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const medicineOptions = medicines.map(m => ({ label: m, value: m }));
  const unitOptions = [
    { label: "vials", value: "vials" },
    { label: "doses", value: "doses" },
    { label: "mL", value: "mL" },
    { label: "tablets", value: "tablets" }
  ];

  const handleAddStock = () => {
    const q = parseInt(quantity, 10);
    if (medicine && !isNaN(q) && q > 0) {
      onSubmit(medicine, q, unit);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:w-[480px] bg-[var(--color-surface)] sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-display font-bold text-[var(--color-text)]">
            Add Medicine Stock
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Medicine
            </label>
            <Select 
              options={medicineOptions} 
              value={medicine} 
              onChange={setMedicine} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                Quantity Received
              </label>
              <Input 
                type="number" 
                placeholder="e.g. 50" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)} 
                min={1}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                Unit
              </label>
              <Select 
                options={unitOptions} 
                value={unit} 
                onChange={setUnit} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
              Date Received
            </label>
            <Input 
              type="date" 
              value={dateReceived} 
              onChange={e => setDateReceived(e.target.value)} 
            />
          </div>
        </div>

        <div className="p-5 border-t border-[var(--color-border)] flex items-center justify-end gap-3 bg-[var(--color-surface)] sm:rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="min-w-[100px] justify-center text-sm font-bold">
            Cancel
          </Button>
          <Button 
            className={`min-w-[100px] justify-center text-sm border-none font-bold ${
              quantity ? "bg-[#e46a4d] hover:bg-[#d65a3d] text-white" : "bg-[#fcd2c8] text-white cursor-not-allowed hover:bg-[#fcd2c8]"
            }`}
            onClick={handleAddStock}
            disabled={!quantity}
          >
            Add Stock
          </Button>
        </div>
      </div>
    </div>
  );
}
