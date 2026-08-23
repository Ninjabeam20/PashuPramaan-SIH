"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTestingQueue, AwaitingSample, ReadySample } from "@/lib/api/dummy/lab-testing";
import { TestingQueueFilterBar, TestingQueueTab } from "@/components/lab/TestingQueueFilterBar";
import { TestingQueueList } from "@/components/lab/TestingQueueList";
import { SampleReceiptFlow } from "@/components/lab/SampleReceiptFlow";

export default function TestingQueuePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-testing-queue"],
    queryFn: fetchTestingQueue,
  });

  const [activeTab, setActiveTab] = useState<TestingQueueTab>("awaiting");
  const [productFilter, setProductFilter] = useState("all");
  const [receivingSample, setReceivingSample] = useState<AwaitingSample | null>(null);

  if (receivingSample) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--color-bg)] h-[100dvh] overflow-hidden flex flex-col">
        <SampleReceiptFlow 
          dispatch={receivingSample} 
          onBack={() => setReceivingSample(null)} 
          onComplete={() => setReceivingSample(null)} 
        />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl w-full"></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load testing queue.</div>;
  }

  // Filter Data
  const filteredAwaiting = data.awaiting.filter((item) => {
    if (productFilter !== "all" && item.product.toLowerCase() !== productFilter) return false;
    return true;
  });

  const filteredReady = data.ready.filter((item) => {
    if (productFilter !== "all" && item.product.toLowerCase() !== productFilter) return false;
    return true;
  });

  const handleStartTesting = (sample: ReadySample) => {
    console.log("Start testing:", sample.id);
    // Ideally this navigates to the specific testing workspace page, e.g. /lab/testing-workspace/[sampleId]
  };

  return (
    <div className="px-4 md:px-8 pb-20 max-w-7xl mx-auto relative h-full">
      {/* Page Header */}
      <div className="mb-6 mt-2">
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          Laboratory Operations
        </p>
        <h1 className="font-display text-4xl font-normal text-[var(--color-text)] mb-2">
          Testing Queue
        </h1>
      </div>

      {/* Filter Bar */}
      <TestingQueueFilterBar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productFilter={productFilter}
        onProductChange={setProductFilter}
        awaitingCount={filteredAwaiting.length}
        readyCount={filteredReady.length}
      />

      {/* Summary Strip (Desktop only) */}
      <div className="hidden md:flex border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-b-2xl mb-6 shadow-sm overflow-hidden">
        {[
          { v: data.awaiting.length.toString(), l: "Awaiting Receipt" },
          { v: data.ready.length.toString(), l: "Tests Active" },
          { v: data.awaiting.filter(a => a.priority === "HIGH PRIORITY").length.toString(), l: "High Priority" },
        ].map(({ v, l }, i) => (
          <div key={l} className={`flex-1 py-3 text-center border-r border-[var(--color-border)] last:border-0`}>
            <p className="font-display text-xl font-bold text-[var(--color-text)] leading-none">{v}</p>
            <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] mt-1 uppercase">{l}</p>
          </div>
        ))}
      </div>

      <div className="md:mt-0 mt-4">
        {/* Main List */}
        <TestingQueueList 
          activeTab={activeTab}
          awaitingList={filteredAwaiting}
          readyList={filteredReady}
          onReceiveClick={setReceivingSample}
          onStartTestingClick={handleStartTesting}
        />
      </div>
    </div>
  );
}
