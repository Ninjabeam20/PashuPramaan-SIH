import { API_BASE } from "../config";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import {
  awareBadge,
  CIA_BADGE,
  prescriptionAwareBadges,
  prescriptionStatusBadge,
  requiresStewardshipNotice,
  speciesTypeLabel,
} from "@/lib/seed/project";

export interface CaseDetail {
  id: string;
  label: string;
  title: string;
  animal: {
    id: string;
    species_type: string;
  };
  farm_name: string;
  status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  health_event?: {
    name: string;
    onset: string;
  };
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  stewardship?: {
    aware_badge?: { text: string; variant: string };
    cia_badge?: { text: string; variant: string };
  };
  treatment_history?: {
    previous_episode: string;
    outcome_badge: { text: string; variant: string };
    completed_date: string;
  };
}

export const getCaseDetail = async (caseId: string): Promise<CaseDetail> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/cases/${caseId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch case detail");
  }
  return await res.json() as any;
};
