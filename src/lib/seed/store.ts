/**
 * Module-level canonical store.
 *
 * Every dummy GET in `src/lib/api/dummy/*.ts` reads through here, so one edit to a
 * row shows up on every page that renders it. Stage 1 is read-only: mutations land
 * in stages 2–5 (see `docs/plan.md`).
 */

import { INITIAL_STATE } from "./canonical";
import type {
  Animal,
  Farm,
  FarmerDispatch,
  HealthEvent,
  LabSample,
  Prescription,
  SeedState,
  Treatment,
  Vet,
} from "./types";

let state: SeedState = structuredClone(INITIAL_STATE);

/** Live state. Callers must not mutate it directly — stage 2+ adds mutations here. */
export function getState(): SeedState {
  return state;
}

/** Restores the seed. Used by tests and by a hard reload of the demo. */
export function resetStore(): void {
  state = structuredClone(INITIAL_STATE);
}

// ─── Farms ───────────────────────────────────────────────────────────────────

const getFarms = (): Farm[] => state.farms;

const getFarm = (farmId: string): Farm | undefined => state.farms.find((f) => f.id === farmId);

/** Resolves a farm by canonical name or by any legacy spelling. */
const getFarmByName = (name: string): Farm | undefined =>
  state.farms.find((f) => f.name === name || f.aliases.includes(name));

const farmName = (farmId: string | null): string => (farmId ? getFarm(farmId)?.name ?? "" : "");

/** The dairy shown on the farmer's My Farm page. */
const getFarmerFarm = (): Farm => state.farms.find((f) => f.operatedByFarmer && f.kind === "dairy")!;

/** Every farm the logged-in farmer operates (the dairy plus the poultry unit). */
const getFarmerFarmIds = (): string[] => state.farms.filter((f) => f.operatedByFarmer).map((f) => f.id);

// ─── Animals ─────────────────────────────────────────────────────────────────

const getAnimals = (): Animal[] => state.animals;

const getAnimal = (animalId: string): Animal | undefined => state.animals.find((a) => a.id === animalId);

const getAnimalsByFarm = (farmId: string): Animal[] => state.animals.filter((a) => a.farmId === farmId);

/** The animals listed individually on My Farm. */
const getFarmerRoster = (): Animal[] =>
  state.animals.filter((a) => a.onFarmerRoster && a.farmId === getFarmerFarm().id);

/** Animals the vet is actively following up. */
const getVetPatients = (): Animal[] => state.animals.filter((a) => a.careStatus !== null);

// ─── Health events ───────────────────────────────────────────────────────────

const getHealthEvents = (): HealthEvent[] => state.healthEvents;

const getHealthEventForAnimal = (animalId: string): HealthEvent | undefined =>
  state.healthEvents.find((e) => e.animalId === animalId);

// ─── Treatments ──────────────────────────────────────────────────────────────

const getTreatments = (): Treatment[] => state.treatments;

const getTreatment = (treatmentId: string): Treatment | undefined =>
  state.treatments.find((t) => t.id === treatmentId);

const getTreatmentsByAnimal = (animalId: string): Treatment[] =>
  state.treatments.filter((t) => t.animalId === animalId);

/** Treatments across every farm the farmer operates. */
const getFarmerTreatments = (): Treatment[] => {
  const farmIds = getFarmerFarmIds();
  return state.treatments.filter((t) => farmIds.includes(t.farmId));
};

/** The course still running on an animal, if any. */
const getOpenTreatment = (animalId: string): Treatment | undefined =>
  getTreatmentsByAnimal(animalId).find((t) => t.phase !== "completed");

// ─── Prescriptions ───────────────────────────────────────────────────────────

const getPrescriptions = (): Prescription[] => state.prescriptions;

const getPrescription = (rxId: string): Prescription | undefined =>
  state.prescriptions.find((p) => p.id === rxId);

const getPrescriptionOptions = () => state.prescriptionOptions;

/**
 * Resolves whatever id a page happens to hold — an `Rx-###`, an id with a UI
 * suffix, an animal id (the alerts widget passes `animal_flock`) or a bare number.
 * Falls back to the oldest prescription still needing action so the sign flow always
 * renders something.
 */
