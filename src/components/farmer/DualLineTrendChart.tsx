"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export interface Series {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

export interface DualLineTrendChartProps {
  data: any[];
  xAxisKey: string;
  series1: Series;
  series2: Series;
  yAxis?: "shared" | "dual";
}

export function DualLineTrendChart({ data, xAxisKey, series1, series2, yAxis = "shared" }: DualLineTrendChartProps) {
  const dual = yAxis === "dual";

  return (
    <div className="flex flex-col w-full h-full min-h-[300px]">
      <div className="flex-1 w-full min-h-[200px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: dual ? 10 : 10, left: 10, bottom: 0 }}>
              <XAxis 
                dataKey={xAxisKey} 
                interval={0}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "var(--color-text-muted)" }} 
                dy={10}
              />
            {dual ? (
              <>
                <YAxis yAxisId="left" hide domain={["dataMin - 10", "dataMax + 10"]} />
                <YAxis yAxisId="right" orientation="right" hide domain={["dataMin - 2", "dataMax + 2"]} />
              </>
            ) : (
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            )}
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--color-text)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--color-text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
            />

            <Line 
              type="monotone" 
              dataKey={series1.key} 
              stroke={series1.color} 
              strokeWidth={2} 
              strokeDasharray={series1.dashed ? "5 5" : undefined}
              dot={{ r: 3, fill: series1.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name={series1.label}
              yAxisId={dual ? "left" : undefined}
            />

            <Line 
              type="monotone" 
              dataKey={series2.key} 
              stroke={series2.color} 
              strokeWidth={2} 
              strokeDasharray={series2.dashed ? "5 5" : undefined}
              dot={{ r: 3, fill: series2.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              name={series2.label}
              yAxisId={dual ? "right" : undefined}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-0 border-t-2 ${series1.dashed ? 'border-dashed' : 'border-solid'}`} 
            style={{ borderColor: series1.color }} 
          />
          <span className="text-xs text-[var(--color-text-muted)]">{series1.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className={`w-4 h-0 border-t-2 ${series2.dashed ? 'border-dashed' : 'border-solid'}`} 
            style={{ borderColor: series2.color }} 
          />
          <span className="text-xs text-[var(--color-text-muted)]">{series2.label}</span>
        </div>
      </div>
    </div>
  );
}
