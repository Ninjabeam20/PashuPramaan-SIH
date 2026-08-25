import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";

export type ReportMrl = {
  drug: string;
  measured: number;
  limit: number;
  unit: string;
  ratio: number;
  verdict: string;
  verdictOk: boolean;
};

export type ReportWithdrawal = {
  drug: string;
  administered: string;
  completed: string;
  /** If the string contains "Completed" it will be styled green; otherwise red */
  status: string;
};

export type ReportAssessment = {
  label: string;
  result: string;
  ok: boolean;
  detail: string;
};

export type LabReport = {
  id: string;
  product: string;
  productSub: string;
  source: string;
  sample: string;
  animal: string;
  date: string;
  status: string;
  statusColor: "green" | "red" | "amber" | "neutral";
  refNo: string;
  verifiedBy: string;
  verifiedOn: string;
  assessments: ReportAssessment[];
  mrl: ReportMrl;
  withdrawal: ReportWithdrawal;
  outcome: string;
  outcomeOk: boolean;
};

export type ReportsSummary = {
  v: string;
  l: string;
  color: "neutral" | "green" | "red" | "amber";
};

export const REPORTS_SUMMARY: ReportsSummary[] = [
  { v: "124", l: "Reports Generated", color: "neutral" },
  { v: "8", l: "Positive Violations", color: "red" },
  { v: "116", l: "Passed", color: "green" },
];

export async function fetchLabReports(): Promise<{ summary: ReportsSummary[], items: LabReport[] }> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/lab/reports`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  const data = await res.json();
  return data;
}
