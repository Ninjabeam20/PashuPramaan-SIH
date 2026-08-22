import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

interface PrescriptionItem {
  rx_id: string;
  farm: string;
  animal_flock: string;
  diagnosis: string;
  status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  aware_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  time?: string;
  date_label?: string;
  action_text: string;
  action_target: "sign_flow" | "countersign_flow" | "read_only";
}

interface PrescriptionsTableProps {
  prescriptions: PrescriptionItem[];
  onReviewClick?: (caseId: string, actionText: string, actionTarget: string) => void;
}

export function PrescriptionsTable({ prescriptions, onReviewClick }: PrescriptionsTableProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden mb-8 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)]">
              <th className="p-4 pl-5 font-bold">PRESCRIPTION</th>
              <th className="p-4 font-bold">ANIMAL</th>
              <th className="p-4 font-bold">DIAGNOSIS</th>
              <th className="p-4 text-right font-bold">STATUS</th>
              <th className="p-4 text-center font-bold">AWARE</th>
              <th className="p-4 pr-5 text-right font-bold">DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {prescriptions.map((item, idx) => (
              <tr key={idx} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="p-4 pl-5">
                  <div className="font-bold text-sm text-[var(--color-text)]">{item.rx_id}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{item.farm}</div>
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">
                  {item.animal_flock}
                </td>
                <td className="p-4 text-sm text-[var(--color-text-muted)]">
                  {item.diagnosis}
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {item.status_badges.map((b, i) => (
                      <Badge key={i} variant={b.variant as BadgeVariant} dot={b.dot}>
                        {b.text}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {item.aware_badges?.map((b, i) => (
                      <Badge key={i} variant={b.variant as BadgeVariant} dot={b.dot}>
                        {b.text}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-4 pr-5 text-right whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  <span className="mr-4">{item.date_label || item.time}</span>
                  <button 
                    className="font-semibold text-[var(--color-text)] hover:underline"
                    onClick={() => onReviewClick?.(item.rx_id, item.action_text, item.action_target)}
                  >
                    {item.action_text} &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
