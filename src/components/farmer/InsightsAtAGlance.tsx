import * as React from "react";
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function InsightsAtAGlance({ data }: { data: FarmInsights["at_a_glance"] }) {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-[#e2ead8] text-[#557b4f]";
      case "Moderate":
        return "bg-[#faecd1] text-[#b67a28]";
      case "High":
        return "bg-[#fce8e8] text-[#c93f4e]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
      
      <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
        Your Farm at a Glance
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-8 sm:gap-16">
        
        {/* Medicine Demand */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            Medicine Demand
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(data.medicine_demand_level)}`}>
              {data.medicine_demand_level}
            </span>
          </div>
        </div>

        {/* Animals needing attention */}
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            Animals needing attention
          </div>
          <div className="text-3xl font-bold font-display text-[#c93f4e]">
            {data.animals_needing_attention}
          </div>
        </div>

        {/* Upcoming follow-ups */}
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            Upcoming follow-ups
          </div>
          <div className="text-3xl font-bold font-display text-[#b67a28]">
            {data.upcoming_followups}
          </div>
        </div>

      </div>

    </div>
  );
}
