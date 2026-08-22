/**
 * Download per-state district GeoJSON (udit-001/india-maps-data), simplify,
 * rewind for d3-geo, and write src/data/districts/<slug>.json
 */
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const RAW = path.join(ROOT, ".tmp-districts")
const OUT = path.join(ROOT, "src/data/districts")
const CDN = "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/geojson/states"

/** @type {{ slug: string, files: string[], keep?: string[] }[]} */
const JOBS = [
  { slug: "andhra-pradesh", files: ["andhra-pradesh"] },
  { slug: "arunachal-pradesh", files: ["arunachal-pradesh"] },
  { slug: "assam", files: ["assam"] },
  { slug: "bihar", files: ["bihar"] },
  { slug: "chandigarh", files: ["chandigarh"] },
  { slug: "chhattisgarh", files: ["chhattisgarh"] },
  { slug: "dadra-and-nagar-haveli", files: ["dnh-and-dd"], keep: ["Dadra and Nagar Haveli"] },
  { slug: "daman-and-diu", files: ["dnh-and-dd"], keep: ["Daman", "Diu"] },
  { slug: "delhi", files: ["delhi"] },
  { slug: "goa", files: ["goa"] },
  { slug: "gujarat", files: ["gujarat"] },
  { slug: "haryana", files: ["haryana"] },
  { slug: "himachal-pradesh", files: ["himachal-pradesh"] },
  { slug: "jammu-and-kashmir", files: ["jammu-and-kashmir", "ladakh"] },
  { slug: "jharkhand", files: ["jharkhand"] },
  { slug: "karnataka", files: ["karnataka"] },
  { slug: "kerala", files: ["kerala"] },
  { slug: "madhya-pradesh", files: ["madhya-pradesh"] },
  { slug: "maharashtra", files: ["maharashtra"] },
  { slug: "manipur", files: ["manipur"] },
  { slug: "meghalaya", files: ["meghalaya"] },
  { slug: "mizoram", files: ["mizoram"] },
  { slug: "nagaland", files: ["nagaland"] },
  { slug: "odisha", files: ["odisha"] },
  { slug: "pondicherry", files: ["puducherry"] },
  { slug: "punjab", files: ["punjab"] },
  { slug: "rajasthan", files: ["rajasthan"] },
  { slug: "sikkim", files: ["sikkim"] },
  { slug: "tamil-nadu", files: ["tamil-nadu"] },
  { slug: "telangana", files: ["telangana"] },
  { slug: "tripura", files: ["tripura"] },
  { slug: "uttar-pradesh", files: ["uttar-pradesh"] },
  { slug: "uttarakhand", files: ["uttarakhand"] },
  { slug: "west-bengal", files: ["west-bengal"] },
]

async function download(name) {
  const dest = path.join(RAW, `${name}.geojson`)
  if (existsSync(dest)) return dest
  const url = `${CDN}/${name}.geojson`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  return dest
}

function rewindGeom(g) {
  const rev = (ring) => ring.slice().reverse()
  if (g.type === "Polygon") g.coordinates = g.coordinates.map(rev)
  else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map((poly) => poly.map(rev))
}

function simplify(input, output) {
  execFileSync(
    "npx",
    [
      "--yes",
      "mapshaper",
      "-i",
      input,
      "-simplify",
      "visvalingam",
      "5%",
      "keep-shapes",
      "-filter-fields",
      "district",
      "-clean",
      "-o",
      "format=geojson",
      "precision=0.001",
      output,
    ],
    { cwd: ROOT, stdio: "pipe" },
  )
}

await mkdir(RAW, { recursive: true })
await mkdir(OUT, { recursive: true })

const needed = [...new Set(JOBS.flatMap((j) => j.files))]
for (let i = 0; i < needed.length; i += 6) {
  await Promise.all(needed.slice(i, i + 6).map(download))
  console.log(`downloaded ${Math.min(i + 6, needed.length)}/${needed.length}`)
}

for (const job of JOBS) {
  const merged = { type: "FeatureCollection", features: [] }
  for (const file of job.files) {
    const raw = JSON.parse(await readFile(path.join(RAW, `${file}.geojson`), "utf8"))
    merged.features.push(...raw.features)
  }
  if (job.keep) {
    const allow = new Set(job.keep)
    merged.features = merged.features.filter((f) => allow.has(f.properties.district))
  }
  const tmpIn = path.join(RAW, `merge-${job.slug}.geojson`)
  const tmpOut = path.join(RAW, `simple-${job.slug}.geojson`)
  await writeFile(tmpIn, JSON.stringify(merged))
  simplify(tmpIn, tmpOut)
  const simple = JSON.parse(await readFile(tmpOut, "utf8"))
  const cleaned = {
    type: "FeatureCollection",
    features: simple.features.map((f) => {
      rewindGeom(f.geometry)
      return {
        type: "Feature",
        properties: { district: String(f.properties.district ?? f.properties.DISTRICT ?? "Unknown") },
        geometry: f.geometry,
      }
    }),
  }
  const dest = path.join(OUT, `${job.slug}.json`)
  await writeFile(dest, JSON.stringify(cleaned))
  const kb = Math.round(Buffer.byteLength(JSON.stringify(cleaned)) / 1024)
  console.log(`${job.slug}: ${cleaned.features.length} districts, ${kb} KB`)
}
