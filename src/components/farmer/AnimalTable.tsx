import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Beef, CalendarDays, ChevronRight } from "lucide-react"; 
import { HealthHistoryModal } from "./HealthHistoryModal";

export interface AnimalItem {
  id: string;
  type: string;
  status: "under_treatment" | "healthy" | "waiting";
}

export function AnimalTable({ animals, onViewAction }: { animals: AnimalItem[], onViewAction?: (id: string) => void }) {
  const [historyAnimalId, setHistoryAnimalId] = React.useState<string | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case "under_treatment": return "Under Treatment";
      case "healthy": return "Healthy";
      case "waiting": return "Waiting";
      default: return status;
    }
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "under_treatment": return "under_treatment";
      case "healthy": return "healthy";
      case "waiting": return "waiting";
      default: return "normal";
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Table Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)]">
        <div className="col-span-3">ID</div>
        <div className="col-span-3">TYPE</div>
        <div className="col-span-4">STATUS</div>
        <div className="col-span-2 text-right"></div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {animals.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">
            No animals found matching your filters.
          </div>
        ) : (
          animals.map((animal, idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 p-4 sm:px-5 sm:py-4 hover:bg-[var(--color-bg)] transition-colors items-start sm:items-center"
            >
              <div className="flex items-center justify-between w-full sm:w-auto sm:col-span-3">
                <span className="font-bold text-sm text-[var(--color-text)]">{animal.id}</span>
                {/* Mobile only status */}
                <div className="sm:hidden">
                  <Badge variant={getStatusVariant(animal.status)}>
                    {getStatusText(animal.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:col-span-3 text-sm text-[var(--color-text-muted)]">
                <div className="w-5 h-5 bg-[#e2ead8]/50 rounded flex items-center justify-center text-[#557b4f]">
                  <Beef size={12} />
                </div>
                {animal.type}
              </div>

              {/* Desktop only status */}
              <div className="hidden sm:block sm:col-span-4">
                <Badge variant={getStatusVariant(animal.status)}>
                  {getStatusText(animal.status)}
                </Badge>
              </div>

              <div className="w-full sm:w-auto sm:col-span-2 flex justify-end mt-2 sm:mt-0 border-t border-[var(--color-border)] sm:border-t-0 pt-3 sm:pt-0 gap-4">
                <button 
                  className="text-[#1f6b4f] hover:text-[var(--color-primary-dark)] flex items-center justify-center p-2 rounded-md hover:bg-[#eef4ed] transition-colors"
                  onClick={() => setHistoryAnimalId(animal.id)}
                >
                  <CalendarDays size={18} />
                </button>
                <button 
                  className="text-xs font-bold text-[#1f6b4f] hover:text-[var(--color-primary-dark)] flex items-center min-h-[44px] sm:min-h-0"
                  onClick={() => onViewAction?.(animal.id)}
                >
                  View <ChevronRight size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {historyAnimalId && (
        <HealthHistoryModal 
          animalId={historyAnimalId} 
          onClose={() => setHistoryAnimalId(null)} 
        />
      )}
    </div>
  );
}
