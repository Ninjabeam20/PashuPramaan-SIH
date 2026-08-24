import { getToken } from "./auth-utils";

export type LabSummaryCard = {
  value: string;
  label: string;
  sub: string;
  color: "amber" | "neutral" | "red" | "green";
  href?: string;
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

export type LabGreeting = {
  hello: string;
  name: string;
  date: string;
};

export type LabProductMixItem = {
  label: string;
  count: number;
};

export type LabDashboardData = {
  greeting?: LabGreeting;
  summary: LabSummaryCard[];
  outcomes?: LabSummaryCard[];
  productMix?: LabProductMixItem[];
  attention: LabAttentionItem[];
  activity: LabActivityItem[];
};

export async function fetchLabDashboard(): Promise<LabDashboardData> {
  const token = getToken();
  const res = await fetch("http://localhost:8000/api/lab/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch lab dashboard");
  }
  return (await res.json()) as LabDashboardData;
}
