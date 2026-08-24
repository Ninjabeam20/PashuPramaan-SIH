import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import type { FarmerDispatch, Treatment } from "@/lib/seed/types";

export interface DispatchStatSummary {
  active_dispatches: number;
  ready_to_dispatch: number;
  under_withdrawal: number;
  blocked: number;
  lab_pending?: number;
}

export interface DispatchItem {
  id: string;
  product: string;
  animal_flock: string;
  date: string;
  status: "cleared" | "withdrawal" | "blocked" | "lab_pending";
}

export interface DispatchSafetyOutcome {
  eligible: boolean;
  withdrawal: {
    status: "cleared" | "active";
    detail: string;
  };
  mrl: {
    status: "within_limit" | "exceeded" | "pending";
    lab_result_ppm: string;
    permitted_ppm: string;
  } | null;
  prescription: {
    signed: boolean;
  };
  lab_assay: {
    available: boolean;
  };
}

/** Default assay figures used when a treatment is badged "Lab ≤ MRL" but no lab report is on file. */
const DEFAULT_WITHIN_LIMIT = { lab_result_ppm: "0.04", permitted_ppm: "0.10" };

const toItem = (dispatch: FarmerDispatch): DispatchItem => ({
  id: dispatch.id,
  product: dispatch.product,
  animal_flock: dispatch.animalId,
  date: dispatch.dateLabel,
  status: dispatch.status,
});

export const getDispatches = async () => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dispatch`, { headers: { Authorization: `Bearer ${token}` } });
  return (await res.json()) as any;
};

export const checkDispatchSafety = async (
  product: string,
  animalIds: string[],
): Promise<DispatchSafetyOutcome> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/safety-check`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ product_type: product, animal_flock_id: animalIds[0], farm_id: "FARM-01" }) });
  return (await res.json()) as any;
};

export const issuePassport = async (
  product: string,
  animalIds: string[]
): Promise<{ passport_id: string; qr_verify_url: string; dispatch_id?: string | null }> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/passport`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product: product, animal_ids: animalIds })
  });
  if (!res.ok) {
    throw new Error("Failed to issue passport");
  }
  return await res.json();
};

export const sendToLab = async (
  product: string,
  animalIds: string[]
) => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/send-to-lab`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ product: product, animal_ids: animalIds })
  });
  if (!res.ok) {
    throw new Error("Failed to send to lab");
  }
  return await res.json();
};

export interface DispatchDetail {
  id: string;
  product: string;
  animal_flock: string;
  date: string;
  status: "cleared" | "withdrawal" | "blocked";
  timeline: { label: string; status: "complete" | "current" | "upcoming" }[];
  cleared_checklist?: string[];
  withdrawal_detail?: {
    clears_label: string;
    treatment_id: string;
  };
  blocked_detail?: {
    failed_gates: { gate: string; message: string }[];
    warnings: { icon: string; message: string }[];
  };
}

const timelineFor = (status: DispatchItem["status"]): DispatchDetail["timeline"] => {
  if (status === "cleared") {
    return [
      { label: "Treatment", status: "complete" },
      { label: "Withdrawal", status: "complete" },
      { label: "Safety Check", status: "complete" },
      { label: "Dispatch", status: "complete" },
    ];
  }
  if (status === "withdrawal") {
    return [
      { label: "Treatment", status: "complete" },
      { label: "Withdrawal", status: "current" },
      { label: "Safety Check", status: "upcoming" },
      { label: "Dispatch", status: "upcoming" },
    ];
  }
  if (status === "lab_pending") {
    return [
      { label: "Treatment", status: "complete" },
      { label: "Withdrawal", status: "complete" },
      { label: "Lab Verification", status: "current" },
      { label: "Dispatch", status: "upcoming" },
    ];
  }
  return [
    { label: "Treatment", status: "complete" },
    { label: "Withdrawal", status: "complete" },
    { label: "Safety Check", status: "current" },
    { label: "Dispatch", status: "upcoming" },
  ];
};

export const getDispatchDetail = async (dispatchId: string): Promise<DispatchDetail> => {
  const token = getToken();
  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/${dispatchId}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (data) {
    data.timeline = timelineFor(data.status);
  }
  return data as any;
};
