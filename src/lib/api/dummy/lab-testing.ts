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
  assessments: Array<{ num: number; label: string; state: "done" | "active" | "pending" }>;
};

export async function fetchTestingWorkspace(sampleId: string): Promise<WorkspaceData> {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}`, { headers: { Authorization: `Bearer ${token}` } });
  return (await res.json()) as any;
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
