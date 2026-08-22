import * as React from "react";
import { Check } from "lucide-react";

export type SignStep = "review" | "notice" | "sign" | "signed";

interface StepIndicatorProps {
  currentStep: SignStep;
  requiresNotice: boolean;
}

export function StepIndicator({ currentStep, requiresNotice }: StepIndicatorProps) {
  if (currentStep === "signed") return null;

  const steps = ["review"];
  if (requiresNotice) steps.push("notice");
  steps.push("sign");

  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const label = step.charAt(0).toUpperCase() + step.slice(1);

        if (isCompleted) {
          return (
            <div key={step} className="flex items-center gap-1 bg-[#e2ead8] text-[#557b4f] px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
              <Check size={12} strokeWidth={3} />
              {label}
            </div>
          );
        }

        if (isCurrent) {
          return (
            <div key={step} className="bg-[var(--color-primary)] text-white px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
              {label}
            </div>
          );
        }

        // Upcoming
        return (
          <div key={step} className="bg-gray-100 text-[var(--color-text-muted)] px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
            {label}
          </div>
        );
      })}
    </div>
  );
}
