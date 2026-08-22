import * as React from "react";

interface SpeciesOverview {
  species: string;
  count: number;
  healthy_count: number;
  under_treatment_count: number;
  waiting_count: number;
}

export function AnimalOverviewCards({ data }: { data: SpeciesOverview[] }) {
  // Simple fallback icons for species using text/emoji or shapes, 
  // since we don't have explicit svgs for each
  const getIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cows': return '🐄';
      case 'buffaloes': return '🐃';
      case 'goats': return '🐐';
      default: return '🐾';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((item, idx) => (
        <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm flex flex-col">
          
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--color-border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg)] flex items-center justify-center text-xl shadow-sm border border-[var(--color-border)]/50">
              {getIcon(item.species)}
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-[var(--color-text)] text-sm">{item.species}</h3>
              <div className="text-sm font-medium">
                <span className="text-2xl font-bold mr-1.5">{item.count}</span>
                <span className="text-xs text-[var(--color-text-muted)] font-normal">animals</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#557b4f]"></span>
                Healthy
              </div>
              <div className="text-xs font-bold text-[#557b4f]">{item.healthy_count}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b67a28]"></span>
                Under Treatment
              </div>
              <div className="text-xs font-bold text-[#b67a28]">{item.under_treatment_count}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a47b53]"></span>
                Waiting
              </div>
              <div className="text-xs font-bold text-[#a47b53]">{item.waiting_count}</div>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
