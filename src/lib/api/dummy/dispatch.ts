import { store } from "@/lib/seed/store";
import type { FarmerDispatch, Treatment } from "@/lib/seed/types";

export interface DispatchStatSummary {
  active_dispatches: number;
  ready_to_dispatch: number;
  under_withdrawal: number;
  blocked: number;
}

export interface DispatchItem {
  id: string;
  product: string;
  animal_flock: string;
  date: string;
  status: "cleared" | "withdrawal" | "blocked";
}

export interface DispatchSafetyOutcome {
  eligible: boolean;
  withdrawal: {
    status: "cleared" | "active";
    detail: string;
  };
  mrl: {
    status: "within_limit" | "exceeded";
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
  await new Promise((resolve) => setTimeout(resolve, 400));

  const dispatches = store.getFarmerDispatches();

  const summary: DispatchStatSummary = {
    active_dispatches: dispatches.filter((d) => d.status !== "blocked").length,
    ready_to_dispatch: dispatches.filter((d) => d.status === "cleared").length,
    under_withdrawal: dispatches.filter((d) => d.status === "withdrawal").length,
    blocked: dispatches.filter((d) => d.status === "blocked").length,
  };

  return { summary, items: dispatches.map(toItem) };
};

export const checkDispatchSafety = async (
  product: string,
  animalIds: string[],
): Promise<DispatchSafetyOutcome> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // CONFLICT: this used to hardcode MP-108 / Flock-07 as the blocked scenario even though
  // MP-108's course (trt-5) is completed. The outcome now derives from the animal's own
  // treatments and from any blocked dispatch already recorded against it.
  const treatments: Treatment[] = animalIds.flatMap((id) => store.getTreatmentsByAnimal(id));
  const openWithdrawal = treatments.find((t) => t.phase === "withdrawal");
  const blockedDispatch = animalIds
    .flatMap((id) => store.getDispatchesForAnimal(id))
    .find((d) => d.blocked !== null);

  const latestTreatment = treatments.find((t) => t.phase !== "completed") ?? treatments[0];
  const hasLabResult =
    latestTreatment?.labAssay === "within_mrl" ||
    animalIds.some((id) => store.getLabSamplesForAnimal(id).length > 0);

  if (blockedDispatch?.blocked) {
    return {
      eligible: false,
      withdrawal: openWithdrawal
        ? { status: "active", detail: openWithdrawal.withdrawal?.clearsAt ?? "Active" }
        : { status: "cleared", detail: "CLEARED" },
      mrl: {
        status: "exceeded",
        lab_result_ppm: blockedDispatch.blocked.mrlMeasuredPpm,
        permitted_ppm: blockedDispatch.blocked.mrlPermittedPpm,
      },
      prescription: { signed: blockedDispatch.blocked.prescriptionSigned },
      lab_assay: { available: true },
    };
  }

  if (openWithdrawal) {
    return {
      eligible: false,
      withdrawal: {
        status: "active",
        detail: openWithdrawal.withdrawal
          ? `Active (${openWithdrawal.withdrawal.productMessage})`
          : "Active",
      },
      mrl:
        openWithdrawal.labAssay === "within_mrl"
          ? { status: "within_limit", ...DEFAULT_WITHIN_LIMIT }
          : null,
      prescription: { signed: openWithdrawal.signed },
      lab_assay: { available: openWithdrawal.labAssay === "within_mrl" },
    };
  }

  return {
    eligible: true,
    withdrawal: { status: "cleared", detail: "CLEARED" },
    mrl: hasLabResult ? { status: "within_limit", ...DEFAULT_WITHIN_LIMIT } : null,
    prescription: { signed: latestTreatment ? latestTreatment.signed : true },
    lab_assay: { available: hasLabResult },
  };
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
  return [
    { label: "Treatment", status: "complete" },
    { label: "Withdrawal", status: "complete" },
    { label: "Safety Check", status: "current" },
    { label: "Dispatch", status: "upcoming" },
  ];
};

export const getDispatchDetail = async (dispatchId: string): Promise<DispatchDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const dispatch = store.getFarmerDispatch(dispatchId) ?? store.getFarmerDispatches()[0];
  const treatment = dispatch.treatmentId ? store.getTreatment(dispatch.treatmentId) : undefined;

  const detail: DispatchDetail = {
    id: dispatch.id,
    product: dispatch.product,
    animal_flock: dispatch.animalId,
    date: dispatch.dateLabel,
    status: dispatch.status,
    timeline: timelineFor(dispatch.status),
  };

  if (dispatch.status === "cleared") {
    detail.cleared_checklist = [
      "Withdrawal Cleared",
      treatment?.labAssay === "within_mrl" ? "MRL Within Limit" : "No lab assay required",
      "Eligible",
      "Passport Generated",
    ];
  }

  if (dispatch.status === "withdrawal") {
    detail.withdrawal_detail = {
      clears_label: treatment?.withdrawal?.clearsAt ?? "Clears when withdrawal completes",
      treatment_id: dispatch.treatmentId ?? "",
    };
  }

  if (dispatch.status === "blocked" && dispatch.blocked) {
    detail.blocked_detail = {
      failed_gates: [
        {
          gate: "MRL",
          message: `MRL Above Limit — Lab: ${dispatch.blocked.mrlMeasuredPpm} ppm / Permitted: ${dispatch.blocked.mrlPermittedPpm} ppm`,
        },
      ],
      warnings: dispatch.blocked.prescriptionSigned
        ? []
        : [{ icon: "⚠", message: "Prescription Unsigned" }],
    };
  }

  return detail;
};
