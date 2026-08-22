import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";
import { useRouter } from "next/navigation";

interface ReviewStepProps {
  data: PrescriptionSignDetail;
  isReadOnly?: boolean;
  onNext?: () => void;
}

export function ReviewStep({ data, isReadOnly, onNext }: ReviewStepProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-2 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              {data.rx_id}
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {data.diagnosis}
            </h2>
            <div className="text-sm text-[var(--color-text-muted)] mt-1">
              {data.farm} &middot; {data.animal}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {data.status_badges.map((b, i) => (
              <Badge key={i} variant={b.variant as BadgeVariant}>
                {b.text}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
          PRESCRIPTION DETAILS
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Drug</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.drug}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Dose</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.dose}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Route</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.route}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Frequency</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.frequency}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Duration</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.duration}</div>
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Reason</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.reason}</div>
          </div>
        </div>
      </div>

      {/* Clinical Context */}
      {(data.health_event || data.previous_treatment) && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
            CLINICAL CONTEXT
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.health_event && (
              <div className="flex flex-col gap-1">
                <div className="text-xs text-[var(--color-text-muted)]">Linked health event</div>
                <div className="text-sm font-bold text-[var(--color-text)]">{data.health_event.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Onset: {data.health_event.onset}</div>
              </div>
            )}
            {data.previous_treatment && (
              <div className="flex flex-col gap-1">
                <div className="text-xs text-[var(--color-text-muted)]">Previous treatment</div>
                <div className="text-sm font-bold text-[var(--color-text)]">
                  {data.previous_treatment.drug} &middot; {data.previous_treatment.duration}
                </div>
                <div className="mt-1">
                  <Badge variant={data.previous_treatment.outcome_badge.variant as BadgeVariant}>
                    {data.previous_treatment.outcome_badge.text}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stewardship Classification */}
      {data.stewardship && (data.stewardship.aware_badge || data.stewardship.cia_badge) && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
            STEWARDSHIP CLASSIFICATION
          </div>
          <div className="flex gap-4 mb-4">
            {data.stewardship.aware_badge && (
              <div className="bg-[var(--color-bg)] rounded-xl p-3 flex flex-col gap-1.5 items-center min-w-[100px]">
                <span className="text-xs text-[var(--color-text-muted)]">AWaRe category</span>
                <Badge variant={data.stewardship.aware_badge.variant as BadgeVariant}>
                  {data.stewardship.aware_badge.text}
                </Badge>
              </div>
            )}
            {data.stewardship.cia_badge && (
              <div className="bg-[var(--color-bg)] rounded-xl p-3 flex flex-col gap-1.5 items-center min-w-[100px]">
                <span className="text-xs text-[var(--color-text-muted)]">CIA status</span>
                <Badge variant={data.stewardship.cia_badge.variant as BadgeVariant}>
                  {data.stewardship.cia_badge.text}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-xs italic text-[var(--color-text-muted)]">
            System-derived from antimicrobial classification.
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center">
        <div className="w-full max-w-3xl flex gap-3">
          {isReadOnly ? (
            <Button 
              variant="outline" 
              className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
              onClick={() => router.push("/vet/home")}
            >
              Close
            </Button>
          ) : (
            <>
              <Button 
                className="flex-[2] min-h-[44px] bg-[var(--color-accent-vet)] hover:bg-[#c25d31] border-none text-white" 
                onClick={onNext}
              >
                Continue to Sign &rarr;
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
                onClick={() => router.push("/vet/home")}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
