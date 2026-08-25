import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";

export type NeedLevel = "High" | "Medium" | "Low";
export type PlanningSignal = "High need" | "Monitor" | "Stable";

export type ForecastSeries = {
  name: string;
  color: string;
  months: string[];
  historical: Array<number | null>;
  forecast: Array<number | null>;
  lower_bound: Array<number | null>;
  upper_bound: Array<number | null>;
  hist_count: number;
  unit: string;
  model: string;
};

export type ForecastSummaryRow = {
  medicine: string;
  need: NeedLevel;
  change: number;
  rec: string;
  recColor: string;
  recBg: string;
  expected_kg: number;
  expected_packs: number;
  model: string;
};

export type RegionalPlanningRow = {
  state: string;
  id: string;
  predDemand: NeedLevel;
  currentAmu: NeedLevel;
  change: number;
  signal: PlanningSignal;
  expected_kg: number;
};

export type DemandLevel = {
  demand: NeedLevel;
  change: number;
  currentAmu: NeedLevel;
  signal: PlanningSignal;
};

export type AdminForecastResponse = {
  origin: string;
  period: string;
  medicine: string;
  species: string;
  region: string;
  title: string;
  unit: string;
  unit_note: string;
  series: ForecastSeries[];
  summary: ForecastSummaryRow[];
  regional_planning: RegionalPlanningRow[];
  demand_level: Record<string, DemandLevel>;
  forecast_months: string[];
  insufficient_data: boolean;
};

export type ForecastQuery = {
  medicine: string;
  species: string;
  region: string;
  period: string;
};

export const getAdminForecast = async (query: ForecastQuery): Promise<AdminForecastResponse> => {
  const token = getToken();
  const params = new URLSearchParams(query);
  const res = await fetch(`${API_BASE}/api/admin/forecast?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to load forecast");
  }
  return (await res.json()) as AdminForecastResponse;
};
