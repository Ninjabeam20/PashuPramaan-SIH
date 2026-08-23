/**
 * Canonical entity types for the PashuPramaan dummy dataset.
 *
 * These are richer than the DTOs returned by `src/lib/api/dummy/*.ts`.
 * Adapters slice / rename / compute; they never change DTO keys or nesting.
 * See `docs/plan.md` (Stage 1) for the audit these types came from.
 */

// ─── Shared ──────────────────────────────────────────────────────────────────

export type Species = "Cow" | "Buffalo" | "Goat" | "Poultry";
export type FarmKind = "dairy" | "poultry" | "livestock";
export type Product = "Milk" | "Meat" | "Eggs";

/** Vet-side follow-up status for an animal (drives the patients registry). */
export type CareStatus = "under_treatment" | "improved" | "recovered" | "no_change" | "healthy";

// ─── Farms & animals ─────────────────────────────────────────────────────────

export interface Farm {
  id: string;
  /** Canonical display name. Every screen renders this string. */
  name: string;
  kind: FarmKind;
  region: string;
  /** Other spellings that appeared in the pre-seed dummy files. */
  aliases: string[];
  /** True when the logged-in farmer (Ankita) operates this farm. */
  operatedByFarmer: boolean;
  /** Head count of the whole herd — the roster below is only the listed sample. */
  herd: { cows: number; buffaloes: number; goats: number };
}

export interface Animal {
  id: string;
  farmId: string;
  species: Species;
  /** Poultry flocks are addressed as one unit ("Flock P-01"). */
  isFlock: boolean;
  breed: string;
  sex: string;
  dateOfBirth: string;
  productionType: string;
  registeredOn: string;
  /** True when the animal shows in the farmer's My Farm roster table. */
  onFarmerRoster: boolean;
  /** Vet-side follow-up state; `null` when the vet has no case for this animal. */
  careStatus: CareStatus | null;
  lastFollowUp: string | null;
  followUpDue: boolean;
}

// ─── Health events ───────────────────────────────────────────────────────────

export interface HealthEvent {
  id: string;
  animalId: string;
  name: string;
  onset: string;
}

// ─── Prescriptions ───────────────────────────────────────────────────────────

export type PrescriptionStatus =
  | "sign_required"
  | "unsigned_emergency"
  | "signed"
  | "countersigned"
  | "voided";

export type AwareClass = "ACCESS" | "WATCH" | "RESERVE";

export interface Prescription {
  /** Canonical id, always `Rx-###`. */
  id: string;
  farmId: string;
  animalId: string;
  diagnosis: string;
  status: PrescriptionStatus;
  /** WHO AWaRe classification of the drug, or null when not classified on screen. */
  aware: AwareClass | null;
  cia: boolean;
  drug: string;
  route: string;
  dose: string;
  frequency: string;
  duration: string;
  reason: string;
  /** Short label used in list/date columns ("10:42", "Yesterday", "15 Aug"). */
  dateLabel: string;
  /** Stewardship guidance shown on the sign-flow notice step. */
  stewardshipGuidance: string[];
  /** Earlier course for the same episode, shown as clinical context. */
  previousTreatment: { drug: string; duration: string; outcome: string } | null;
  /** Earlier resolved episode, shown in the case-detail modal. */
  treatmentHistory: { episode: string; outcome: string; completedDate: string } | null;
  signature: { signedBy: string; dateTime: string; reference: string } | null;
}

/**
 * A drug the farmer can record a treatment against.
 * `prescriptionId` points at a canonical `Rx-###` row, or null when the dose is
 * given without a signed prescription.
 */
export interface PrescriptionOptionSeed {
  id: string;
  drugName: string;
  dosage: string;
  route: string;
  prescriptionId: string | null;
  isEmergencyException: boolean;
}

// ─── Treatments ──────────────────────────────────────────────────────────────

export type TreatmentPhase = "active" | "withdrawal" | "completed";
export type LabAssay = "within_mrl" | "unavailable" | null;

export interface Withdrawal {
  doseTime: string;
  nowPct: number;
  clearLabel: string;
  productMessage: string;
  /** Absolute clearance label reused by dispatch detail. */
  clearsAt: string;
}

