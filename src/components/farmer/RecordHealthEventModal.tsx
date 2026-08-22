"use client";

import * as React from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RecordHealthEventModalProps {
  onClose: () => void;
}

const EVENT_TYPES = ["Illness", "Injury", "Abnormal Behaviour", "Other"];

export function RecordHealthEventModal({ onClose }: RecordHealthEventModalProps) {
  const [animalId, setAnimalId] = React.useState("");
  const [date, setDate] = React.useState("22-08-2026");
  const [eventType, setEventType] = React.useState("Illness");
  const [description, setDescription] = React.useState("");

  const isFormValid = animalId !== "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[480px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-start border-b border-[var(--color-border)] shrink-0">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#7ba081] uppercase mb-1">
              QUICK ACTION
            </div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-text)] tracking-tight">Record Health Event</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-[#7ba081] uppercase">Select animal</label>
            <select 
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              <option value="">&mdash; Select animal ID &mdash;</option>
              <option value="MP-104">MP-104</option>
              <option value="MP-105">MP-105</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-[#7ba081] uppercase">Date of event</label>
            <div className="relative">
              <input 
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-[var(--color-border)] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
              />
              <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wide text-[#7ba081] uppercase mb-1">Issue / Event Type</label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setEventType(type)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-colors text-left ${
                    eventType === type 
                      ? "bg-[#1f6b4f] text-white" 
                      : "bg-[#eef4ed] text-[#1f6b4f] hover:bg-[#e2ead8]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide text-[#7ba081] uppercase">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what was observed..."
              rows={4}
              className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 resize-none placeholder:text-gray-400"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-border)] flex gap-3 shrink-0 pb-safe sm:pb-5 justify-end">
          <Button 
            variant="outline"
            className="w-32 min-h-[44px] rounded-xl font-bold border-gray-200 text-gray-500"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className={`w-36 min-h-[44px] rounded-xl font-bold text-white border-none ${
              isFormValid ? "bg-[#facbbd] hover:bg-[#f4a261]" : "bg-[#fcdfd5]"
            }`}
            onClick={() => {
              if (isFormValid) onClose();
            }}
            disabled={!isFormValid}
          >
            Save Event
          </Button>
        </div>
      </div>
    </div>
  );
}
