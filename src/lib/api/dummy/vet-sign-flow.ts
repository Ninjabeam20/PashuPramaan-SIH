import { API_BASE } from "../config";
import { getToken } from "./auth-utils";
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
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/prescriptions/${rxId}/for-signing`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const submitSignature = async (
  rxId: string,
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string, signature_image?: string },
) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/prescriptions/${rxId}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const getEmergencyForCountersigning = async (rxId: string): Promise<PrescriptionSignDetail> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/emergencies/${rxId}/for-countersigning`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};

export const submitCountersignature = async (
  rxId: string,
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string, signature_image?: string },
) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/vet/emergencies/${rxId}/countersign`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    // some fallback just in case or throw
  }
  return await res.json() as any;
};
