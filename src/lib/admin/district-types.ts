import type { FeatureCollection, Geometry } from "geojson"

export type DistrictFeatureCollection = FeatureCollection<Geometry, { district: string }>