export interface Treatment {
  id: string;
  animalId: string;
  farmId: string;
  prescriptionId: string | null;
  drug: string;
  route: string;
  dosage: string;
  /** Display label for the list ("Administered Today, 08:15 AM"). */
  administeredLabel: string;
  /** Absolute date reused by the lab antimicrobial context. */
  administeredOn: string;
  phase: TreatmentPhase;
  signed: boolean;
  emergency: boolean;
  labAssay: LabAssay;
  feedBatch: string | null;
  reason: string;
  withdrawal: Withdrawal | null;
}

// ─── Farmer dispatches ───────────────────────────────────────────────────────

export type DispatchStatus = "cleared" | "withdrawal" | "blocked";

export interface FarmerDispatch {
  id: string;
  farmId: string;
  product: Product;
  animalId: string;
  dateLabel: string;
  status: DispatchStatus;
  treatmentId: string | null;
  /** Lab dispatch id this lot was sampled into, when the lab holds it. */
  labDispatchId: string | null;
  blocked: {
    mrlMeasuredPpm: string;
    mrlPermittedPpm: string;
    prescriptionSigned: boolean;
  } | null;
}

// ─── Medicine stock ──────────────────────────────────────────────────────────

export type StockLevel = "restock" | "monitor" | "good";

export interface MedicineStock {
  name: string;
  quantity: number;
  unit: string;
  recentUsage: number;
  level: StockLevel;
  /** Rank + usage units for the "most used medicines" list; null when untracked. */
  usageTotal: number | null;
}

// ─── Vets ────────────────────────────────────────────────────────────────────

export interface Vet {
  id: string;
  name: string;
  designation: string;
  pin: string;
  /** True for the vet whose desk `/vet/*` renders. */
  isCurrentUser: boolean;
}

// ─── Lab ─────────────────────────────────────────────────────────────────────

export type LabStage =
  | "awaiting_receipt"
  | "received"
  | "testing"
  | "awaiting_verification"
  | "verified"
  | "on_hold";

export type LabTestState = "done" | "active" | "pending";

export interface LabTest {
  name: string;
  checks: string[];
  state: LabTestState;
  /** Result label once the test is done ("COMPLIANT", "WITHIN LIMIT", …). */
  result: string | null;
  ok: boolean;
  /** Why the test was scheduled, shown as a badge on the dispatch detail. */
  trigger: string | null;
}

export interface LabReportContent {
  refNo: string;
  verifiedBy: string;
  verifiedOn: string;
  status: string;
  statusColor: "green" | "red" | "amber" | "neutral";
  assessments: Array<{ label: string; result: string; ok: boolean; detail: string }>;
  mrl: {
    drug: string;
    measured: number;
    limit: number;
    unit: string;
    ratio: number;
    verdict: string;
    verdictOk: boolean;
  };
  withdrawal: { drug: string; administered: string; completed: string; status: string };
  outcome: string;
  outcomeOk: boolean;
}

export interface LabSample {
  /** Lab dispatch id, e.g. `MLK-2026-00124`. */
  dispatchId: string;
  /** Physical sample id, e.g. `LAB-MLK-00981`. */
  sampleId: string;
  product: Product;
  productSub: string;
  /** Long product label used by detail/results ("Raw Milk"). */
  productLabel: string;
  /** Farm this lot came from; null for sources with no farm entity. */
  farmId: string | null;
  sourceName: string;
  animalId: string | null;
  /** Batch / flock reference when the lot is not a single animal. */
  batchLabel: string | null;
  /** Farmer-side dispatch this lot was sampled from, when linked. */
  farmerDispatchId: string | null;
  stage: LabStage;
  risk: "LOW" | "MODERATE" | "HIGH";
  riskReason: string;
  priority: "HIGH PRIORITY" | "MODERATE" | "ROUTINE";
  arrival: string;
  receiptReason: string;
  dateLabel: string;
  date: string;
  time: string;
  /** Date printed on the results / reports rows once testing finished. */
  resultDate: string | null;
  quantity: string;
  receipt: {
    condition: string;
    temperature: string;
    container: string;
    receivedBy: string;
    receivedAt: string;
  };
  tests: LabTest[];
  /** Overridden antimicrobial context when no farmer treatment is linked. */
  antimicrobialContext: string | null;
  antimicrobialStatus: string | null;
  activity: Array<{ time: string; title: string; desc: string; icon: "active" | "done" | "neutral" }>;
  /** Row shown on the lab dashboard "needs attention" list, when this lot needs action. */
  attention: {
    desc: string;
    status: string;
    statusColor: "amber" | "red" | "green";
    action: string;
    page: string;
  } | null;
  report: LabReportContent | null;
}

