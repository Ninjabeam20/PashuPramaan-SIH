import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";

interface CountersignedResultStepProps {
  data: PrescriptionSignDetail;
  result: { countersigned_by: string; date_time: string; reference: string; disclaimer_text: string };
  typedName: string;
}

export function CountersignedResultStep({ data, result, typedName }: CountersignedResultStepProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Success Card */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-8 flex flex-col items-center text-center shadow-sm mb-6">
        <div className="w-16 h-16 bg-[#dbeafe] text-[#1d4ed8] rounded-full flex items-center justify-center mb-4">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-[#1d4ed8] mb-2">
          Emergency Record Countersigned
        </h2>
        <div className="text-sm text-[#1d4ed8]/80 mb-1">
          {data.rx_id} &middot; {data.diagnosis}
        </div>
        <div className="text-sm text-[#1d4ed8]/80">
          {data.farm} &middot; {data.animal}
        </div>
      </div>

      {/* Record Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-sm mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
          COUNTERSIGNATURE RECORD
        </div>
        
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-[var(--color-text-muted)]">Countersigned by</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{result.countersigned_by}</div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="text-xs text-[var(--color-text-muted)]">Date & time</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{result.date_time}</div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="text-xs text-[var(--color-text-muted)]">Status</div>
            <div>
              <Badge variant="countersigned" dot>COUNTERSIGNED</Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="text-xs text-[var(--color-text-muted)]">Reference</div>
            <div className="text-sm text-[var(--color-text)]">{result.reference}</div>
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
        {result.disclaimer_text}
      </p>

      {/* Signature Render */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-sm mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
          SIGNATURE
        </div>
        
        {typedName ? (
          <div className="font-serif text-2xl italic">
            {typedName}
          </div>
        ) : (
          <div className="text-sm italic text-[var(--color-text-muted)]">
            Signature drawn by {result.countersigned_by}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center z-10">
        <div className="w-full max-w-[720px] flex gap-3">
          <Button 
            className="flex-[2] min-h-[44px] bg-[var(--status-good-text)] hover:bg-[#43673f] border-none text-white" 
            onClick={() => router.push(`/vet/prescriptions/${data.rx_id}`)}
          >
            View Record
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
            onClick={() => router.push("/vet/home")}
          >
            Back to Home
          </Button>
        </div>
      </div>

    </div>
  );
}
