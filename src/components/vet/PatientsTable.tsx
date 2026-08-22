import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { PatientItem } from "@/lib/api/dummy/vet-patients";

interface PatientsTableProps {
  patients: PatientItem[];
  onViewClick?: (patientId: string) => void;
}

export function PatientsTable({ patients, onViewClick }: PatientsTableProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden mb-8 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)]">
              <th className="p-4 pl-5 font-bold">PATIENT / ANIMAL ID</th>
              <th className="p-4 font-bold">ANIMAL TYPE</th>
              <th className="p-4 font-bold">FARM / OWNER</th>
              <th className="p-4 font-bold">CURRENT STATUS</th>
              <th className="p-4 pr-5 font-bold">LAST FOLLOW-UP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {patients.map((item, idx) => (
              <tr key={idx} className="hover:bg-[var(--color-bg)] transition-colors">
                <td className="p-4 pl-5">
                  <div className="font-bold text-[13px] text-[var(--color-text)]">{item.id}</div>
                </td>
                <td className="p-4 text-[13px] text-[var(--color-text-muted)] font-medium">
                  {item.type}
                </td>
                <td className="p-4 text-[13px] text-[var(--color-text-muted)] font-medium">
                  {item.farm}
                </td>
                <td className="p-4">
                  <Badge variant={item.status.variant as BadgeVariant} dot={item.status.dot}>
                    {item.status.text}
                  </Badge>
                </td>
                <td className="p-4 pr-5 whitespace-nowrap text-[13px] text-[var(--color-text-muted)] font-medium flex items-center justify-between">
                  <span>{item.last_follow_up}</span>
                  <button 
                    className="font-bold text-[13px] text-[#1f6b4f] hover:underline"
                    onClick={() => onViewClick?.(item.id)}
                  >
                    View &rarr;
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
