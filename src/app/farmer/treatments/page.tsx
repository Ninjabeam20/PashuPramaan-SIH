"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getTreatments, getPrescriptionOptions, createTreatment, TreatmentItem } from "@/lib/api/dummy/treatments";
import { getFarmDetail } from "@/lib/api/dummy/farm-detail";
import { TreatmentStatSummary } from "@/components/farmer/TreatmentStatSummary";
import { TreatmentSearchFilter, TreatmentFilter } from "@/components/farmer/TreatmentSearchFilter";
import { TreatmentList } from "@/components/farmer/TreatmentList";
import { RecordTreatmentModal } from "@/components/farmer/RecordTreatmentModal";
import { TreatmentDetailPanel } from "@/components/farmer/TreatmentDetailPanel";
import { Button } from "@/components/ui/Button";

export default function TreatmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<TreatmentFilter>("All");
  const [speciesFilter, setSpeciesFilter] = React.useState("All");
  
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [defaultRxId, setDefaultRxId] = React.useState<string | undefined>(undefined);
  const [defaultAnimalId, setDefaultAnimalId] = React.useState<string | undefined>(undefined);
  
  const [selectedTreatmentId, setSelectedTreatmentId] = React.useState<string | null>(null);
  const [localTreatments, setLocalTreatments] = React.useState<TreatmentItem[] | null>(null);

  // Queries
  const { data: treatmentsData, isLoading: isLoadingTreatments } = useQuery({
    queryKey: ["treatments"],
    queryFn: getTreatments,
  });

  const { data: farmData } = useQuery({
    queryKey: ["farm-detail"],
    queryFn: getFarmDetail,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: getPrescriptionOptions,
  });

  const queryClient = useQueryClient();
  
  const createTreatmentMutation = useMutation({
    mutationFn: createTreatment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setIsRecordModalOpen(false);
    }
  });
  
  if (isLoadingTreatments || !treatmentsData || !farmData || !prescriptions) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading treatments...</div>;
  }

  const handleRecordTreatment = (data: any) => {
    const { animalIds, prescription, timing, backdatedTime } = data;
    
    // We send backdated_at in ISO format if timing is backdated
    let isoBackdatedAt: string | undefined = undefined;
    if (timing === "backdated" && backdatedTime) {
      try { isoBackdatedAt = new Date(backdatedTime).toISOString(); } catch(e) {}
    }
    
    createTreatmentMutation.mutate({
      animal_ids: animalIds,
      prescription_option_id: prescription.id,
      timing: timing,
      backdated_at: isoBackdatedAt
    });
  };

  // Client-side filtering
  const filteredTreatments = (treatmentsData?.items || []).filter((trt: TreatmentItem) => {
    // Search match
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      trt.animal_flock.toLowerCase().includes(searchLower) ||
      trt.drug_name.toLowerCase().includes(searchLower);
    
    // Status match
    let matchesStatus = true;
    if (selectedFilter !== "All") {
      matchesStatus = trt.status === selectedFilter;
    }

    // Species match
    let matchesSpecies = true;
    if (speciesFilter !== "All") {
      matchesSpecies = trt.species.toLowerCase() === speciesFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div>
        <Link href="/farmer/home" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center min-h-[44px]">
          &larr; Back to Home
        </Link>
      </div>

      {/* Header section */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 -mt-2">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            TREATMENTS
          </div>
          <h1 className="text-4xl font-display font-normal text-[var(--color-text)] mb-2">
            Treatment Records
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Track treatments, prescriptions and withdrawal periods for your animals.
          </p>
        </div>
        
        <div className="shrink-0">
          <Button 
            className="w-full sm:w-auto bg-[#f47b59] hover:bg-[#e46a4d] text-white border-none gap-2 font-bold min-h-[44px]"
            onClick={() => {
              setDefaultRxId(undefined);
              setDefaultAnimalId(undefined);
              setIsRecordModalOpen(true);
            }}
          >
            <span className="text-lg leading-none">+</span> Record Treatment
          </Button>
        </div>
      </section>

      {/* Awaiting Administration Section */}
      {prescriptions && prescriptions.length > 0 && (
        <section className="flex flex-col gap-3 mt-4 mb-2">
          <h2 className="text-lg font-bold text-[#b45309] flex items-center gap-2">
            Awaiting Administration
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {prescriptions.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">{rx.animal_id || "Animal"}</div>
                    <div className="font-bold text-amber-900">{rx.drug_name}</div>
                    <div className="text-sm text-amber-700">Diagnosis: {rx.diagnosis || "Not specified"}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                    onClick={() => {
                      setDefaultRxId(rx.id);
                      setDefaultAnimalId(rx.animal_id);
                      setIsRecordModalOpen(true);
                    }}
                  >
                    Record Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats Summary */}
      {/* We use the fetched treatmentsData.summary here instead of a dynamically recalculated one for simplicity of the mock */}
      <TreatmentStatSummary stats={treatmentsData.summary} />

      {/* List section (Search + Table) */}
      <section className="flex flex-col gap-4 mt-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <TreatmentSearchFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            speciesFilter={speciesFilter}
            setSpeciesFilter={setSpeciesFilter}
          />
          <TreatmentList treatments={filteredTreatments} onViewAction={(id) => setSelectedTreatmentId(id)} />
        </div>
      </section>

      {/* Record Treatment Modal */}
      {isRecordModalOpen && (
        <RecordTreatmentModal
          animals={farmData?.animals || []}
          prescriptions={prescriptions || []}
          defaultRxId={defaultRxId}
          defaultAnimalId={defaultAnimalId}
          onClose={() => setIsRecordModalOpen(false)}
          onSubmit={handleRecordTreatment}
        />
      )}

      {/* Treatment Detail Panel */}
      {selectedTreatmentId && (
        <TreatmentDetailPanel
          treatmentId={selectedTreatmentId}
          onClose={() => setSelectedTreatmentId(null)}
        />
      )}
    </div>
  );
}
