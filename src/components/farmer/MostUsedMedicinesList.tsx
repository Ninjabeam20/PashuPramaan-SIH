import * as React from "react";
import { Card } from "@/components/ui/Card";

interface MostUsedMedicine {
  rank: number;
  name: string;
  usage: string;
  usage_value: number; // For relative bar width (0-100)
}

export function MostUsedMedicinesList({ data }: { data: MostUsedMedicine[] }) {
  // Orange for #1, Amber for #2, Green for #3 as per screenshot
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-[#e46a4d]"; // Coral/Orange
      case 2: return "bg-[#d97706]"; // Amber
      case 3: return "bg-[#557b4f]"; // Green
      default: return "bg-[var(--color-border)]";
    }
  };

  return (
    <Card className="flex flex-col p-6 shadow-sm h-full">
      <div className="mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
          Most Used Medicines
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Historical usage this season
        </p>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--color-text-muted)] w-2">{item.rank}</span>
                <span className="text-sm font-bold text-[var(--color-text)]">{item.name}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">{item.usage}</span>
            </div>
            
            <div className="w-full bg-[var(--color-surface)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]/50 relative">
              <div 
                className={`absolute left-0 top-0 bottom-0 rounded-full ${getRankColor(item.rank)}`}
                style={{ width: `${Math.max(5, item.usage_value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