const resolvePrescription = (ref: string): Prescription => {
  const exact = getPrescription(ref);
  if (exact) return exact;

  const trimmed = ref.replace(/^(Rx-\d+).*$/i, "$1");
  const bySuffix = state.prescriptions.find((p) => p.id.toLowerCase() === trimmed.toLowerCase());
  if (bySuffix) return bySuffix;

  const byAnimal = state.prescriptions.find(
    (p) => p.animalId.toLowerCase() === ref.toLowerCase() && p.status !== "signed" && p.status !== "voided",
  );
  if (byAnimal) return byAnimal;

  const digits = ref.match(/\d{3}/)?.[0];
  const byNumber = digits ? state.prescriptions.find((p) => p.id.endsWith(digits)) : undefined;
  if (byNumber) return byNumber;

  return (
    state.prescriptions.find((p) => p.status === "sign_required") ??
    state.prescriptions[0]
  );
};

/** Prescriptions the vet still has to act on, newest first. */
const getActionablePrescriptions = (): Prescription[] =>
  state.prescriptions.filter((p) => p.status === "sign_required" || p.status === "unsigned_emergency");

// ─── Dispatches ──────────────────────────────────────────────────────────────

const getFarmerDispatches = (): FarmerDispatch[] => {
  const farmIds = getFarmerFarmIds();
  return state.farmerDispatches.filter((d) => farmIds.includes(d.farmId));
};

const getFarmerDispatch = (dispatchId: string): FarmerDispatch | undefined =>
  state.farmerDispatches.find((d) => d.id === dispatchId);

const getDispatchesForAnimal = (animalId: string): FarmerDispatch[] =>
  state.farmerDispatches.filter((d) => d.animalId === animalId);

// ─── Medicine stock ──────────────────────────────────────────────────────────

const getMedicineStock = () => state.medicineStock;

// ─── Vets ────────────────────────────────────────────────────────────────────

const getVets = (): Vet[] => state.vets;

const getCurrentVet = (): Vet => state.vets.find((v) => v.isCurrentUser) ?? state.vets[0];

// ─── Lab ─────────────────────────────────────────────────────────────────────

const getLabSamples = (): LabSample[] => state.labSamples;

/** Accepts either the lab dispatch id or the physical sample id. */
const getLabSample = (id: string): LabSample | undefined =>
  state.labSamples.find((s) => s.dispatchId === id || s.sampleId === id);

/** Lots that have been received — everything the dispatches table lists. */
const getReceivedLabSamples = (): LabSample[] =>
  state.labSamples.filter((s) => s.stage !== "awaiting_receipt");

const getAwaitingLabSamples = (): LabSample[] =>
  state.labSamples.filter((s) => s.stage === "awaiting_receipt");

/** The lab lot sampled from a farmer dispatch, when the two are linked. */
const getLabSampleForFarmerDispatch = (dispatchId: string): LabSample | undefined =>
  state.labSamples.find((s) => s.farmerDispatchId === dispatchId);

const getLabSamplesForAnimal = (animalId: string): LabSample[] =>
  state.labSamples.filter((s) => s.animalId === animalId);

export const store = {
  getState,
  reset: resetStore,

  getFarms,
  getFarm,
  getFarmByName,
  farmName,
  getFarmerFarm,
  getFarmerFarmIds,

  getAnimals,
  getAnimal,
  getAnimalsByFarm,
  getFarmerRoster,
  getVetPatients,

  getHealthEvents,
  getHealthEventForAnimal,

  getTreatments,
  getTreatment,
  getTreatmentsByAnimal,
  getFarmerTreatments,
  getOpenTreatment,

  getPrescriptions,
  getPrescription,
  getPrescriptionOptions,
  resolvePrescription,
  getActionablePrescriptions,

  getFarmerDispatches,
  getFarmerDispatch,
  getDispatchesForAnimal,

  getMedicineStock,

  getVets,
  getCurrentVet,

  getLabSamples,
  getLabSample,
  getReceivedLabSamples,
  getAwaitingLabSamples,
  getLabSampleForFarmerDispatch,
  getLabSamplesForAnimal,
};
