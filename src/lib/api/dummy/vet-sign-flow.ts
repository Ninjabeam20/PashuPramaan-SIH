// Dummy API for the Vet Signature Flow

import { store } from "@/lib/seed/store";
import { VET_SIGNATURE_PIN } from "@/lib/seed/ids";
import {
  awareBadge,
  CIA_BADGE,
  prescriptionAwareBadges,
  prescriptionStatusBadge,
  requiresStewardshipNotice,
} from "@/lib/seed/project";
import type { Prescription } from "@/lib/seed/types";

export interface PrescriptionSignDetail {
  rx_id: string;
  farm: string;
  animal: string;
  diagnosis: string;
  status_badges: { text: string; variant: string; dot?: boolean }[];
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  requires_stewardship_notice: boolean;
  confirmation_heading?: string;
  confirmation_text?: string;

  health_event?: {
    name: string;
    onset: string;
  };

  previous_treatment?: {
    drug: string;
    duration: string;
    outcome_badge: { text: string; variant: string };
  };

  stewardship?: {
    aware_badge?: { text: string; variant: string };
    cia_badge?: { text: string; variant: string };
    guidance: string[];
  };
}

const toSignDetail = (prescription: Prescription): PrescriptionSignDetail => {
  const healthEvent = store.getHealthEventForAnimal(prescription.animalId);

  const detail: PrescriptionSignDetail = {
    rx_id: prescription.id,
    farm: store.farmName(prescription.farmId),
    animal: prescription.animalId,
    diagnosis: prescription.diagnosis,
    status_badges: [prescriptionStatusBadge(prescription), ...prescriptionAwareBadges(prescription)],
    requires_stewardship_notice: requiresStewardshipNotice(prescription),
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

  if (prescription.previousTreatment) {
    detail.previous_treatment = {
      drug: prescription.previousTreatment.drug,
      duration: prescription.previousTreatment.duration,
      outcome_badge: {
        text: prescription.previousTreatment.outcome,
        variant: prescription.previousTreatment.outcome.toLowerCase(),
      },
    };
  }

  if (requiresStewardshipNotice(prescription)) {
    detail.stewardship = {
      ...(prescription.aware ? { aware_badge: awareBadge(prescription.aware) } : {}),
      ...(prescription.cia ? { cia_badge: { ...CIA_BADGE } } : {}),
      guidance: prescription.stewardshipGuidance,
    };
  }

  return detail;
};

export const getPrescriptionForSigning = async (rxId: string): Promise<PrescriptionSignDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // CONFLICT: this used to ignore `rxId` and always return the Krishna Dairy / MP-118 /
  // Enrofloxacin body, so signing Rx-208 showed the wrong farm, animal and drug.
  // It now branches on the prescription (plan resolution 11).
  return toSignDetail(store.resolvePrescription(rxId));
};

export const submitSignature = async (
  rxId: string,
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string },
) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (payload.pin !== VET_SIGNATURE_PIN) {
    throw new Error("Incorrect PIN");
  }

  // Generate a dummy signature reference
  const ref = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("");

  return {
    signed_by: payload.typed_name || store.getCurrentVet().name, // Fallback if they only drew
    date_time: "22 Aug · 03:45 pm",
    status: "signed",
    signature_reference: `Signed · ${ref}`,
  };
};

export const getEmergencyForCountersigning = async (rxId: string): Promise<PrescriptionSignDetail> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const prescription = store.resolvePrescription(rxId);
  const detail = toSignDetail(prescription);

  return {
    ...detail,
    confirmation_heading: "Countersignature confirmation",
    confirmation_text:
      "By countersigning, I confirm that I have reviewed this emergency administration record and am formally adding my countersignature to authorize it.",
  };
};

export const submitCountersignature = async (
  rxId: string,
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string },
) => {
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating network & cryptographic delay

  if (payload.pin !== VET_SIGNATURE_PIN) {
    throw new Error("Invalid PIN");
  }

  const now = new Date();
  const formatTime = () => {
    return `${now.getDate()} Aug · ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase()}`;
  };

  const ref = Math.floor(1000000 + Math.random() * 9000000).toString();

  return {
    countersigned_by: payload.typed_name || store.getCurrentVet().name,
    date_time: formatTime(),
    status: "countersigned",
    reference: `Countersigned · ${ref}`,
    disclaimer_text:
      "This countersignature records your formal review and authorization of the emergency administration. The original emergency administration record has been retained.",
  };
};
