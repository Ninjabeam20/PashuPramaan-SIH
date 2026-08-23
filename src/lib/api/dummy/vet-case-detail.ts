import { store } from "@/lib/seed/store";
import {
  awareBadge,
  CIA_BADGE,
  prescriptionAwareBadges,
  prescriptionStatusBadge,
  requiresStewardshipNotice,
  speciesTypeLabel,
} from "@/lib/seed/project";

export interface CaseDetail {
  id: string;
  label: string;
  title: string;
  animal: {
    id: string;
    species_type: string;
  };
  farm_name: string;
  status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  health_event?: {
    name: string;
    onset: string;
  };
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  stewardship?: {
    aware_badge?: { text: string; variant: string };
    cia_badge?: { text: string; variant: string };
  };
  treatment_history?: {
    previous_episode: string;
    outcome_badge: { text: string; variant: string };
    completed_date: string;
  };
}

export const getCaseDetail = async (caseId: string): Promise<CaseDetail> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // CONFLICT: this used to branch on the string "P-01" and otherwise return a fixed
  // Rx-205 body (with MP-118 typed as a Buffalo). It now resolves whatever id the caller
  // holds — an Rx id, an animal id from the alerts widget, or an id with a UI suffix.
  const prescription = store.resolvePrescription(caseId);
  const animal = store.getAnimal(prescription.animalId);
  const healthEvent = store.getHealthEventForAnimal(prescription.animalId);

  const detail: CaseDetail = {
    id: prescription.id,
    label: prescription.id,
    title: prescription.diagnosis,
    animal: {
      id: prescription.animalId,
      species_type: animal ? speciesTypeLabel(animal) : "",
    },
    farm_name: store.farmName(prescription.farmId),
    status_badges: [prescriptionStatusBadge(prescription), ...prescriptionAwareBadges(prescription)],
    prescription: {
      drug: prescription.drug,
      route: prescription.route,
      dose: prescription.dose,
      frequency: prescription.frequency,
      duration: prescription.duration,
      reason: prescription.reason,
    },
  };

  if (healthEvent) {
    detail.health_event = { name: healthEvent.name, onset: healthEvent.onset };
  }

  // Only Watch / Reserve / CIA drugs get the stewardship block.
  if (requiresStewardshipNotice(prescription)) {
    detail.stewardship = {
      ...(prescription.aware ? { aware_badge: awareBadge(prescription.aware) } : {}),
      ...(prescription.cia ? { cia_badge: { ...CIA_BADGE } } : {}),
    };
  }

  if (prescription.treatmentHistory) {
    detail.treatment_history = {
      previous_episode: prescription.treatmentHistory.episode,
      outcome_badge: { text: prescription.treatmentHistory.outcome, variant: prescription.treatmentHistory.outcome.toLowerCase() },
      completed_date: prescription.treatmentHistory.completedDate,
    };
  }

  return detail;
};
