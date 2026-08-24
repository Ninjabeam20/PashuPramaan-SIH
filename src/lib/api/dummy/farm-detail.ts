import { API_BASE } from "../config";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";

export interface SpeciesCount {
  species: string;
  count: number;
}

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
  species_overview: SpeciesCount[];
  animals: any[];
  recent_activity: any[];
}

export async function getFarmDetail(): Promise<FarmDetail> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/farmer/animals`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  
  return {
    farm: {
      name: "Shree Krishna Dairy",
      status: "GOOD",
      total_animals: data.summary?.all_count || 0,
      cows_count: 0,
      buffaloes_count: 0,
      goats_count: 0,
      under_treatment_count: data.summary?.under_treatment_count || 0
    },
    species_overview: [],
    animals: data.items || [],
    recent_activity: []
  };
}