// ─── Feeds kept verbatim (display-only rows, no entity of their own) ─────────

export interface ActivityRow {
  icon: string;
  title: string;
  subject: string;
  timeLabel: string;
}

export interface VetActivityRow {
  time: string;
  title: string;
  description: string;
}

export interface VetOutcomeRow {
  animalFlock: string;
  diagnosis: string;
  detail: string;
  outcome: { text: string; variant: string };
}

export interface VetInsightRow {
  id: string;
  type: string;
  caseTitle: string;
  similarCaseCount: number;
  recoveryPct: number;
  recoveryLabel: string;
  disclaimer: string;
}

export interface LabActivityRow {
  text: string;
  time: string;
  icon: "check" | "inbox" | "hold" | "dispatch";
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminRegionRow {
  id: string;
  state: string;
  zone: string;
  amu: number;
  change: number;
  anomalies: number;
  unexplained: number;
}

export interface AdminDistrictRow {
  district: string;
  amu: number;
  change: number;
  anomalies: number;
  unexplained: number;
}

export interface AdminAnomalyRow {
  id: string;
  farm: string;
  /** Canonical farm id when this national row is one of our seeded farms. */
  farmId?: string | null;
  region: string;
  medicine: string;
  amuChange: number;
  baseline: number;
  healthEvent: string | null;
  status: "UNEXPLAINED" | "EXPLAINED";
  severity: "HIGH" | "MEDIUM" | "LOW";
  species: string;
  date: string;
  history: number[];
}

export interface AdminHealthRow {
  event: string;
  species: string;
  amuChange: number;
  farmsAffected: number;
  classification: "Explained" | "Unexplained" | "Mixed";
}

// ─── Charts / series kept as authored data ───────────────────────────────────

export interface InsightsSeries {
  forecast: Record<"30d" | "60d" | "90d", Array<{ month: string; past_usage: number | null; forecast: number | null }>>;
  nowIndex: number;
  expectedRequirement: string;
  performance: Array<{ month: string; milk_output: number; medicine_cost: number }>;
  healthTrends: Array<{ month: string; health_events: number; treatments: number }>;
}

// ─── Root state ──────────────────────────────────────────────────────────────

export interface SeedState {
  farms: Farm[];
  animals: Animal[];
  healthEvents: HealthEvent[];
  prescriptions: Prescription[];
  prescriptionOptions: PrescriptionOptionSeed[];
  treatments: Treatment[];
  farmerDispatches: FarmerDispatch[];
  medicineStock: MedicineStock[];
  vets: Vet[];
  labSamples: LabSample[];
  farmActivity: ActivityRow[];
  vetActivity: VetActivityRow[];
  vetOutcomes: VetOutcomeRow[];
  vetInsights: VetInsightRow[];
  vetWorkload: { followUp: number };
  labActivity: LabActivityRow[];
  labCounters: { awaitingReceipt: number; testsInProgress: number; dispatchesInProgress: number; awaitingVerification: number; onHold: number };
  labReportTotals: Array<{ v: string; l: string; color: "neutral" | "green" | "red" | "amber" }>;
  insightsSeries: InsightsSeries;
  adminRegions: AdminRegionRow[];
  adminDistricts: Record<string, AdminDistrictRow[]>;
  adminAnomalies: AdminAnomalyRow[];
  adminHealth: AdminHealthRow[];
  adminMonthlyAmu: number[];
  adminMonthlyLabels: string[];
  adminHealthEventMarkers: Array<{ month: number; label: string; color: string }>;
}
