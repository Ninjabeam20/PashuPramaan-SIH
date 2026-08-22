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

  return {
    farm: {
      name: "Shree Krishna Dairy",
      status: "GOOD",
      total_animals: 48,
      cows_count: 10,
      buffaloes_count: 20,
      goats_count: 18,
      under_treatment_count: 3
    },
    species_overview: [
      { species: "Cows", count: 10, healthy_count: 8, under_treatment_count: 1, waiting_count: 1 },
      { species: "Buffaloes", count: 20, healthy_count: 18, under_treatment_count: 1, waiting_count: 1 },
      { species: "Goats", count: 18, healthy_count: 17, under_treatment_count: 1, waiting_count: 0 }
    ],
    animals: [
      { id: "MP-104", type: "Cow", status: "under_treatment" },
      { id: "MP-105", type: "Cow", status: "healthy" },
      { id: "MP-106", type: "Buffalo", status: "healthy" },
      { id: "MP-107", type: "Buffalo", status: "healthy" },
      { id: "MP-108", type: "Goat", status: "healthy" },
      { id: "MP-109", type: "Buffalo", status: "waiting" },
      { id: "MP-110", type: "Cow", status: "healthy" },
      { id: "MP-111", type: "Goat", status: "healthy" }
    ],
    recent_activity: [
      { icon: "clock", title: "Treatment recorded", subject: "MP-104", time_label: "Today" },
      { icon: "clock", title: "Health check completed", subject: "MP-108", time_label: "Yesterday" },
      { icon: "clock", title: "Animal registered", subject: "MP-109", time_label: "2 days ago" }
    ]
  };
};
