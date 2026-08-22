"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTreatments, getPrescriptionOptions, TreatmentItem } from "@/lib/api/dummy/treatments";
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

  // Sync initial fetch to local state
  React.useEffect(() => {
    if (treatmentsData && !localTreatments) {
      setLocalTreatments(treatmentsData.items);
    }
  }, [treatmentsData, localTreatments]);

  if (isLoadingTreatments || !localTreatments || !treatmentsData || !farmData || !prescriptions) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading treatments...</div>;
  }

  const handleRecordTreatment = (data: any) => {
    const { animalIds, prescription, timing, backdatedTime } = data;
    
    // For each animal, create a new treatment row client-side
    const newTreatments = animalIds.map((id: string) => {
      const animal = farmData.animals.find(a => a.id === id);
      
      const newTrt: TreatmentItem = {
        id: `trt-new-${Date.now()}-${id}`,
        animal_flock: id,
        species: animal?.type || "Unknown",
        drug_name: prescription.drug_name,
        route_dosage: prescription.is_emergency_exception 
          ? "Emergency Log" 
          : `${prescription.route} \u00b7 ${prescription.dosage}`,
        administered_time: timing === "now" ? "Administered Just Now" : `Administered ${backdatedTime}`,
        status: "Withdrawal",
        badges: [
          { text: "Withdrawal Active", variant: "withdrawal_active" },
          prescription.is_emergency_exception 
            ? { text: "Emergency / Unsigned", variant: "emergency_unsigned" } 
            : { text: "Vet Signed", variant: "vet_signed" }
        ],
        // Dummy client-side approximation
        withdrawal: {
          dose_time: "Dose",
          now_pct: 0,
          clear_label: "Clear",
          product_message: "Withdrawal calculating..."
        }
      };
      
      return newTrt;
    });

    setLocalTreatments(prev => {
      return [...newTreatments, ...(prev || [])];
    });

    setIsRecordModalOpen(false);
  };

  // Client-side filtering
  const filteredTreatments = localTreatments.filter(trt => {
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
            onClick={() => setIsRecordModalOpen(true)}
          >
            <span className="text-lg leading-none">+</span> Record Treatment
          </Button>
        </div>
      </section>

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
          animals={farmData.animals}
          prescriptions={prescriptions}
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
