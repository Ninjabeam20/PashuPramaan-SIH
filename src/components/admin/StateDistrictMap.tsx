"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import type { FeatureCollection, Geometry } from "geojson"
import { getStateBySlug } from "@/lib/admin/india-geo"
import "leaflet/dist/leaflet.css"

interface DistrictStats {
  district: string
  amu: number
  change: number
  anomalies: number
  unexplained: number
}

const KNOWN_DISTRICTS: Record<string, Record<string, Partial<DistrictStats>>> = {
  maharashtra: {
    "Pune": { amu: 14200, change: 22, anomalies: 4, unexplained: 2 },
    "Nashik": { amu: 11800, change: 19, anomalies: 3, unexplained: 1 },
    "Nagpur": { amu: 10200, change: 17, anomalies: 2, unexplained: 0 },
    "Aurangabad": { amu: 9400, change: 24, anomalies: 3, unexplained: 1 },
    "Amravati": { amu: 7800, change: 28, anomalies: 3, unexplained: 1 },
    "Solapur": { amu: 8100, change: 21, anomalies: 2, unexplained: 0 },
    "Kolhapur": { amu: 6700, change: 12, anomalies: 1, unexplained: 0 },
    "Ahmednagar": { amu: 9200, change: 16, anomalies: 2, unexplained: 1 },
    "Thane": { amu: 8900, change: 14, anomalies: 2, unexplained: 0 },
    "Satara": { amu: 6400, change: 11, anomalies: 1, unexplained: 0 },
    "Jalgaon": { amu: 7300, change: 15, anomalies: 2, unexplained: 0 },
    "Nanded": { amu: 6900, change: 18, anomalies: 2, unexplained: 1 },
    "Sangli": { amu: 5800, change: 9, anomalies: 1, unexplained: 0 },
    "Yavatmal": { amu: 5200, change: 13, anomalies: 1, unexplained: 0 },
    "Latur": { amu: 4900, change: 10, anomalies: 1, unexplained: 0 },
    "Chandrapur": { amu: 4700, change: 8, anomalies: 1, unexplained: 0 },
    "Beed": { amu: 4400, change: 12, anomalies: 1, unexplained: 0 },
    "Buldhana": { amu: 4100, change: 7, anomalies: 1, unexplained: 0 },
    "Parbhani": { amu: 3800, change: 9, anomalies: 1, unexplained: 0 },
    "Jalna": { amu: 3600, change: 8, anomalies: 1, unexplained: 0 },
    "Raigad": { amu: 3400, change: 6, anomalies: 1, unexplained: 0 },
    "Osmanabad": { amu: 3200, change: 5, anomalies: 0, unexplained: 0 },
    "Nandurbar": { amu: 3100, change: 7, anomalies: 0, unexplained: 0 },
    "Wardha": { amu: 2900, change: 4, anomalies: 0, unexplained: 0 },
    "Dhule": { amu: 2800, change: 5, anomalies: 0, unexplained: 0 },
    "Gondia": { amu: 2600, change: 3, anomalies: 0, unexplained: 0 },
    "Bhandara": { amu: 2500, change: 4, anomalies: 0, unexplained: 0 },
    "Washim": { amu: 2400, change: 5, anomalies: 0, unexplained: 0 },
    "Hingoli": { amu: 2200, change: 3, anomalies: 0, unexplained: 0 },
    "Gadchiroli": { amu: 2100, change: 2, anomalies: 0, unexplained: 0 },
    "Ratnagiri": { amu: 1900, change: 3, anomalies: 0, unexplained: 0 },
    "Sindhudurg": { amu: 1600, change: 2, anomalies: 0, unexplained: 0 },
    "Palghar": { amu: 2700, change: 4, anomalies: 0, unexplained: 0 },
    "Mumbai": { amu: 1200, change: 1, anomalies: 0, unexplained: 0 },
  },
  gujarat: {
    "Kachchh": { amu: 12400, change: 18, anomalies: 3, unexplained: 1 },
    "Ahmedabad": { amu: 8920, change: 11, anomalies: 2, unexplained: 0 },
    "Rajkot": { amu: 9100, change: 15, anomalies: 2, unexplained: 1 },
    "Surat": { amu: 7840, change: 8, anomalies: 1, unexplained: 0 },
    "Vadodara": { amu: 6800, change: 6, anomalies: 1, unexplained: 0 },
    "Bhavnagar": { amu: 7200, change: 12, anomalies: 2, unexplained: 0 },
    "Jamnagar": { amu: 5600, change: 9, anomalies: 1, unexplained: 0 },
    "Junagadh": { amu: 4900, change: 14, anomalies: 1, unexplained: 0 },
  },
  "uttar-pradesh": {
    "Lucknow": { amu: 12400, change: 16, anomalies: 3, unexplained: 1 },
    "Agra": { amu: 10800, change: 21, anomalies: 4, unexplained: 2 },
    "Kanpur": { amu: 11200, change: 18, anomalies: 3, unexplained: 1 },
    "Varanasi": { amu: 9600, change: 14, anomalies: 2, unexplained: 1 },
    "Meerut": { amu: 8900, change: 22, anomalies: 3, unexplained: 1 },
    "Bareilly": { amu: 7400, change: 11, anomalies: 2, unexplained: 0 },
    "Allahabad": { amu: 8200, change: 19, anomalies: 2, unexplained: 1 },
    "Gorakhpur": { amu: 7100, change: 15, anomalies: 2, unexplained: 1 },
  },
  rajasthan: {
    "Jaipur": { amu: 14600, change: 28, anomalies: 3, unexplained: 2 },
    "Jodhpur": { amu: 12800, change: 33, anomalies: 3, unexplained: 2 },
    "Bikaner": { amu: 11200, change: 31, anomalies: 2, unexplained: 1 },
    "Udaipur": { amu: 9800, change: 24, anomalies: 2, unexplained: 1 },
    "Kota": { amu: 10200, change: 29, anomalies: 2, unexplained: 1 },
    "Ajmer": { amu: 8900, change: 26, anomalies: 2, unexplained: 0 },
  },
}

