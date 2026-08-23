/**
 * Projection helpers shared by the dummy adapters.
 *
 * Everything here is a pure function over canonical rows. Adapters use these so a
 * badge, a label or a count is computed once and reads the same on every page.
 */

import { store } from "./store";
import type {
  Animal,
  AwareClass,
  LabSample,
  LabStage,
  MedicineStock,
  Prescription,
  StockLevel,
  Treatment,
  Withdrawal,
} from "./types";

export type Badge = { text: string; variant: string; dot?: boolean };

// ─── Animals ─────────────────────────────────────────────────────────────────

export type RosterStatus = "under_treatment" | "healthy" | "waiting";

/**
 * An animal is under treatment while a signed course is running, and "waiting"
 * while the only open course is still unsigned (waiting on the vet).
 */
export function animalStatus(animalId: string): RosterStatus {
  const open = store.getTreatmentsByAnimal(animalId).filter((t) => t.phase !== "completed");
  if (open.length === 0) return "healthy";
  return open.some((t) => t.signed) ? "under_treatment" : "waiting";
}

/** Roster / dispatch label: flocks read as "Poultry / Flock". */
export function animalTypeLabel(animal: Animal): string {
  return animal.isFlock ? "Poultry / Flock" : animal.species;
}

/** Vet patients label: flocks read as "Flock (Broiler)". */
export function patientTypeLabel(animal: Animal): string {
  return animal.isFlock ? `Flock (${animal.breed})` : animal.species;
}

/** Case-detail label: "Poultry · Broiler" / "Cow · Dairy". */
export function speciesTypeLabel(animal: Animal): string {
  return animal.isFlock ? `${animal.species} · ${animal.breed}` : `${animal.species} · ${animal.productionType}`;
}

export type SpeciesGroup = { key: "Cow" | "Buffalo" | "Goat"; label: string; herd: number };

export function speciesGroups(): SpeciesGroup[] {
  const farm = store.getFarmerFarm();
  return [
    { key: "Cow", label: "Cows", herd: farm.herd.cows },
    { key: "Buffalo", label: "Buffaloes", herd: farm.herd.buffaloes },
    { key: "Goat", label: "Goats", herd: farm.herd.goats },
  ];
}

/**
 * Herd counts for the farmer's dairy. `total` is the whole herd; the treatment and
 * waiting counts come from the animals actually on the roster, so the summary
 * numbers always match the table below them.
 */
export function farmCounts() {
  const roster = store.getFarmerRoster();
  const groups = speciesGroups();
  const total = groups.reduce((sum, g) => sum + g.herd, 0);
  const underTreatment = roster.filter((a) => animalStatus(a.id) === "under_treatment").length;
  const waiting = roster.filter((a) => animalStatus(a.id) === "waiting").length;

  return {
    total,
    cows: farmHerd("Cow"),
    buffaloes: farmHerd("Buffalo"),
    goats: farmHerd("Goat"),
    underTreatment,
    waiting,
    clear: total - underTreatment - waiting,
  };
}

function farmHerd(species: "Cow" | "Buffalo" | "Goat"): number {
  return speciesGroups().find((g) => g.key === species)!.herd;
}

export function speciesOverview() {
  const roster = store.getFarmerRoster();
  return speciesGroups().map((group) => {
    const inGroup = roster.filter((a) => a.species === group.key);
    const underTreatment = inGroup.filter((a) => animalStatus(a.id) === "under_treatment").length;
    const waiting = inGroup.filter((a) => animalStatus(a.id) === "waiting").length;
    return {
      species: group.label,
      count: group.herd,
      healthy_count: group.herd - underTreatment - waiting,
      under_treatment_count: underTreatment,
      waiting_count: waiting,
    };
  });
}

// ─── Treatments ──────────────────────────────────────────────────────────────

export function routeDosage(treatment: Treatment): string {
  return treatment.route ? `${treatment.route} · ${treatment.dosage}` : treatment.dosage;
}

export type TreatmentStatus = "Active" | "Withdrawal" | "Completed" | "Unsigned";

export function treatmentStatus(treatment: Treatment): TreatmentStatus {
  if (treatment.phase === "completed") return "Completed";
  if (!treatment.signed) return "Unsigned";
  return treatment.phase === "withdrawal" ? "Withdrawal" : "Active";
}

