import * as React from "react";
import { Check } from "lucide-react";
import { TreatmentTimelineStep } from "@/lib/api/dummy/treatments";

interface TreatmentTimelineProps {
  steps: TreatmentTimelineStep[];
}

export function TreatmentTimeline({ steps }: TreatmentTimelineProps) {
  return (
    <div className="flex items-start justify-between w-full pt-2">
      {steps.map((step, idx) => {
        const isComplete = step.status === "complete";
        const isCurrent = step.status === "current";
        const isUpcoming = step.status === "upcoming";

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-2 shrink-0 w-[4.5rem]">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  isComplete 
                    ? "bg-[#e2ead8] text-[#358a6f]" 
                    : isCurrent 
                      ? "bg-[#f2f6f3] text-[#358a6f]" 
                      : "bg-[#f2f6f3] text-[#94a39a]"
                }`}
              >
                {isComplete ? <Check size={18} strokeWidth={2.5} /> : (idx + 1)}
              </div>
              <div 
                className={`text-[12px] text-center leading-tight ${
                  isUpcoming ? "text-[#94a39a]" : "text-[#2d4035]"
                }`}
              >
                {step.label}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex-1 px-1 pt-[18px]">
                <div 
                  className={`h-px w-full ${
                    isComplete ? "bg-[#358a6f]" : "bg-[#e5e7eb]"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
