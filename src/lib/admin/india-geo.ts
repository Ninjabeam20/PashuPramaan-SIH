/**
 * Maps GeoJSON state names → dummy REGION_DATA / DEMAND_LEVEL ids, labels, and
 * district-page slugs.
 * Mainland states from click_that_hood (simplified; rings rewound for d3-geo).
 * Jammu and Kashmir uses the pre-2019 unified outline (J&K + Ladakh, including
 * the official northern claim). Arunachal Pradesh uses the official eastern
 * outline. North-East states share dummy AMU id `NE` but each has its own
 * abbreviation and district page. Islands omitted so the mainland fills the frame.
 */

export type IndiaStateMeta = {
  slug: string
  name: string
  geoName: string
  abbr: string
  /** Dummy AMU/demand series id; several NE states share `NE`. */
  regionId: string | null
}

export const INDIA_STATES: IndiaStateMeta[] = [
  { slug: "andhra-pradesh", name: "Andhra Pradesh", geoName: "Andhra Pradesh", abbr: "AP", regionId: "AP" },
  { slug: "arunachal-pradesh", name: "Arunachal Pradesh", geoName: "Arunachal Pradesh", abbr: "AR", regionId: "NE" },
  { slug: "assam", name: "Assam", geoName: "Assam", abbr: "AS", regionId: "NE" },
  { slug: "bihar", name: "Bihar", geoName: "Bihar", abbr: "BR", regionId: "BR" },
  { slug: "chandigarh", name: "Chandigarh", geoName: "Chandigarh", abbr: "CH", regionId: null },
  { slug: "chhattisgarh", name: "Chhattisgarh", geoName: "Chhattisgarh", abbr: "CG", regionId: "CG" },
  { slug: "dadra-and-nagar-haveli", name: "Dadra and Nagar Haveli", geoName: "Dadra and Nagar Haveli", abbr: "DN", regionId: null },
  { slug: "daman-and-diu", name: "Daman and Diu", geoName: "Daman and Diu", abbr: "DD", regionId: null },
  { slug: "delhi", name: "Delhi", geoName: "Delhi", abbr: "DL", regionId: "DL" },
  { slug: "goa", name: "Goa", geoName: "Goa", abbr: "GA", regionId: "GA" },
  { slug: "gujarat", name: "Gujarat", geoName: "Gujarat", abbr: "GJ", regionId: "GJ" },
  { slug: "haryana", name: "Haryana", geoName: "Haryana", abbr: "HR", regionId: "HR" },
  { slug: "himachal-pradesh", name: "Himachal Pradesh", geoName: "Himachal Pradesh", abbr: "HP", regionId: "HP" },
  { slug: "jammu-and-kashmir", name: "Jammu and Kashmir", geoName: "Jammu and Kashmir", abbr: "JK", regionId: "JK" },
  { slug: "jharkhand", name: "Jharkhand", geoName: "Jharkhand", abbr: "JH", regionId: "JH" },
  { slug: "karnataka", name: "Karnataka", geoName: "Karnataka", abbr: "KA", regionId: "KA" },
  { slug: "kerala", name: "Kerala", geoName: "Kerala", abbr: "KL", regionId: "KL" },
  { slug: "madhya-pradesh", name: "Madhya Pradesh", geoName: "Madhya Pradesh", abbr: "MP", regionId: "MP" },
  { slug: "maharashtra", name: "Maharashtra", geoName: "Maharashtra", abbr: "MH", regionId: "MH" },
  { slug: "manipur", name: "Manipur", geoName: "Manipur", abbr: "MN", regionId: "NE" },
  { slug: "meghalaya", name: "Meghalaya", geoName: "Meghalaya", abbr: "ML", regionId: "NE" },
  { slug: "mizoram", name: "Mizoram", geoName: "Mizoram", abbr: "MZ", regionId: "NE" },
  { slug: "nagaland", name: "Nagaland", geoName: "Nagaland", abbr: "NL", regionId: "NE" },
  { slug: "odisha", name: "Odisha", geoName: "Odisha", abbr: "OD", regionId: "OD" },
  { slug: "pondicherry", name: "Puducherry", geoName: "Pondicherry", abbr: "PY", regionId: null },
  { slug: "punjab", name: "Punjab", geoName: "Punjab", abbr: "PB", regionId: "PB" },
  { slug: "rajasthan", name: "Rajasthan", geoName: "Rajasthan", abbr: "RJ", regionId: "RJ" },
  { slug: "sikkim", name: "Sikkim", geoName: "Sikkim", abbr: "SK", regionId: "NE" },
  { slug: "tamil-nadu", name: "Tamil Nadu", geoName: "Tamil Nadu", abbr: "TN", regionId: "TN" },
  { slug: "telangana", name: "Telangana", geoName: "Telangana", abbr: "TG", regionId: "TG" },
  { slug: "tripura", name: "Tripura", geoName: "Tripura", abbr: "TR", regionId: "NE" },
  { slug: "uttar-pradesh", name: "Uttar Pradesh", geoName: "Uttar Pradesh", abbr: "UP", regionId: "UP" },
  { slug: "uttarakhand", name: "Uttarakhand", geoName: "Uttarakhand", abbr: "UT", regionId: "UT" },
  { slug: "west-bengal", name: "West Bengal", geoName: "West Bengal", abbr: "WB", regionId: "WB" },
]

export const GEO_NAME_TO_ID: Record<string, string> = Object.fromEntries(
  INDIA_STATES.filter((s) => s.regionId).map((s) => [s.geoName, s.regionId as string]),
)

export const GEO_NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.geoName, s.abbr]),
)

export const GEO_NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.geoName, s.slug]),
)

/** Pixel nudge so tiny UT / Himalayan labels sit beside the polygon. */
export const LABEL_NUDGE: Record<string, [number, number]> = {
  Chandigarh: [14, -10],
  Delhi: [14, -6],
  Goa: [12, 8],
  Sikkim: [14, -4],
  Pondicherry: [16, 6],
  "Dadra and Nagar Haveli": [14, 10],
  "Daman and Diu": [-14, 8],
  Tripura: [8, 6],
  Mizoram: [10, 8],
  Nagaland: [10, -6],
  Manipur: [10, 2],
  Meghalaya: [0, 4],
  Kerala: [-6, 4],
  "Himachal Pradesh": [4, -6],
  Uttarakhand: [6, -4],
  Punjab: [-4, -2],
  Haryana: [2, 6],
}

export function geoNameToId(name: string): string | null {
  return GEO_NAME_TO_ID[name] ?? null
}

export function geoNameToAbbr(name: string): string | null {
  return GEO_NAME_TO_ABBR[name] ?? null
}

export function geoNameToSlug(name: string): string | null {
  return GEO_NAME_TO_SLUG[name] ?? null
}

export function getStateBySlug(slug: string): IndiaStateMeta | undefined {
  return INDIA_STATES.find((s) => s.slug === slug)
}

export function slugFromRegionId(regionId: string): string | null {
  if (regionId === "NE") return null
  const match = INDIA_STATES.find((s) => s.regionId === regionId)
  return match?.slug ?? null
}
