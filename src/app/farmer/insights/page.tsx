"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFarmInsights } from "@/lib/api/dummy/farm-insights";
import { InsightsAtAGlance } from "@/components/farmer/InsightsAtAGlance";
import { MedicineDemandChart } from "@/components/farmer/MedicineDemandChart";
import { FarmHeatmap } from "@/components/farmer/FarmHeatmap";
import { MedicinesToWatchList } from "@/components/farmer/MedicinesToWatchList";
import { AttentionList } from "@/components/farmer/AttentionList";
import { WhyThisMattersCallout } from "@/components/farmer/WhyThisMattersCallout";

export default function InsightsPage() {
  const [range, setRange] = React.useState<"30d" | "90d">("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["farm-insights", range],
    queryFn: () => getFarmInsights(range),
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div>
        <Link href="/farmer/home" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center min-h-[44px]">
          &larr; Back to Home
        </Link>
      </div>

      {/* Header section with Toggle */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 -mt-2">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            INSIGHTS
          </div>
          <h1 className="text-4xl font-display font-normal text-[var(--color-text)] mb-2">
            Farm Insights
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Understand what your farm may need next.
          </p>
        </div>
        
        {/* Toggle Pill */}
        <div className="shrink-0">
          <div className="flex items-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1 min-h-[44px]">
            <button
              onClick={() => setRange("30d")}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                range === "30d" 
                  ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]" 
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setRange("90d")}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                range === "90d" 
                  ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text)]" 
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </section>

      {isLoading || !data ? (
        <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)] animate-pulse">
          Loading insights...
        </div>
      ) : (
        <>
          <section>
            <InsightsAtAGlance data={data.at_a_glance} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <MedicineDemandChart data={data.medicine_demand} />
            <FarmHeatmap data={data.farm_heatmap} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <MedicinesToWatchList data={data.medicines_to_watch} />
            <AttentionList data={data.attention_items} />
          </section>

          <section>
            <WhyThisMattersCallout data={data.why_this_matters} />
          </section>
        </>
      )}

    </div>
  );
}
