import { store } from "@/lib/seed/store";
import { routeDosage, treatmentBadges, treatmentStatus, withdrawalDto } from "@/lib/seed/project";

export interface TreatmentSummary {
  active_treatments: number;
  withdrawal_ongoing: number;
  awaiting_vet_unsigned: number;
  completed: number;
}

export interface BadgeData {
  text: string;
  variant: string;
}

export interface WithdrawalData {
  dose_time: string;
  now_pct: number;
  clear_label: string;
  product_message: string; // e.g. "Milk clears tomorrow, 10:30 AM"
}

export interface TreatmentItem {
  id: string;
  animal_flock: string;
  species: string;
  feed_batch?: string;
  drug_name: string;
  route_dosage: string;
  administered_time: string;
  status: "Active" | "Withdrawal" | "Completed" | "Unsigned";
  badges: BadgeData[];
  withdrawal?: WithdrawalData;
}

export interface PrescriptionOption {
  id: string;
  drug_name: string;
  dosage: string;
  route: string;
  rx_id: string | null; // null if pending signature or exception
  is_emergency_exception: boolean;
}

/** Species column: an animal's own species, or "Poultry" for a flock. */
const speciesLabel = (animalId: string): string => {
  const animal = store.getAnimal(animalId);
  return animal ? animal.species : "";
};

export const getTreatments = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const treatments = store.getFarmerTreatments();

  const items: TreatmentItem[] = treatments.map((treatment) => ({
    id: treatment.id,
    animal_flock: treatment.animalId,
    species: speciesLabel(treatment.animalId),
    ...(treatment.feedBatch ? { feed_batch: treatment.feedBatch } : {}),
    drug_name: treatment.drug,
    route_dosage: routeDosage(treatment),
    administered_time: treatment.administeredLabel,
    status: treatmentStatus(treatment),
    badges: treatmentBadges(treatment),
    ...(treatment.withdrawal ? { withdrawal: withdrawalDto(treatment.withdrawal) } : {}),
  }));

  const summary: TreatmentSummary = {
    active_treatments: treatments.filter((t) => t.phase === "active").length,
    withdrawal_ongoing: treatments.filter((t) => t.phase === "withdrawal").length,
    awaiting_vet_unsigned: treatments.filter((t) => !t.signed && t.phase !== "completed").length,
    completed: treatments.filter((t) => t.phase === "completed").length,
  };

  return { summary, items };
};

export const getPrescriptionOptions = async (): Promise<PrescriptionOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return store.getPrescriptionOptions().map((option) => {
    const prescription = option.prescriptionId ? store.getPrescription(option.prescriptionId) : undefined;
    const isSigned = prescription?.status === "signed" || prescription?.status === "countersigned";

    return {
      id: option.id,
      drug_name: option.drugName,
      dosage: option.dosage,
      route: option.route,
      // CONFLICT: canonical ids read "Rx-201"; `RecordTreatmentModal` renders
      // "Vet Rx #{rx_id}", so the adapter still emits the bare number
      // (plan resolution 12). Unsigned prescriptions stay null → "Pending Signature".
      rx_id: prescription && isSigned ? prescription.id.replace(/^Rx-/, "") : null,
      is_emergency_exception: option.isEmergencyException,
    };
  });
};

export interface TreatmentTimelineStep {
  label: string;
  status: "complete" | "current" | "upcoming";
}

export interface TreatmentDetail {
  id: string;
  animal_id: string;
  species: string;
  status_badges: BadgeData[];
  medicine: string;
  route: string;
  dose: string;
  administered_at: string;
  reason: string;
  withdrawal: WithdrawalData | null;
  timeline: TreatmentTimelineStep[];
}

export const getTreatmentDetail = async (treatmentId: string): Promise<TreatmentDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // CONFLICT: the old fallback returned an MP-106 Goat body for every id except trt-1,
  // so opening trt-2..trt-5 showed the wrong animal. Every treatment now reads its own row.
  const treatment = store.getTreatment(treatmentId) ?? store.getFarmerTreatments()[0];

  const timeline: TreatmentTimelineStep[] = [
    { label: "Prescription", status: "complete" },
    { label: "Dose Given", status: "complete" },
    {
      label: "Withdrawal",
      status:
        treatment.phase === "withdrawal" ? "current" : treatment.phase === "completed" ? "complete" : "upcoming",
    },
    { label: "Clear", status: treatment.phase === "completed" ? "complete" : "upcoming" },
  ];

  return {
    id: treatment.id,
    animal_id: treatment.animalId,
    species: speciesLabel(treatment.animalId),
    status_badges: treatmentBadges(treatment),
    medicine: treatment.drug,
    route: treatment.route,
    dose: treatment.dosage,
    administered_at: treatment.administeredLabel.replace(/^Administered\s*/, ""),
    reason: treatment.reason,
    withdrawal: treatment.withdrawal ? withdrawalDto(treatment.withdrawal) : null,
    timeline,
  };
};
