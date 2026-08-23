"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLabDispatches } from "@/lib/api/dummy/lab-dispatches";
import { LabDispatchesFilterBar } from "@/components/lab/LabDispatchesFilterBar";
import { LabDispatchesTable } from "@/components/lab/LabDispatchesTable";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LabDispatchesPage() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-dispatches"],
    queryFn: fetchLabDispatches,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-2xl w-full max-w-md"></div>
        <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
        <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load dispatches.</div>;
  }

  // Filter Data
  const filteredData = data.filter((item) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.id.toLowerCase().includes(searchLower) ||
      item.sample.toLowerCase().includes(searchLower) ||
      item.source.toLowerCase().includes(searchLower) ||
      item.sourceSub.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Product Filter
    if (selectedProduct !== "all" && item.product.toLowerCase() !== selectedProduct.toLowerCase()) return false;

    // 3. Status Filter (loose matching for dummy data)
    if (selectedStatus !== "all") {
      const normalizedStatus = item.status.toLowerCase().replace(/ /g, "_");
      if (normalizedStatus !== selectedStatus) return false;
    }

    // 4. Risk Filter
    if (selectedRisk !== "all" && item.risk.toLowerCase() !== selectedRisk.toLowerCase()) return false;

    return true;
  });

  const handleActionClick = (dispatchId: string, actionText: string) => {
    router.push(`/lab/dispatches/${dispatchId}`);
  };

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Page Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
            Laboratory Operations
          </p>
          <h1 className="font-display text-4xl font-normal text-[var(--color-text)] mb-2">
            Dispatches
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xl">
            Track and assess milk, meat and egg dispatches submitted for laboratory testing.
          </p>
        </div>
        <button className="self-start md:self-auto inline-flex items-center justify-center gap-2 border border-[var(--color-border)] hover:bg-[var(--color-bg)] bg-[var(--color-surface)] text-[var(--color-text)] px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <FileText size={16} className="text-[var(--color-text-muted)]" />
          Laboratory Guidelines
        </button>
      </div>

      {/* Filter Bar */}
      <LabDispatchesFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedRisk={selectedRisk}
        onRiskChange={setSelectedRisk}
      />

      {/* Dispatch Overview Summary */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl md:rounded-b-none mb-4 md:mb-0 shadow-sm md:shadow-none overflow-hidden">
        {[
          { v: "48", l: "Total Dispatches" },
          { v: "12", l: "Ready for Testing", indicator: "bg-amber-500" },
          { v: "18", l: "In Progress", indicator: "bg-slate-400" },
          { v: "4", l: "Requires Attention", indicator: "bg-red-500" },
        ].map(({ v, l, indicator }, i) => (
          <div key={l} className={`flex-1 py-4 md:py-3 px-4 text-center border-b md:border-b-0 md:border-r border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? 'border-r' : ''}`}>
            <p className="font-display text-2xl md:text-xl font-bold text-[var(--color-text)] leading-none flex items-center justify-center gap-2">
              {v}
              {indicator && <span className={`w-2 h-2 rounded-full ${indicator}`} />}
            </p>
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">{l}</p>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <LabDispatchesTable 
        dispatches={filteredData}
        onActionClick={handleActionClick}
      />
    </div>
  );
}
