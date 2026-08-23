"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/Badge";
import { getFarmDetail } from "@/lib/api/dummy/farm-detail";

import { FarmStatSummary } from "@/components/farmer/FarmStatSummary";
import { AnimalOverviewCards } from "@/components/farmer/AnimalOverviewCards";
import { AnimalSearchFilter, AnimalFilter } from "@/components/farmer/AnimalSearchFilter";
import { AnimalTable } from "@/components/farmer/AnimalTable";
import { RecentActivityList } from "@/components/farmer/RecentActivityList";
import { AddAnimalModal, AnimalFormData } from "@/components/farmer/AddAnimalModal";
import { AnimalDetailModal } from "@/components/farmer/AnimalDetailModal";
import { FarmDetail } from "@/lib/api/dummy/farm-detail";

export default function MyFarmPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<AnimalFilter>("All");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = React.useState<string | null>(null);
  const [localData, setLocalData] = React.useState<FarmDetail | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["farm-detail"],
    queryFn: getFarmDetail,
  });

  // Sync initial fetch to local state so we can mutate it client-side
  React.useEffect(() => {
    if (data && !localData) {
      setLocalData(data);
    }
  }, [data, localData]);

  if (isLoading || !localData) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading farm details...</div>;
  }

  if (isError) {
    return <div className="text-red-500">Error loading farm details.</div>;
  }

  const handleAddAnimal = (formData: AnimalFormData) => {
    setLocalData(prev => {
      if (!prev) return prev;
      
      const newAnimal = {
        id: formData.id,
        type: formData.type === "Poultry" ? "Poultry / Flock" : formData.type,
        status: "healthy" as const
      };

      const next = { ...prev };
      
      // Update animals list
      next.animals = [newAnimal, ...next.animals];
      
      // Update total animals
      next.farm = { ...next.farm, total_animals: next.farm.total_animals + 1 };
      
      // Update specific species counts
      if (formData.type === "Cow") {
        next.farm.cows_count += 1;
      } else if (formData.type === "Buffalo") {
        next.farm.buffaloes_count += 1;
      } else if (formData.type === "Goat") {
        next.farm.goats_count += 1;
      }
      // Note: Sheep, Pig, Poultry, Other don't have overview cards yet, so we skip their specific counts

      // Update overview cards
      next.species_overview = (next.species_overview || []).map(overview => {
        if (
          (formData.type === "Cow" && overview.species === "Cows") ||
          (formData.type === "Buffalo" && overview.species === "Buffaloes") ||
          (formData.type === "Goat" && overview.species === "Goats")
        ) {
          return {
            ...overview,
            count: overview.count + 1,
            healthy_count: overview.healthy_count + 1
          };
        }
        return overview;
      });
      
      return next;
    });
    
    setIsAddModalOpen(false);
  };

  // Client-side filtering
  const filteredAnimals = (localData.animals || []).filter(animal => {
    // Search match
    const matchesSearch = animal.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter match
    let matchesFilter = true;
    if (selectedFilter !== "All") {
      if (selectedFilter === "Under Treatment") {
        matchesFilter = animal.status === "under_treatment";
      } else {
        // e.g. "Cows" => "Cow"
        matchesFilter = animal.type.toLowerCase() === selectedFilter.toLowerCase().replace(/s$/, '');
        // handle 'Buffaloes' -> 'Buffalo' edge case if simple regex fails
        if (selectedFilter === "Buffaloes" && animal.type === "Buffalo") matchesFilter = true;
      }
    }
    
    return matchesSearch && matchesFilter;
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
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-2">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
            MY FARM
          </div>
          <h1 className="text-4xl font-display font-normal text-[var(--color-text)]">
            {localData.farm.name}
          </h1>
        </div>
        <div className="shrink-0 mb-1">
          <Badge variant="good" dot>{localData.farm.status}</Badge>
        </div>
      </section>

      {/* Stats Summary */}
      <FarmStatSummary stats={localData.farm} onAddClick={() => setIsAddModalOpen(true)} />

      {/* Animal Overview */}
      <section className="flex flex-col gap-4 mt-2">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Animal Overview</h2>
        <AnimalOverviewCards data={localData.species_overview || []} />
      </section>

      {/* Your Animals section (Search + Table) */}
      <section className="flex flex-col gap-4 mt-6">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Your Animals</h2>
        
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <AnimalSearchFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
          <AnimalTable animals={filteredAnimals} onViewAction={(id) => setSelectedAnimalId(id)} />
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-6">
        <RecentActivityList activities={localData.recent_activity || []} />
      </section>

      {/* Add Animal Modal */}
      {isAddModalOpen && (
        <AddAnimalModal
          existingIds={(localData.animals || []).map(a => a.id)}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAnimal}
        />
      )}

      {/* Animal Detail Modal */}
      {selectedAnimalId && (
        <AnimalDetailModal
          animalId={selectedAnimalId}
          onClose={() => setSelectedAnimalId(null)}
        />
      )}
    </div>
  );
}