function getDistrictStats(stateSlug: string, districtName: string): DistrictStats {
  const known = KNOWN_DISTRICTS[stateSlug]?.[districtName]
  if (known) {
    return {
      district: districtName,
      amu: known.amu ?? 4500,
      change: known.change ?? 12,
      anomalies: known.anomalies ?? 1,
      unexplained: known.unexplained ?? 0,
    }
  }

  let hash = 0
  for (let i = 0; i < districtName.length; i++) {
    hash = (hash * 31 + districtName.charCodeAt(i)) >>> 0
  }
  const amu = 2000 + (hash % 11000)
  const change = 3 + (hash % 28)
  const anomalies = hash % 5
  const unexplained = anomalies > 0 ? (hash % 2) : 0

  return {
    district: districtName,
    amu,
    change,
    anomalies,
    unexplained,
  }
}

function districtColor(amu: number): string {
  if (amu >= 12000) return "#EF4444"
  if (amu >= 9000)  return "#FB923C"
  if (amu >= 6000)  return "#FDE047"
  if (amu >= 3500)  return "#86EFAC"
  return "#22C55E"
}

export function StateDistrictMap({
  stateSlug,
  stateName,
  highlightDistrict,
  onHoverDistrict,
  onClickDistrict,
  onBack,
}: {
  stateSlug: string
  stateName?: string
  highlightDistrict?: string | null
  onHoverDistrict?: (district: string | null) => void
  onClickDistrict?: (district: string) => void
  onBack?: () => void
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const geoLayerRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [districtCount, setDistrictCount] = useState(0)

  const displayName = useMemo(() => {
    if (stateName) return stateName
    const stateMeta = getStateBySlug(stateSlug)
    return stateMeta ? stateMeta.name : stateSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  }, [stateName, stateSlug])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function initLeafletMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [leafletModule, geoJsonModule] = await Promise.all([
          import("leaflet" as string),
          import(`@/data/districts/${stateSlug}.json`),
        ])

        if (cancelled || !mapContainerRef.current) return

        const L = (leafletModule.default || leafletModule) as any
        const geoData = (geoJsonModule.default || geoJsonModule) as FeatureCollection<Geometry, { district: string }>
        setDistrictCount(geoData.features?.length || 0)

        // Clean up previous map instance if exists
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Initialize Leaflet Map
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: true,
          dragging: true,
        })

        mapInstanceRef.current = map

        // Create Leaflet GeoJSON layer
        const geoLayer = L.geoJSON(geoData, {
          style: (feature: any) => {
            const dName = feature?.properties?.district ?? ""
            const isHighlighted = highlightDistrict === dName
            const stats = getDistrictStats(stateSlug, dName)

            return {
              fillColor: isHighlighted ? "#2D6A4F" : districtColor(stats.amu),
              weight: isHighlighted ? 2 : 1,
              opacity: 1,
              color: isHighlighted ? "#1A4030" : "rgba(255, 255, 255, 0.9)",
              fillOpacity: 0.9,
            }
          },
          onEachFeature: (feature: any, layer: any) => {
            const dName = feature?.properties?.district ?? ""
            const stats = getDistrictStats(stateSlug, dName)

            // Bind floating tooltip
            const tooltipHtml = `
              <div style="font-family: Inter, system-ui, sans-serif; padding: 2px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; gap: 12px;">
                  <strong style="color: #fff; font-size: 13px;">${stats.district}</strong>
                  <span style="color: rgba(255,255,255,0.5); font-size: 10px;">${displayName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 3px;">
                  <span style="color: rgba(255,255,255,0.55); font-size: 11px;">AMU Volume</span>
                  <strong style="color: #fff; font-family: monospace; font-size: 11px;">${stats.amu.toLocaleString()}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 3px;">
                  <span style="color: rgba(255,255,255,0.55); font-size: 11px;">Change vs prev.</span>
                  <strong style="color: #F97316; font-size: 11px;">↑ ${stats.change}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 3px;">
                  <span style="color: rgba(255,255,255,0.55); font-size: 11px;">Active Anomalies</span>
                  <strong style="color: #fff; font-size: 11px;">${stats.anomalies}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; gap: 16px;">
                  <span style="color: rgba(255,255,255,0.55); font-size: 11px;">Unexplained</span>
                  <strong style="color: ${stats.unexplained > 0 ? "#F87171" : "rgba(255,255,255,0.5)"}; font-size: 11px;">${stats.unexplained > 0 ? stats.unexplained : "0"}</strong>
                </div>
              </div>
            `

            layer.bindTooltip(tooltipHtml, {
              className: "custom-leaflet-tooltip",
              sticky: true,
              direction: "auto",
              opacity: 1,
            })

            layer.on({
              mouseover: (e: any) => {
                const target = e.target
                target.setStyle({
                  fillColor: "#2D6A4F",
                  color: "#1A4030",
                  weight: 2,
                  fillOpacity: 1,
                })
                target.bringToFront()
                onHoverDistrict?.(dName)
              },
              mouseout: (e: any) => {
                geoLayer.resetStyle(e.target)
                onHoverDistrict?.(null)
              },
              click: () => {
                onClickDistrict?.(dName)
              },
            })
          },
        }).addTo(map)

        geoLayerRef.current = geoLayer

        // Automatically center and fit whole state
        const bounds = geoLayer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [18, 18] })
        }

        setLoading(false)
      } catch (err) {
        console.error(`Leaflet error for ${stateSlug}:`, err)
        if (!cancelled) setLoading(false)
      }
    }

    initLeafletMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [stateSlug, highlightDistrict])

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Global CSS for dark Leaflet tooltips */}
      <style jsx global>{`
        .custom-leaflet-tooltip.leaflet-tooltip {
          background: #1A2E24 !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28) !important;
          color: #fff !important;
        }
        .custom-leaflet-tooltip.leaflet-tooltip:before {
          display: none !important;
        }
        .leaflet-container {
          background-color: #EAF3FB !important;
          font-family: inherit !important;
        }
      `}</style>

      {/* Top Header inside Map Container */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 2px" }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: "#2D6A4F",
              background: "#fff",
              border: "1px solid #CBD5E1",
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <span>←</span> Back to India Map
          </button>
        ) : <div />}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{displayName}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", background: "#F3F0EB", padding: "2px 8px", borderRadius: 10 }}>
            {districtCount} Districts
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ position: "relative", width: "100%", height: 460, borderRadius: 6, overflow: "hidden", border: "1px solid #E2E8F0", background: "#EAF3FB" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: "#EAF3FB", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#2D6A4F" }}>Rendering {displayName} with Leaflet...</p>
          </div>
        )}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: "rgba(255,255,255,0.92)",
            borderRadius: 6,
            padding: "7px 10px",
            border: "1px solid #E8E4DC",
            zIndex: 900,
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
            District AMU
          </p>
          {[
            { color: "#22C55E", label: "< 3.5k · Low" },
            { color: "#86EFAC", label: "3.5–6k" },
            { color: "#FDE047", label: "6–9k" },
            { color: "#FB923C", label: "9–12k" },
            { color: "#EF4444", label: "> 12k · High" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <div style={{ width: 9, height: 9, background: color, borderRadius: 2, border: "1px solid rgba(0,0,0,0.1)" }} />
              <span style={{ fontSize: 9, color: "#6B7280" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

