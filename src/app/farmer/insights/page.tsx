"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getFarmInsights } from "@/lib/api/dummy/farm-insights";
import { queryKeys } from "@/lib/seed/query-keys";
import { MedicineStockTable } from "@/components/farmer/MedicineStockTable";
import { MedicineDemandForecastCard } from "@/components/farmer/MedicineDemandForecastCard";
import { MostUsedMedicinesList } from "@/components/farmer/MostUsedMedicinesList";
import { FarmHealthMedicineMap } from "@/components/farmer/FarmHealthMedicineMap";
import { DualLineTrendChart } from "@/components/farmer/DualLineTrendChart";
import { Card } from "@/components/ui/Card";

export default function InsightsPage() {
  const [range, setRange] = React.useState<"30d" | "60d" | "90d">("30d");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.farmInsights(range),
    queryFn: () => getFarmInsights(range),
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div>
        <Link href="/farmer/home" className="text-xs font-semibold text-[#557b4f] hover:underline flex items-center min-h-[44px]">
          &larr; Back to Home
        </Link>
      </div>

      {/* Header section */}
      <section className="flex flex-col -mt-2 mb-2">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
          INSIGHTS
        </div>
        <h1 className="text-4xl font-display font-bold text-[var(--color-text)] mb-2">
          Farm Insights
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Medicine stock, demand forecast, and farm health at a glance.
        </p>
      </section>

      {isLoading || !data ? (
        <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)] animate-pulse">
          Loading insights...
        </div>
      ) : (
        <>
          <section>
            <MedicineStockTable initialData={data.medicine_stock} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <MedicineDemandForecastCard 
                data={data.demand_forecast} 
                range={range} 
                onRangeChange={setRange} 
              />
            </div>
            <div className="lg:col-span-1">
              <MostUsedMedicinesList data={data.most_used_medicines} />
            </div>
          </section>

          <section>
            <FarmHealthMedicineMap data={data.farm_health_map} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <Card className="flex flex-col p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                  Farm Performance
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Milk output vs. medicine cost over the past year
                </p>
              </div>
              <DualLineTrendChart 
                data={data.farm_performance.chart_data}
                xAxisKey="month"
                yAxis="dual"
                series1={{ key: "milk_output", label: "Milk output (L)", color: "#557b4f" }}
                series2={{ key: "medicine_cost", label: "Medicine cost (₹00s)", color: "#e46a4d", dashed: true }}
              />
            </Card>

            <Card className="flex flex-col p-6 shadow-sm">
              <div className="mb-4">
                <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
                  Health & Treatment Trends
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Health events and treatment activity over the past year
                </p>
              </div>
              <DualLineTrendChart 
                data={data.health_treatment_trends.chart_data}
                xAxisKey="month"
                series1={{ key: "health_events", label: "Health events", color: "#c93f4e" }}
                series2={{ key: "treatments", label: "Treatments", color: "#b67a28", dashed: true }}
              />
            </Card>
          </section>
        </>
      )}

    </div>
  );
}