export function treatmentBadges(treatment: Treatment): Badge[] {
  const badges: Badge[] = [];

  if (treatment.phase === "completed") badges.push({ text: "Completed", variant: "completed" });
  else if (treatment.phase === "withdrawal") badges.push({ text: "Withdrawal Active", variant: "withdrawal_active" });
  else badges.push({ text: "Active", variant: "active" });

  if (treatment.signed) badges.push({ text: "Vet Signed", variant: "vet_signed" });
  else if (treatment.emergency) badges.push({ text: "Emergency / Unsigned", variant: "emergency_unsigned" });
  else badges.push({ text: "Pending Vet Signature", variant: "pending_vet_signature" });

  if (treatment.labAssay === "within_mrl") badges.push({ text: "Lab ≤ MRL", variant: "lab_mrl" });
  else if (treatment.labAssay === "unavailable") badges.push({ text: "No lab assay", variant: "no_lab_assay" });

  return badges;
}

export function withdrawalDto(withdrawal: Withdrawal) {
  return {
    dose_time: withdrawal.doseTime,
    now_pct: withdrawal.nowPct,
    clear_label: withdrawal.clearLabel,
    product_message: withdrawal.productMessage,
  };
}

export function signatureBadge(treatment: Treatment): Badge {
  if (treatment.signed) return { text: "Vet Signed", variant: "vet_signed" };
  if (treatment.emergency) return { text: "Emergency / Unsigned", variant: "emergency_unsigned" };
  return { text: "Pending Vet Signature", variant: "pending_vet_signature" };
}

// ─── Medicine stock ──────────────────────────────────────────────────────────

const STOCK_STATUS: Record<StockLevel, { text: string; variant: string }> = {
  restock: { text: "Restock recommended", variant: "red" },
  monitor: { text: "Monitor", variant: "amber" },
  good: { text: "Good", variant: "green" },
};

export function stockStatus(level: StockLevel) {
  return { ...STOCK_STATUS[level] };
}

