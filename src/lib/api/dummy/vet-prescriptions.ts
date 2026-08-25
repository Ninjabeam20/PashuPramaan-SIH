import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { prescriptionAction, prescriptionAwareBadges, prescriptionStatusBadge } from "@/lib/seed/project";

export interface PrescriptionsData {
  summary: {
    all_count: number;
    awaiting_signature_count: number;
    unsigned_emergency_count: number;
    signed_count: number;
    voided_count: number;
  };
  items: Array<{
    rx_id: string;
    farm: string;
    animal_flock: string;
    diagnosis: string;
    status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    aware_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    date_label: string;
    action_text: string;
    action_target: "sign_flow" | "countersign_flow" | "read_only";
  }>;
}

export const getPrescriptionsList = async (): Promise<PrescriptionsData> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/prescriptions`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const createPrescription = async (payload: any) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/prescriptions`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to create prescription");
  }
  return await res.json();
};

export const getDrugsList = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/drugs`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch drugs");
  return await res.json();
};
