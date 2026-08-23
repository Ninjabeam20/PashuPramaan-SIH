import { store } from "@/lib/seed/store";
import { prescriptionAction, prescriptionAwareBadges, prescriptionStatusBadge } from "@/lib/seed/project";

export interface PrescriptionsData {
  summary: {
    all_count: number;
    awaiting_signature_count: number;
    unsigned_emergency_count: number;
    signed_count: number;
    voided_count: number;
  };
  items: Array<{
    rx_id: string;
    farm: string;
    animal_flock: string;
    diagnosis: string;
    status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    aware_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    date_label: string;
    action_text: string;
    action_target: "sign_flow" | "countersign_flow" | "read_only";
  }>;
}

export const getPrescriptionsList = async (): Promise<PrescriptionsData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const prescriptions = store.getPrescriptions();

  return {
    summary: {
      all_count: prescriptions.length,
      awaiting_signature_count: prescriptions.filter((p) => p.status === "sign_required").length,
      // CONFLICT: this counter read 0 while Rx-207 was listed as COUNTERSIGNED. Rx-207 is
      // an unsigned emergency (plan resolution 9), so the count now derives from status.
      unsigned_emergency_count: prescriptions.filter((p) => p.status === "unsigned_emergency").length,
      signed_count: prescriptions.filter((p) => p.status === "signed" || p.status === "countersigned").length,
      voided_count: prescriptions.filter((p) => p.status === "voided").length,
    },
    items: prescriptions.map((prescription) => ({
      rx_id: prescription.id,
      farm: store.farmName(prescription.farmId),
      animal_flock: prescription.animalId,
      diagnosis: prescription.diagnosis,
      status_badges: [prescriptionStatusBadge(prescription)],
      aware_badges: prescriptionAwareBadges(prescription),
      date_label: prescription.dateLabel,
      ...prescriptionAction(prescription),
    })),
  };
};
