import * as React from "react";
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function FarmHeatmap({ data }: { data: FarmInsights["farm_heatmap"] }) {
  const getStyle = (level: string) => {
    switch (level) {
      case "Low":
        return { bg: "bg-[#e2ead8]/40", text: "text-[#557b4f]", dot: "bg-[#557b4f]", border: "border-[#e2ead8]" };
      case "Moderate":
        return { bg: "bg-[#faecd1]/40", text: "text-[#b67a28]", dot: "bg-[#b67a28]", border: "border-[#faecd1]" };
      case "High":
        return { bg: "bg-[#fce8e8]/40", text: "text-[#c93f4e]", dot: "bg-[#c93f4e]", border: "border-[#fce8e8]" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-500", border: "border-gray-200" };
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col w-full h-full min-h-[400px]">
      
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          Farm Heatmap
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Where medicine requirement is expected on your farm.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
        {data.map((item, idx) => {
          const style = getStyle(item.level);
          return (
            <div 
              key={idx} 
              className={`flex flex-col gap-1 p-3 rounded-lg border ${style.bg} ${style.border}`}
            >
              <div className={`flex items-center gap-1.5 text-xs font-bold ${style.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {item.level}
              </div>
              <div className="text-sm font-bold text-[var(--color-text)] mt-0.5">
                {item.entity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#557b4f]" />
          Low requirement
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#b67a28]" />
          Moderate requirement
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c93f4e]" />
          High requirement
        </div>
      </div>

    </div>
  );
}
