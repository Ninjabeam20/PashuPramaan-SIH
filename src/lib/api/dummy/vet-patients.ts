import { store } from "@/lib/seed/store";
import { patientTypeLabel } from "@/lib/seed/project";
import type { CareStatus } from "@/lib/seed/types";

export interface PatientItem {
  id: string;
  type: string;
  farm: string;
  status: { text: string; variant: string; dot?: boolean };
  last_follow_up: string;
}

export interface PatientsData {
  summary: {
    all_count: number;
    under_treatment_count: number;
    follow_up_due_count: number;
    recovered_count: number;
    needs_attention_count: number;
  };
  items: PatientItem[];
}

const CARE_STATUS_BADGE: Record<Exclude<CareStatus, "healthy">, { text: string; variant: string }> = {
  under_treatment: { text: "Under Treatment", variant: "patient_under_treatment" },
  improved: { text: "Improved", variant: "improved" },
  recovered: { text: "Recovered", variant: "recovered" },
  no_change: { text: "No Change", variant: "no_change" },
};

export const getVetPatients = async (): Promise<PatientsData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const patients = store.getVetPatients();

  return {
    summary: {
      all_count: patients.length,
      // CONFLICT: Flock P-01 was listed "Recovered" while its emergency Rx was unsigned.
      // Care status is canonical now (plan resolution 10), so this counter follows it.
      under_treatment_count: patients.filter((a) => a.careStatus === "under_treatment").length,
      follow_up_due_count: patients.filter((a) => a.followUpDue).length,
      recovered_count: patients.filter((a) => a.careStatus === "recovered").length,
      needs_attention_count: patients.filter((a) => a.careStatus === "no_change").length,
    },
    items: patients.map((animal) => ({
      id: animal.id,
      type: patientTypeLabel(animal),
      farm: store.farmName(animal.farmId),
      status: { ...CARE_STATUS_BADGE[(animal.careStatus ?? "improved") as Exclude<CareStatus, "healthy">], dot: true },
      last_follow_up: animal.lastFollowUp ?? "—",
    })),
  };
};
