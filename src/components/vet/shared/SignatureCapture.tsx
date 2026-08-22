import * as React from "react";
import { Input } from "@/components/ui/Input";

interface SignatureCaptureProps {
  typedName: string;
  onTypedNameChange: (val: string) => void;
  hasDrawn: boolean;
  onHasDrawnChange: (val: boolean) => void;
  canvasRef: any;
  placeholder?: string;
}

export function SignatureCapture({ 
  typedName, 
  onTypedNameChange, 
  hasDrawn, 
  onHasDrawnChange, 
  canvasRef,
  placeholder = ""
}: SignatureCaptureProps) {
  
  const isDrawing = React.useRef(false);

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
    
    if (!hasDrawn) onHasDrawnChange(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onHasDrawnChange(false);
  };

  return (
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
        onChange={(e) => onTypedNameChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
