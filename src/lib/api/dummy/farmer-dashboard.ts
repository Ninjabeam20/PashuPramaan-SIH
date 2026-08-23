import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { farmCounts, stockQuantityLabel, stockStatus } from "@/lib/seed/project";

export const getFarmerDashboard = async () => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dashboard`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
