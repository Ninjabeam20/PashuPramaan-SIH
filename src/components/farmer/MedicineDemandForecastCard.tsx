"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip
} from "recharts";

interface MedicineDemandForecastCardProps {
  data: {
    chart_data: { month: string; past_usage: number | null; forecast: number | null }[];
    now_index: number;
    current_stock: string;
    expected_requirement: string;
    status: { text: string; variant: string };
  };
  range: "30d" | "60d" | "90d";
  onRangeChange: (range: "30d" | "60d" | "90d") => void;
}

export function MedicineDemandForecastCard({ data, range, onRangeChange }: MedicineDemandForecastCardProps) {
  const chartColor = "#e46a4d";
  const areaColor = "#fce8e8";

  const rangeLabels = {
    "30d": "30 Days",
    "60d": "60 Days",
    "90d": "90 Days"
  };

  return (
    <Card className="flex flex-col p-6 shadow-sm h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            Medicine Demand Forecast
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Historical usage transitioning into predicted demand
          </p>
        </div>
        
        <div className="shrink-0 flex items-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full p-1">
          {(["30d", "60d", "90d"] as const).map((val) => {
            const isActive = range === val;
            return (
              <button
                key={val}
                onClick={() => onRangeChange(val)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                  isActive 
                    ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text)] border border-[var(--color-border)]" 
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent"
                }`}
              >
                {rangeLabels[val]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[250px] mt-4 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.chart_data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} 
              dy={10}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--color-text)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
            />

            {data.now_index !== undefined && data.chart_data[data.now_index] && (
              <ReferenceLine 
                x={data.chart_data[data.now_index].month} 
                stroke="var(--color-border)" 
                strokeDasharray="3 3"
                label={{ 
                  position: 'top', 
                  value: 'Now', 
                  fill: 'var(--color-text-muted)', 
                  fontSize: 10,
                  dy: -10
                }} 
              />
            )}

            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="none" 
              fill={areaColor} 
              fillOpacity={0.6}
            />

            <Line 
              type="monotone" 
              dataKey="past_usage" 
              stroke={chartColor} 
              strokeWidth={2} 
              dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Past usage"
            />

            <Line 
              type="monotone" 
              dataKey="forecast" 
              stroke={chartColor} 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-[#e46a4d]" />
          <span className="text-xs text-[var(--color-text-muted)] font-semibold">Historical usage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0 border-t-2 border-dashed border-[#e46a4d]" />
          <span className="text-xs text-[var(--color-text-muted)] font-semibold">Forecast ({rangeLabels[range]})</span>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="bg-[#FAF8F3] border border-[var(--color-border)] rounded-xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Current Stock</span>
          <span className="text-sm font-bold text-[var(--color-text)]">{data.current_stock}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Expected Requirement</span>
          <span className="text-sm font-bold text-[var(--color-text)]">{data.expected_requirement}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">Status</span>
          <Badge variant={data.status.variant as BadgeVariant} className="normal-case tracking-normal text-xs font-semibold px-2 py-0.5 w-fit">
            {data.status.text}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
