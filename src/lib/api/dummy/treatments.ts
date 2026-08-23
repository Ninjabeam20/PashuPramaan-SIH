import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { routeDosage, treatmentBadges, treatmentStatus, withdrawalDto } from "@/lib/seed/project";

export interface TreatmentSummary {
  active_treatments: number;
  withdrawal_ongoing: number;
  awaiting_vet_unsigned: number;
  completed: number;
}

export interface BadgeData {
  text: string;
  variant: string;
}

export interface WithdrawalData {
  dose_time: string;
  now_pct: number;
  clear_label: string;
  product_message: string; // e.g. "Milk clears tomorrow, 10:30 AM"
}

export interface TreatmentItem {
  id: string;
  animal_flock: string;
  species: string;
  feed_batch?: string;
  drug_name: string;
  route_dosage: string;
  administered_time: string;
  status: "Active" | "Withdrawal" | "Completed" | "Unsigned";
  badges: BadgeData[];
  withdrawal?: WithdrawalData;
}

export interface PrescriptionOption {
  id: string;
  drug_name: string;
  dosage: string;
  route: string;
  rx_id: string | null; // null if pending signature or exception
  animal_id?: string;
  diagnosis?: string;
  is_emergency_exception: boolean;
}

/** Species column: an animal's own species, or "Poultry" for a flock. */
const speciesLabel = (animalId: string): string => {
  const animal = store.getAnimal(animalId);
  return animal ? animal.species : "";
};

export const getTreatments = async () => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/treatments`, {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const createTreatment = async (payload: { animal_ids: string[]; prescription_option_id: string; timing: string; backdated_at?: string }) => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/treatments`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to create treatment");
  }
  return await res.json();
};

export const getPrescriptionOptions = async (): Promise<PrescriptionOption[]> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/treatments/prescriptions`, {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export interface TreatmentTimelineStep {
  label: string;
  status: "complete" | "current" | "upcoming";
}

export interface TreatmentDetail {
  id: string;
  animal_id: string;
  species: string;
  status_badges: BadgeData[];
  medicine: string;
  route: string;
  dose: string;
  administered_at: string;
  reason: string;
  withdrawal: WithdrawalData | null;
  timeline: TreatmentTimelineStep[];
}

export const getTreatmentDetail = async (treatmentId: string): Promise<TreatmentDetail> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/treatments/${treatmentId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
