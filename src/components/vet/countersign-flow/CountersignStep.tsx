import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";
import { SignatureCapture } from "@/components/vet/shared/SignatureCapture";
import { PinInput } from "@/components/vet/shared/PinInput";

interface CountersignStepProps {
  data: PrescriptionSignDetail;
  onSubmit: (payload: { typed_name: string; has_drawn_signature: boolean; pin: string }) => void;
  isSubmitting: boolean;
  pinError: string | null;
}

export function CountersignStep({ data, onSubmit, isSubmitting, pinError }: CountersignStepProps) {
  const router = useRouter();
  
  const [typedName, setTypedName] = React.useState("");
  const [pin, setPin] = React.useState(["", "", "", ""]);
  const [hasDrawn, setHasDrawn] = React.useState(false);
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const isFormValid = () => {
    const isSignatureValid = hasDrawn || typedName.trim().length > 0;
    const isPinValid = pin.every(p => p !== "");
    return isSignatureValid && isPinValid;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;
    
    onSubmit({
      typed_name: typedName,
      has_drawn_signature: hasDrawn,
      pin: pin.join("")
    });
  };

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            {data.rx_id} &middot; EMERGENCY ADMINISTRATION
          </div>
          {data.status_badges.map((b, i) => (
            <Badge key={i} variant={b.variant as BadgeVariant} dot={b.dot}>
              {b.text}
            </Badge>
          ))}
        </div>
        
        <div className="flex flex-col gap-1 mb-4 border-b border-[var(--color-border)] pb-4">
          <h2 className="text-xl font-bold text-[var(--color-text)] leading-tight">
            {data.diagnosis}
          </h2>
          <div className="text-sm text-[var(--color-text-muted)]">
            {data.farm} &middot; {data.animal}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Medicine</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.drug}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Dose</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.dose}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Route</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.route}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Frequency</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.frequency}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Duration</div>
            <div className="text-sm font-bold text-[var(--color-text)]">{data.prescription.duration}</div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[10px] text-[var(--color-text-muted)]">Administered</div>
            <div className="text-sm font-bold text-[var(--color-text)]">09:18</div> {/* Placeholder, or feed from data */}
          </div>
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="bg-[#faecd1]/40 border border-[#b67a28]/30 rounded-2xl p-5 mb-6 flex flex-col gap-2">
        <h3 className="font-bold text-[#b67a28]">{data.confirmation_heading || "Countersignature confirmation"}</h3>
        <p className="text-sm text-[#b67a28]">
          {data.confirmation_text || "By countersigning, I confirm that I have reviewed this emergency administration record and am formally adding my countersignature to authorize it."}
        </p>
      </div>

      <SignatureCapture 
        typedName={typedName}
        onTypedNameChange={setTypedName}
        hasDrawn={hasDrawn}
        onHasDrawnChange={setHasDrawn}
        canvasRef={canvasRef}
        placeholder="Dr. Full Name"
      />

      <PinInput 
        pin={pin}
        onChange={setPin}
        error={pinError}
        message="Enter your 4-digit Signing PIN to authorize this countersignature."
      />

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center z-10">
        <div className="w-full max-w-[720px] flex gap-3">
          <Button 
            className="flex-[2] min-h-[44px] bg-[var(--status-good-text)] hover:bg-[#43673f] border-none text-white" 
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? "Countersigning..." : "Countersign Emergency"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 min-h-[44px] bg-[var(--color-bg)]" 
            onClick={() => router.push("/vet/home")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>

    </div>
  );
}
