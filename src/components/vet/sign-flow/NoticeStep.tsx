import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";

interface NoticeStepProps {
  data: PrescriptionSignDetail;
  onNext: () => void;
  onBack: () => void;
}

export function NoticeStep({ data, onNext, onBack }: NoticeStepProps) {
  // Hardcoded the warning paragraph for now since the prompt said "similar to the 'Why this matters' approach if practical"
  // I will just use React elements since we know exactly what is highlighted in the screenshot.
  const warningText = (
    <>
      This prescription involves a <span className="font-bold text-[#b67a28]">Critically Important Antimicrobial (CIA)</span> classified as <span className="font-bold text-[#b67a28]">AWaRe WATCH</span>. This does not prevent signing, but requires your informed confirmation.
    </>
  );

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Warning Card */}
      <div className="bg-[#faecd1]/30 border border-[#faecd1] rounded-2xl p-6 flex items-start gap-4 mb-6">
        <div className="text-[#b67a28] bg-[#faecd1] rounded-lg p-2 shrink-0">
          <TriangleAlert size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-[#b67a28]">Stewardship notice before signing</h3>
          <p className="text-sm text-[#b67a28]">
            {warningText}
          </p>
        </div>
      </div>

      {/* Prescription Summary */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-2">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          PRESCRIPTION
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {data.rx_id} &middot; {data.diagnosis}
          </h2>
          <div className="text-sm text-[var(--color-text-muted)]">
            {data.farm} &middot; {data.animal}
          </div>
          <div className="text-sm text-[var(--color-text)] mt-2">
            {data.prescription.drug} &middot; {data.prescription.dose} &middot; {data.prescription.route} &middot; {data.prescription.duration}
          </div>
        </div>
        {data.stewardship && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.stewardship.aware_badge && (
              <Badge variant={data.stewardship.aware_badge.variant as BadgeVariant}>
                {data.stewardship.aware_badge.text}
              </Badge>
            )}
            {data.stewardship.cia_badge && (
              <Badge variant={data.stewardship.cia_badge.variant as BadgeVariant}>
                {data.stewardship.cia_badge.text}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stewardship Guidance */}
      {data.stewardship && data.stewardship.guidance.length > 0 && (
        <div className="flex flex-col gap-3 px-2">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            STEWARDSHIP GUIDANCE
          </div>
          <ul className="flex flex-col gap-3">
            {data.stewardship.guidance.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-vet)] shrink-0 mt-1.5" />
                <span className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center">
        <div className="w-full max-w-3xl flex gap-3">
          <Button 
            className="flex-[2] min-h-[44px] bg-[var(--color-accent-vet)] hover:bg-[#c25d31] border-none text-white" 
            onClick={onNext}
          >
            Continue to Signature &rarr;
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
            onClick={onBack}
          >
            Back
          </Button>
        </div>
      </div>

    </div>
  );
}
