"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchLabResults, LabResult } from "@/lib/api/dummy/lab-results";
import { ResultsList } from "@/components/lab/ResultsList";
import {
  AssessmentScreen,
  VerificationScreen,
  ReleasedScreen,
  HoldScreen,
} from "@/components/lab/ResultsSubScreens";

type ResultsView = "list" | "assessment" | "verification" | "released" | "hold";

export default function LabResultsPage() {
  const router = useRouter();
  const [view, setView] = useState<ResultsView>("list");
  const [selected, setSelected] = useState<LabResult | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-results"],
    queryFn: fetchLabResults,
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
        <div className="h-12 bg-gray-200 rounded-xl w-full max-w-sm"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load laboratory results.</div>;
  }

  // Filter logic matching the source exactly
  const filtered = (data || []).filter((r) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Awaiting Verification" && r.status === "AWAITING VERIFICATION") ||
      (filter === "Verified"              && r.status === "VERIFIED") ||
      (filter === "Released"             && r.status === "CLEARED FOR DISPATCH") ||
      (filter === "On Hold"              && r.status === "ACTION REQUIRED");
    const matchSearch =
      !search ||
      [r.id, r.sample, r.source].some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );
    return matchFilter && matchSearch;
  });

  // Opening a result card: hold items → hold screen, others → assessment screen.
  // The source also special-cases "View Report →" action (statusColor green / VERIFIED)
  // to fire onOpenReport (→ /lab/reports). We mirror that here.
  function handleOpen(item: LabResult) {
    // If the item's action is "View Report →", go directly to /lab/reports
    // (this is the onOpenReport path from the source App.tsx)
    if (item.action === "View Report →") {
      router.push("/lab/reports");
      return;
    }
    setSelected(item);
    setView(item.outcome === "hold" ? "hold" : "assessment");
  }

  // Sub-screen views — render full-height with fixed nav clearance
  if (view !== "list" && selected) {
    return (
      <div className="fixed inset-0 z-40 bg-[var(--color-bg)] flex flex-col overflow-hidden">
        {view === "assessment" && (
          <AssessmentScreen
            item={selected}
            onBack={() => setView("list")}
            onSubmit={() => setView("verification")}
          />
        )}
        {view === "verification" && (
          <VerificationScreen
            onViewAssessment={() => setView("assessment")}
            onBack={() => setView("list")}
            onReleased={() => setView("released")}
          />
        )}
        {view === "released" && (
          <ReleasedScreen
            // onReport → /lab/reports (the onOpenReport callback from source App.tsx)
            onReport={() => router.push("/lab/reports")}
            onDispatch={() => router.push(`/lab/dispatches/${selected.id}`)}
            onBack={() => setView("list")}
          />
        )}
        {view === "hold" && (
          <HoldScreen onBack={() => setView("list")} />
        )}
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
          Laboratory Results
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Review completed tests and submit dispatches for final assessment.
        </p>
      </div>

      <ResultsList
        results={filtered}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onOpen={handleOpen}
      />
    </div>
  );
}
