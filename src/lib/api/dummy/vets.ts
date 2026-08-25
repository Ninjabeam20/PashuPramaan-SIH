import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";

export interface VetOption {
  id: string;
  name: string;
  designation: string;
}

export const getAvailableVets = async (): Promise<VetOption[]> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/farmer/vets`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return (await res.json()).items as any;
};
