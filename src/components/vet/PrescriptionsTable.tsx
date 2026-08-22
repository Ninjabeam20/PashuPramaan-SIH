import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

interface PrescriptionItem {
  rx_id: string;
  farm: string;
  animal_flock: string;
  diagnosis: string;
  status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  aware_badge: { text: string; variant: string; dot?: boolean } | null;
  time: string;
  action_text: string;
}

interface PrescriptionsTableProps {
  prescriptions: {
    total: number;
    items: PrescriptionItem[];
  };
}

export function PrescriptionsTable({ prescriptions }: PrescriptionsTableProps) {
  return (
    <Card className="flex flex-col p-0 overflow-hidden mb-8">
      <div className="p-5 flex items-start justify-between border-b border-[var(--color-border)]">
        <div>
          <h3 className="font-bold text-[var(--color-text)]">Prescriptions</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{prescriptions.total} records</p>
        </div>
        <button 
          className="text-xs font-semibold text-[var(--color-text)] hover:underline flex items-center min-h-[44px] -mt-2 sm:mt-0 sm:min-h-0"
          onClick={() => console.log("View all prescriptions")}
        >
          View all &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
              <th className="p-4 pl-5">PRESCRIPTION</th>
              <th className="p-4">ANIMAL</th>
              <th className="p-4">DIAGNOSIS</th>
              <th className="p-4 text-right">STATUS</th>
              <th className="p-4 text-center">AWARE</th>
              <th className="p-4 pr-5 text-right">TIME</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {prescriptions.items.map((item, idx) => (
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
                  {item.aware_badge && (
                    <Badge variant={item.aware_badge.variant as BadgeVariant} dot={item.aware_badge.dot}>
                      {item.aware_badge.text}
                    </Badge>
                  )}
                </td>
                <td className="p-4 pr-5 text-right whitespace-nowrap text-sm text-[var(--color-text-muted)]">
                  <span className="mr-4">{item.time}</span>
                  <button 
                    className="font-semibold text-[var(--color-text)] hover:underline"
                    onClick={() => console.log(`${item.action_text} for ${item.rx_id}`)}
                  >
                    {item.action_text}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
