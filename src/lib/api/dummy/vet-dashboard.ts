import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import {
  needsAction,
  prescriptionAwareBadges,
  prescriptionDashboardBadges,
  prescriptionStatusBadge,
  requiresStewardshipNotice,
} from "@/lib/seed/project";

export const getVetDashboard = async () => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/dashboard`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
