import { readFile } from "node:fs/promises"
import path from "node:path"
import { getStateBySlug } from "@/lib/admin/india-geo"
import type { DistrictFeatureCollection } from "@/lib/admin/district-types"

export type { DistrictFeatureCollection }

export async function loadDistrictGeo(slug: string): Promise<DistrictFeatureCollection | null> {
  if (!getStateBySlug(slug)) return null
  const file = path.join(process.cwd(), "src/data/districts", `${slug}.json`)
  try {
    const raw = await readFile(file, "utf8")
    return JSON.parse(raw) as DistrictFeatureCollection
  } catch {
    return null
  }
}
