import { API_BASE } from "../config";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";

export type LabSummaryCard = {
  value: string;
  label: string;
  sub: string;
  color: "amber" | "neutral" | "red" | "green";
};

export type LabAttentionItem = {
  id: string;
  type: string;
  title: string;
  desc: string;
  status: string;
  statusColor: "amber" | "red" | "green";
  action: string;
  page: string;
};

export type LabActivityItem = {
  text: string;
  time: string;
  icon: "check" | "inbox" | "hold" | "dispatch";
};

export type LabDashboardData = {
  summary: LabSummaryCard[];
  attention: LabAttentionItem[];
  activity: LabActivityItem[];
};

export async function fetchLabDashboard(): Promise<LabDashboardData> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/lab/dashboard`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  return data as any;
}
