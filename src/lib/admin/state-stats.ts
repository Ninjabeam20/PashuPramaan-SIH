import type { IndiaStateMeta } from "@/lib/admin/india-geo"

export const SPECIES = [
  "Buffalo",
  "Cattle",
  "Goat",
  "Pig",
  "Sheep",
  "Camel",
  "Yak",
  "Mithun",
  "Horse",
  "Donkey",
  "Mule",
] as const

export type SpeciesName = (typeof SPECIES)[number]
export type HeadCountMode = "individual" | "flock"

export type HeadCount = { total: number; male: number; female: number }

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function unit(seed: string): number {
  return (hash(seed) % 10_000) / 10_000
}

function splitSex(total: number, seed: string): HeadCount {
  const femaleShare = 0.46 + unit(`${seed}|sex`) * 0.12
  const female = Math.round(total * femaleShare)
  return { total, male: total - female, female }
}

const YEAR_FACTOR: Record<string, number> = {
  "2026": 1,
  "2025": 0.96,
  "2024": 0.91,
  "2023": 0.87,
  "2022": 0.83,
}

function yearFactor(year: string): number {
  return YEAR_FACTOR[year] ?? 1
}

/** Dummy livestock headcount for a district (deterministic). */
export function districtHeadcount(
  state: IndiaStateMeta,
  district: string,
  year: string,
  mode: HeadCountMode,
): HeadCount {
  const u = unit(`${state.slug}|${district}|pop`)
  const base = 40_000 + Math.round(u * 3_200_000)
  const modeN = mode === "flock" ? 0.78 : 1
  return splitSex(Math.max(800, Math.round(base * yearFactor(year) * modeN)), `${state.slug}|${district}`)
}

function speciesWeight(state: IndiaStateMeta, species: SpeciesName): number {
  const slug = state.slug
  const desert = slug === "rajasthan" || slug === "gujarat" || slug === "haryana"
  const himalaya =
    slug === "himachal-pradesh" ||
    slug === "uttarakhand" ||
    slug === "sikkim" ||
    slug === "arunachal-pradesh" ||
    slug === "jammu-and-kashmir"
  const ne = state.regionId === "NE"
  switch (species) {
    case "Cattle":
      return 28
    case "Buffalo":
      return desert || slug === "punjab" || slug === "haryana" || slug === "uttar-pradesh" ? 24 : 16
    case "Goat":
      return 18
    case "Sheep":
      return slug === "rajasthan" || slug === "telangana" || slug === "andhra-pradesh" ? 12 : 6
    case "Pig":
      return ne ? 10 : 3
    case "Camel":
      return desert ? 8 : 0.2
    case "Yak":
      return himalaya ? 4 : 0
    case "Mithun":
      return ne ? 5 : 0
    case "Horse":
      return 1.4
    case "Donkey":
      return desert ? 2 : 0.6
    case "Mule":
      return himalaya ? 2 : 0.5
    default:
      return 1
  }
}

export function speciesBreakdown(
  state: IndiaStateMeta,
  district: string | null,
  year: string,
  mode: HeadCountMode,
  districts: string[],
): { species: SpeciesName; counts: HeadCount }[] {
  const names = district ? [district] : districts
  const totals = Object.fromEntries(SPECIES.map((s) => [s, { total: 0, male: 0, female: 0 }])) as Record<
    SpeciesName,
    HeadCount
  >
  for (const d of names) {
    const pop = districtHeadcount(state, d, year, mode)
    const weights = SPECIES.map((sp) => {
      const jitter = 0.7 + unit(`${state.slug}|${d}|${sp}`) * 0.6
      return Math.max(0, speciesWeight(state, sp) * jitter)
    })
    const sumW = weights.reduce((a, b) => a + b, 0) || 1
    const raw = SPECIES.map((sp, i) => Math.round((weights[i] / sumW) * pop.total))
    let drift = pop.total - raw.reduce((a, b) => a + b, 0)
    raw[SPECIES.indexOf("Cattle")] += drift
    SPECIES.forEach((sp, i) => {
      const sex = splitSex(Math.max(0, raw[i]), `${state.slug}|${d}|${sp}|${year}|${mode}`)
      totals[sp].total += sex.total
      totals[sp].male += sex.male
      totals[sp].female += sex.female
    })
  }
  return SPECIES.map((species) => ({ species, counts: totals[species] }))
}

export function areaSummary(
  state: IndiaStateMeta,
  district: string | null,
  year: string,
  mode: HeadCountMode,
  districts: string[],
): HeadCount {
  const names = district ? [district] : districts
  return names.reduce(
    (acc, d) => {
      const c = districtHeadcount(state, d, year, mode)
      return { total: acc.total + c.total, male: acc.male + c.male, female: acc.female + c.female }
    },
    { total: 0, male: 0, female: 0 },
  )
}

export function formatIn(n: number): string {
  return n.toLocaleString("en-IN")
}
