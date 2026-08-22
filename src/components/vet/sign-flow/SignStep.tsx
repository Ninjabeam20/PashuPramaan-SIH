import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionSignDetail } from "@/lib/api/dummy/vet-sign-flow";
import { Input } from "@/components/ui/Input";

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
  const isDrawing = React.useRef(false);
  const pinRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    draw(e);
  };
  
  const stopDrawing = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Set drawing styles
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "var(--color-text)";

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (!hasDrawn) setHasDrawn(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handlePinChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    
    const newPin = [...pin];
    newPin[idx] = value.substring(value.length - 1);
    setPin(newPin);
    
    // Auto-advance
    if (value && idx < 3) {
      pinRefs.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      pinRefs.current[idx - 1]?.focus();
    }
  };

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

      {/* Signature Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-4">
          YOUR SIGNATURE
        </div>
        
        <div className="relative border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] overflow-hidden">
          {!hasDrawn && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-sm text-[var(--color-text-muted)]">
              Draw your signature here
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full h-[150px] touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        <button 
          className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] self-start mt-2"
          onClick={clearCanvas}
        >
          Clear
        </button>

        <div className="flex items-center my-6 gap-4">
          <div className="flex-1 h-px bg-[var(--color-border)]" />
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase shrink-0">
            OR TYPE FULL NAME
          </div>
          <div className="flex-1 h-px bg-[var(--color-border)]" />
        </div>

        <Input 
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder=""
        />
      </div>

      {/* PIN Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center text-center">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          SIGNING PIN
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Enter your 4-digit Signing PIN to authorize this prescription.
        </p>

        <div className="flex gap-4 justify-center mb-4">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { pinRefs.current[idx] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(idx, e.target.value)}
              onKeyDown={(e) => handlePinKeyDown(idx, e)}
              className="w-12 h-14 border border-[var(--color-border)] rounded-lg text-center text-2xl font-bold bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          ))}
        </div>

        {pinError && (
          <div className="text-sm text-red-500 font-bold mb-4">{pinError}</div>
        )}

        <div className="flex flex-col gap-1">
          <div className="text-xs italic text-[var(--color-text-muted)]">
            This is your separate Signing PIN, not your application login.
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]/70">
            Demo: use PIN 1234
          </div>
        </div>
      </div>

      {/* NOTE: This validation is for demo purposes only. A real product requires a cryptographic signing ceremony (e.g. ECDSA P-256). */}
      
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 pb-safe sm:pb-4 justify-center">
        <div className="w-full max-w-3xl flex gap-3">
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
