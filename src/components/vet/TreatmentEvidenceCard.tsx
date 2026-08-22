import * as React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface TreatmentEvidenceProps {
  evidence: {
    case_title: string;
    species: string;
    similar_case_count: number;
    recovery_pct: number;
    recovery_label: string;
    disclaimer: string;
  };
}

export function TreatmentEvidenceCard({ evidence }: TreatmentEvidenceProps) {
  return (
    <Card className="flex flex-col gap-3 p-5 mt-4">
      <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
        TREATMENT EVIDENCE
      </div>
      
      <div className="flex flex-col">
        <div className="text-sm font-bold text-[var(--color-text)]">
          {evidence.case_title}
        </div>
        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {evidence.similar_case_count} similar recorded cases
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span>{evidence.recovery_label}</span>
          <span className="text-[var(--status-good-text)]">{evidence.recovery_pct}%</span>
        </div>
        <ProgressBar progress={evidence.recovery_pct} colorClass="bg-[var(--status-good-text)]" />
      </div>

      <div className="text-[10px] text-[var(--color-text-muted)] italic mt-2 leading-relaxed">
        {evidence.disclaimer}
      </div>
    </Card>
  );
}
