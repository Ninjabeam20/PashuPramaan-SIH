import { store } from "@/lib/seed/store";
import { animalStatus, animalTypeLabel, farmCounts, speciesOverview } from "@/lib/seed/project";

export interface FarmDetail {
  farm: {
    name: string;
    status: string;
    total_animals: number;
    cows_count: number;
    buffaloes_count: number;
    goats_count: number;
    under_treatment_count: number;
  };
  species_overview: Array<{
    species: string;
    count: number;
    healthy_count: number;
    under_treatment_count: number;
    waiting_count: number;
  }>;
  animals: Array<{
    id: string;
    type: string;
    status: "under_treatment" | "healthy" | "waiting";
  }>;
  recent_activity: Array<{
    icon: string;
    title: string;
    subject: string;
    time_label: string;
  }>;
}

export const getFarmDetail = async (): Promise<FarmDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const farm = store.getFarmerFarm();
  const counts = farmCounts();

  return {
    farm: {
      name: farm.name,
      status: counts.underTreatment > 3 ? "ATTENTION" : "GOOD",
      total_animals: counts.total,
      cows_count: counts.cows,
      buffaloes_count: counts.buffaloes,
      goats_count: counts.goats,
      under_treatment_count: counts.underTreatment,
    },
    species_overview: speciesOverview(),
    animals: store.getFarmerRoster().map((animal) => ({
      id: animal.id,
      type: animalTypeLabel(animal),
      status: animalStatus(animal.id),
    })),
    recent_activity: store.getState().farmActivity.map((row) => ({
      icon: row.icon,
      title: row.title,
      subject: row.subject,
      time_label: row.timeLabel,
    })),
  };
};
