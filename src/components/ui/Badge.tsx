import * as React from "react";

export type BadgeVariant = "good" | "high" | "medium" | "normal" | "alert" | "sign" | "access" | "watch" | "cia" | "unsigned_emergency" | "signed" | "recovered" | "improved" | "follow_up_pending" | "action_needed";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = "good", dot, className, children, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider";
  
  const variants = {
    good: "bg-[var(--status-good-bg)] text-[var(--status-good-text)]",
    high: "bg-[var(--status-high-bg)] text-[var(--status-high-text)]",
    alert: "bg-[var(--status-high-bg)] text-[var(--status-high-text)]",
    medium: "bg-[var(--status-medium-bg)] text-[var(--status-medium-text)]",
    normal: "bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
    sign: "text-[#de6a38] border border-[#de6a38]/30 bg-transparent",
    access: "text-[var(--status-good-text)] border border-[var(--status-good-text)]/30 bg-transparent",
    watch: "text-[#c27c19] border border-[#c27c19]/30 bg-transparent",
    cia: "text-[#7c3aed] border border-[#7c3aed]/30 bg-transparent",
    unsigned_emergency: "bg-[var(--status-high-bg)] text-[var(--status-high-text)] border border-[var(--status-high-text)]/30",
    signed: "bg-[var(--status-good-bg)] text-[var(--status-good-text)] border border-[var(--status-good-text)]/30",
    recovered: "text-[var(--status-good-text)] border border-[var(--status-good-text)]/30 bg-transparent",
    improved: "text-[#2563eb] border border-[#2563eb]/30 bg-transparent",
    follow_up_pending: "text-[#d97706] border border-[#d97706]/30 bg-transparent",
    action_needed: "bg-[var(--status-high-bg)] text-[var(--status-high-text)]",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className || ""}`} {...props}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}
