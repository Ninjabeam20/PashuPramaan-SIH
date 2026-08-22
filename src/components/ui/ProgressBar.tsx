import * as React from "react";

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  className?: string;
}

export function ProgressBar({ progress, colorClass = "bg-[var(--color-primary)]", className }: ProgressBarProps) {
  return (
    <div className={`h-2.5 w-full bg-[#E5E0D5] rounded-full overflow-hidden ${className || ""}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
