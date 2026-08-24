export type ForecastSlots = {
  medicine: string;
  species: string;
  region: string;
  period: string;
};

export const FORECAST_DEFAULTS: ForecastSlots = {
  medicine: "All Medicines",
  species: "All Species",
  region: "All Regions",
  period: "Next 30 days",
};

export const MEDICINE_OPTIONS = [
  "All Medicines",
  "Oxytetracycline",
  "Amoxicillin",
  "Enrofloxacin",
] as const;

export const SPECIES_OPTIONS = [
  "All Species",
  "Dairy",
  "Poultry",
  "Small Ruminants",
] as const;

export const REGION_OPTIONS = [
  "All Regions",
  "Maharashtra",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Karnataka",
] as const;

export const PERIOD_OPTIONS = [
  "Next 30 days",
  "Next 60 days",
  "Next 90 days",
  "Q4 2026",
] as const;

const MEDICINE_ALIASES: Array<[RegExp, string]> = [
  [/\ball medicines\b|\ball drugs\b|\ball medicines?\b/i, "All Medicines"],
  [/oxytetracycline|oxy[\s-]?tet/i, "Oxytetracycline"],
  [/amoxicillin|amoxycillin|amox/i, "Amoxicillin"],
  [/enrofloxacin|enro/i, "Enrofloxacin"],
];

const SPECIES_ALIASES: Array<[RegExp, string]> = [
  [/\ball species\b/i, "All Species"],
  [/\bdairy\b|\bcow\b|\bbuffalo\b/i, "Dairy"],
  [/\bpoultry\b|\bchicken\b|\bbroiler\b/i, "Poultry"],
  [/\bsmall ruminants?\b|\bgoat\b|\bsheep\b/i, "Small Ruminants"],
];

const REGION_ALIASES: Array<[RegExp, string]> = [
  [/\ball regions?\b|\bnational\b|\ball states?\b/i, "All Regions"],
  [/maharashtra|\bmah\b|\bmh\b/i, "Maharashtra"],
  [/gujarat|\bgj\b/i, "Gujarat"],
  [/rajasthan|\brj\b/i, "Rajasthan"],
  [/\bpunjab\b|\bpb\b/i, "Punjab"],
  [/karnataka|\bka\b/i, "Karnataka"],
];

const PERIOD_ALIASES: Array<[RegExp, string]> = [
  [/q4\s*2026|fourth quarter|oct(?:ober)?\s*[–-]\s*dec/i, "Q4 2026"],
  [/next\s*90\s*days|90[-\s]?day/i, "Next 90 days"],
  [/next\s*60\s*days|60[-\s]?day/i, "Next 60 days"],
  [/next\s*30\s*days|30[-\s]?day/i, "Next 30 days"],
];

const SLOT_LINE =
  /(?:^|\n)\s*(medicine|species|region|forecast|period)\s+include\s+one\s+of\s+(.+)/gi;

function earliestAlias(text: string, aliases: Array<[RegExp, string]>): string | undefined {
  let best: { index: number; value: string } | undefined;
  for (const [re, value] of aliases) {
    const match = text.match(re);
    if (!match || match.index === undefined) continue;
    if (!best || match.index < best.index) best = { index: match.index, value };
  }
  return best?.value;
}

function allAliases(text: string, aliases: Array<[RegExp, string]>): string[] {
  const found: string[] = [];
  for (const [re, value] of aliases) {
    if (re.test(text) && !found.includes(value)) found.push(value);
  }
  return found;
}

function pickFromList(raw: string, aliases: Array<[RegExp, string]>, allValue: string): string | undefined {
  const found = allAliases(raw, aliases).filter((v) => v !== allValue);
  if (found.length === 1) return found[0];
  if (found.length > 1) return allValue;
  const allHit = allAliases(raw, aliases);
  if (allHit.includes(allValue)) return allValue;
  return undefined;
}

export function parseForecastSlots(
  text: string,
  current: ForecastSlots = FORECAST_DEFAULTS,
): { slots: ForecastSlots; understood: Partial<ForecastSlots> } {
  const understood: Partial<ForecastSlots> = {};
  const body = text.trim();
  if (!body) return { slots: current, understood };

  const lineHits: Partial<Record<"medicine" | "species" | "region" | "period", string>> = {};
  for (const match of body.matchAll(SLOT_LINE)) {
    const key = match[1].toLowerCase();
    const rest = match[2];
    if (key === "medicine") {
      const value = pickFromList(rest, MEDICINE_ALIASES, "All Medicines");
      if (value) lineHits.medicine = value;
    } else if (key === "species") {
      const value = pickFromList(rest, SPECIES_ALIASES, "All Species");
      if (value) lineHits.species = value;
    } else if (key === "region") {
      const value = pickFromList(rest, REGION_ALIASES, "All Regions");
      if (value) lineHits.region = value;
    } else {
      const value = earliestAlias(rest, PERIOD_ALIASES);
      if (value) lineHits.period = value;
    }
  }

  const slots: ForecastSlots = { ...current };
  const free = body.replace(SLOT_LINE, " ");

  const medicine = lineHits.medicine ?? pickFromList(free, MEDICINE_ALIASES, "All Medicines") ?? earliestAlias(free, MEDICINE_ALIASES);
  const species = lineHits.species ?? pickFromList(free, SPECIES_ALIASES, "All Species") ?? earliestAlias(free, SPECIES_ALIASES);
  const region = lineHits.region ?? pickFromList(free, REGION_ALIASES, "All Regions") ?? earliestAlias(free, REGION_ALIASES);
  const period = lineHits.period ?? earliestAlias(free, PERIOD_ALIASES);

  if (medicine) {
    slots.medicine = medicine;
    understood.medicine = medicine;
  }
  if (species) {
    slots.species = species;
    understood.species = species;
  }
  if (region) {
    slots.region = region;
    understood.region = region;
  }
  if (period) {
    slots.period = period;
    understood.period = period;
  }

  return { slots, understood };
}

export function understoodLabel(understood: Partial<ForecastSlots>): string {
  const parts = [understood.medicine, understood.species, understood.region, understood.period].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No filters recognised — dropdowns unchanged";
}
