import * as React from "react";

interface PinInputProps {
  pin: string[];
  onChange: (pin: string[]) => void;
  error?: string | null;
  message?: string;
}

export function PinInput({ pin, onChange, error, message = "Enter your 4-digit Signing PIN to authorize this prescription." }: PinInputProps) {
  const pinRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[idx] = value.substring(value.length - 1);
    onChange(newPin);
    
    if (value && idx < 3) {
      pinRefs.current[idx + 1]?.focus();
    }
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[idx] && idx > 0) {
      pinRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center text-center">
      <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
        SIGNING PIN
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        {message}
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

      {error && (
        <div className="text-sm text-red-500 font-bold mb-4">{error}</div>
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
  );
}
