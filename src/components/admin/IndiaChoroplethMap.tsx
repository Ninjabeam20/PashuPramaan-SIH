"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { geoMercator, geoPath } from "d3"
import type { Feature, FeatureCollection, Geometry } from "geojson"
import indiaStates from "@/data/india-states.json"
import { geoNameToAbbr, geoNameToId, LABEL_NUDGE } from "@/lib/admin/india-geo"

type IndiaFeature = Feature<Geometry, { name: string }>

const COLLECTION = indiaStates as FeatureCollection<Geometry, { name: string }>

const WIDTH = 520
const HEIGHT = 580
const NO_DATA = "#E5E7EB"
const NO_DATA_STROKE = "#D1D5DB"

export function IndiaChoroplethMap({
  highlightId,
  onHover,
  onClick,
  getFill,
  getStroke,
  legendTitle,
  legendItems,
  renderTip,
}: {
  highlightId: string | null
  onHover: (id: string | null) => void
  onClick?: (id: string, geoName: string) => void
  getFill: (id: string) => string
  getStroke: (id: string) => string
  legendTitle: string
  legendItems: { color: string; label: string }[]
  renderTip: (id: string, geoName: string) => ReactNode
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; id: string; geoName: string } | null>(null)

  useEffect(() => {
    setReady(true)
  }, [])

  const { path, features } = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [[10, 8], [WIDTH - 10, HEIGHT - 8]],
      COLLECTION,
    )
    const generator = geoPath(projection)
    return { path: generator, features: COLLECTION.features as IndiaFeature[] }
  }, [])

  if (!ready) {
    return (
      <div style={{ position: "relative", width: "100%", minHeight: 360, background: "#EAF3FB", borderRadius: 4 }} />
    )
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <rect width={WIDTH} height={HEIGHT} fill="#EAF3FB" rx="4" />
        {features.map((feature, i) => {
          const geoName = feature.properties.name
          const id = geoNameToId(geoName)
          const d = path(feature)
          if (!d) return null
          const hov = Boolean(id && highlightId === id)
          return (
            <path
              key={`${geoName}-${i}`}
              d={d}
              fill={hov ? "#2D6A4F" : id ? getFill(id) : NO_DATA}
              stroke={hov ? "#1A4030" : id ? getStroke(id) : NO_DATA_STROKE}
              strokeWidth={hov ? 1.2 : 0.5}
              strokeLinejoin="round"
              style={{ cursor: onClick ? "pointer" : "default", transition: "fill 0.12s" }}
              onMouseMove={(e) => {
                const r = svgRef.current?.getBoundingClientRect()
                if (!r) return
                setTip({ x: e.clientX - r.left, y: e.clientY - r.top, id: id ?? "", geoName })
                if (id) onHover(id)
              }}
              onMouseLeave={() => {
                setTip(null)
                onHover(null)
              }}
              onClick={() => {
                onClick?.(id ?? "", geoName)
              }}
            />
          )
        })}
        {features.map((feature, i) => {
          const geoName = feature.properties.name
          const abbr = geoNameToAbbr(geoName)
          if (!abbr) return null
          const id = geoNameToId(geoName)
          const [cx0, cy0] = path.centroid(feature)
          if (!Number.isFinite(cx0) || !Number.isFinite(cy0)) return null
          const [dx, dy] = LABEL_NUDGE[geoName] ?? [0, 0]
          const area = Math.abs(path.area(feature))
          const fontSize = area > 5000 ? 10 : area > 1800 ? 9 : area > 500 ? 8 : 7
          return (
            <text
              key={`l-${geoName}-${i}`}
              x={Math.round((cx0 + dx) * 10) / 10}
              y={Math.round((cy0 + dy) * 10) / 10}
              textAnchor="middle"
              style={{
                fontSize,
                fontFamily: "Inter, system-ui",
                fontWeight: 700,
                fill: highlightId === id ? "#fff" : "#1F2937",
                pointerEvents: "none",
                paintOrder: "stroke",
                stroke: highlightId === id ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.85)",
                strokeWidth: 2.4,
              }}
            >
              {abbr}
            </text>
          )
        })}
      </svg>
      {tip && (
        <div
          style={{
            position: "absolute",
            left: tip.x + 12,
            top: tip.y - 8,
            background: "#1A2E24",
            borderRadius: 8,
            padding: "10px 14px",
            minWidth: 160,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {tip.id ? renderTip(tip.id, tip.geoName) : (
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>{tip.geoName}</p>
          )}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          background: "rgba(255,255,255,0.92)",
          borderRadius: 6,
          padding: "7px 10px",
          border: "1px solid #E8E4DC",
        }}
      >
        <p style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          {legendTitle}
        </p>
        {legendItems.map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <div style={{ width: 9, height: 9, background: color, borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)" }} />
            <span style={{ fontSize: 9, color: "#6B7280" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
