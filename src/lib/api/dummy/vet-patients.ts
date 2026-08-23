import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { patientTypeLabel } from "@/lib/seed/project";
import type { CareStatus } from "@/lib/seed/types";

export interface PatientItem {
  id: string;
  type: string;
  farm: string;
  status: { text: string; variant: string; dot?: boolean };
  last_follow_up: string;
}

export interface PatientsData {
  summary: {
    all_count: number;
    under_treatment_count: number;
    follow_up_due_count: number;
    recovered_count: number;
    needs_attention_count: number;
  };
  items: PatientItem[];
}

const CARE_STATUS_BADGE: Record<Exclude<CareStatus, "healthy">, { text: string; variant: string }> = {
  under_treatment: { text: "Under Treatment", variant: "patient_under_treatment" },
  improved: { text: "Improved", variant: "improved" },
  recovered: { text: "Recovered", variant: "recovered" },
  no_change: { text: "No Change", variant: "no_change" },
};

export const getVetPatients = async (): Promise<PatientsData> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/vet/patients`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
