"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getVetPatients } from "@/lib/api/dummy/vet-patients";
import { PatientsTable } from "@/components/vet/PatientsTable";
import { PatientDetailModal } from "@/components/vet/PatientDetailModal";

export default function PatientsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vet-patients"],
    queryFn: getVetPatients,
  });

  const [filter, setFilter] = React.useState("all");
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-sm text-[var(--color-text-muted)] animate-pulse">Loading patients...</div>;
  }

  const handleFilter = (f: string) => {
    setFilter(f);
  };

  const activePillClass = "bg-[#2d4b29] text-white border-[#2d4b29] font-bold";
  const inactivePillClass = "bg-white text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-bg)] font-medium";

  // Dummy filtering logic
  const filteredPatients = data.items.filter(item => {
    if (filter === "all") return true;
    if (filter === "under_treatment") return item.status.text === "Under Treatment";
    if (filter === "follow_up_due") return item.status.text === "Follow-up Due" || item.status.text === "Improved"; // Just logic for dummy
    if (filter === "recovered") return item.status.text === "Recovered";
    if (filter === "needs_attention") return item.status.text === "No Change";
    return true;
  });

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text)] mb-1">Your Patients</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Tracking outcomes across 3 farms</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search by patient ID, farm or owner..."
          className="w-full bg-white border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-1"
        />
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => handleFilter("all")}
          className={`px-4 py-1.5 rounded-full text-xs border ${filter === "all" ? activePillClass : inactivePillClass}`}
        >
          All ({data.summary.all_count})
        </button>
        <button 
          onClick={() => handleFilter("under_treatment")}
          className={`px-4 py-1.5 rounded-full text-xs border ${filter === "under_treatment" ? activePillClass : inactivePillClass}`}
        >
          Under Treatment ({data.summary.under_treatment_count})
        </button>
        <button 
          onClick={() => handleFilter("follow_up_due")}
          className={`px-4 py-1.5 rounded-full text-xs border ${filter === "follow_up_due" ? activePillClass : inactivePillClass}`}
        >
          Follow-up Due ({data.summary.follow_up_due_count})
        </button>
        <button 
          onClick={() => handleFilter("recovered")}
          className={`px-4 py-1.5 rounded-full text-xs border ${filter === "recovered" ? activePillClass : inactivePillClass}`}
        >
          Recovered ({data.summary.recovered_count})
        </button>
        <button 
          onClick={() => handleFilter("needs_attention")}
          className={`px-4 py-1.5 rounded-full text-xs border ${filter === "needs_attention" ? activePillClass : inactivePillClass}`}
        >
          Needs Attention ({data.summary.needs_attention_count})
        </button>
      </div>

      {/* Table */}
      <PatientsTable 
        patients={filteredPatients} 
        onViewClick={(id) => setSelectedPatientId(id)}
      />

      {selectedPatientId && (
        <PatientDetailModal 
          patientId={selectedPatientId} 
          onClose={() => setSelectedPatientId(null)}
        />
      )}
    </div>
  );
}
