"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

import { getPrescriptionsList, createPrescription } from "@/lib/api/dummy/vet-prescriptions";
import { PrescriptionsFilterBar } from "@/components/vet/PrescriptionsFilterBar";
import { PrescriptionsTable } from "@/components/vet/PrescriptionsTable";
import { CaseDetailModal } from "@/components/vet/CaseDetailModal";
import { NewPrescriptionModal } from "@/components/vet/NewPrescriptionModal";

function PrescriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewRxOpen = searchParams.get("new_rx") === "true";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vet-prescriptions"],
    queryFn: getPrescriptionsList,
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(null);
  const [selectedActionText, setSelectedActionText] = React.useState<string>("");

  const handleReviewClick = (caseId: string, actionText: string, actionTarget: string) => {
    if (actionTarget === "read_only" || actionText === "View") {
      router.push(`/vet/prescriptions/${caseId}`);
    } else {
      setSelectedCaseId(caseId);
      // Map the target to the correct modal action string so it routes properly
      if (actionTarget === "sign_flow") {
        setSelectedActionText("Review & Sign");
      } else if (actionTarget === "countersign_flow") {
        setSelectedActionText("Review & Countersign");
      } else {
        setSelectedActionText("Review");
      }
    }
  };

  const closeNewRxModal = () => {
    // Remove query param to close
    const params = new URLSearchParams(searchParams.toString());
    params.delete("new_rx");
    router.replace(`/vet/prescriptions?${params.toString()}`);
  };

  const queryClient = useQueryClient();

  const createRxMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vet-prescriptions"] });
      closeNewRxModal();
    }
  });

  const handleSaveNewRx = (prescription: any) => {
    createRxMutation.mutate(prescription);
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading prescriptions...</div>;
  }

  if (isError || !data) {
    return <div className="text-red-500">Error loading prescriptions.</div>;
  }

  // Filter Options
  const filterOptions = [
    { id: "all", label: "All", count: data.summary.all_count },
    { id: "awaiting_signature", label: "Awaiting signature", count: data.summary.awaiting_signature_count },
    { id: "unsigned_emergency", label: "Unsigned emergency", count: data.summary.unsigned_emergency_count },
    { id: "signed", label: "Signed", count: data.summary.signed_count },
    { id: "voided", label: "Voided", count: data.summary.voided_count },
  ];

  // Client-side filtering
  const filteredItems = (data.items || []).filter(item => {
    // 1. Search matching
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.rx_id.toLowerCase().includes(searchLower) ||
      item.farm.toLowerCase().includes(searchLower) ||
      item.animal_flock.toLowerCase().includes(searchLower) ||
      item.diagnosis.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Tab matching
    if (selectedFilter === "all") return true;
    
    const status = item.status || "";
    if (selectedFilter === "awaiting_signature" && status === "SIGN_REQUIRED") return true;
    if (selectedFilter === "unsigned_emergency" && status === "UNSIGNED_EMERGENCY") return true;
    if (selectedFilter === "signed" && (status === "SIGNED" || status === "COUNTERSIGNED")) return true;
    if (selectedFilter === "voided" && status === "VOIDED") return true;

    return false;
  });

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <section className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-normal text-[var(--color-text)] mb-2">
            Prescriptions
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Review and manage your prescription records.
          </p>
        </div>
        <Link 
          href="?new_rx=true"
          className="inline-flex items-center justify-center gap-2 bg-[#d96c42] hover:bg-[#c25d31] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={18} />
          New Prescription
        </Link>
      </section>

      {/* Filter and Search */}
      <PrescriptionsFilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterOptions={filterOptions}
      />

      {/* Main Table */}
      <PrescriptionsTable 
        prescriptions={filteredItems} 
        onReviewClick={handleReviewClick} 
      />

      {/* Case Detail Modal */}
      {selectedCaseId && (
        <CaseDetailModal 
          caseId={selectedCaseId} 
          actionText={selectedActionText} 
          onClose={() => setSelectedCaseId(null)} 
        />
      )}

      {/* New Prescription Modal */}
      {isNewRxOpen && (
        <NewPrescriptionModal 
          onClose={closeNewRxModal}
          onSave={handleSaveNewRx}
          nextRxId={`RX-${data.summary.all_count + 195}`} // placeholder ID generation
        />
      )}
    </div>
  );
}

export default function PrescriptionsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading...</div>}>
      <PrescriptionsContent />
    </React.Suspense>
  );
}
