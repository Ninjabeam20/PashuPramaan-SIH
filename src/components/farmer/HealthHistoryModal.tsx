"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface HealthHistoryModalProps {
  animalId: string;
  onClose: () => void;
}

export function HealthHistoryModal({ animalId, onClose }: HealthHistoryModalProps) {
  // Static representation of August 2026 calendar to match the design
  const daysInMonth = 31;
  const startDayOfWeek = 6; // Aug 1 2026 is a Saturday (0=Sun, 6=Sat)
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
      <div className="bg-[var(--color-surface)] w-full sm:max-w-[420px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-start border-b border-[var(--color-border)] shrink-0">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#7ba081] uppercase mb-1">
              COW &middot; {animalId}
            </div>
            <h2 className="text-2xl font-display font-bold text-[var(--color-text)] tracking-tight">Health History</h2>
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
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button className="w-9 h-9 rounded-xl bg-[#eef4ed] text-[#1f6b4f] flex items-center justify-center hover:bg-[#e2ead8] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="font-bold text-[var(--color-text)] text-[15px]">
              August 2026
            </div>
            <button className="w-9 h-9 rounded-xl bg-[#eef4ed] text-[#1f6b4f] flex items-center justify-center hover:bg-[#e2ead8] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 mb-4">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-bold text-[#7ba081]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-4">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} />
              ))}
              {days.map(day => {
                const isSelected = day === 18;
                const isToday = day === 22;
                const hasEvent = day === 12 || day === 18;

                return (
                  <div key={day} className="flex flex-col items-center justify-center relative h-10">
                    <button
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                        ${isSelected ? "bg-[#1f6b4f] text-white" : 
                          isToday ? "bg-[#eef4ed] text-[#1f6b4f]" : 
                          "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                        }
                      `}
                    >
                      {day}
                    </button>
                    {hasEvent && (
                      <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#cd5c5c]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-[#cd5c5c]" />
            <span className="text-sm font-medium text-[#7ba081]">Health event recorded</span>
          </div>

          {/* Selected Event Card */}
          <div className="bg-[#f2f5f2] rounded-2xl p-5 mt-2 flex flex-col gap-3">
            <div className="text-xs font-bold tracking-widest text-[#1f6b4f]">
              18 AUGUST 2026
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-[#fef3c7] text-[#92400e] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Injury
              </span>
              <span className="text-sm text-[#7ba081] font-medium">{animalId}</span>
            </div>
            <p className="text-[15px] text-[var(--color-text)]">
              Minor injury observed on hind leg.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
