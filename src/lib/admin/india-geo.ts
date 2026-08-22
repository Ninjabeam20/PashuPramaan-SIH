/**
 * Maps GeoJSON state names → dummy REGION_DATA / DEMAND_LEVEL ids.
 * Source: click_that_hood india.geojson, simplified; rings rewound for d3-geo.
 * North-East states share dummy id `NE`. Islands omitted so the mainland fills the frame.
 */
export const GEO_NAME_TO_ID: Record<string, string> = {
  "Andhra Pradesh": "AP",
  Assam: "NE",
  Bihar: "BR",
  Chhattisgarh: "CG",
  Delhi: "DL",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "NE",
  Meghalaya: "NE",
  Mizoram: "NE",
  Nagaland: "NE",
  Odisha: "OD",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "NE",
  "Tamil Nadu": "TN",
  Telangana: "TG",
  Tripura: "NE",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UT",
  "West Bengal": "WB",
}

export const LABELED_IDS = new Set([
  "RJ", "UP", "MP", "MH", "GJ", "KA", "AP", "TN", "WB", "BR", "OD", "CG",
])

export function geoNameToId(name: string): string | null {
  return GEO_NAME_TO_ID[name] ?? null
}
