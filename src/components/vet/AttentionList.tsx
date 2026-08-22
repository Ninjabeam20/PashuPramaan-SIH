import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

interface AttentionBadge {
  text: string;
  variant: string;
  dot?: boolean;
}

export interface AttentionItem {
  id: string;
  type: string;
  priority_color: string;
  label: string;
  link_text: string;
  title: string;
  diagnosis: string;
  detail: string;
  badges: AttentionBadge[];
}

export function AttentionCard({ item, onReviewClick }: { item: AttentionItem, onReviewClick?: (caseId: string, actionText: string) => void }) {
  const accentColorMap: Record<string, string> = {
    orange: "bg-[var(--color-accent-vet)]",
    red: "bg-[var(--status-high-text)]",
    purple: "bg-[#7c3aed]",
  };

  const accentClass = accentColorMap[item.priority_color] || "bg-[var(--color-border)]";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-2">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass}`} />
      
      <div className="pl-2 flex justify-between items-start gap-2">
        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
          {item.label}
        </div>
        <button 
          className="text-xs font-semibold text-[var(--color-text)] hover:underline flex items-center min-h-[44px] sm:min-h-0 sm:py-0 -mt-3 sm:mt-0"
          onClick={() => onReviewClick?.(item.id, item.link_text)}
        >
          {item.link_text}
        </button>
      </div>

      <div className="pl-2 flex flex-col gap-1">
        <div className="font-bold text-[var(--color-text)]">{item.title}</div>
        <div className="text-xs text-[var(--color-text-muted)]">{item.diagnosis}</div>
        {item.detail && (
          <div className="text-xs text-[var(--color-text-muted)] mb-1">{item.detail}</div>
        )}
      </div>

      {item.badges && item.badges.length > 0 && (
        <div className="pl-2 mt-1 flex flex-wrap gap-2">
          {item.badges.map((b, i) => (
            <Badge key={i} variant={b.variant as BadgeVariant} dot={b.dot}>
              {b.text}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function AttentionList({ items, onReviewClick }: { items: AttentionItem[], onReviewClick?: (caseId: string, actionText: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <AttentionCard key={item.id} item={item} onReviewClick={onReviewClick} />
      ))}
    </div>
  );
}
