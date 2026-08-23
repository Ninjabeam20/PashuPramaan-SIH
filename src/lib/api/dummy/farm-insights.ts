import { getToken } from "./auth-utils";
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
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/insights`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const getDrugsList = async () => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/drugs`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch drugs");
  return await res.json();
};

export const addMedicineStock = async (payload: { drug_id: string, quantity: number }) => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/inventory/stock`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to add stock");
  return await res.json();
};
