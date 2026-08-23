/**
 * Canonical dummy data — the single source of truth for every role.
 *
 * Rows were copied from the pre-seed literals in `src/lib/api/dummy/*.ts` and
 * `src/components/admin/AdminShared.tsx`, then patched per the conflict
 * resolutions in `docs/plan.md`. Every patch carries a `// CONFLICT:` note
 * saying what disagreed and what we kept.
 */

import { FARM_IDS } from "./ids";
import type {
  ActivityRow,
  AdminAnomalyRow,
  AdminDistrictRow,
  AdminHealthRow,
  AdminRegionRow,
  Animal,
  Farm,
  FarmerDispatch,
  HealthEvent,
  InsightsSeries,
  LabActivityRow,
  LabSample,
  MedicineStock,
  Prescription,
  PrescriptionOptionSeed,
  SeedState,
  Treatment,
  Vet,
  VetActivityRow,
  VetInsightRow,
  VetOutcomeRow,
} from "./types";

// ─── Farms ───────────────────────────────────────────────────────────────────

export const FARMS: Farm[] = [
  {
    // CONFLICT: vet files (prescriptions, dashboard, case detail, patients) called this
    // farm "Krishna Dairy" and lab files spelled it "Shree Krishna Dairy". Kept the
    // farmer-side name "Shree Krishna Dairy" (plan resolution 1); "Krishna Dairy" is an alias.
    id: FARM_IDS.shreeKrishnaDairy,
    name: "Shree Krishna Dairy",
    kind: "dairy",
    region: "Haryana",
    aliases: ["Krishna Dairy"],
    operatedByFarmer: true,
    herd: { cows: 10, buffaloes: 20, goats: 18 },
  },
  {
    id: FARM_IDS.shantiDairy,
    name: "Shanti Dairy",
    kind: "dairy",
    region: "Haryana",
    aliases: [],
    operatedByFarmer: false,
    // Herd size never appears on screen for the vet-side farms.
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
  {
    // CONFLICT: kept the "Meena Poultry" spelling used by prescriptions/patients
    // (plan resolution 2). This farm stays a separate farm_id from the dairy even
    // though the farmer records treatments and dispatches against its flocks —
    // the logged-in farmer operates both the dairy and the poultry unit.
    id: FARM_IDS.meenaPoultry,
    name: "Meena Poultry",
    kind: "poultry",
    region: "Punjab",
    aliases: [],
    operatedByFarmer: true,
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
  {
    id: FARM_IDS.greenValleyLivestock,
    name: "Green Valley Livestock",
    kind: "livestock",
    region: "Maharashtra",
    aliases: [],
    operatedByFarmer: false,
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
  {
    id: FARM_IDS.sunrisePoultry,
    name: "Sunrise Poultry",
    kind: "poultry",
    region: "West Bengal",
    aliases: [],
    operatedByFarmer: false,
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
  {
    id: FARM_IDS.mahalaxmiDairy,
    name: "Mahalaxmi Dairy",
    kind: "dairy",
    region: "Gujarat",
    aliases: [],
    operatedByFarmer: false,
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
  {
    id: FARM_IDS.rajFarms,
    name: "Raj Farms",
    kind: "livestock",
    region: "Rajasthan",
    aliases: [],
    operatedByFarmer: false,
    herd: { cows: 0, buffaloes: 0, goats: 0 },
  },
];

// ─── Animals ─────────────────────────────────────────────────────────────────
//
// The dairy carries 48 head; only the eight `onFarmerRoster` animals are listed
// individually on My Farm today. MP-112 / MP-118 / MP-088 belong to the same
// dairy (the vet called it "Krishna Dairy") but are not part of that listed sample.

export const ANIMALS: Animal[] = [
  {
    // CONFLICT: farm-detail said Cow, animal-detail + treatment trt-1 said Buffalo (Gir).
    // Kept Buffalo (plan resolution 3).
    // CONFLICT: vet prescriptions/patients placed MP-104 at "Shanti Dairy".
    // Kept Shree Krishna Dairy — the farmer's own animal (plan resolution 3).
    id: "MP-104",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Gir",
    sex: "Female",
    dateOfBirth: "12 Mar 2021",
    productionType: "Dairy",
    registeredOn: "01 Jan 2022",
    onFarmerRoster: true,
    careStatus: "under_treatment",
    lastFollowUp: "22 Aug",
    followUpDue: false,
  },
  {
    // CONFLICT: the vet dashboard carried an "unsigned emergency" alert for MP-105
    // (Amoxicillin, Shanti Dairy). MP-105 is a healthy Shree Krishna cow and no
    // prescription backs that alert, so the alert is gone — alerts now derive from
    // prescriptions whose status is actually `unsigned_emergency`.
    id: "MP-105",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Cow",
    isFlock: false,
    breed: "Sahiwal",
    sex: "Female",
    dateOfBirth: "04 Feb 2020",
    productionType: "Dairy",
    registeredOn: "12 Mar 2021",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    // CONFLICT: treatment trt-3 said Goat and farm-detail said Buffalo/healthy.
    // Kept Buffalo (plan resolution 6); status now derives from trt-3 (active, signed).
    id: "MP-106",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Murrah",
    sex: "Female",
    dateOfBirth: "22 Jul 2019",
    productionType: "Dairy",
    registeredOn: "10 Aug 2020",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "MP-107",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Murrah",
    sex: "Female",
    dateOfBirth: "18 Nov 2020",
    productionType: "Dairy",
    registeredOn: "02 Jan 2021",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    // CONFLICT: treatment trt-5 said Cow; farm-detail said Goat. Kept Goat
    // (plan resolution 7) — a dairy goat, so its milk dispatch DSP-023 still makes sense.
    id: "MP-108",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Goat",
    isFlock: false,
    breed: "Jamunapari",
    sex: "Female",
    dateOfBirth: "09 Jan 2022",
    productionType: "Dairy",
    registeredOn: "20 Feb 2022",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    // Status "waiting" now derives from trt-4 being administered but unsigned.
    id: "MP-109",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Murrah",
    sex: "Female",
    dateOfBirth: "30 May 2021",
    productionType: "Dairy",
    registeredOn: "21 Aug 2026",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "MP-110",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Cow",
    isFlock: false,
    breed: "Gir",
    sex: "Female",
    dateOfBirth: "15 Sep 2019",
    productionType: "Dairy",
    registeredOn: "01 Nov 2020",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "MP-111",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Goat",
    isFlock: false,
    breed: "Beetal",
    sex: "Female",
    dateOfBirth: "27 Apr 2022",
    productionType: "Dairy",
    registeredOn: "05 Jun 2022",
    onFarmerRoster: true,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    // CONFLICT: vet patients listed MP-112 at "Krishna Dairy" — the same dairy as
    // the farmer's. Not part of the farmer's listed roster sample.
    id: "MP-112",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Murrah",
    sex: "Female",
    dateOfBirth: "11 Jun 2019",
    productionType: "Dairy",
    registeredOn: "19 Jul 2020",
    onFarmerRoster: false,
    careStatus: "improved",
    lastFollowUp: "17 Aug",
    followUpDue: false,
  },
  {
    // CONFLICT: vet case-detail said Buffalo; patients + prescriptions said Cow.
    // Kept Cow (plan resolution 8). The plan also flagged an "MP-118 vs MP-118"
    // id typo; the current files no longer differ, so `MP-118` is the only id.
    id: "MP-118",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Cow",
    isFlock: false,
    breed: "Gir",
    sex: "Female",
    dateOfBirth: "03 Mar 2020",
    productionType: "Dairy",
    registeredOn: "14 Apr 2021",
    onFarmerRoster: false,
    careStatus: "improved",
    lastFollowUp: "20 Aug",
    followUpDue: false,
  },
  {
    id: "MP-088",
    farmId: FARM_IDS.shreeKrishnaDairy,
    species: "Buffalo",
    isFlock: false,
    breed: "Murrah",
    sex: "Female",
    dateOfBirth: "08 Dec 2018",
    productionType: "Dairy",
    registeredOn: "02 Feb 2020",
    onFarmerRoster: false,
    careStatus: "no_change",
    lastFollowUp: "14 Aug",
    followUpDue: false,
  },
  {
    // CONFLICT: MP-101 appears in vet prescriptions (Rx-201) and outcomes but never in
    // the patients registry, so it carries no follow-up status.
    id: "MP-101",
    farmId: FARM_IDS.shantiDairy,
    species: "Cow",
    isFlock: false,
    breed: "Sahiwal",
    sex: "Female",
    dateOfBirth: "17 Oct 2019",
    productionType: "Dairy",
    registeredOn: "23 Nov 2020",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "MP-097",
    farmId: FARM_IDS.shantiDairy,
    species: "Cow",
    isFlock: false,
    breed: "Sahiwal",
    sex: "Female",
    dateOfBirth: "25 Jan 2019",
    productionType: "Dairy",
    registeredOn: "30 Mar 2020",
    onFarmerRoster: false,
    careStatus: "recovered",
    lastFollowUp: "16 Aug",
    followUpDue: false,
  },
  {
    // CONFLICT: vet patients said "Recovered" while the same flock had an unsigned
    // emergency (Rx-207) open. Kept Under treatment (plan resolution 10).
    id: "Flock P-01",
    farmId: FARM_IDS.meenaPoultry,
    species: "Poultry",
    isFlock: true,
    breed: "Broiler",
    sex: "Mixed",
    dateOfBirth: "02 Jul 2026",
    productionType: "Broiler",
    registeredOn: "02 Jul 2026",
    onFarmerRoster: false,
    careStatus: "under_treatment",
    lastFollowUp: "21 Aug",
    followUpDue: true,
  },
  {
    id: "Flock P-02",
    farmId: FARM_IDS.meenaPoultry,
    species: "Poultry",
    isFlock: true,
    breed: "Broiler",
    sex: "Mixed",
    dateOfBirth: "18 Jun 2026",
    productionType: "Broiler",
    registeredOn: "18 Jun 2026",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    // CONFLICT: Flock-07 only ever appeared on the farmer's blocked meat dispatch
    // DSP-022 and on no roster. Seated at Meena Poultry, the farmer's poultry unit.
    // Plan resolution 20: it is NOT merged with the lab's Green Valley meat sample.
    id: "Flock-07",
    farmId: FARM_IDS.meenaPoultry,
    species: "Poultry",
    isFlock: true,
    breed: "Broiler",
    sex: "Mixed",
    dateOfBirth: "12 May 2026",
    productionType: "Broiler",
    registeredOn: "12 May 2026",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "MP-087",
    farmId: FARM_IDS.mahalaxmiDairy,
    species: "Cow",
    isFlock: false,
    breed: "Gir",
    sex: "Female",
    dateOfBirth: "06 Aug 2019",
    productionType: "Dairy",
    registeredOn: "16 Sep 2020",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "FLK-2026-042",
    farmId: FARM_IDS.sunrisePoultry,
    species: "Poultry",
    isFlock: true,
    breed: "Layer",
    sex: "Female",
    dateOfBirth: "20 Mar 2026",
    productionType: "Layer",
    registeredOn: "20 Mar 2026",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
  {
    id: "FLK-2026-051",
    farmId: FARM_IDS.sunrisePoultry,
    species: "Poultry",
    isFlock: true,
    breed: "Layer",
    sex: "Female",
    dateOfBirth: "11 Apr 2026",
    productionType: "Layer",
    registeredOn: "11 Apr 2026",
    onFarmerRoster: false,
    careStatus: null,
    lastFollowUp: null,
    followUpDue: false,
  },
];

// ─── Health events ───────────────────────────────────────────────────────────

export const HEALTH_EVENTS: HealthEvent[] = [
  { id: "he-1", animalId: "MP-104", name: "Clinical mastitis", onset: "Today" },
  { id: "he-2", animalId: "Flock P-01", name: "Gumboro (IBD)", onset: "Today" },
  { id: "he-3", animalId: "MP-118", name: "Clinical mastitis", onset: "18 Aug" },
];

// ─── Prescriptions ───────────────────────────────────────────────────────────

const CIA_GUIDANCE = [
  "CIA drugs require clinical justification for use.",
  "AWaRe Watch drugs should be reserved for specific cases where first-line options are insufficient.",
  "Your signature confirms this prescription is clinically justified.",
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    // CONFLICT: the vet dashboard said Rx-208 was Amoxicillin and the sign flow ignored
    // the rxId entirely (it always returned the Krishna / MP-118 / Enrofloxacin body).
    // Kept Oxytetracycline for the MP-104 mastitis case (plan resolution 11); the sign
    // flow now branches on rxId.
    // CONFLICT: the prescriptions list and dashboard placed Rx-208 at "Shanti Dairy".
    // Kept Shree Krishna Dairy, where MP-104 actually lives (plan resolution 3).
    id: "Rx-208",
    farmId: FARM_IDS.shreeKrishnaDairy,
    animalId: "MP-104",
    diagnosis: "Clinical mastitis",
    status: "sign_required",
    aware: "ACCESS",
    cia: false,
    drug: "Oxytetracycline",
    route: "Injection",
    dose: "10 mg/kg",
    frequency: "Once daily",
    duration: "5 days",
    reason: "Clinical mastitis — first-line therapy",
    dateLabel: "10:42",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: null,
  },
  {
    // CONFLICT: the prescriptions list said COUNTERSIGNED while the dashboard, the case
    // detail and the farmer's trt-2 all said unsigned emergency. Kept unsigned emergency
    // (plan resolution 9).
    // CONFLICT: case detail said "Drinking water · 3 days · Outbreak control"; the
    // countersign flow said "Oral · 5 days · Gumboro-associated secondary infection".
    // Kept drinking water + 5 days + the more specific reason.
    id: "Rx-207",
    farmId: FARM_IDS.meenaPoultry,
    animalId: "Flock P-01",
    diagnosis: "Gumboro (IBD)",
    status: "unsigned_emergency",
    aware: null,
    cia: false,
    drug: "Oxytetracycline",
    route: "Drinking water",
    dose: "20 mg/kg",
    frequency: "Once daily",
    duration: "5 days",
    reason: "Gumboro-associated secondary infection",
    dateLabel: "09:18",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: null,
  },
  {
    // CONFLICT: case detail said route "Intramammary"; the sign flow said "Intramuscular
    // · 5 mg/kg". Kept intramuscular, which matches the dose the sign flow shows.
    id: "Rx-205",
    farmId: FARM_IDS.shreeKrishnaDairy,
    animalId: "MP-118",
    diagnosis: "Clinical mastitis",
    status: "sign_required",
    aware: "WATCH",
    cia: true,
    drug: "Enrofloxacin",
    route: "Intramuscular",
    dose: "5 mg/kg",
    frequency: "Once daily",
    duration: "5 days",
    reason: "Non-responsive to first-line treatment",
    dateLabel: "Yesterday",
    stewardshipGuidance: CIA_GUIDANCE,
    previousTreatment: { drug: "Amoxicillin", duration: "3 days", outcome: "RECOVERED" },
    treatmentHistory: { episode: "Clinical mastitis", outcome: "RECOVERED", completedDate: "12 Aug" },
    signature: null,
  },
  {
    id: "Rx-201",
    farmId: FARM_IDS.shantiDairy,
    animalId: "MP-101",
    diagnosis: "Clinical mastitis",
    status: "signed",
    aware: "ACCESS",
    cia: false,
    drug: "Amoxicillin",
    route: "Injection",
    dose: "7 mg/kg",
    frequency: "Twice daily",
    duration: "3 days",
    reason: "Clinical mastitis",
    dateLabel: "Yesterday",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: { signedBy: "Dr. Bankey", dateTime: "22 Aug · 09:10 am", reference: "Signed · 4F2A91C7" },
  },
  {
    id: "Rx-198",
    farmId: FARM_IDS.shreeKrishnaDairy,
    animalId: "MP-112",
    diagnosis: "Mastitis",
    status: "signed",
    aware: "ACCESS",
    cia: false,
    drug: "Amoxicillin",
    route: "Injection",
    dose: "7 mg/kg",
    frequency: "Twice daily",
    duration: "3 days",
    reason: "Mastitis",
    dateLabel: "17 Aug",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: { signedBy: "Dr. Bankey", dateTime: "17 Aug · 11:20 am", reference: "Signed · 7C41B0DE" },
  },
  {
    // Rx-195 never appeared in the vet registry but the farmer's prescription options
    // already offered "Vet Rx #195" for Ivermectin. Seeded here so that id resolves to a
    // real row and backs the farmer's trt-5.
    id: "Rx-195",
    farmId: FARM_IDS.shreeKrishnaDairy,
    animalId: "MP-108",
    diagnosis: "Parasite control",
    status: "signed",
    aware: "ACCESS",
    cia: false,
    drug: "Ivermectin",
    route: "Pour-on",
    dose: "500 mcg/kg",
    frequency: "Single dose",
    duration: "1 day",
    reason: "Ectoparasite control",
    dateLabel: "18 Aug",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: { signedBy: "Dr. Bankey", dateTime: "18 Aug · 08:05 am", reference: "Signed · 22B9F5A1" },
  },
  {
    id: "Rx-194",
    farmId: FARM_IDS.meenaPoultry,
    animalId: "Flock P-02",
    diagnosis: "Colibacillosis",
    status: "signed",
    aware: "WATCH",
    cia: false,
    drug: "Enrofloxacin",
    route: "Drinking water",
    dose: "10 mg/kg",
    frequency: "Once daily",
    duration: "3 days",
    reason: "Colibacillosis outbreak",
    dateLabel: "15 Aug",
    stewardshipGuidance: CIA_GUIDANCE,
    previousTreatment: null,
    treatmentHistory: null,
    signature: { signedBy: "Dr. Bankey", dateTime: "15 Aug · 04:40 pm", reference: "Signed · 91D7E230" },
  },
  {
    id: "Rx-189",
    farmId: FARM_IDS.shantiDairy,
    animalId: "MP-097",
    diagnosis: "Foot rot",
    status: "signed",
    aware: "ACCESS",
    cia: false,
    drug: "Oxytetracycline",
    route: "Injection",
    dose: "10 mg/kg",
    frequency: "Once daily",
    duration: "4 days",
    reason: "Foot rot",
    dateLabel: "12 Aug",
    stewardshipGuidance: [],
    previousTreatment: null,
    treatmentHistory: null,
    signature: { signedBy: "Dr. Bankey", dateTime: "12 Aug · 10:15 am", reference: "Signed · 5A0C77EB" },
  },
  {
    id: "Rx-183",
    farmId: FARM_IDS.shreeKrishnaDairy,
    animalId: "MP-088",
    diagnosis: "Respiratory infection",
    status: "voided",
    aware: "RESERVE",
    cia: true,
    drug: "Colistin",
    route: "Injection",
    dose: "50,000 IU/kg",
    frequency: "Twice daily",
    duration: "3 days",
    reason: "Non-responsive respiratory infection",
    dateLabel: "10 Aug",
    stewardshipGuidance: CIA_GUIDANCE,
    previousTreatment: null,
    treatmentHistory: null,
    signature: null,
  },
];

/**
 * Drugs the farmer can pick from when recording a treatment.
 * `prescriptionId` points at the canonical `Rx-###`; the adapter still emits the
 * bare number ("208") because `RecordTreatmentModal` renders "Vet Rx #{rx_id}"
 * (plan resolution 12).
 */
export const PRESCRIPTION_OPTIONS: PrescriptionOptionSeed[] = [
  // CONFLICT: this option pointed at rx 201, but Rx-201 is Amoxicillin for MP-101 at
  // Shanti Dairy. The drug/dose match Rx-208 (Oxytetracycline 10 mg/kg injection), so
  // it points there now.
  { id: "opt-1", drugName: "Oxytetracycline", dosage: "10 mg/kg", route: "Injection", prescriptionId: "Rx-208", isEmergencyException: false },
  { id: "opt-2", drugName: "Amoxicillin", dosage: "7 mg/kg", route: "Injection", prescriptionId: "Rx-198", isEmergencyException: false },
  { id: "opt-3", drugName: "Ivermectin", dosage: "500 mcg/kg", route: "Pour-on", prescriptionId: "Rx-195", isEmergencyException: false },
  { id: "opt-4", drugName: "Vitamin B12", dosage: "5 mL", route: "Injection", prescriptionId: null, isEmergencyException: false },
  // CONFLICT: this option pointed at rx 189 (a Shanti Dairy foot-rot Rx). The medicated
  // oxytetracycline course the farmer actually runs is Rx-207 on Flock P-01, which is
  // still an unsigned emergency — so the adapter emits `rx_id: null` (pending signature).
  { id: "opt-5", drugName: "Oxytetracycline", dosage: "Medicated Feed", route: "", prescriptionId: "Rx-207", isEmergencyException: false },
  { id: "opt-6", drugName: "No signed Rx — Emergency Log", dosage: "", route: "", prescriptionId: null, isEmergencyException: true },
];

// ─── Treatments ──────────────────────────────────────────────────────────────

export const TREATMENTS: Treatment[] = [
  {
    // CONFLICT: trt-1 is Oxytetracycline on MP-104 and so is Rx-208, but the farmer's
    // screens badge trt-1 "Vet Signed" while Rx-208 is still awaiting signature.
    // Kept them separate: trt-1 is the signed course already in withdrawal, Rx-208 is the
    // new prescription for the same mastitis episode. Signing Rx-208 (stage 3) must not
    // flip this row.
    id: "trt-1",
    animalId: "MP-104",
    farmId: FARM_IDS.shreeKrishnaDairy,
    prescriptionId: null,
    drug: "Oxytetracycline",
    route: "Injection",
    dosage: "10 mg/kg",
    administeredLabel: "Administered Today, 08:15 AM",
    administeredOn: "23 Aug 2026",
    phase: "withdrawal",
    signed: true,
    emergency: false,
    labAssay: "within_mrl",
    feedBatch: null,
    reason: "Respiratory infection",
    withdrawal: {
      doseTime: "Dose",
      nowPct: 30,
      clearLabel: "Clear",
      productMessage: "Milk clears tomorrow, 10:30 AM",
      clearsAt: "Clears: 24 Aug, 10:30 AM",
    },
  },
  {
    // CONFLICT: the farmer list said "Medicated Feed · 200 mg/L water" while Rx-207 said
    // drinking water. Kept Rx-207's route; the feed batch reference is retained.
    id: "trt-2",
    animalId: "Flock P-01",
    farmId: FARM_IDS.meenaPoultry,
    prescriptionId: "Rx-207",
    drug: "Oxytetracycline",
    route: "Drinking water",
    dosage: "200 mg/L",
    administeredLabel: "Administered 2 days ago",
    administeredOn: "21 Aug 2026",
    phase: "withdrawal",
    signed: false,
    emergency: true,
    labAssay: "unavailable",
    feedBatch: "Feed Batch FB-012",
    reason: "Gumboro-associated secondary infection",
    withdrawal: {
      doseTime: "Dose",
      nowPct: 55,
      clearLabel: "Clear",
      productMessage: "Eggs clear in 4 days",
      clearsAt: "Clears: 27 Aug",
    },
  },
  {
    // CONFLICT: the list said Goat; species now comes from MP-106, a Buffalo
    // (plan resolution 6). No Rx in this vet's registry covers it, so it stays unlinked
    // while keeping its "Vet Signed" badge.
    id: "trt-3",
    animalId: "MP-106",
    farmId: FARM_IDS.shreeKrishnaDairy,
    prescriptionId: null,
    drug: "Amoxicillin",
    route: "Injection",
    dosage: "7 mg/kg",
    administeredLabel: "Administered Yesterday, 14:00",
    administeredOn: "22 Aug 2026",
    phase: "active",
    signed: true,
    emergency: false,
    labAssay: null,
    feedBatch: null,
    reason: "Preventative",
    withdrawal: null,
  },
  {
    id: "trt-4",
    animalId: "MP-109",
    farmId: FARM_IDS.shreeKrishnaDairy,
    prescriptionId: null,
    drug: "Vitamin B12",
    route: "Injection",
    dosage: "5 mL",
    administeredLabel: "Administered Today, 09:00 AM",
    administeredOn: "23 Aug 2026",
    phase: "active",
    signed: false,
    emergency: false,
    labAssay: null,
    feedBatch: null,
    reason: "Supportive care",
    withdrawal: null,
  },
  {
    // CONFLICT: the list said Cow; species now comes from MP-108, a Goat
    // (plan resolution 7).
    id: "trt-5",
    animalId: "MP-108",
    farmId: FARM_IDS.shreeKrishnaDairy,
    prescriptionId: "Rx-195",
    drug: "Ivermectin",
    route: "Pour-on",
    dosage: "500 mcg/kg",
    administeredLabel: "Administered 5 days ago",
    administeredOn: "18 Aug 2026",
    phase: "completed",
    signed: true,
    emergency: false,
    labAssay: "within_mrl",
    feedBatch: null,
    reason: "Parasite control",
    withdrawal: null,
  },
];

// ─── Farmer dispatches ───────────────────────────────────────────────────────

export const FARMER_DISPATCHES: FarmerDispatch[] = [
  {
    // CONFLICT: the list said "cleared" while MP-104's trt-1 withdrawal is still running.
    // Kept the withdrawal (plan resolution 4) — the dispatch is under withdrawal.
    // Plan resolution 20: this is the same milk lot the lab holds as MLK-2026-00124.
    id: "DSP-024",
    farmId: FARM_IDS.shreeKrishnaDairy,
    product: "Milk",
    animalId: "MP-104",
    dateLabel: "Today",
    status: "withdrawal",
    treatmentId: "trt-1",
    labDispatchId: "MLK-2026-00124",
    blocked: null,
  },
  {
    // CONFLICT: the list said "withdrawal" and the detail pointed at trt-2 (a poultry
    // treatment). Plan resolution 5 repoints it at trt-5, MP-108's own course — which is
    // completed with lab ≤ MRL, so this lot is cleared rather than under withdrawal.
    id: "DSP-023",
    farmId: FARM_IDS.shreeKrishnaDairy,
    product: "Milk",
    animalId: "MP-108",
    dateLabel: "Yesterday",
    status: "cleared",
    treatmentId: "trt-5",
    labDispatchId: null,
    blocked: null,
  },
  {
    // Plan resolution 20: kept farmer-side only. It is NOT merged into the lab's
    // Green Valley meat sample (MEAT-2026-00087) — different source, different batch.
    id: "DSP-022",
    farmId: FARM_IDS.meenaPoultry,
    product: "Meat",
    animalId: "Flock-07",
    dateLabel: "20 Aug",
    status: "blocked",
    treatmentId: null,
    labDispatchId: null,
    blocked: { mrlMeasuredPpm: "0.14", mrlPermittedPpm: "0.10", prescriptionSigned: false },
  },
];

// ─── Medicine stock ──────────────────────────────────────────────────────────
//
// CONFLICT: farmer home and farm insights carried duplicate literals with one
// mismatch — home labelled Ivermectin "Stock sufficient", insights "Good".
// One row now feeds both; the label comes from `level`.

export const MEDICINE_STOCK: MedicineStock[] = [
  { name: "Oxytetracycline", quantity: 17, unit: "vials", recentUsage: 4, level: "restock", usageTotal: 25 },
  { name: "Ivermectin", quantity: 32, unit: "doses", recentUsage: 3, level: "good", usageTotal: 18 },
  { name: "Vitamin B Complex", quantity: 60, unit: "doses", recentUsage: 2, level: "good", usageTotal: 11 },
  { name: "Amoxicillin", quantity: 8, unit: "vials", recentUsage: 2, level: "monitor", usageTotal: null },
];

// ─── Vets ────────────────────────────────────────────────────────────────────

export const VETS: Vet[] = [
  { id: "vet-1", name: "Dr. Bankey", designation: "Veterinary Officer", pin: "1234", isCurrentUser: true },
  { id: "vet-2", name: "Dr. Sofia Abidi", designation: "Senior Vet Surgeon", pin: "1234", isCurrentUser: false },
  { id: "vet-3", name: "Dr. Anil Sharma", designation: "Field Veterinarian", pin: "1234", isCurrentUser: false },
];

// ─── Lab samples ─────────────────────────────────────────────────────────────
//
// One row per business object. Dispatches / testing queue / results / reports are
// all projections of these rows, so a lot can never be "CLEARED" on one page while
// another page still says "start testing" (plan resolution 13).

export const LAB_SAMPLES: LabSample[] = [
  {
    // CONFLICT: the dispatch row said READY FOR TESTING, the detail said TESTING IN
    // PROGRESS, results said AWAITING VERIFICATION and the report said CLEARED for the
    // same milk lot. Kept "testing in progress" (plan resolution 13): the detail, the
    // testing queue and the dashboard all agree, and the CLEARED milk report moved to
    // MLK-2026-00118, the milk dispatch that really is finished.
    // Linked to the farmer's DSP-024 (same milk lot, plan resolution 20).
    dispatchId: "MLK-2026-00124",
    sampleId: "LAB-MLK-00981",
    product: "Milk",
    productSub: "Raw milk",
    productLabel: "Raw Milk",
    farmId: FARM_IDS.shreeKrishnaDairy,
    sourceName: "Shree Krishna Dairy",
    animalId: "MP-104",
    batchLabel: null,
    farmerDispatchId: "DSP-024",
    stage: "testing",
    risk: "MODERATE",
    riskReason: "Recent antimicrobial exposure",
    priority: "HIGH PRIORITY",
    arrival: "Received 22 Aug · 11:05 AM",
    receiptReason: "Beta-lactam residue testing required",
    dateLabel: "22 Aug · 10:30 AM",
    date: "22 Aug 2026",
    time: "10:30 AM",
    resultDate: null,
    quantity: "850 L",
    receipt: {
      condition: "Acceptable",
      temperature: "4.2°C",
      container: "Intact",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "22 Aug · 11:05 AM",
    },
    tests: [
      { name: "Product Quality", checks: ["Fat", "SNF", "Acidity", "Adulteration screen"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Microbiological Safety", checks: ["Standard plate count", "Coliform screening", "Pathogen screen"], state: "active", result: null, ok: false, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Beta-lactam screen", "Targeted residue analysis"], state: "pending", result: null, ok: false, trigger: "Triggered by treatment history" },
    ],
    // Antimicrobial context is derived from the linked farmer treatment (trt-1).
    antimicrobialContext: null,
    antimicrobialStatus: null,
    activity: [
      { time: "12:10 PM", title: "Microbiological testing started", desc: "Status updated to In Progress.", icon: "active" },
      { time: "11:20 AM", title: "Product quality testing completed", desc: "Results submitted by Dr. Priya Sharma.", icon: "done" },
      { time: "11:05 AM", title: "Sample received and registered", desc: "LAB-MLK-00981 linked to this dispatch.", icon: "done" },
      { time: "10:30 AM", title: "Dispatch created", desc: "Milk dispatch submitted from Shree Krishna Dairy.", icon: "neutral" },
    ],
    attention: {
      desc: "Beta-lactam residue testing required.",
      status: "HIGH PRIORITY",
      statusColor: "amber",
      action: "Continue Testing →",
      page: "/lab/testing-workspace/MLK-2026-00124",
    },
    report: null,
  },
  {
    // CONFLICT: the dispatch row said IN PROGRESS while results said ACTION REQUIRED and
    // the report said ON HOLD. Kept ON HOLD — testing finished and the residue result
    // needs review. This also makes the dashboard's "2 On Hold" counter match the rows.
    dispatchId: "MEAT-2026-00087",
    sampleId: "LAB-MT-00472",
    product: "Meat",
    productSub: "Batch M-42",
    productLabel: "Meat",
    farmId: FARM_IDS.greenValleyLivestock,
    sourceName: "Green Valley Livestock",
    animalId: null,
    batchLabel: "M-42",
    farmerDispatchId: null,
    stage: "on_hold",
    risk: "HIGH",
    riskReason: "Tetracycline detected above threshold",
    priority: "HIGH PRIORITY",
    arrival: "Received 22 Aug · 09:15 AM",
    receiptReason: "Withdrawal verification requires review",
    dateLabel: "22 Aug · 08:45 AM",
    date: "22 Aug 2026",
    time: "08:45 AM",
    resultDate: "23 Aug 2026",
    quantity: "420 kg",
    receipt: {
      condition: "Acceptable",
      temperature: "2.8°C",
      container: "Intact",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "22 Aug · 09:15 AM",
    },
    tests: [
      { name: "Product Quality", checks: ["pH", "Appearance", "Odour"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Microbiological Safety", checks: ["Aerobic count", "E. coli", "Salmonella"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Tetracycline screen", "Confirmatory analysis"], state: "done", result: "REVIEW REQUIRED", ok: false, trigger: "Triggered by withdrawal dispute" },
    ],
    antimicrobialContext: "Oxytetracycline · Last administered 10 Aug 2026",
    antimicrobialStatus: "⚠ Withdrawal period disputed. Residue exceeds MRL — assessment on hold.",
    activity: [
      { time: "02:40 PM", title: "Dispatch placed on hold", desc: "Tetracycline above MRL — awaiting review.", icon: "active" },
      { time: "01:15 PM", title: "Residue testing completed", desc: "Confirmatory analysis submitted.", icon: "done" },
      { time: "09:15 AM", title: "Sample received and registered", desc: "LAB-MT-00472 linked to this dispatch.", icon: "done" },
      { time: "08:45 AM", title: "Dispatch created", desc: "Meat dispatch submitted from Green Valley Livestock.", icon: "neutral" },
    ],
    attention: {
      desc: "Withdrawal verification requires review.",
      status: "REVIEW REQUIRED",
      statusColor: "red",
      action: "View Dispatch →",
      page: "/lab/dispatches/MEAT-2026-00087",
    },
    report: {
      refNo: "LAB-REF-2026-00087",
      verifiedBy: "Laboratory Authority",
      verifiedOn: "—",
      status: "ON HOLD",
      statusColor: "red",
      assessments: [
        { label: "Product Quality", result: "Compliant", ok: true, detail: "pH 5.7 · Appearance normal · Odour normal" },
        { label: "Microbiological Safety", result: "Compliant", ok: true, detail: "Aerobic count within range · E. coli ND · Salmonella ND" },
        { label: "Antimicrobial Residue", result: "Review Required", ok: false, detail: "Tetracycline detected above threshold" },
      ],
      mrl: { drug: "Tetracycline", measured: 220, limit: 100, unit: "μg/kg", ratio: 2.2, verdict: "EXCEEDS MRL", verdictOk: false },
      withdrawal: { drug: "Oxytetracycline", administered: "10 Aug 2026", completed: "18 Aug 2026", status: "Disputed — review required" },
      outcome: "ON HOLD",
      outcomeOk: false,
    },
  },
  {
    // CONFLICT: dispatches + dashboard said AWAITING VERIFICATION while results said
    // VERIFIED and the report said CLEARED. Kept awaiting verification — the earlier
    // stage, same rule as the milk lot — so the report only appears once a verification
    // is recorded (stage 4).
    // CONFLICT: the plan flagged an EGG id drift (241 vs 241); the current files agree on
    // EGG-2026-00241, which stays canonical (plan resolution 15).
    dispatchId: "EGG-2026-00241",
    sampleId: "LAB-EGG-01128",
    product: "Eggs",
    productSub: "Flock dispatch",
    productLabel: "Eggs",
    farmId: FARM_IDS.sunrisePoultry,
    sourceName: "Sunrise Poultry",
    animalId: "FLK-2026-042",
    batchLabel: "FLK-2026-042",
    farmerDispatchId: null,
    stage: "awaiting_verification",
    risk: "LOW",
    riskReason: "Routine surveillance",
    priority: "ROUTINE",
    arrival: "Received 21 Aug · 04:55 PM",
    receiptReason: "Routine residue surveillance",
    dateLabel: "21 Aug · 04:20 PM",
    date: "21 Aug 2026",
    time: "04:20 PM",
    resultDate: "22 Aug 2026",
    quantity: "6,400 eggs",
    receipt: {
      condition: "Acceptable",
      temperature: "18.0°C",
      container: "Intact",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "21 Aug · 04:55 PM",
    },
    tests: [
      { name: "Physical Quality", checks: ["Average weight", "Shell integrity", "Cleanliness"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Microbiological Safety", checks: ["Salmonella screen", "Pathogen screen"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Enrofloxacin screen"], state: "done", result: "WITHIN LIMIT", ok: true, trigger: null },
    ],
    antimicrobialContext: "Enrofloxacin · Last administered 8 Aug 2026",
    antimicrobialStatus: "✓ Withdrawal completed before dispatch. Assessment awaiting verification.",
    activity: [
      { time: "03:10 PM", title: "Assessment submitted", desc: "Awaiting authority verification.", icon: "active" },
      { time: "01:40 PM", title: "Residue testing completed", desc: "Enrofloxacin within limit.", icon: "done" },
      { time: "04:55 PM", title: "Sample received and registered", desc: "LAB-EGG-01128 linked to this dispatch.", icon: "done" },
      { time: "04:20 PM", title: "Dispatch created", desc: "Egg dispatch submitted from Sunrise Poultry.", icon: "neutral" },
    ],
    attention: {
      desc: "Assessment is awaiting verification.",
      status: "ACTION REQUIRED",
      statusColor: "amber",
      action: "Review Results →",
      page: "/lab/results",
    },
    report: null,
  },
  {
    // The dispatch row already said COMPLETED with a "View Report →" action and the
    // dashboard activity said its result was submitted, so this lot carries the CLEARED
    // milk report (moved here from MLK-2026-00124, which is still in testing).
    dispatchId: "MLK-2026-00118",
    sampleId: "LAB-MLK-00972",
    product: "Milk",
    productSub: "Raw milk",
    productLabel: "Raw Milk",
    farmId: FARM_IDS.mahalaxmiDairy,
    sourceName: "Mahalaxmi Dairy",
    animalId: "MP-087",
    batchLabel: null,
    farmerDispatchId: null,
    stage: "verified",
    risk: "LOW",
    riskReason: "No recent antimicrobial exposure",
    priority: "ROUTINE",
    arrival: "Received 21 Aug · 11:40 AM",
    receiptReason: "Routine residue surveillance",
    dateLabel: "21 Aug · 11:15 AM",
    date: "21 Aug 2026",
    time: "11:15 AM",
    resultDate: "22 Aug 2026",
    quantity: "620 L",
    receipt: {
      condition: "Acceptable",
      temperature: "4.0°C",
      container: "Intact",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "21 Aug · 11:40 AM",
    },
    tests: [
      { name: "Product Quality", checks: ["Fat", "SNF", "Acidity", "Adulteration screen"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Microbiological Safety", checks: ["Standard plate count", "Coliform screening", "Pathogen screen"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Beta-lactam screen", "Tetracycline screen"], state: "done", result: "WITHIN LIMIT", ok: true, trigger: null },
    ],
    antimicrobialContext: "Amoxicillin · Last administered 15 Aug 2026",
    antimicrobialStatus: "✓ Withdrawal completed before dispatch. Residue testing complete.",
    activity: [
      { time: "04:20 PM", title: "Report verified and released", desc: "Cleared for dispatch by Laboratory Authority.", icon: "done" },
      { time: "02:05 PM", title: "Residue testing completed", desc: "Beta-lactam within limit.", icon: "done" },
      { time: "11:40 AM", title: "Sample received and registered", desc: "LAB-MLK-00972 linked to this dispatch.", icon: "done" },
      { time: "11:15 AM", title: "Dispatch created", desc: "Milk dispatch submitted from Mahalaxmi Dairy.", icon: "neutral" },
    ],
    attention: null,
    report: {
      refNo: "LAB-REF-2026-00118",
      verifiedBy: "Laboratory Authority",
      verifiedOn: "22 Aug 2026 · 4:20 PM",
      status: "CLEARED",
      statusColor: "green",
      assessments: [
        { label: "Product Quality", result: "Compliant", ok: true, detail: "Fat 3.8% · SNF 8.6% · Acidity Normal · No adulteration" },
        { label: "Microbiological Safety", result: "Compliant", ok: true, detail: "SPC 4,200 CFU/mL · Coliform ND · Pathogen ND" },
        { label: "Antimicrobial Residue", result: "Within Limit", ok: true, detail: "Beta-lactam · Tetracycline screened" },
      ],
      mrl: { drug: "Amoxicillin (Beta-lactam)", measured: 3.2, limit: 4.0, unit: "μg/kg", ratio: 0.8, verdict: "WITHIN MRL", verdictOk: true },
      withdrawal: { drug: "Amoxicillin", administered: "15 Aug 2026", completed: "20 Aug 2026", status: "Completed before dispatch" },
      outcome: "CLEARED FOR DISPATCH",
      outcomeOk: true,
    },
  },
  {
    // On hold *during* testing (sample integrity), so it has no results or report row —
    // unlike MEAT-2026-00087, whose testing finished before the hold.
    dispatchId: "MEAT-2026-00072",
    sampleId: "LAB-MT-00461",
    product: "Meat",
    productSub: "Batch M-18",
    productLabel: "Meat",
    farmId: FARM_IDS.rajFarms,
    sourceName: "Raj Farms",
    animalId: null,
    batchLabel: "M-18",
    farmerDispatchId: null,
    stage: "on_hold",
    risk: "HIGH",
    riskReason: "Sample integrity dispute",
    priority: "HIGH PRIORITY",
    arrival: "Received 20 Aug · 02:35 PM",
    receiptReason: "Re-collection requested",
    dateLabel: "20 Aug · 02:00 PM",
    date: "20 Aug 2026",
    time: "02:00 PM",
    resultDate: null,
    quantity: "310 kg",
    receipt: {
      condition: "Container seal broken",
      temperature: "6.5°C",
      container: "Compromised",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "20 Aug · 02:35 PM",
    },
    tests: [
      { name: "Product Quality", checks: ["pH", "Appearance", "Odour"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Microbiological Safety", checks: ["Aerobic count", "E. coli", "Salmonella"], state: "done", result: "COMPLIANT", ok: true, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Tetracycline screen"], state: "active", result: null, ok: false, trigger: "Held pending re-collection" },
    ],
    antimicrobialContext: null,
    antimicrobialStatus: "⚠ Sample integrity compromised. Residue testing held pending re-collection.",
    activity: [
      { time: "03:10 PM", title: "Dispatch placed on hold", desc: "Container seal broken on arrival.", icon: "active" },
      { time: "02:35 PM", title: "Sample received and registered", desc: "LAB-MT-00461 linked to this dispatch.", icon: "done" },
      { time: "02:00 PM", title: "Dispatch created", desc: "Meat dispatch submitted from Raj Farms.", icon: "neutral" },
    ],
    attention: null,
    report: null,
  },
  {
    dispatchId: "MLK-2026-00131",
    sampleId: "LAB-MLK-00992",
    product: "Milk",
    productSub: "Raw Milk",
    productLabel: "Raw Milk",
    farmId: FARM_IDS.mahalaxmiDairy,
    sourceName: "Mahalaxmi Dairy",
    animalId: "MP-087",
    batchLabel: null,
    farmerDispatchId: null,
    stage: "awaiting_receipt",
    risk: "HIGH",
    riskReason: "Targeted residue test required",
    priority: "HIGH PRIORITY",
    arrival: "Expected today · 10:45 AM",
    receiptReason: "Targeted residue test required",
    dateLabel: "23 Aug · 10:45 AM",
    date: "23 Aug 2026",
    time: "10:45 AM",
    resultDate: null,
    quantity: "540 L",
    receipt: { condition: "—", temperature: "—", container: "—", receivedBy: "—", receivedAt: "—" },
    tests: [
      { name: "Product Quality", checks: ["Fat", "SNF", "Acidity", "Adulteration screen"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Microbiological Safety", checks: ["Standard plate count", "Coliform screening"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Targeted residue analysis"], state: "pending", result: null, ok: false, trigger: "Targeted residue test required" },
    ],
    antimicrobialContext: null,
    antimicrobialStatus: null,
    activity: [{ time: "09:30 AM", title: "Dispatch created", desc: "Milk dispatch submitted from Mahalaxmi Dairy.", icon: "neutral" }],
    attention: null,
    report: null,
  },
  {
    // CONFLICT: the testing queue listed MEAT-2026-00091 in both "awaiting receipt" and
    // "ready for testing". Kept awaiting receipt only (plan resolution 16).
    dispatchId: "MEAT-2026-00091",
    sampleId: "LAB-MT-00481",
    product: "Meat",
    productSub: "Batch M-56",
    productLabel: "Meat",
    farmId: FARM_IDS.greenValleyLivestock,
    sourceName: "Green Valley Livestock",
    animalId: null,
    batchLabel: "M-56",
    farmerDispatchId: null,
    stage: "awaiting_receipt",
    risk: "MODERATE",
    riskReason: "Routine surveillance",
    priority: "MODERATE",
    arrival: "Received 15 min ago",
    receiptReason: "",
    dateLabel: "23 Aug · 09:50 AM",
    date: "23 Aug 2026",
    time: "09:50 AM",
    resultDate: null,
    quantity: "380 kg",
    receipt: { condition: "—", temperature: "—", container: "—", receivedBy: "—", receivedAt: "—" },
    tests: [
      { name: "Quality Assessment", checks: ["pH", "Appearance", "Odour"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Microbiology", checks: ["Aerobic count", "E. coli", "Salmonella"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Tetracycline screen"], state: "pending", result: null, ok: false, trigger: null },
    ],
    antimicrobialContext: null,
    antimicrobialStatus: null,
    activity: [{ time: "09:50 AM", title: "Dispatch created", desc: "Meat dispatch submitted from Green Valley Livestock.", icon: "neutral" }],
    attention: null,
    report: null,
  },
  {
    dispatchId: "EGG-2026-00255",
    sampleId: "LAB-EGG-01142",
    product: "Eggs",
    productSub: "Flock FLK-2026-051",
    productLabel: "Eggs",
    farmId: FARM_IDS.sunrisePoultry,
    sourceName: "Sunrise Poultry",
    animalId: "FLK-2026-051",
    batchLabel: "FLK-2026-051",
    farmerDispatchId: null,
    stage: "awaiting_receipt",
    risk: "LOW",
    riskReason: "Routine surveillance",
    priority: "ROUTINE",
    arrival: "Expected today · 12:30 PM",
    receiptReason: "",
    dateLabel: "23 Aug · 12:30 PM",
    date: "23 Aug 2026",
    time: "12:30 PM",
    resultDate: null,
    quantity: "5,200 eggs",
    receipt: { condition: "—", temperature: "—", container: "—", receivedBy: "—", receivedAt: "—" },
    tests: [
      { name: "Physical Quality", checks: ["Average weight", "Shell integrity", "Cleanliness"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Microbiological Safety", checks: ["Salmonella screen"], state: "pending", result: null, ok: false, trigger: null },
      { name: "Antimicrobial Residue", checks: ["Enrofloxacin screen"], state: "pending", result: null, ok: false, trigger: null },
    ],
    antimicrobialContext: null,
    antimicrobialStatus: null,
    activity: [{ time: "08:15 AM", title: "Dispatch created", desc: "Egg dispatch submitted from Sunrise Poultry.", icon: "neutral" }],
    attention: null,
    report: null,
  },
];

// ─── Admin / national aggregates ─────────────────────────────────────────────
//
// Moved here from `src/components/admin/AdminShared.tsx`, which now re-exports
// these under their original names so the admin UI is untouched.

export const ADMIN_REGIONS: AdminRegionRow[] = [
  { id:"UP",  state:"Uttar Pradesh",    zone:"North",  amu:94200, change:18, anomalies:22, unexplained:8 },
  { id:"RJ",  state:"Rajasthan",        zone:"North",  amu:87670, change:31, anomalies:14, unexplained:7 },
  { id:"MH",  state:"Maharashtra",      zone:"West",   amu:69420, change:23, anomalies:17, unexplained:5 },
  { id:"KA",  state:"Karnataka",        zone:"South",  amu:73380, change:8,  anomalies:6,  unexplained:1 },
  { id:"GJ",  state:"Gujarat",          zone:"West",   amu:65960, change:11, anomalies:9,  unexplained:2 },
  { id:"MP",  state:"Madhya Pradesh",   zone:"Central",amu:71200, change:15, anomalies:11, unexplained:3 },
  { id:"TN",  state:"Tamil Nadu",       zone:"South",  amu:61200, change:12, anomalies:8,  unexplained:2 },
  { id:"WB",  state:"West Bengal",      zone:"East",   amu:58900, change:9,  anomalies:7,  unexplained:3 },
  { id:"AP",  state:"Andhra Pradesh",   zone:"South",  amu:54300, change:6,  anomalies:5,  unexplained:1 },
  { id:"BR",  state:"Bihar",            zone:"East",   amu:52100, change:21, anomalies:12, unexplained:4 },
  { id:"HR",  state:"Haryana",          zone:"North",  amu:48700, change:14, anomalies:7,  unexplained:2 },
  { id:"OD",  state:"Odisha",           zone:"East",   amu:39400, change:5,  anomalies:4,  unexplained:1 },
  { id:"TG",  state:"Telangana",        zone:"South",  amu:43800, change:7,  anomalies:6,  unexplained:2 },
  { id:"PB",  state:"Punjab",           zone:"North",  amu:51340, change:-3, anomalies:4,  unexplained:0 },
  { id:"CG",  state:"Chhattisgarh",     zone:"Central",amu:36200, change:10, anomalies:4,  unexplained:1 },
  { id:"JH",  state:"Jharkhand",        zone:"East",   amu:29800, change:8,  anomalies:3,  unexplained:1 },
  { id:"HP",  state:"Himachal Pradesh", zone:"North",  amu:18200, change:4,  anomalies:2,  unexplained:0 },
  { id:"UT",  state:"Uttarakhand",      zone:"North",  amu:21400, change:6,  anomalies:2,  unexplained:0 },
  { id:"JK",  state:"J&K & Ladakh",     zone:"North",  amu:15600, change:3,  anomalies:2,  unexplained:0 },
  { id:"NE",  state:"North-East States",zone:"East",   amu:24700, change:7,  anomalies:3,  unexplained:1 },
  { id:"KL",  state:"Kerala",           zone:"South",  amu:34200, change:5,  anomalies:3,  unexplained:0 },
  { id:"GA",  state:"Goa",             zone:"West",   amu:4800,  change:2,  anomalies:1,  unexplained:0 },
]


export const ADMIN_DISTRICTS: Record<string, AdminDistrictRow[]> = {
  GJ: [
    { district:"Kachchh",   amu:12400, change:18, anomalies:3, unexplained:1 },
    { district:"Ahmedabad", amu:8920,  change:11, anomalies:2, unexplained:0 },
    { district:"Rajkot",    amu:9100,  change:15, anomalies:2, unexplained:1 },
    { district:"Surat",     amu:7840,  change:8,  anomalies:1, unexplained:0 },
    { district:"Vadodara",  amu:6800,  change:6,  anomalies:1, unexplained:0 },
    { district:"Bhavnagar", amu:7200,  change:12, anomalies:2, unexplained:0 },
    { district:"Jamnagar",  amu:5600,  change:9,  anomalies:1, unexplained:0 },
    { district:"Junagadh",  amu:4900,  change:14, anomalies:1, unexplained:0 },
  ],
  MH: [
    { district:"Pune",        amu:14200, change:22, anomalies:4, unexplained:2 },
    { district:"Nashik",      amu:11800, change:19, anomalies:3, unexplained:1 },
    { district:"Nagpur",      amu:10200, change:17, anomalies:2, unexplained:0 },
    { district:"Aurangabad",  amu:9400,  change:24, anomalies:3, unexplained:1 },
    { district:"Amravati",    amu:7800,  change:28, anomalies:3, unexplained:1 },
    { district:"Solapur",     amu:8100,  change:21, anomalies:2, unexplained:0 },
    { district:"Kolhapur",    amu:6700,  change:12, anomalies:1, unexplained:0 },
  ],
  UP: [
    { district:"Lucknow",   amu:12400, change:16, anomalies:3, unexplained:1 },
    { district:"Agra",      amu:10800, change:21, anomalies:4, unexplained:2 },
    { district:"Kanpur",    amu:11200, change:18, anomalies:3, unexplained:1 },
    { district:"Varanasi",  amu:9600,  change:14, anomalies:2, unexplained:1 },
    { district:"Meerut",    amu:8900,  change:22, anomalies:3, unexplained:1 },
    { district:"Bareilly",  amu:7400,  change:11, anomalies:2, unexplained:0 },
    { district:"Allahabad", amu:8200,  change:19, anomalies:2, unexplained:1 },
    { district:"Gorakhpur", amu:7100,  change:15, anomalies:2, unexplained:1 },
  ],
  RJ: [
    { district:"Jaipur",  amu:14600, change:28, anomalies:3, unexplained:2 },
    { district:"Jodhpur", amu:12800, change:33, anomalies:3, unexplained:2 },
    { district:"Bikaner", amu:11200, change:31, anomalies:2, unexplained:1 },
    { district:"Udaipur", amu:9800,  change:24, anomalies:2, unexplained:1 },
    { district:"Kota",    amu:10200, change:29, anomalies:2, unexplained:1 },
    { district:"Ajmer",   amu:8900,  change:26, anomalies:2, unexplained:0 },
  ],
}


// CONFLICT: A001 "Farm 247", A004 "Farm 91", A006 "Farm 334" … are national demo farms
// with no counterpart in the farmer/vet/lab story, so they carry no farm_id.
export const ADMIN_ANOMALIES: AdminAnomalyRow[] = [
  { id:"A001", farm:"Farm 247",       region:"Maharashtra",  medicine:"Oxytetracycline", amuChange:68, baseline:100, healthEvent:null,                  status:"UNEXPLAINED", severity:"HIGH",   species:"Dairy",   date:"24 Aug 2026", history:[98,102,97,104,99,101,100,98,103,115,142,168] },
  // CONFLICT: A002 is the same poultry farm as the vet/farmer Meena Poultry (Gumboro +
  // Oxytetracycline), so it now carries that farm_id (plan resolution 19).
  { id:"A002", farm:"Meena Poultry",  farmId:FARM_IDS.meenaPoultry, region:"Punjab",       medicine:"Oxytetracycline", amuChange:54, baseline:100, healthEvent:"Gumboro (IBD)",         status:"EXPLAINED",   severity:"MEDIUM", species:"Poultry", date:"22 Aug 2026", history:[96,100,98,102,97,99,101,98,100,108,154,148] },
  { id:"A003", farm:"Farm 18",        region:"Gujarat",      medicine:"Amoxicillin",     amuChange:41, baseline:100, healthEvent:"Mastitis",              status:"EXPLAINED",   severity:"MEDIUM", species:"Dairy",   date:"21 Aug 2026", history:[101,99,102,97,100,98,102,99,101,110,141,138] },
  { id:"A004", farm:"Farm 91",        region:"Rajasthan",    medicine:"Enrofloxacin",    amuChange:73, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Dairy",   date:"20 Aug 2026", history:[100,103,98,101,99,102,98,101,100,118,148,173] },
  // CONFLICT: listed as "Krishna Dairy", the vet-side alias of Shree Krishna Dairy.
  // Joined to that farm and renamed to the canonical display name (plan resolution 1).
  { id:"A005", farm:"Shree Krishna Dairy", farmId:FARM_IDS.shreeKrishnaDairy, region:"Haryana",      medicine:"Amoxicillin",     amuChange:38, baseline:100, healthEvent:"Mastitis",              status:"EXPLAINED",   severity:"LOW",    species:"Dairy",   date:"19 Aug 2026", history:[99,101,100,98,102,100,99,101,98,105,138,132] },
  { id:"A006", farm:"Farm 334",       region:"Uttar Pradesh",medicine:"Oxytetracycline", amuChange:82, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Poultry", date:"18 Aug 2026", history:[102,98,101,99,103,100,98,102,104,122,158,182] },
  { id:"A007", farm:"Shanti Farms",   region:"Karnataka",    medicine:"Enrofloxacin",    amuChange:29, baseline:100, healthEvent:"Respiratory infection",  status:"EXPLAINED",   severity:"LOW",    species:"Poultry", date:"17 Aug 2026", history:[98,100,99,101,100,98,102,99,100,104,129,125] },
  { id:"A008", farm:"Farm 512",       region:"Rajasthan",    medicine:"Oxytetracycline", amuChange:61, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"MEDIUM", species:"Dairy",   date:"16 Aug 2026", history:[101,99,102,98,100,103,99,101,100,114,145,161] },
  { id:"A009", farm:"Greenview Dairy",region:"Maharashtra",  medicine:"Penicillin",      amuChange:44, baseline:100, healthEvent:"Foot rot",              status:"EXPLAINED",   severity:"MEDIUM", species:"Dairy",   date:"15 Aug 2026", history:[100,102,98,101,99,100,103,99,101,108,144,139] },
  { id:"A010", farm:"Farm 88",        region:"Gujarat",      medicine:"Enrofloxacin",    amuChange:57, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Poultry", date:"14 Aug 2026", history:[99,101,100,102,98,101,99,103,101,116,148,157] },
  { id:"A011", farm:"Farm 203",       region:"Bihar",        medicine:"Amoxicillin",     amuChange:35, baseline:100, healthEvent:"Colibacillosis",        status:"EXPLAINED",   severity:"LOW",    species:"Poultry", date:"13 Aug 2026", history:[100,98,101,99,102,100,98,101,99,104,135,130] },
  // Same Sunrise Poultry the lab samples eggs from.
  { id:"A012", farm:"Sunrise Poultry",farmId:FARM_IDS.sunrisePoultry, region:"West Bengal",  medicine:"Oxytetracycline", amuChange:47, baseline:100, healthEvent:"Newcastle disease",     status:"EXPLAINED",   severity:"MEDIUM", species:"Poultry", date:"12 Aug 2026", history:[102,99,101,98,100,102,99,101,100,109,147,142] },
]


export const ADMIN_HEALTH: AdminHealthRow[] = [
  { event:"Gumboro (IBD)",         species:"Poultry", amuChange:54, farmsAffected:21, classification:"Explained"   },
  { event:"Mastitis",              species:"Dairy",   amuChange:31, farmsAffected:14, classification:"Explained"   },
  { event:"None recorded",         species:"Poultry", amuChange:47, farmsAffected:9,  classification:"Unexplained" },
  { event:"Foot Rot",              species:"Dairy",   amuChange:28, farmsAffected:11, classification:"Explained"   },
  { event:"Respiratory infection", species:"Poultry", amuChange:36, farmsAffected:7,  classification:"Explained"   },
  { event:"Newcastle disease",     species:"Poultry", amuChange:41, farmsAffected:8,  classification:"Explained"   },
  { event:"None recorded",         species:"Dairy",   amuChange:62, farmsAffected:5,  classification:"Unexplained" },
  { event:"Colibacillosis",        species:"Poultry", amuChange:29, farmsAffected:12, classification:"Explained"   },
  { event:"Mastitis + other",      species:"Dairy",   amuChange:38, farmsAffected:6,  classification:"Mixed"       },
]


export const ADMIN_MONTHLY_AMU = [112, 108, 115, 110, 114, 118, 156, 182]
export const ADMIN_MONTHLY_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"]
export const ADMIN_HEALTH_EVENT_MARKERS = [
  { month: 5, label: "Gumboro outbreak · Punjab", color: "#F97316" },
  { month: 6, label: "Mastitis cluster · MH",     color: "#EF4444" },
]


// ─── Display-only feeds ──────────────────────────────────────────────────────

export const FARM_ACTIVITY: ActivityRow[] = [
  { icon: "clock", title: "Treatment recorded", subject: "MP-104", timeLabel: "Today" },
  { icon: "clock", title: "Health check completed", subject: "MP-108", timeLabel: "Yesterday" },
  { icon: "clock", title: "Animal registered", subject: "MP-109", timeLabel: "2 days ago" },
];

export const VET_ACTIVITY: VetActivityRow[] = [
  { time: "10:42", title: "Rx-208 · MP-104", description: "Prescription awaiting signature" },
  { time: "09:18", title: "Flock P-01", description: "Emergency administration recorded" },
  { time: "Yesterday", title: "Rx-201 · MP-101", description: "Prescription signed" },
  { time: "Yesterday", title: "MP-101", description: "Treatment outcome recorded" },
  { time: "18 Aug", title: "MP-112", description: "Treatment outcome recorded" },
  { time: "17 Aug", title: "Rx-199 · MP-098", description: "Prescription signed" },
  { time: "17 Aug", title: "MP-098", description: "Treatment protocol updated" },
];

export const VET_OUTCOMES: VetOutcomeRow[] = [
  { animalFlock: "MP-101", diagnosis: "Clinical mastitis", detail: "Treatment completed · 18 Aug", outcome: { text: "RECOVERED", variant: "recovered" } },
  { animalFlock: "MP-112", diagnosis: "Mastitis", detail: "Treatment completed · 17 Aug", outcome: { text: "IMPROVED", variant: "improved" } },
  { animalFlock: "Flock P-01", diagnosis: "Gumboro (IBD)", detail: "", outcome: { text: "FOLLOW-UP PENDING", variant: "follow_up_pending" } },
  { animalFlock: "MP-095", diagnosis: "Lameness", detail: "Treatment completed · 16 Aug", outcome: { text: "RECOVERED", variant: "recovered" } },
  { animalFlock: "MP-088", diagnosis: "Pneumonia", detail: "Treatment completed · 15 Aug", outcome: { text: "FAILED", variant: "failed" } },
  { animalFlock: "Flock P-03", diagnosis: "Coccidiosis", detail: "Treatment completed · 14 Aug", outcome: { text: "IMPROVED", variant: "improved" } },
];

export const VET_INSIGHTS: VetInsightRow[] = [
  {
    id: "insight-1",
    type: "treatment_evidence",
    caseTitle: "Clinical mastitis · Buffalo",
    similarCaseCount: 47,
    recoveryPct: 82,
    recoveryLabel: "Recovered or improved",
    disclaimer: "Supporting evidence from recorded cases. Not a recommendation.",
  },
];

/** Follow-up count spans the whole caseload, not just the seeded patients. */
export const VET_WORKLOAD = { followUp: 3 };

export const LAB_ACTIVITY: LabActivityRow[] = [
  { text: "Result submitted for MLK-2026-00118", time: "10 min ago", icon: "check" },
  { text: "Sample LAB-00921 received and registered", time: "1 hour ago", icon: "inbox" },
  { text: "MEAT-2026-00072 placed on hold", time: "Yesterday", icon: "hold" },
  { text: "EGG-2026-00217 cleared for dispatch", time: "Yesterday", icon: "dispatch" },
];

/** Lab-wide counters; the seeded samples are only the demo slice of the queue. */
export const LAB_COUNTERS = {
  awaitingReceipt: 12,
  testsInProgress: 18,
  dispatchesInProgress: 11,
  awaitingVerification: 7,
  onHold: 2,
};

/** Lifetime report totals shown above the reports table. */
export const LAB_REPORT_TOTALS: SeedState["labReportTotals"] = [
  { v: "128", l: "Completed", color: "neutral" },
  { v: "112", l: "Released", color: "green" },
  { v: "6", l: "On Hold", color: "red" },
  { v: "10", l: "Awaiting Verif.", color: "amber" },
];

// ─── Insight series (authored chart data) ────────────────────────────────────

const FORECAST_BASE = [
  { month: "Mar", past_usage: 10, forecast: null },
  { month: "Apr", past_usage: 15, forecast: null },
  { month: "May", past_usage: 12, forecast: null },
  { month: "Jun", past_usage: 20, forecast: null },
  { month: "Jul", past_usage: 18, forecast: null },
  { month: "Aug", past_usage: 25, forecast: null },
  { month: "Sep", past_usage: 32, forecast: null },
  { month: "Oct", past_usage: 35, forecast: 35 },
] as Array<{ month: string; past_usage: number | null; forecast: number | null }>;

export const INSIGHTS_SERIES: InsightsSeries = {
  forecast: {
    "30d": [...FORECAST_BASE, { month: "Nov", past_usage: null, forecast: 38 }],
    "60d": [
      ...FORECAST_BASE,
      { month: "Nov", past_usage: null, forecast: 45 },
      { month: "Dec", past_usage: null, forecast: 42 },
    ],
    "90d": [
      ...FORECAST_BASE,
      { month: "Nov", past_usage: null, forecast: 45 },
      { month: "Dec", past_usage: null, forecast: 60 },
      { month: "Jan", past_usage: null, forecast: 75 },
    ],
  },
  nowIndex: 7,
  expectedRequirement: "25 vials",
  performance: [
    { month: "Mar", milk_output: 100, medicine_cost: 110 },
    { month: "Apr", milk_output: 120, medicine_cost: 105 },
    { month: "May", milk_output: 140, medicine_cost: 130 },
    { month: "Jun", milk_output: 130, medicine_cost: 110 },
    { month: "Jul", milk_output: 160, medicine_cost: 90 },
    { month: "Aug", milk_output: 175, medicine_cost: 80 },
  ],
  healthTrends: [
    { month: "Mar", health_events: 5, treatments: 8 },
    { month: "Apr", health_events: 7, treatments: 12 },
    { month: "May", health_events: 4, treatments: 9 },
    { month: "Jun", health_events: 10, treatments: 15 },
    { month: "Jul", health_events: 8, treatments: 11 },
    { month: "Aug", health_events: 13, treatments: 18 },
  ],
};

// ─── Initial state ───────────────────────────────────────────────────────────

export const INITIAL_STATE: SeedState = {
  farms: FARMS,
  animals: ANIMALS,
  healthEvents: HEALTH_EVENTS,
  prescriptions: PRESCRIPTIONS,
  prescriptionOptions: PRESCRIPTION_OPTIONS,
  treatments: TREATMENTS,
  farmerDispatches: FARMER_DISPATCHES,
  medicineStock: MEDICINE_STOCK,
  vets: VETS,
  labSamples: LAB_SAMPLES,
  farmActivity: FARM_ACTIVITY,
  vetActivity: VET_ACTIVITY,
  vetOutcomes: VET_OUTCOMES,
  vetInsights: VET_INSIGHTS,
  vetWorkload: VET_WORKLOAD,
  labActivity: LAB_ACTIVITY,
  labCounters: LAB_COUNTERS,
  labReportTotals: LAB_REPORT_TOTALS,
  insightsSeries: INSIGHTS_SERIES,
  adminRegions: ADMIN_REGIONS,
  adminDistricts: ADMIN_DISTRICTS,
  adminAnomalies: ADMIN_ANOMALIES,
  adminHealth: ADMIN_HEALTH,
  adminMonthlyAmu: ADMIN_MONTHLY_AMU,
  adminMonthlyLabels: ADMIN_MONTHLY_LABELS,
  adminHealthEventMarkers: ADMIN_HEALTH_EVENT_MARKERS,
};
