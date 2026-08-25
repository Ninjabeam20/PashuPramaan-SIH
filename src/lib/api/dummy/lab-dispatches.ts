import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import {
  labSourceSub,
  labWithdrawalCheck,
  riskColor,
  stageView,
} from "@/lib/seed/project";
import type { LabSample, LabTest } from "@/lib/seed/types";

export type LabDispatchItem = {
  id: string;
  date: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  sample: string;
  sampleStatus: string;
  sampleColor: "green" | "blue" | "red" | "amber" | "neutral";
  risk: string;
  riskColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral";
  status: string;
  statusColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral";
  action: string;
  clickable: boolean;
};

export async function fetchLabDispatches(): Promise<LabDispatchItem[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/lab/dispatches`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  return data as any;
}

export type LabTestItem = {
  num: string;
  title: string;
  checks: string[];
  status: string;
  statusColor: string;
  action: string;
  active: boolean;
  badge: string | null;
};

export type LabAssessmentItem = {
  label: string;
  status: string;
  color: string;
};

export type LabActivityLog = {
  time: string;
  title: string;
  desc: string;
  icon: "active" | "done" | "neutral";
};

export type LabDispatchDetail = {
  id: string;
  product: string;
  source: string;
  date: string;
  time: string;
  quantity: string;
  linkedAnimal: string;
  currentSample: string;
  risk: string;
  riskColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral" | string;
  riskReason: string;
  overallStatus: string;
  progressText?: string;
  stages: Array<{ label: string; state: "done" | "active" | "upcoming" }>;
  tests: LabTestItem[];
  assessment: LabAssessmentItem[];
  notes: {
    condition: string;
    temperature: string;
    container: string;
    receivedBy: string;
    receivedAt: string;
  };
  activity: LabActivityLog[];
};

const STAGE_LABELS = ["Created", "Received", "Testing", "Verification", "Assessment"] as const;

const testItem = (test: LabTest, index: number): LabTestItem => {
  const status = test.state === "done" ? "COMPLETED" : test.state === "active" ? "IN PROGRESS" : "PENDING";
  const statusColor = test.state === "done" ? "green" : test.state === "active" ? "amber" : "neutral";
  const action = test.state === "done" ? "View Results →" : test.state === "active" ? "Continue Testing →" : "Start Test →";

  return {
    num: String(index + 1).padStart(2, "0"),
    title: test.name,
    checks: test.checks,
    status,
    statusColor,
    action,
    active: test.state === "active",
    badge: test.trigger,
  };
};

const assessmentList = (sample: LabSample): LabAssessmentItem[] => [
  { label: "Traceability", status: "Complete", color: "green" },
  { label: "Withdrawal Check", ...labWithdrawalCheck(sample) },
  ...sample.tests.map((test) => ({
    label: test.name,
    status: test.state === "done" ? "Complete" : test.state === "active" ? "In Progress" : "Pending",
    color: test.state === "done" ? (test.ok ? "green" : "red") : test.state === "active" ? "amber" : "neutral",
  })),
];

export async function fetchLabDispatchDetail(dispatchId: string): Promise<LabDispatchDetail | null> {
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}/api/lab/dispatches/${dispatchId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch lab dispatch detail", err);
    return null;
  }
}