export function stockQuantityLabel(medicine: MedicineStock): string {
  return `${medicine.quantity} ${medicine.unit}`;
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export function prescriptionStatusBadge(prescription: Prescription): Badge {
  switch (prescription.status) {
    case "sign_required":
      return { text: "SIGN-REQ", variant: "sign" };
    case "unsigned_emergency":
      return { text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true };
    case "signed":
      return { text: "SIGNED", variant: "signed", dot: true };
    case "countersigned":
      return { text: "COUNTERSIGNED", variant: "countersigned", dot: true };
    case "voided":
      return { text: "VOIDED", variant: "voided" };
  }
}

export function awareBadge(aware: AwareClass): Badge {
  return { text: aware, variant: aware.toLowerCase() };
}

export const CIA_BADGE: Badge = { text: "CIA", variant: "cia" };

/** Registry view: AWaRe class and CIA sit together in `aware_badges`. */
export function prescriptionAwareBadges(prescription: Prescription): Badge[] {
  const badges: Badge[] = [];
  if (prescription.aware) badges.push(awareBadge(prescription.aware));
  if (prescription.cia) badges.push({ ...CIA_BADGE });
  return badges;
}

/**
 * Dashboard view: the widget shows one trailing badge, so a CIA drug pushes its
 * AWaRe class up into the status badges and keeps CIA as the trailing one.
 */
export function prescriptionDashboardBadges(prescription: Prescription) {
  const status: Badge[] = [prescriptionStatusBadge(prescription)];
  let trailing: Badge | null = null;

  if (prescription.cia) {
    if (prescription.aware) status.push(awareBadge(prescription.aware));
    trailing = { ...CIA_BADGE };
  } else if (prescription.aware) {
    trailing = awareBadge(prescription.aware);
  }

  return { status_badges: status, aware_badge: trailing };
}

export function needsAction(prescription: Prescription): boolean {
  return prescription.status === "sign_required" || prescription.status === "unsigned_emergency";
}

export function prescriptionAction(prescription: Prescription): {
  action_text: string;
  action_target: "sign_flow" | "countersign_flow" | "read_only";
} {
  if (prescription.status === "sign_required") return { action_text: "Review", action_target: "sign_flow" };
  if (prescription.status === "unsigned_emergency") return { action_text: "Review", action_target: "countersign_flow" };
  return { action_text: "View", action_target: "read_only" };
}

/** The stewardship notice step only applies to Watch/Reserve or CIA drugs. */
export function requiresStewardshipNotice(prescription: Prescription): boolean {
  return prescription.cia || prescription.aware === "WATCH" || prescription.aware === "RESERVE";
}

// ─── Lab ─────────────────────────────────────────────────────────────────────

type StageView = {
  status: string;
  statusColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral";
  sampleStatus: string;
  sampleColor: "green" | "blue" | "red" | "amber" | "neutral";
  action: string;
  overallStatus: string;
  stageIndex: number;
};

const STAGE_VIEW: Record<LabStage, StageView> = {
  awaiting_receipt: { status: "AWAITING RECEIPT", statusColor: "neutral", sampleStatus: "Awaiting", sampleColor: "neutral", action: "Receive →", overallStatus: "AWAITING RECEIPT", stageIndex: 1 },
  received: { status: "READY FOR TESTING", statusColor: "amber", sampleStatus: "Received", sampleColor: "green", action: "View →", overallStatus: "READY FOR TESTING", stageIndex: 2 },
  testing: { status: "IN PROGRESS", statusColor: "sage", sampleStatus: "Testing", sampleColor: "blue", action: "Continue →", overallStatus: "TESTING IN PROGRESS", stageIndex: 2 },
  awaiting_verification: { status: "AWAITING VERIFICATION", statusColor: "amber", sampleStatus: "Complete", sampleColor: "green", action: "Review →", overallStatus: "AWAITING VERIFICATION", stageIndex: 3 },
  verified: { status: "COMPLETED", statusColor: "green", sampleStatus: "Complete", sampleColor: "green", action: "View Report →", overallStatus: "COMPLETED", stageIndex: 5 },
  on_hold: { status: "ON HOLD", statusColor: "red", sampleStatus: "On Hold", sampleColor: "red", action: "Review →", overallStatus: "ON HOLD", stageIndex: 3 },
};

export function stageView(stage: LabStage): StageView {
  return STAGE_VIEW[stage];
}

export function riskColor(risk: LabSample["risk"]): "amber" | "red" | "green" {
  if (risk === "HIGH") return "red";
  if (risk === "MODERATE") return "amber";
  return "green";
}

export function priorityColor(priority: LabSample["priority"]): "red" | "amber" | "neutral" {
  if (priority === "HIGH PRIORITY") return "red";
  if (priority === "MODERATE") return "amber";
  return "neutral";
}

/** Whichever of animal id / batch label identifies the lot. */
export function labSourceRef(sample: LabSample): string {
  return sample.animalId ?? sample.batchLabel ?? "";
}

export function labSourceSub(sample: LabSample): string {
  if (sample.animalId) {
    // Flocks are labelled "Flock:", individual animals "Animal:".
    const label = store.getAnimal(sample.animalId)?.isFlock ? "Flock" : "Animal";
    return `${label}: ${sample.animalId}`;
  }
  if (sample.batchLabel) return `Batch: ${sample.batchLabel}`;
  return "";
}

export function labTestingFinished(sample: LabSample): boolean {
  return sample.tests.every((t) => t.state === "done");
}

export function labTestingStarted(sample: LabSample): boolean {
  return sample.tests.some((t) => t.state !== "pending");
}

/**
 * Antimicrobial context for a lab lot. When the lot is linked to a farmer dispatch
 * the drug, date and withdrawal state come straight from that treatment, so the lab
 * never contradicts the farmer's withdrawal ribbon.
 */
export function labAntimicrobial(sample: LabSample): { context: string; status: string } {
  const dispatch = sample.farmerDispatchId ? store.getFarmerDispatch(sample.farmerDispatchId) : undefined;
  const treatment = dispatch?.treatmentId ? store.getTreatment(dispatch.treatmentId) : undefined;

  if (treatment) {
    const context = `${treatment.drug} · Last administered ${treatment.administeredOn}`;
    const status =
      treatment.phase === "withdrawal"
        ? "⚠ Withdrawal still active at dispatch. Residue testing required."
        : "✓ Withdrawal completed before dispatch. Residue testing still required.";
    return { context, status };
  }

  return {
    context: sample.antimicrobialContext ?? "No antimicrobial exposure recorded.",
    status: sample.antimicrobialStatus ?? "✓ No withdrawal period applies to this lot.",
  };
}

/** Withdrawal row of the lab assessment checklist. */
export function labWithdrawalCheck(sample: LabSample): { status: string; color: string } {
  const dispatch = sample.farmerDispatchId ? store.getFarmerDispatch(sample.farmerDispatchId) : undefined;
  const treatment = dispatch?.treatmentId ? store.getTreatment(dispatch.treatmentId) : undefined;

  if (treatment && treatment.phase === "withdrawal") return { status: "Active", color: "amber" };
  if (sample.stage === "on_hold") return { status: "Review Required", color: "red" };
  return { status: "Passed", color: "green" };
}
