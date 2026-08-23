import { store } from "@/lib/seed/store";
import {
  needsAction,
  prescriptionAwareBadges,
  prescriptionDashboardBadges,
  prescriptionStatusBadge,
  requiresStewardshipNotice,
} from "@/lib/seed/project";

export const getVetDashboard = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const state = store.getState();
  const vet = store.getCurrentVet();
  const prescriptions = store.getPrescriptions();
  const actionable = store.getActionablePrescriptions();
  const emergencies = prescriptions.filter((p) => p.status === "unsigned_emergency");

  // CONFLICT: the alerts widget renders every row as "Emergency administration needs
  // countersignature", but two of the three seeded alerts were ordinary sign-requests
  // (one of them for MP-105, a healthy animal with no prescription at all). Alerts now
  // derive from prescriptions that really are unsigned emergencies, so the widget count
  // matches the workload counter.
  const alerts = emergencies.map((prescription, index) => ({
    id: `alert-${index + 1}`,
    farm: store.farmName(prescription.farmId),
    animal_flock: prescription.animalId,
    drug: prescription.drug,
    administered_at: prescription.dateLabel,
    badge: "unsigned_emergency",
  }));

  const attention_items = [
    ...actionable.map((prescription) => {
      const isEmergency = prescription.status === "unsigned_emergency";
      return {
        // The id doubles as the case id the modal opens and the rxId the sign flow routes
        // to, so it is the prescription id rather than an "attn-N" placeholder.
        id: prescription.id,
        type: isEmergency ? "emergency" : "prescription",
        priority_color: isEmergency ? "red" : "orange",
        label: isEmergency ? "Unsigned emergency" : "Prescription awaiting signature",
        link_text: isEmergency ? "Review & Countersign →" : "Review & Sign →",
        title: `${store.farmName(prescription.farmId)} · ${prescription.animalId}`,
        diagnosis: prescription.diagnosis,
        detail: `${prescription.drug} · administered ${prescription.dateLabel}`,
        badges: [prescriptionStatusBadge(prescription), ...prescriptionAwareBadges(prescription)],
      };
    }),
    ...actionable
      .filter((prescription) => requiresStewardshipNotice(prescription))
      .map((prescription) => ({
        id: `${prescription.id}-stewardship`,
        type: "stewardship",
        priority_color: "purple",
        label: "Stewardship review",
        link_text: "Review →",
        title: `${store.farmName(prescription.farmId)} · ${prescription.animalId}`,
        diagnosis: prescription.diagnosis,
        detail: "",
        badges: prescriptionAwareBadges(prescription),
      })),
  ];

  const awaitingSignature = prescriptions.filter((p) => p.status === "sign_required").length;
  // Counts every Watch / Reserve / CIA prescription that is not signed off yet — the
  // attention list only shows the ones still actionable (a voided Rx is not).
  const stewardshipReview = prescriptions.filter(
    (p) => requiresStewardshipNotice(p) && p.status !== "signed" && p.status !== "countersigned",
  ).length;

  const recentPrescriptions = prescriptions.slice(0, 4);

  return {
    vet: { name: vet.name },
    workload: {
      awaiting_signature: awaitingSignature,
      unsigned_emergency: emergencies.length,
      follow_up: state.vetWorkload.followUp,
      stewardship_review: stewardshipReview,
      status: awaitingSignature + emergencies.length > 0 ? "action_needed" : "clear",
    },
    alerts,
    attention_items,
    insights: state.vetInsights.map((insight) => ({
      id: insight.id,
      type: insight.type,
      case_title: insight.caseTitle,
      similar_case_count: insight.similarCaseCount,
      recovery_pct: insight.recoveryPct,
      recovery_label: insight.recoveryLabel,
      disclaimer: insight.disclaimer,
    })),
    prescriptions: {
      total: recentPrescriptions.length,
      items: recentPrescriptions.map((prescription) => ({
        rx_id: prescription.id,
        farm: store.farmName(prescription.farmId),
        animal_flock: prescription.animalId,
        diagnosis: prescription.diagnosis,
        ...prescriptionDashboardBadges(prescription),
        time: prescription.dateLabel,
        action_text: needsAction(prescription) ? "Review →" : "View →",
      })),
    },
    recent_activity: state.vetActivity.map((row) => ({
      time: row.time,
      title: row.title,
      description: row.description,
    })),
    recent_outcomes: state.vetOutcomes.map((row) => ({
      animal_flock: row.animalFlock,
      diagnosis: row.diagnosis,
      detail: row.detail,
      outcome_badge: row.outcome,
    })),
  };
};
