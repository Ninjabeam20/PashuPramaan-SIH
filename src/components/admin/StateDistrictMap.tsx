"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { geoMercator, geoPath } from "d3"
import type { Feature, Geometry } from "geojson"
import type { DistrictFeatureCollection } from "@/lib/admin/district-types"
import { districtHeadcount, formatIn, type HeadCountMode } from "@/lib/admin/state-stats"
import type { IndiaStateMeta } from "@/lib/admin/india-geo"

const WIDTH = 640
const HEIGHT = 720

function lerpColor(t: number): string {
  const stops: [number, number, number][] = [
    [220, 252, 231],
    [134, 239, 172],
    [74, 222, 128],
    [22, 163, 74],
    [20, 83, 45],
  ]
  const x = Math.min(1, Math.max(0, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x))
  const f = x - i
  const a = stops[i]
  const b = stops[i + 1]
  const r = Math.round(a[0] + (b[0] - a[0]) * f)
  const g = Math.round(a[1] + (b[1] - a[1]) * f)
  const bl = Math.round(a[2] + (b[2] - a[2]) * f)
  return `rgb(${r},${g},${bl})`
}

function luminance(fill: string): number {
  const m = fill.match(/\d+/g)
  if (!m) return 0.5
  const [r, g, b] = m.map(Number)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function StateDistrictMap({
  state,
  geo,
  year,
  mode,
  selectedDistrict,
  onSelect,
}: {
  state: IndiaStateMeta
  geo: DistrictFeatureCollection
  year: string
  mode: HeadCountMode
  selectedDistrict: string | null
  onSelect: (district: string | null) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; district: string } | null>(null)

  useEffect(() => {
    setReady(true)
  }, [])

  const features = geo.features as Feature<Geometry, { district: string }>[]
  const pops = useMemo(() => {
    const map = new Map<string, ReturnType<typeof districtHeadcount>>()
    for (const f of features) {
      const name = f.properties.district
      map.set(name, districtHeadcount(state, name, year, mode))
    }
    return map
  }, [features, state, year, mode])

  const { min, max } = useMemo(() => {
    let lo = Infinity
    let hi = 0
    for (const c of pops.values()) {
      lo = Math.min(lo, c.total)
      hi = Math.max(hi, c.total)
    }
    if (!Number.isFinite(lo)) lo = 0
    return { min: lo, max: hi || 1 }
  }, [pops])

  const { path, labeled } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [18, 16],
        [WIDTH - 18, HEIGHT - 16],
      ],
      geo,
    )
    const generator = geoPath(projection)
    const ranked = features
      .map((f) => ({
        name: f.properties.district,
        area: Math.abs(generator.area(f)),
        total: pops.get(f.properties.district)?.total ?? 0,
      }))
      .sort((a, b) => b.total - a.total || b.area - a.area)
    const keep = features.length <= 14 ? features.length : features.length <= 36 ? 11 : 13
    const labeledNames = new Set(ranked.slice(0, keep).map((r) => r.name))
    return { path: generator, labeled: labeledNames }
  }, [features, geo, pops])

  if (!ready) {
    return (
      <div style={{ position: "relative", width: "100%", minHeight: 420, background: "#F4F7F2", borderRadius: 4 }} />
    )
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <rect width={WIDTH} height={HEIGHT} fill="#F4F7F2" rx="4" />
        {features.map((feature, i) => {
          const district = feature.properties.district
          const d = path(feature)
          if (!d) return null
          const counts = pops.get(district)
          const t = counts ? (counts.total - min) / (max - min || 1) : 0.2
          const selected = selectedDistrict === district
          const hovered = tip?.district === district
          return (
            <path
              key={`${district}-${i}`}
              d={d}
              fill={selected ? "#14532D" : lerpColor(t)}
              stroke={selected || hovered ? "#1A2E24" : "#4B5563"}
              strokeWidth={selected ? 1.8 : hovered ? 1.3 : 0.55}
              strokeLinejoin="round"
              style={{ cursor: "pointer", transition: "fill 0.12s, stroke-width 0.12s" }}
              onMouseMove={(e) => {
                const r = svgRef.current?.getBoundingClientRect()
                if (!r) return
                setTip({ x: e.clientX - r.left, y: e.clientY - r.top, district })
              }}
              onMouseLeave={() => setTip(null)}
              onClick={() => onSelect(selected ? null : district)}
            />
          )
        })}
        {features.map((feature, i) => {
          const district = feature.properties.district
          if (!labeled.has(district) && selectedDistrict !== district) return null
          const [cx, cy] = path.centroid(feature)
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null
          const selected = selectedDistrict === district
          const fill = selected ? "#14532D" : lerpColor(
            ((pops.get(district)?.total ?? min) - min) / (max - min || 1),
          )
          const dark = luminance(fill) < 0.55
          return (
            <text
              key={`l-${district}-${i}`}
              x={Math.round(cx * 10) / 10}
              y={Math.round(cy * 10) / 10}
              textAnchor="middle"
              style={{
                fontSize: district.length > 14 ? 8 : 9,
                fontFamily: "Inter, system-ui",
                fontWeight: 600,
                fill: dark ? "#F9FAFB" : "#1F2937",
                pointerEvents: "none",
                paintOrder: "stroke",
                stroke: dark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.7)",
                strokeWidth: 2,
              }}
            >
              {district}
            </text>
          )
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(255,255,255,0.94)",
          borderRadius: 6,
          padding: "7px 10px",
          border: "1px solid #E8E4DC",
        }}
      >
        <p style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          Headcount
        </p>
        {[
          { color: lerpColor(0), label: "Lower" },
          { color: lerpColor(0.5), label: "Mid" },
          { color: lerpColor(1), label: "Higher" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <div style={{ width: 9, height: 9, background: color, borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 9, color: "#6B7280" }}>{label}</span>
          </div>
        ))}
      </div>
      {tip && (
        <div
          style={{
            position: "absolute",
            left: tip.x + 12,
            top: Math.max(8, tip.y - 10),
            background: "#fff",
            borderRadius: 8,
            padding: "10px 14px",
            minWidth: 168,
            boxShadow: "0 8px 24px rgba(16,24,16,0.16)",
            border: "1px solid #E8E4DC",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 8 }}>{tip.district}</p>
          {(["Total", "Male", "Female"] as const).map((k) => {
            const c = pops.get(tip.district)
            const v = k === "Total" ? c?.total : k === "Male" ? c?.male : c?.female
            return (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 18, marginBottom: 3 }}>
                <span style={{ color: "#6B7280", fontSize: 12 }}>{k}</span>
                <span style={{ color: "#111827", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {formatIn(v ?? 0)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
