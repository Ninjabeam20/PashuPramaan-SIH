"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { TriangleAlert, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { getVetDashboard } from "@/lib/api/dummy/vet-dashboard";
import { WorkloadSummary } from "@/components/vet/WorkloadSummary";
import { EmergencyAlertBanner } from "@/components/vet/EmergencyAlertBanner";
import { AttentionList } from "@/components/vet/AttentionList";
import { TreatmentEvidenceCard } from "@/components/vet/TreatmentEvidenceCard";
import { PrescriptionsTable } from "@/components/vet/PrescriptionsTable";
import { ActivityFeed } from "@/components/vet/ActivityFeed";
import { RecentOutcomes } from "@/components/vet/RecentOutcomes";

export default function VetHome() {
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

      {/* 3. Emergency Alert Banner */}
      {data.emergency_alert && (
        <EmergencyAlertBanner alert={data.emergency_alert} />
      )}

      {/* 4. Two-column section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left Column: Attention Items */}
        <section className="flex-1 flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-[var(--color-text)]">Needs your attention</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Review prescriptions and clinical cases that need action.</p>
          </div>
          <AttentionList items={data.attention_items} />
        </section>

        {/* Right Column: Quick actions */}
        <section className="lg:w-80 flex flex-col gap-4 shrink-0 mt-6 lg:mt-0">
          <h3 className="font-bold text-[var(--color-text)]">Quick actions</h3>
          <div className="flex flex-col gap-3">
            <Button className="gap-2 justify-center bg-[var(--color-accent-vet)] hover:bg-[#c25d31] text-white border-none w-full min-h-[44px]">
              <Plus size={18} /> New Prescription
            </Button>
            <Button variant="outline" className="gap-2 justify-center w-full min-h-[44px]">
              <TriangleAlert size={18} /> Review Emergencies
            </Button>
            <Button variant="outline" className="gap-2 justify-center w-full min-h-[44px]">
              <FileText size={18} /> View Cases
            </Button>
          </div>

          {/* Treatment Evidence Card */}
          <TreatmentEvidenceCard evidence={data.treatment_evidence} />
        </section>
      </div>

      {/* 5. Prescriptions Table */}
      <PrescriptionsTable prescriptions={data.prescriptions} />

      {/* 6. Two-column Activity / Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityFeed activities={data.recent_activity} />
        <RecentOutcomes outcomes={data.recent_outcomes} />
      </div>
    </div>
  );
}
