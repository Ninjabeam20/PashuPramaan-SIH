import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { labTestingFinished } from "@/lib/seed/project";

export type LabResultTest = {
  label: string;
  result: string;
  ok: boolean;
};

export type LabResult = {
  id: string;
  product: string;
  source: string;
  sample: string;
  date: string;
  tests: LabResultTest[];
  status: string;
  statusColor: "amber" | "red" | "green" | "neutral";
  action: string;
  /** "hold" routes directly to the On Hold sub-screen; anything else goes to Assessment */
  outcome: "hold" | "released";
};

const RESULT_VIEW = {
  on_hold: { status: "ACTION REQUIRED", statusColor: "red" as const, action: "Review →", outcome: "hold" as const },
  awaiting_verification: { status: "AWAITING VERIFICATION", statusColor: "amber" as const, action: "Review Assessment →", outcome: "released" as const },
  verified: { status: "VERIFIED", statusColor: "green" as const, action: "View Report →", outcome: "released" as const },
};

export async function fetchLabResults(): Promise<LabResult[]> {
  const token = getToken();
  const res = await fetch("http://localhost:8000/api/lab/results", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  return data.items as any;
}
