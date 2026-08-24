import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { labAntimicrobial, labSourceSub, labTestingStarted, priorityColor } from "@/lib/seed/project";

export type AwaitingSample = {
  id: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  sample: string;
  arrival: string;
  priority: string;
  priorityColor: "red" | "amber" | "neutral" | "green" | "sage";
  reason: string;
  action: string;
  highlighted: boolean;
};

export type ReadySampleTest = {
  name: string;
  status: "done" | "active" | "pending";
};

export type ReadySample = {
  id: string;
  product: string;
  source: string;
  sample: string;
  tests: ReadySampleTest[];
  action: string;
};

export type TestingQueueData = {
  awaiting: AwaitingSample[];
  ready: ReadySample[];
};

export async function fetchTestingQueue(): Promise<TestingQueueData> {
  const token = getToken();
  const res = await fetch("http://localhost:8000/api/lab/queue", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  return data as any;
}

export async function receiveSample(dispatchId: string, payload: { condition: string; temperature: string; container: string; notes?: string }) {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/lab/dispatches/${dispatchId}/receive`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to receive sample");
  }
  return await res.json();
}

export type WorkspaceData = {
  dispatchId: string;
  sampleId: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  condition: string;
  temperature: string;
  riskLevel: string;
  antimicrobialContext: string;
  antimicrobialStatus: string;
  assessments: Array<{
    id?: string;
    num: number;
    label: string;
    state: "done" | "active" | "pending";
    checks?: string[];
    result?: string | null;
    ok?: boolean;
  }>;
};

export async function fetchTestingWorkspace(sampleId: string): Promise<WorkspaceData> {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error("Failed to load testing workspace");
  }
  return (await res.json()) as WorkspaceData;
}

export async function submitTestResult(sampleId: string, payload: { test_id: string; result_value: number; unit: string; operator: string; verdict: string }) {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}/tests`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error("Failed to submit test result");
  }
  return await res.json();
}

export async function submitAssessment(sampleId: string) {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}/submit_assessment`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error("Failed to submit assessment");
  return await res.json();
}
