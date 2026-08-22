import * as React from "react";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${className || ""}`} {...props}>
      {children}
    </div>
  );
}
