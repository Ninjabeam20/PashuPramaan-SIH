import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";

interface SignedResultStepProps {
  data: PrescriptionSignDetail;
  result: {
    signed_by: string;
    date_time: string;
    status: string;
    signature_reference: string;
  };
  typedName: string;
  drawnImage: string | null;
}

export function SignedResultStep({ data, result, typedName, drawnImage }: SignedResultStepProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Success Banner */}
      <div className="bg-[#e2ead8]/40 border border-[#e2ead8] rounded-2xl p-8 flex flex-col items-center text-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#e2ead8] flex items-center justify-center text-[#557b4f]">
          <Check size={24} strokeWidth={3} />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-[#557b4f]">Prescription Signed</h2>
          <div className="text-sm text-[#557b4f]/80">
            {data.rx_id} &middot; {data.diagnosis}
          </div>
          <div className="text-sm text-[#557b4f]/80">
            {data.farm} &middot; {data.animal}
          </div>
        </div>
      </div>

      {/* Signing Record */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
          SIGNING RECORD
        </div>
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Signed by</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{result.signed_by}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Date & time</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{result.date_time}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Status</div>
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#e2ead8] text-[#557b4f] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-[#557b4f]" />
                SIGNED
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-[var(--color-text-muted)]">Signature reference</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{result.signature_reference}</div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      {typedName && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-3">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            SIGNATURE
          </div>
          <div className="text-3xl italic" style={{ fontFamily: "cursive, serif" }}>
            {typedName}
          </div>
        </div>
      )}

      {drawnImage && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-3">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            SIGNATURE
          </div>
          <img src={drawnImage} alt="Drawn signature" className="h-[100px] object-contain object-left" />
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center">
        <div className="w-full max-w-3xl flex gap-3">
          <Button 
            className="flex-[2] min-h-[44px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] border-none text-white" 
            onClick={() => console.log("View Prescription clicked")}
          >
            View Prescription
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
            onClick={() => router.push("/vet/prescriptions")}
          >
            Back to Prescriptions
          </Button>
        </div>
      </div>

    </div>
  );
}
