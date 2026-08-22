"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { DistrictFeatureCollection } from "@/lib/admin/district-types"
import { INDIA_STATES, type IndiaStateMeta } from "@/lib/admin/india-geo"
import { areaSummary, formatIn, speciesBreakdown, type HeadCountMode } from "@/lib/admin/state-stats"
import { StateDistrictMap } from "@/components/admin/StateDistrictMap"

const YEARS = ["2026", "2025", "2024", "2023", "2022"]

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 5, letterSpacing: "0.04em" }}>{label}</p>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            background: "#fff",
            border: "1px solid #CBD5E1",
            borderRadius: 4,
            padding: "8px 30px 8px 10px",
            fontSize: 13,
            fontWeight: 500,
            color: "#111827",
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
            minWidth: 180,
          }}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}

export function StateRegionView({
  state,
  geo,
}: {
  state: IndiaStateMeta
  geo: DistrictFeatureCollection
}) {
  const router = useRouter()
  const districts = useMemo(
    () =>
      [...new Set(geo.features.map((f) => f.properties.district))].sort((a, b) => a.localeCompare(b)),
    [geo],
  )
  const [district, setDistrict] = useState<string | null>(null)
  const [year, setYear] = useState("2026")
  const [mode, setMode] = useState<HeadCountMode>("individual")

  const summary = areaSummary(state, district, year, mode, districts)
  const species = speciesBreakdown(state, district, year, mode, districts)

  return (
    <div style={{ background: "#F5F3EE", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #E8E4DC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 52,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#1A2E24",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2C5.6 2 4 3.8 4 6c0 1.4.6 2.6 1.6 3.4L4.4 14h7.2l-1.2-4.6C11.4 8.6 12 7.4 12 6c0-2.2-1.6-4-4-4z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>PashuPramaan</span>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#2D6A4F",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            Admin
          </button>
          <span style={{ color: "#D1D5DB" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{state.name}</span>
        </div>
        <span style={{ fontSize: 12, color: "#6B7280" }}>Dummy livestock register · {year}</span>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 24px 48px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8E4DC",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <SelectField
            label="State"
            value={state.name}
            options={INDIA_STATES.map((s) => s.name)}
            onChange={(name) => {
              const next = INDIA_STATES.find((s) => s.name === name)
              if (next) router.push(`/admin/states/${next.slug}`)
            }}
          />
          <SelectField
            label="District"
            value={district ?? "Please select District"}
            options={["Please select District", ...districts]}
            onChange={(v) => setDistrict(v === "Please select District" ? null : v)}
          />
          <SelectField label="Year" value={year} options={YEARS} onChange={setYear} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 5, letterSpacing: "0.04em" }}>
              Category
            </p>
            <div style={{ display: "flex", border: "1px solid #CBD5E1", borderRadius: 4, overflow: "hidden" }}>
              {(["individual", "flock"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: mode === m ? "#1E3A5F" : "#fff",
                    color: mode === m ? "#fff" : "#374151",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.9fr) minmax(360px, 1.2fr)", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "#1E3A5F", color: "#fff", padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>
                Area{district ? ` · ${district}` : ` · ${state.name}`}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {(
                    [
                      ["Total", summary.total],
                      ["Total Male", summary.male],
                      ["Total Female", summary.female],
                    ] as const
                  ).map(([label, value], i) => (
                    <tr key={label} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                      <td style={{ padding: "8px 14px", fontSize: 13, color: "#111827", fontWeight: 600 }}>{label}</td>
                      <td
                        style={{
                          padding: "8px 14px",
                          fontSize: 13,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          color: "#111827",
                        }}
                      >
                        {formatIn(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "#1E3A5F", color: "#fff", padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>
                Species Details
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Species", "Total", "Male", "Female"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === "Species" ? "left" : "right",
                            padding: "8px 12px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#1E3A5F",
                            background: "#E8EEF6",
                            borderBottom: "1px solid #D6DEE8",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {species.map((row, i) => (
                      <tr key={row.species} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                        <td style={{ padding: "7px 12px", fontSize: 13, color: "#111827" }}>{row.species}</td>
                        <td style={{ padding: "7px 12px", fontSize: 13, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {formatIn(row.counts.total)}
                        </td>
                        <td style={{ padding: "7px 12px", fontSize: 13, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {formatIn(row.counts.male)}
                        </td>
                        <td style={{ padding: "7px 12px", fontSize: 13, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {formatIn(row.counts.female)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 8, overflow: "hidden" }}>
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid #E8E4DC",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  District map
                </p>
                <p style={{ fontSize: 13, color: "#6B7280" }}>
                  Hover a region for headcount · click to pin a district
                </p>
              </div>
              <p style={{ fontSize: 12, color: "#6B7280" }}>{districts.length} regions</p>
            </div>
            <StateDistrictMap
              state={state}
              geo={geo}
              year={year}
              mode={mode}
              selectedDistrict={district}
              onSelect={setDistrict}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
