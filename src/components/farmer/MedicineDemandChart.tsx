"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
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
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function MedicineDemandChart({ data }: { data: FarmInsights["medicine_demand"] }) {
  const chartColor = "#e46a4d"; // coral/orange
  const areaColor = "#fce8e8";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col w-full h-full min-h-[400px]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
          Medicine Demand
        </div>
        <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-3xl font-bold font-display text-[var(--color-text)]">
          {data.level}
        </h2>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#faecd1] text-[#b67a28]">
          {data.range_label}
        </span>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        {data.summary}
      </p>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data.chart_data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} 
              dy={10}
            />
            {/* Hide Y Axis but keep it for scaling */}
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--color-text)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
            />

            {/* Reference Line for "Now" */}
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

            {/* Area under Forecast */}
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="none" 
              fill={areaColor} 
              fillOpacity={1}
            />

            {/* Past Usage Line (Solid) */}
            <Line 
              type="monotone" 
              dataKey="past_usage" 
              stroke={chartColor} 
              strokeWidth={2} 
              dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name="Past usage"
            />

            {/* Forecast Line (Dashed) */}
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
      <div className="flex items-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-[#e46a4d]" />
          <span className="text-xs text-[var(--color-text-muted)]">Past usage</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0 border-t-2 border-dashed border-[#e46a4d]" />
          <span className="text-xs text-[var(--color-text-muted)]">{data.range_label} forecast</span>
        </div>
      </div>

    </div>
  );
}
