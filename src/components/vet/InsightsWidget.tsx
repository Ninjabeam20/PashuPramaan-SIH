import * as React from "react";
import { LightbulbOff } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ListWidget } from "./ListWidget";

interface Insight {
  id: string;
  type: string;
  case_title?: string;
  species?: string;
  similar_case_count?: number;
  recovery_pct?: number;
  recovery_label?: string;
  disclaimer?: string;
}

interface InsightsWidgetProps {
  insights: Insight[];
}

export function InsightsWidget({ insights = [] }: InsightsWidgetProps) {
  return (
    <ListWidget
      items={insights}
      emptyIcon={LightbulbOff}
      emptyText="No insights"
      maxVisible={2}
      modalTitle="All Insights"
      viewAllText={(count) => `View all ${count} insights`}
      title={
        <div className="px-5 pt-4 pb-3">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
            INSIGHTS
          </div>
        </div>
      }
      renderItem={(insight) => {
        if (insight.type === "treatment_evidence") {
          return (
            <div key={insight.id} className="border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <div className="text-sm font-bold text-[var(--color-text)]">
                  {insight.case_title}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {insight.similar_case_count} similar recorded cases
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span>{insight.recovery_label}</span>
                  <span className="text-[var(--status-good-text)]">{insight.recovery_pct}%</span>
                </div>
                <ProgressBar progress={insight.recovery_pct || 0} colorClass="bg-[var(--status-good-text)]" />
              </div>

              <div className="text-[10px] text-[var(--color-text-muted)] italic leading-relaxed">
                {insight.disclaimer}
              </div>
            </div>
          );
        }
        return null;
      }}
    />
  );
}
