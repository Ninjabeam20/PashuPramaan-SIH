import * as React from "react";
import { Card } from "@/components/ui/Card";

interface FarmHealthMapCell {
  species: string;
  level: "Low" | "Moderate" | "High";
  detail: string;
}

export function FarmHealthMedicineMap({ data }: { data: FarmHealthMapCell[] }) {
  const getLevelStyles = (level: "Low" | "Moderate" | "High") => {
    switch (level) {
      case "Low": 
        return { bg: "bg-[#e2ead8]/50", border: "border-[#557b4f]/30", dot: "bg-[#557b4f]", text: "text-[#557b4f]" };
      case "Moderate": 
        return { bg: "bg-[#faecd1]/50", border: "border-[#b67a28]/30", dot: "bg-[#b67a28]", text: "text-[#b67a28]" };
      case "High": 
        return { bg: "bg-[#fce8e8]/50", border: "border-[#c93f4e]/30", dot: "bg-[#c93f4e]", text: "text-[#c93f4e]" };
    }
  };

  return (
    <Card className="flex flex-col p-6 shadow-sm w-full">
      <div className="mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
          Farm Health & Medicine Map
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Where health and medicine attention is concentrated across your farm.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.map((item) => {
          const styles = getLevelStyles(item.level);
          return (
            <div 
              key={item.species} 
              className={`flex flex-col p-4 rounded-xl border ${styles.bg} ${styles.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                <span className={`text-[10px] font-bold tracking-widest uppercase ${styles.text}`}>
                  {item.level}
                </span>
              </div>
              <h3 className="text-base font-bold text-[var(--color-text)] mb-1">
                {item.species}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] font-medium">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#557b4f]" />
          <span className="text-xs text-[var(--color-text-muted)] font-semibold">Low requirement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#b67a28]" />
          <span className="text-xs text-[var(--color-text-muted)] font-semibold">Moderate requirement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c93f4e]" />
          <span className="text-xs text-[var(--color-text-muted)] font-semibold">High requirement</span>
        </div>
      </div>
    </Card>
  );
}
