import * as React from "react";

interface WithdrawalRibbonProps {
  doseTime: string;
  nowPct: number;
  clearLabel: string;
  productMessage: string;
}

export function WithdrawalRibbon({ doseTime, nowPct, clearLabel, productMessage }: WithdrawalRibbonProps) {
  // Ensure pct is between 0 and 100
  const pct = Math.max(0, Math.min(100, nowPct));
  
  // Format the doseTime cleanly if it's an ISO string
  const formattedDoseTime = doseTime.includes('T') 
    ? new Date(doseTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) 
    : doseTime;
    
  // Prevent the "Now" label from falling off the edges or overlapping wildly
  const labelLeft = pct < 15 ? 15 : pct > 85 ? 85 : pct;
  
  return (
    <div className="flex flex-col mt-4 w-full">
      <div className="relative w-full text-xs text-[var(--color-text-muted)] font-medium h-5 mb-1">
        <div className="absolute left-0 bottom-0">{formattedDoseTime}</div>
        <div 
          className="absolute bottom-0 text-[#b67a28] whitespace-nowrap transform -translate-x-1/2" 
          style={{ left: `${labelLeft}%` }}
        >
          Now ({pct}%)
        </div>
        <div className="absolute right-0 bottom-0">{clearLabel}</div>
      </div>
      
      <div className="relative h-2 bg-[var(--color-border)] rounded-full w-full">
        <div 
          className="absolute left-0 top-0 h-full bg-[#d9a05b] rounded-full"
          style={{ width: `${pct}%` }}
        />
        <div 
          className="absolute top-1/2 -mt-2 h-4 w-4 rounded-full bg-[#d9a05b] border-2 border-white shadow-sm transform -translate-x-1/2"
          style={{ left: `${pct}%` }}
        />
      </div>
      
      <div className="mt-1 text-xs font-semibold text-[#b67a28]">
        {productMessage}
      </div>
    </div>
  );
}
