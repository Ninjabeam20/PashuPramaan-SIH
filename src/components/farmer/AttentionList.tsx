import * as React from "react";
import { TriangleAlert, CheckCircle2 } from "lucide-react";
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function AttentionList({ data }: { data: FarmInsights["attention_items"] }) {
  const getIconConfig = (iconType: string) => {
    switch (iconType) {
      case "warning_amber":
        return { 
          icon: TriangleAlert, 
          wrapperClass: "text-[#b67a28] bg-[#faecd1]/50 border border-[#faecd1]"
        };
      case "check_green":
        return { 
          icon: CheckCircle2, 
          wrapperClass: "text-[#557b4f] bg-[#e2ead8]/50 border border-[#e2ead8]"
        };
      case "warning_purple":
        return { 
          icon: TriangleAlert, 
          wrapperClass: "text-[#7c3aed] bg-[#f3e8ff]/50 border border-[#e9d5ff]"
        };
      default:
        return { 
          icon: TriangleAlert, 
          wrapperClass: "text-gray-500 bg-gray-100 border border-gray-200"
        };
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col w-full h-full shadow-sm overflow-hidden min-h-[250px]">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          What Needs Your Attention
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-[var(--color-border)]">
        {data.map((item, idx) => {
          const config = getIconConfig(item.icon);
          const Icon = config.icon;
          
          return (
            <div key={idx} className="flex items-start gap-4 p-4 sm:px-6 hover:bg-[var(--color-bg)] transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.wrapperClass}`}>
                <Icon size={16} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm text-[var(--color-text)]">
                  {item.title}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
