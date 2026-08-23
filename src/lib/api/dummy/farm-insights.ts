import { store } from "@/lib/seed/store";
import { animalStatus, speciesGroups, stockQuantityLabel, stockStatus } from "@/lib/seed/project";

export interface FarmInsights {
  range: "30d" | "60d" | "90d";
  medicine_stock: {
    name: string;
    current_stock: string;
    recent_usage: string;
    status: { text: string; variant: string };
  }[];
  demand_forecast: {
    chart_data: { month: string; past_usage: number | null; forecast: number | null }[];
    now_index: number;
    current_stock: string;
    expected_requirement: string;
    status: { text: string; variant: string };
  };
  most_used_medicines: {
    rank: number;
    name: string;
    usage: string;
    usage_value: number;
  }[];
  farm_health_map: {
    species: string;
    level: "Low" | "Moderate" | "High";
    detail: string;
  }[];
  farm_performance: {
    chart_data: { month: string; milk_output: number; medicine_cost: number }[];
  };
  health_treatment_trends: {
    chart_data: { month: string; health_events: number; treatments: number }[];
  };
}

const pressureLevel = (underTreatment: number): "Low" | "Moderate" | "High" => {
  if (underTreatment >= 2) return "High";
  if (underTreatment === 1) return "Moderate";
  return "Low";
};

export const getFarmInsights = async (range: "30d" | "60d" | "90d"): Promise<FarmInsights> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const series = store.getState().insightsSeries;
  const stock = store.getMedicineStock();
  const roster = store.getFarmerRoster();

  // CONFLICT: home and insights carried duplicate stock literals that disagreed on the
  // Ivermectin label. Both now read this one list.
  const forecastMedicine = stock.find((m) => m.level === "restock") ?? stock[0];

  const ranked = stock
    .filter((m) => m.usageTotal !== null)
    .sort((a, b) => (b.usageTotal ?? 0) - (a.usageTotal ?? 0));
  const topUsage = ranked[0]?.usageTotal ?? 1;

  // Species pressure is recomputed from the roster so it agrees with My Farm.
  const farmHealthMap = speciesGroups().map((group) => {
    const inGroup = roster.filter((a) => a.species === group.key);
    const underTreatment = inGroup.filter((a) => animalStatus(a.id) === "under_treatment").length;
    return {
      species: group.key === "Cow" ? "Cattle" : group.label,
      level: pressureLevel(underTreatment),
      detail: `${group.herd} animals · ${underTreatment} under treatment`,
    };
  });

  // Poultry lives on the farmer's second farm, so it is summarised by its flocks.
  const poultryTreatments = store
    .getFarmerTreatments()
    .filter((t) => store.getAnimal(t.animalId)?.isFlock && t.phase !== "completed");
  if (poultryTreatments.length > 0) {
    const flockIds = Array.from(new Set(poultryTreatments.map((t) => t.animalId)));
    farmHealthMap.push({
      species: "Poultry",
      level: "High",
      detail: `${flockIds.join(", ")} · ${poultryTreatments.some((t) => t.emergency) ? "emergency tx" : "under treatment"}`,
    });
  }

  return {
    range,
    medicine_stock: stock.map((medicine) => ({
      name: medicine.name,
      current_stock: stockQuantityLabel(medicine),
      recent_usage: `${medicine.recentUsage} used`,
      status: stockStatus(medicine.level),
    })),
    demand_forecast: {
      chart_data: series.forecast[range],
      now_index: series.nowIndex,
      current_stock: stockQuantityLabel(forecastMedicine),
      expected_requirement: series.expectedRequirement,
      status:
        forecastMedicine.level === "restock"
          ? { text: "Restock Recommended", variant: "red" }
          : { text: "Stock Sufficient", variant: "green" },
    },
    most_used_medicines: ranked.map((medicine, index) => ({
      rank: index + 1,
      name: medicine.name,
      usage: `${medicine.usageTotal} used`,
      usage_value: Math.round(((medicine.usageTotal ?? 0) / topUsage) * 100),
    })),
    farm_health_map: farmHealthMap,
    farm_performance: { chart_data: series.performance },
    health_treatment_trends: { chart_data: series.healthTrends },
  };
};
