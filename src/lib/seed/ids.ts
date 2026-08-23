/**
 * Canonical id constants.
 *
 * Only ids that already appeared on screen before the seed existed are listed
 * here — see the "recurring IDs" table in `docs/plan.md`.
 */

export const FARM_IDS = {
  shreeKrishnaDairy: "farm-shree-krishna-dairy",
  shantiDairy: "farm-shanti-dairy",
  meenaPoultry: "farm-meena-poultry",
  greenValleyLivestock: "farm-green-valley-livestock",
  sunrisePoultry: "farm-sunrise-poultry",
  mahalaxmiDairy: "farm-mahalaxmi-dairy",
  rajFarms: "farm-raj-farms",
} as const;

export type FarmId = (typeof FARM_IDS)[keyof typeof FARM_IDS];

/** Animals the farmer sees on My Farm. */
export const FARMER_ROSTER_ANIMAL_IDS = [
  "MP-104",
  "MP-105",
  "MP-106",
  "MP-107",
  "MP-108",
  "MP-109",
  "MP-110",
  "MP-111",
] as const;

export const TREATMENT_IDS = ["trt-1", "trt-2", "trt-3", "trt-4", "trt-5"] as const;

export const FARMER_DISPATCH_IDS = ["DSP-024", "DSP-023", "DSP-022"] as const;

export const PRESCRIPTION_IDS = [
  "Rx-208",
  "Rx-207",
  "Rx-205",
  "Rx-201",
  "Rx-198",
  "Rx-194",
  "Rx-189",
  "Rx-183",
] as const;

export const LAB_DISPATCH_IDS = [
  "MLK-2026-00124",
  "MEAT-2026-00087",
  "EGG-2026-00241",
  "MLK-2026-00118",
  "MEAT-2026-00072",
  "MLK-2026-00131",
  "MEAT-2026-00091",
  "EGG-2026-00255",
] as const;

/** PIN accepted by the vet sign / countersign flows. */
export const VET_SIGNATURE_PIN = "1234";
