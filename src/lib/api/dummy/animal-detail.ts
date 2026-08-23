import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { animalStatus, signatureBadge, withdrawalDto } from "@/lib/seed/project";
import { WithdrawalData, BadgeData } from "./treatments";

export interface AnimalDetail {
  id: string;
  type: string;
  status: "under_treatment" | "healthy" | "waiting";
  breed: string;
  sex: string;
  date_of_birth: string;
  production_type: string;
  registered_on: string;
  current_treatment: {
    drug: string;
    route: string;
    dosage: string;
    administered_at: string;
    signed_badge: BadgeData;
    withdrawal: WithdrawalData | null;
  } | null;
}

export const getAnimalDetail = async (animalId: string): Promise<AnimalDetail> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/animals/${animalId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
