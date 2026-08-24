"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface RecordFollowUpModalProps {
  patientId: string;
  onClose: () => void;
  onSave: (outcome: string, notes: string) => void;
}

const OUTCOMES = ["Recovered", "Improved", "No Change", "Worsened", "Relapse"];

export function RecordFollowUpModal({ patientId, onClose, onSave }: RecordFollowUpModalProps) {
  const [selectedOutcome, setSelectedOutcome] = React.useState("Improved");
  const [notes, setNotes] = React.useState("");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[480px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-xl font-display font-bold text-[var(--color-text)]">Record Follow-up</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* Patient Info Block */}
          <div className="bg-[#f5f4ef] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-[#e2e1dc] pb-3">
              <div>
                <div className="font-bold text-[var(--color-text)]">{patientId}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Cow &middot; Shanti Dairy</div>
              </div>
              <Badge variant="patient_under_treatment" dot>Under Treatment</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Condition</span>
                <span className="text-xs font-medium text-[var(--color-text)]">Clinical mastitis</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Treatment</span>
                <span className="text-xs font-medium text-[var(--color-text)] leading-relaxed">Amoxicillin &middot; Intramammary &middot; Twice daily</span>
              </div>
            </div>
          </div>

          {/* Treatment Outcome */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wide text-[var(--color-text-muted)] uppercase">Treatment Outcome</label>
            <div className="flex flex-col gap-2">
              {OUTCOMES.map(outcome => {
                const isSelected = selectedOutcome === outcome;
                return (
                  <button
                    key={outcome}
                    onClick={() => setSelectedOutcome(outcome)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border font-bold text-sm transition-colors text-left
                      ${isSelected 
                        ? "border-[#22c55e] text-[#16a34a] bg-[#f0fdf4]" 
                        : "border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                      }
                    `}
                  >
                    <span>{outcome}</span>
                    {isSelected && <Check size={18} className="text-[#16a34a]" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vet Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-[var(--color-text-muted)] uppercase">Vet Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record observations from this follow-up..."
              rows={4}
              className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 resize-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-border)] flex gap-3 shrink-0 pb-safe sm:pb-5 justify-end">
          <Button 
            variant="outline"
            className="flex-1 min-h-[44px] rounded-xl font-bold border-gray-200 text-gray-500"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 min-h-[44px] rounded-xl font-bold text-white border-none bg-[#2d4b29] hover:bg-[#1f361c]"
            onClick={() => onSave(selectedOutcome, notes)}
          >
            Save Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
}
