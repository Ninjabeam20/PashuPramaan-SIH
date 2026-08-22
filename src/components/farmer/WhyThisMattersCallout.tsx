import * as React from "react";
import { FarmInsights } from "@/lib/api/dummy/farm-insights";

export function WhyThisMattersCallout({ data }: { data: FarmInsights["why_this_matters"] }) {
  // Simple substring replacement logic to wrap highlight string
  const renderText = () => {
    if (!data.text || !data.highlight) return data.text;
    
    const parts = data.text.split(data.highlight);
    
    // If the highlight doesn't perfectly match, just render normal text
    if (parts.length === 1) return data.text;

    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="text-[#b67a28] font-medium">{data.highlight}</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="bg-[#f9faf8] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col w-full">
      <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
        Why This Matters
      </div>
      <p className="text-sm text-[var(--color-text)] leading-relaxed">
        {renderText()}
      </p>
    </div>
  );
}
