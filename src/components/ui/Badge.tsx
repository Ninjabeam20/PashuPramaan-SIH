import * as React from "react";

export type BadgeVariant = "good" | "high" | "medium" | "normal" | "alert" | "sign" | "access" | "watch" | "cia" | "unsigned_emergency" | "signed" | "recovered" | "improved" | "follow_up_pending" | "action_needed" | "healthy" | "under_treatment" | "waiting" | "withdrawal_active" | "vet_signed" | "lab_mrl" | "active" | "completed" | "emergency_unsigned" | "no_lab_assay" | "pending_vet_signature" | "exception" | "cleared" | "withdrawal" | "blocked" | "countersigned" | "voided" | "reserve";

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
    healthy: "bg-[#e2ead8] text-[#557b4f]", // muted green/gray
    under_treatment: "bg-[#faecd1] text-[#b67a28]", // amber
    waiting: "bg-[#f2e2d0] text-[#a47b53]", // tan
    withdrawal_active: "bg-[#faecd1] text-[#b67a28]",
    vet_signed: "bg-[#e2ead8] text-[#557b4f]",
    lab_mrl: "bg-[#e2ead8] text-[#557b4f]",
    active: "bg-[#e2ead8] text-[#557b4f]",
    completed: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
    emergency_unsigned: "bg-[#f3e8ff] text-[#7c3aed]",
    no_lab_assay: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
    pending_vet_signature: "bg-[#faecd1] text-[#b67a28]",
    exception: "bg-[#f3e8ff] text-[#7c3aed]",
    cleared: "bg-[#e2ead8] text-[#557b4f]",
    withdrawal: "bg-[#faecd1] text-[#b67a28]",
    blocked: "bg-[#fce8e8] text-[#c93f4e]",
    countersigned: "bg-[#eff6ff] text-[#1d4ed8] border border-[#1d4ed8]/30",
    voided: "text-[var(--color-text-muted)] bg-[var(--color-border)]/30 line-through",
    reserve: "text-[#be123c] border border-[#be123c]/30 bg-transparent",
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
