"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getDispatches, DispatchItem } from "@/lib/api/dummy/dispatch";
import { getFarmDetail } from "@/lib/api/dummy/farm-detail";
import { DispatchStatSummary } from "@/components/farmer/DispatchStatSummary";
import { DispatchTable } from "@/components/farmer/DispatchTable";
import { StartDispatchModal } from "@/components/farmer/StartDispatchModal";
import { DispatchDetailModal } from "@/components/farmer/DispatchDetailModal";
import { Button } from "@/components/ui/Button";

export default function DispatchPage() {
  const [isStartModalOpen, setIsStartModalOpen] = React.useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = React.useState<string | null>(null);

  const { data: dispatchData, isLoading } = useQuery({
    queryKey: ["dispatches"],
    queryFn: getDispatches,
  });

  const { data: farmData } = useQuery({
    queryKey: ["farm-detail-dispatch"],
    queryFn: getFarmDetail,
  });

  const handleDispatchSuccess = () => {
    setIsStartModalOpen(false);
  };

  if (isLoading || !dispatchData) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading dispatch data...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div>
        <Link href="/farmer/home" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center min-h-[44px]">
          &larr; Back to Home
        </Link>
      </div>

      {/* Header section */}
      <section className="flex flex-col -mt-2">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
          DISPATCH
        </div>
        <h1 className="text-4xl font-display font-normal text-[var(--color-text)] mb-2">
          Farm Dispatch
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Check your products before they leave the farm.
        </p>
      </section>

      {/* Stats Summary */}
      <DispatchStatSummary stats={dispatchData.summary} />

      {/* Redundant Start Entry Point Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            START A NEW DISPATCH
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            Check your product's safety status before it leaves the farm.
          </div>
        </div>
        <Button 
          className="w-full sm:w-auto bg-[#f47b59] hover:bg-[#e46a4d] text-white border-none font-bold min-h-[44px]"
          onClick={() => setIsStartModalOpen(true)}
        >
          <span className="text-lg leading-none mr-1">+</span> Start Dispatch
        </Button>
      </div>

      {/* List section */}
      <section className="flex flex-col gap-4 mt-6">
        <h2 className="text-xl font-bold font-display text-[var(--color-text)]">Recent Dispatches</h2>
        <DispatchTable items={dispatchData?.items || []} onViewAction={(id) => setSelectedDispatchId(id)} />
      </section>

      {/* Start Dispatch Modal */}
      {isStartModalOpen && farmData && (
        <StartDispatchModal
          animals={farmData.animals || []}
          onClose={() => setIsStartModalOpen(false)}
          onSuccess={handleDispatchSuccess}
        />
      )}

      {/* Dispatch Detail Modal */}
      {selectedDispatchId && (
        <DispatchDetailModal
          dispatchId={selectedDispatchId}
          onClose={() => setSelectedDispatchId(null)}
        />
      )}
    </div>
  );
}
