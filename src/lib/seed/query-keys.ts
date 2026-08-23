/**
 * Query keys used by the pages, in one place.
 *
 * Stage 1 only reads; stage 2+ mutations invalidate through these so a write on one
 * page refreshes every other page that shows the same rows. These match the keys the
 * pages already pass to `useQuery` — a few differ from the draft list in
 * `docs/plan.md` (noted inline), and the app's spelling is the canonical one.
 */

export const queryKeys = {
  // Farmer
  farmerDashboard: () => ["farmer-dashboard"] as const,
  farmDetail: () => ["farm-detail"] as const,
  /** The dispatch page fetches the farm under its own key. */
  farmDetailDispatch: () => ["farm-detail-dispatch"] as const,
  animalDetail: (animalId: string) => ["animal-detail", animalId] as const,
  treatments: () => ["treatments"] as const,
  treatmentDetail: (treatmentId: string) => ["treatment-detail", treatmentId] as const,
  /** Prescription options for the record-treatment modal (plan called this "prescription-options"). */
  prescriptionOptions: () => ["prescriptions"] as const,
  dispatches: () => ["dispatches"] as const,
  dispatchDetail: (dispatchId: string) => ["dispatch-detail", dispatchId] as const,
  dispatchSafety: (product: string, animalIds: string[]) => ["dispatch-safety", product, animalIds] as const,
  farmInsights: (range: string) => ["farm-insights", range] as const,
  availableVets: () => ["available-vets"] as const,

  // Vet
  vetDashboard: () => ["vet-dashboard"] as const,
  vetPrescriptions: () => ["vet-prescriptions"] as const,
  /** Case-detail modal (plan called this "vet-case"). */
  caseDetail: (caseId: string) => ["case-detail", caseId] as const,
  signFlow: (rxId: string) => ["sign-flow", rxId] as const,
  vetPatients: () => ["vet-patients"] as const,

  // Lab
  labDashboard: () => ["lab-dashboard"] as const,
  labDispatches: () => ["lab-dispatches"] as const,
  /** Lab dispatch detail (plan called this "lab-dispatch"). */
  labDispatchDetail: (dispatchId: string) => ["lab-dispatch-detail", dispatchId] as const,
  /** Testing queue (plan called this "lab-queue"). */
  labTestingQueue: () => ["lab-testing-queue"] as const,
  labWorkspace: (sampleId: string) => ["lab-workspace", sampleId] as const,
  labResults: () => ["lab-results"] as const,
  labReports: () => ["lab-reports"] as const,
} as const;

/** Every key that shows farmer-owned rows — used by stage 2 invalidation. */
export const FARMER_QUERY_KEYS = [
  queryKeys.farmerDashboard(),
  queryKeys.farmDetail(),
  queryKeys.farmDetailDispatch(),
  queryKeys.treatments(),
  queryKeys.dispatches(),
  queryKeys.prescriptionOptions(),
] as const;

export const VET_QUERY_KEYS = [
  queryKeys.vetDashboard(),
  queryKeys.vetPrescriptions(),
  queryKeys.vetPatients(),
] as const;

export const LAB_QUERY_KEYS = [
  queryKeys.labDashboard(),
  queryKeys.labDispatches(),
  queryKeys.labTestingQueue(),
  queryKeys.labResults(),
  queryKeys.labReports(),
] as const;
