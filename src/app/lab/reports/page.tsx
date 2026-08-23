"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLabReports, LabReport, REPORTS_SUMMARY } from "@/lib/api/dummy/lab-reports";
import { ReportsList } from "@/components/lab/ReportsList";
import { ReportDetail } from "@/components/lab/ReportDetail";

type ReportsView = "list" | "detail";

export default function LabReportsPage() {
  const [view, setView]             = useState<ReportsView>("list");
  const [selected, setSelected]     = useState<LabReport | null>(null);
  const [dateFilter, setDateFilter]         = useState("All Dates");
  const [productFilter, setProductFilter]   = useState("All Products");
  const [statusFilter, setStatusFilter]     = useState("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-reports"],
    queryFn: fetchLabReports,
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-60 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load laboratory reports.</div>;
  }

  // Filter logic matching source exactly
  const filtered = data.filter((r) => {
    const matchProduct =
      productFilter === "All Products" || r.product === productFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Cleared"  && r.status === "CLEARED") ||
      (statusFilter === "On Hold"  && r.status === "ON HOLD") ||
      (statusFilter === "Awaiting" && r.statusColor === "amber");
    // Date filter is UI-only for now (no actual dates to diff in dummy data)
    return matchProduct && matchStatus;
  });

  // Detail view — render full-screen over the layout
  if (view === "detail" && selected) {
    return (
      <div className="fixed inset-0 z-40 bg-[var(--color-bg)] flex flex-col overflow-hidden">
        <ReportDetail
          report={selected}
          onBack={() => { setSelected(null); setView("list"); }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6 mt-2">
        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          Laboratory Operations
        </p>
        <h1 className="font-display text-4xl font-normal text-[var(--color-text)] mb-2">
          Laboratory Reports
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Access completed assessments and laboratory records.
        </p>
      </div>

      <ReportsList
        reports={filtered}
        summary={REPORTS_SUMMARY}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        productFilter={productFilter}
        onProductFilterChange={setProductFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpen={(r) => { setSelected(r); setView("detail"); }}
      />
    </div>
  );
}
