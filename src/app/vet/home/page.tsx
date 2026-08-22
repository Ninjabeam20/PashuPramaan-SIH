"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TriangleAlert, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { getVetDashboard } from "@/lib/api/dummy/vet-dashboard";
import { WorkloadSummary } from "@/components/vet/WorkloadSummary";
import { AlertsWidget } from "@/components/vet/AlertsWidget";
import { AttentionList } from "@/components/vet/AttentionList";
import { InsightsWidget } from "@/components/vet/InsightsWidget";
import { ActivityFeed } from "@/components/vet/ActivityFeed";
import { RecentOutcomes } from "@/components/vet/RecentOutcomes";
import { CaseDetailModal } from "@/components/vet/CaseDetailModal";

export default function VetHome() {
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const [selectedActionText, setSelectedActionText] = React.useState<string>("");

  const handleReviewClick = (caseId: string, actionText: string) => {
    setSelectedCaseId(caseId);
    setSelectedActionText(actionText);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vet-dashboard"],
    queryFn: getVetDashboard,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="text-red-500">Error loading dashboard.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 1. Header Section */}
      <section className="mb-6">
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          YOUR DESK
        </div>
        <h1 className="text-4xl font-display font-normal text-[var(--color-text)] mb-2">
          Good morning, {data.vet.name}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your prescription desk at a glance.
        </p>
      </section>

      {/* 2. Workload Summary Card */}
      <WorkloadSummary workload={data.workload} />

      {/* 3. Emergency and Insights Row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
        <div className="flex-1 min-w-0">
          <AlertsWidget alerts={data.alerts} onReviewClick={handleReviewClick} />
        </div>
        <div className="lg:w-[400px] shrink-0">
          <InsightsWidget insights={data.insights} />
        </div>
      </div>

      {/* 4. Attention Items */}
      <section className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-[var(--color-text)]">Needs your attention</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Review prescriptions and clinical cases that need action.</p>
          </div>
          <Link href="/vet/prescriptions" className="text-xs font-semibold text-[var(--color-text)] hover:underline min-h-[44px] flex items-center">
            View all cases &rarr;
          </Link>
        </div>
        <AttentionList items={data.attention_items} onReviewClick={handleReviewClick} />
      </section>

      {/* 5. Two-column Activity / Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityFeed activities={data.recent_activity} />
        <RecentOutcomes outcomes={data.recent_outcomes} />
      </div>

      {/* Case Detail Modal */}
      {selectedCaseId && (
        <CaseDetailModal 
          caseId={selectedCaseId} 
          actionText={selectedActionText} 
          onClose={() => setSelectedCaseId(null)} 
        />
      )}
    </div>
  );
}
