"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { getDrugsList } from "@/lib/api/dummy/farm-insights";

interface AddMedicineStockModalProps {
  onClose: () => void;
  onSubmit: (drugId: string, quantity: number) => void;
}

export function AddMedicineStockModal({ onClose, onSubmit }: AddMedicineStockModalProps) {
  const { data: drugs = [] } = useQuery({
    queryKey: ["farmer-drugs"],
    queryFn: getDrugsList,
  });

  const [drugId, setDrugId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  
  // Format date as DD-MM-YYYY for input (wait, standard HTML date input uses YYYY-MM-DD, let's stick to standard and assume formatting happens in presentation)
  const [dateReceived, setDateReceived] = React.useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const medicineOptions = drugs.map((d: any) => ({ 
    label: `${d.name} ${d.formulation ? `(${d.formulation})` : ''}`, 
    value: d.id 
  }));

  const handleAddStock = () => {
    const q = parseInt(quantity, 10);
    if (drugId && !isNaN(q) && q > 0) {
      onSubmit(drugId, q);
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
              value={drugId} 
              onChange={setDrugId} 
            />
          </div>

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
