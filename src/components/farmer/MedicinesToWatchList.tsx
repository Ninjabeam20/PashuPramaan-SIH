import * as React from "react";
import { MoveUp, MoveRight, MoveDown } from "lucide-react";
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function MedicinesToWatchList({ data }: { data: FarmInsights["medicines_to_watch"] }) {
  const getTrendStyle = (trend: string) => {
    switch (trend) {
      case "up":
        return { icon: MoveUp, color: "text-[#c93f4e]", badgeBg: "bg-[#fce8e8]/70" };
      case "flat":
        return { icon: MoveRight, color: "text-[#b67a28]", badgeBg: "bg-[#faecd1]/70" };
      case "down":
        return { icon: MoveDown, color: "text-[#557b4f]", badgeBg: "bg-[#e2ead8]/70" };
      default:
        return { icon: MoveRight, color: "text-gray-500", badgeBg: "bg-gray-100" };
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col w-full h-full shadow-sm overflow-hidden min-h-[250px]">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          Medicines to Watch
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {data.map((item, idx) => {
          const style = getTrendStyle(item.trend);
          const Icon = style.icon;
          
          return (
            <div key={idx} className="flex items-center justify-between p-4 sm:px-6 hover:bg-[var(--color-bg)] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`${style.color}`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <div className="font-bold text-sm text-[var(--color-text)]">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className={`shrink-0 ml-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.badgeBg} ${style.color}`}>
                {item.level}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
