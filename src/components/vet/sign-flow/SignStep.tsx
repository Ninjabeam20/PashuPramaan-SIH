import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";
import { Input } from "@/components/ui/Input";
import { SignatureCapture } from "@/components/vet/shared/SignatureCapture";
import { PinInput } from "@/components/vet/shared/PinInput";

interface SignStepProps {
  data: PrescriptionSignDetail;
  onSubmit: (payload: { typed_name: string; has_drawn_signature: boolean; pin: string; drawn_image: string | null }) => void;
  isSubmitting: boolean;
  pinError: string | null;
}

export function SignStep({ data, onSubmit, isSubmitting, pinError }: SignStepProps) {
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
    
    const canvas = canvasRef.current;
    const drawn_image = hasDrawn && canvas ? canvas.toDataURL() : null;
    
    onSubmit({
      typed_name: typedName,
      has_drawn_signature: hasDrawn,
      pin: pin.join(""),
      drawn_image
    });
  };

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col gap-2">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          {data.rx_id}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {data.diagnosis}
          </h2>
          <div className="text-sm text-[var(--color-text-muted)]">
            {data.farm} &middot; {data.animal}
          </div>
          <div className="text-sm text-[var(--color-text)] mt-2">
            {data.prescription.drug} &middot; {data.prescription.dose} &middot; {data.prescription.route} &middot; {data.prescription.duration}
          </div>
        </div>
      </div>

      <SignatureCapture 
        typedName={typedName}
        onTypedNameChange={setTypedName}
        hasDrawn={hasDrawn}
        onHasDrawnChange={setHasDrawn}
        canvasRef={canvasRef}
      />

      <PinInput 
        pin={pin}
        onChange={setPin}
        error={pinError}
      />

      {/* NOTE: This validation is for demo purposes only. A real product requires a cryptographic signing ceremony (e.g. ECDSA P-256). */}
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center z-10">
        <div className="w-full max-w-[720px] flex gap-3">
          <Button 
            className="flex-[2] min-h-[44px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] border-none text-white" 
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? "Signing..." : "Sign and Lock Prescription"}
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
