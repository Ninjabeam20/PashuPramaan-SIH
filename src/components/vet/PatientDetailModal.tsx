"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RecordFollowUpModal } from "./RecordFollowUpModal";

interface PatientDetailModalProps {
  patientId: string;
  onClose: () => void;
}

export function PatientDetailModal({ patientId, onClose }: PatientDetailModalProps) {
  const [isRecordFollowUpOpen, setIsRecordFollowUpOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<number | null>(null);
  const [hasFollowUpLog, setHasFollowUpLog] = React.useState(false); // To simulate adding a follow-up

  const daysInMonth = 31;
  const startDayOfWeek = 6; // Aug 1 is Saturday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const handleSaveFollowUp = () => {
    setHasFollowUpLog(true);
    setIsRecordFollowUpOpen(false);
    setSelectedDate(22); // Auto select date to see the log
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/40 backdrop-blur-sm sm:px-4">
        <div className="bg-[var(--color-surface)] w-full sm:max-w-[560px] sm:mx-auto sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
          
          {/* Header */}
          <div className="p-5 flex justify-between items-start border-b border-[var(--color-border)] shrink-0">
            <div>
              <h2 className="text-xl font-display font-bold text-[var(--color-text)]">{patientId}</h2>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">Cow &middot; Shanti Dairy</div>
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
            
            {/* Status Card */}
            <div className="bg-[#f5f4ef] rounded-xl p-5 grid grid-cols-2 gap-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Condition</span>
                <span className="text-sm font-medium text-[var(--color-text)]">Clinical mastitis</span>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Current Status</span>
                <Badge variant="patient_under_treatment" dot>Under Treatment</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Current Treatment</span>
                <span className="text-sm font-medium text-[var(--color-text)]">Amoxicillin &middot; Intramammary &middot; Twice daily</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Last Follow-up</span>
                <span className="text-sm font-medium text-[var(--color-text)]">22 Aug</span>
              </div>
            </div>

            <Button 
              className="w-full bg-[#2d4b29] hover:bg-[#1f361c] text-white font-bold h-12 rounded-xl"
              onClick={() => setIsRecordFollowUpOpen(true)}
            >
              Record Follow-up
            </Button>

            {/* Health History */}
            <div>
              <h3 className="font-bold text-[var(--color-text)] mb-4">Health History</h3>
              
              <div className="flex items-center justify-between mb-4">
                <button className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <ChevronLeft size={20} />
                </button>
                <div className="font-bold text-[var(--color-text)] text-[15px]">
                  August 2026
                </div>
                <button className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-[var(--color-text-muted)]">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                  {blanks.map(blank => (
                    <div key={`blank-${blank}`} />
                  ))}
                  {days.map(day => {
                    const isSelected = day === selectedDate;
                    const isToday = day === 22;
                    const hasEvent = day === 22; // In this mock, only 22 has logs

                    return (
                      <div key={day} className="flex flex-col items-center justify-center relative h-10 cursor-pointer" onClick={() => { if(hasEvent) setSelectedDate(day) }}>
                        <div
                          className={`w-10 h-8 rounded-lg flex flex-col items-center justify-center transition-colors
                            ${isSelected ? "bg-[#e2ead8] text-[var(--color-text)] font-bold" : 
                              isToday ? "bg-transparent text-[var(--color-text)]" : 
                              "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                            }
                          `}
                        >
                          <span className="text-sm">{day}</span>
                          {hasEvent && (
                            <div className="flex gap-0.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1f6b4f]" />
                              {hasFollowUpLog && <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-y-3 mb-6 border-t border-[var(--color-border)] pt-4">
                <div className="text-[9px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase col-span-2 mb-1">Legend</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Health Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1f6b4f]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Prescription / Treatment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Administration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Follow-up</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Recovery / Completion</span>
                </div>
              </div>

              {/* Log List for Selected Date */}
              {selectedDate === 22 && (
                <div className="bg-[#f5f4ef] rounded-xl p-4 flex flex-col gap-3 relative animate-in fade-in duration-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-[var(--color-text)]">22 Aug</span>
                    <button onClick={() => setSelectedDate(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                      <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Health Event</span>
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text)]">Clinical mastitis onset</div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1f6b4f]" />
                      <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Prescription / Treatment</span>
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text)] mb-0.5">Amoxicillin prescribed (Rx-208)</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Vet: Dr. Bankey</div>
                  </div>

                  {hasFollowUpLog && (
                    <div className="bg-white rounded-lg p-3 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                        <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Follow-up</span>
                      </div>
                      <div className="text-sm font-medium text-[var(--color-text)] mb-0.5">Follow-up recorded</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Vet: Dr. Bankey &middot; Outcome: Improved</div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {isRecordFollowUpOpen && (
        <RecordFollowUpModal 
          patientId={patientId} 
          onClose={() => setIsRecordFollowUpOpen(false)}
          onSave={handleSaveFollowUp}
        />
      )}
    </>
  );
}
