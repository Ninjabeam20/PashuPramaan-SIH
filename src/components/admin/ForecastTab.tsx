"use client"

import React, { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { IndiaChoroplethMap } from "@/components/admin/IndiaChoroplethMap"
import { Card, SelectField, SL, TH_STYLE, amuById } from "@/components/admin/AdminShared"
import { getAdminForecast, type DemandLevel, type ForecastSeries } from "@/lib/api/dummy/admin-forecast"
import {
  MEDICINE_OPTIONS,
  PERIOD_OPTIONS,
  REGION_OPTIONS,
  SPECIES_OPTIONS,
  parseForecastSlots,
  understoodLabel,
  type ForecastSlots,
} from "@/lib/forecast/parse-slots"
import { queryKeys } from "@/lib/seed/query-keys"

const NEED_STYLE = {
  High: { bg: "#FEE2E2", text: "#B91C1C" },
  Medium: { bg: "#FEF3C7", text: "#92400E" },
  Low: { bg: "#D1FAE5", text: "#065F46" },
}

const SIGNAL_STYLE = {
  "High need": { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
  Monitor: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  Stable: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
}

function demandFill(level: Record<string, DemandLevel> | undefined, id: string): string {
  const d = level?.[id]?.demand
  if (d === "High") return "#EF4444"
  if (d === "Medium") return "#FDE047"
  if (d === "Low") return "#22C55E"
  return "#E5E7EB"
}

function demandStroke(level: Record<string, DemandLevel> | undefined, id: string): string {
  const d = level?.[id]?.demand
  if (d === "High") return "#B91C1C"
  if (d === "Medium") return "#CA8A04"
  if (d === "Low") return "#15803D"
  return "#D1D5DB"
}

function ForecastLineChart({ series }: { series: ForecastSeries[] }) {
  const W = 580, H = 168, PAD = { t: 20, r: 112, b: 32, l: 40 }
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b
  const months = series[0]?.months ?? []
  const histCount = series[0]?.hist_count ?? Math.max(months.length - 1, 1)
  const allValues = series.flatMap((s) => [
    ...s.historical,
    ...s.forecast,
    ...s.lower_bound,
    ...s.upper_bound,
  ]).filter((v): v is number => v != null)
  const minV = allValues.length ? Math.min(...allValues) * 0.92 : 0
  const maxV = allValues.length ? Math.max(...allValues) * 1.05 : 1
  const span = Math.max(maxV - minV, 0.001)
  const last = Math.max(months.length - 1, 1)
  const toX = (i: number) => PAD.l + (i / last) * cw
  const toY = (v: number) => PAD.t + ch - ((v - minV) / span) * ch
  const sepX = toX(histCount - 0.5)
  const showBand = series.length === 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={PAD.l} y1={PAD.t + ch * (1 - f)} x2={W - PAD.r} y2={PAD.t + ch * (1 - f)} stroke="#F3F0EB" strokeWidth="1" />
      ))}
      <line x1={sepX} y1={PAD.t - 8} x2={sepX} y2={H - PAD.b + 4} stroke="#E8E4DC" strokeWidth="1" strokeDasharray="3,2" />
      <text x={sepX - 6} y={PAD.t - 2} textAnchor="end" style={{ fontSize: 8, fill: "#9CA3AF" }}>Historical</text>
      <text x={sepX + 6} y={PAD.t - 2} textAnchor="start" style={{ fontSize: 8, fill: "#9CA3AF" }}>Forecast →</text>
      <rect x={sepX} y={PAD.t - 8} width={Math.max(W - PAD.r - sepX, 0)} height={ch + 12} fill="#F5F3EE" opacity="0.5" />
      {showBand && series.map((s) => {
        const up: string[] = []
        const down: string[] = []
        s.upper_bound.forEach((hi, i) => {
          const lo = s.lower_bound[i]
          if (hi == null || lo == null) return
          up.push(`${toX(i)},${toY(hi)}`)
          down.push(`${toX(i)},${toY(lo)}`)
        })
        if (!up.length) return null
        return <polygon key={`${s.name}-band`} points={[...up, ...down.reverse()].join(" ")} fill={s.color} opacity="0.12" />
      })}
      {series.map((s) => {
        const histPts = s.historical
          .map((v, i) => (v == null ? null : `${toX(i)},${toY(v)}`))
          .filter(Boolean)
          .join(" ")
        const foreIdx = s.forecast
          .map((v, i) => (v == null ? null : { i, v }))
          .filter((p): p is { i: number; v: number } => p != null)
        const forePts = foreIdx.map((p) => `${toX(p.i)},${toY(p.v)}`).join(" ")
        const end = foreIdx[foreIdx.length - 1]
        return (
          <g key={s.name}>
            <polyline points={histPts} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" />
            <polyline points={forePts} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="4,3" />
            {end ? <circle cx={toX(end.i)} cy={toY(end.v)} r="3" fill={s.color} /> : null}
          </g>
        )
      })}
      {months.map((m, i) => (
        <text key={`${m}-${i}`} x={toX(i)} y={H - PAD.b + 12} textAnchor="middle" style={{ fontSize: 7, fill: "#9CA3AF" }}>{m}</text>
      ))}
      {series.map((s, i) => (
        <g key={s.name} transform={`translate(${W - PAD.r + 8}, ${PAD.t + i * 20})`}>
          <line x1="0" y1="5" x2="16" y2="5" stroke={s.color} strokeWidth="1.8" />
          <text x="20" y="9" style={{ fontSize: 9, fill: "#374151" }}>{s.name}</text>
        </g>
      ))}
    </svg>
  )
}

function DemandMap({
  demandLevel,
  highlightId,
  onHover,
}: {
  demandLevel: Record<string, DemandLevel>
  highlightId: string | null
  onHover: (id: string | null) => void
}) {
  return (
    <IndiaChoroplethMap
      highlightId={highlightId}
      onHover={onHover}
      getFill={(id) => demandFill(demandLevel, id)}
      getStroke={(id) => demandStroke(demandLevel, id)}
      legendTitle="Predicted Demand"
      legendItems={[
        { color: "#EF4444", label: "High" },
        { color: "#FDE047", label: "Medium" },
        { color: "#22C55E", label: "Low" },
        { color: "#E5E7EB", label: "No series" },
      ]}
      renderTip={(id, geoName) => {
        const d = demandLevel[id]
        const title = amuById[id]?.state ?? geoName
        if (!d) return <p style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>{title}</p>
        return (
          <>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, marginBottom: 6 }}>{title}</p>
            {([
              { k: "Predicted Demand", v: d.demand },
              { k: "Expected Change", v: d.change > 0 ? `↑ ${d.change}%` : d.change < 0 ? `↓ ${Math.abs(d.change)}%` : "Stable" },
              { k: "Planning Signal", v: d.signal },
            ]).map(({ k, v }) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, marginBottom: 3 }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{k}</span>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </>
        )
      }}
    />
  )
}

export function ForecastTab() {
  const [medicine, setMedicine] = useState<string>("All Medicines")
  const [species, setSpecies] = useState<string>("All Species")
  const [region, setRegion] = useState<string>("All Regions")
  const [period, setPeriod] = useState<string>("Next 30 days")
  const [prompt, setPrompt] = useState("")
  const [understood, setUnderstood] = useState<string>("")
  const [hoverId, setHoverId] = useState<string | null>(null)

  const query: ForecastSlots = useMemo(
    () => ({ medicine, species, region, period }),
    [medicine, species, region, period],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminForecast(query),
    queryFn: () => getAdminForecast(query),
  })

  const applyPrompt = () => {
    const parsed = parseForecastSlots(prompt, query)
    setMedicine(parsed.slots.medicine)
    setSpecies(parsed.slots.species)
    setRegion(parsed.slots.region)
    setPeriod(parsed.slots.period)
    setUnderstood(understoodLabel(parsed.understood))
  }

  const selectedStateId = (
    {
      Maharashtra: "MH",
      Gujarat: "GJ",
      Rajasthan: "RJ",
      Punjab: "PB",
      Karnataka: "KA",
    } as Record<string, string>
  )[region] ?? null

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-7 pb-12">
      <div style={{ marginBottom: 20 }}>
        <SL>Researcher · Decision Support</SL>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "4px 0 4px" }}>Forecast & Planning</h1>
        <p style={{ fontSize: 13, color: "#6B7280" }}>Predict antimicrobial demand and support regional resource planning.</p>
      </div>

      <Card style={{ padding: "14px 18px", marginBottom: 16 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Ask for a slice
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              applyPrompt()
            }
          }}
          placeholder={"oxytetracycline in Maharashtra next 90 days\nor: medicine include ONE of oxytetracycline"}
          rows={3}
          style={{
            width: "100%", marginTop: 6, resize: "vertical", boxSizing: "border-box",
            background: "#fff", border: "1px solid #E8E4DC", borderRadius: 6,
            padding: "8px 10px", fontSize: 13, color: "#111827", fontFamily: "inherit", outline: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <p style={{ fontSize: 11, color: "#9CA3AF" }}>
            {understood || "Fills the four filters below. Does not invent forecast numbers."}
          </p>
          <button
            type="button"
            onClick={applyPrompt}
            style={{
              fontSize: 12, fontWeight: 600, color: "#fff", background: "#1A3A25",
              border: "none", borderRadius: 6, padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Apply filters
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end", marginTop: 14 }}>
          <SelectField label="Medicine" value={medicine} options={[...MEDICINE_OPTIONS]} onChange={setMedicine} />
          <SelectField label="Species" value={species} options={[...SPECIES_OPTIONS]} onChange={setSpecies} />
          <SelectField label="Region" value={region} options={[...REGION_OPTIONS]} onChange={setRegion} />
          <SelectField label="Forecast Period" value={period} options={[...PERIOD_OPTIONS]} onChange={setPeriod} />
        </div>
      </Card>

      {isLoading && (
        <Card style={{ padding: "28px 20px", marginBottom: 16, textAlign: "center", color: "#6B7280", fontSize: 13 }}>
          Fitting exponential smoothing on the selected slice…
        </Card>
      )}
      {isError && (
        <Card style={{ padding: "16px 20px", marginBottom: 16, color: "#B91C1C", fontSize: 13 }}>
          Could not load the forecast. Is the API running? {error instanceof Error ? error.message : ""}
        </Card>
      )}

      {data && !data.insufficient_data && (
        <>
          <Card style={{ padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <SL>{data.title}</SL>
                <p style={{ fontSize: 12, color: "#6B7280" }}>
                  Historical AMU ({data.unit} active ingredient) with {period.toLowerCase()} projection
                  {data.series[0] ? ` · ${data.series[0].model.replaceAll("_", " ")}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 2, background: "#374151" }} /><span style={{ fontSize: 11, color: "#6B7280" }}>Historical</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 2, background: "#374151", borderTop: "2px dashed #374151" }} /><span style={{ fontSize: 11, color: "#6B7280" }}>Forecast</span>
                </div>
              </div>
            </div>
            {data.series.length > 0 && <ForecastLineChart series={data.series} />}
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
              {data.unit_note} Forecast is model-assisted and intended for planning purposes only. Human review is required before any procurement or allocation decisions.
            </p>
          </Card>

          <Card style={{ overflow: "hidden", overflowX: "auto", marginBottom: 16 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #E8E4DC", minWidth: 500 }}>
              <SL>Medicine Forecast Summary</SL>
              <p style={{ fontSize: 12, color: "#6B7280" }}>{period} · {species} · {region}</p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  {["Medicine", "Predicted Need", "Change", "Recommendation", "Expected"].map((h, i) => (
                    <th key={h} style={{ ...TH_STYLE, textAlign: i > 0 ? "center" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.summary.map((row, i) => {
                  const ns = NEED_STYLE[row.need]
                  const cp = row.change > 0 ? { bg: "#FEE2E2", text: "#B91C1C", label: `↑ ${row.change}%` }
                    : row.change < 0 ? { bg: "#D1FAE5", text: "#065F46", label: `↓ ${Math.abs(row.change)}%` }
                    : { bg: "#F3F4F6", text: "#6B7280", label: "→ Stable" }
                  const color = data.series.find((s) => s.name === row.medicine)?.color ?? "#6B7280"
                  return (
                    <tr key={row.medicine} style={{ borderBottom: "1px solid #F3F0EB", background: i % 2 === 0 ? "#fff" : "#FDFCFA" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{row.medicine}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: ns.bg, color: ns.text, padding: "2px 10px", borderRadius: 10 }}>{row.need}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, background: cp.bg, color: cp.text, padding: "2px 8px", borderRadius: 10 }}>{cp.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 500, background: row.recBg, color: row.recColor, padding: "3px 10px", borderRadius: 10 }}>{row.rec}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: "#374151" }}>
                        {row.expected_kg.toFixed(2)} kg · ~{row.expected_packs.toLocaleString()} packs
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Regional Demand Outlook</h2>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              State-level predicted demand for the {period.toLowerCase()} ({medicine}, {species.toLowerCase()}). Hover a state for details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card style={{ padding: 16, overflow: "hidden" }}>
              <div style={{ marginBottom: 8 }}><SL>Predicted Demand Map</SL></div>
              <DemandMap
                demandLevel={data.demand_level}
                highlightId={hoverId ?? selectedStateId ?? null}
                onHover={setHoverId}
              />
            </Card>
            <Card style={{ overflow: "hidden", overflowX: "auto" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #E8E4DC", minWidth: 500 }}><SL>Planning Signals by State</SL></div>
              <div style={{ overflowY: "auto", overflowX: "auto", maxHeight: 412 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr>
                      {["State", "Predicted", "Current AMU", "Change", "Signal"].map((h, i) => (
                        <th key={h} style={{ ...TH_STYLE, textAlign: i > 0 ? "center" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.regional_planning.map((row, i) => {
                      const ns = NEED_STYLE[row.predDemand]
                      const na = NEED_STYLE[row.currentAmu]
                      const ss = SIGNAL_STYLE[row.signal]
                      const cp = row.change > 0 ? { bg: "#FEE2E2", text: "#B91C1C", label: `↑ ${row.change}%` }
                        : row.change < 0 ? { bg: "#D1FAE5", text: "#065F46", label: `↓ ${Math.abs(row.change)}%` }
                        : { bg: "#F3F4F6", text: "#6B7280", label: "→ Stable" }
                      const active = (hoverId ?? selectedStateId) === row.id
                      return (
                        <tr
                          key={row.id}
                          onMouseEnter={() => setHoverId(row.id)}
                          onMouseLeave={() => setHoverId(null)}
                          style={{ borderBottom: "1px solid #F3F0EB", background: active ? "#F5F3EE" : i % 2 === 0 ? "#fff" : "#FDFCFA", transition: "background 0.1s" }}
                        >
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: demandFill(data.demand_level, row.id), border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{row.state}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, background: ns.bg, color: ns.text, padding: "2px 7px", borderRadius: 10 }}>{row.predDemand}</span>
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, background: na.bg, color: na.text, padding: "2px 7px", borderRadius: 10 }}>{row.currentAmu}</span>
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, background: cp.bg, color: cp.text, padding: "2px 8px", borderRadius: 10 }}>{cp.label}</span>
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: ss.bg, padding: "2px 8px", borderRadius: 10 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: ss.text }}>{row.signal}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {data?.insufficient_data && (
        <Card style={{ padding: "16px 20px", marginBottom: 16, fontSize: 13, color: "#6B7280" }}>
          Not enough history in this slice to fit a forecast (need at least 8 months).
        </Card>
      )}

      <Card style={{ padding: "16px 20px", borderLeft: "4px solid #E8E4DC" }}>
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-14">
          <div className="flex-1">
            <SL>AI-Assisted Resource Planning</SL>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, marginTop: 6, maxWidth: 720 }}>
              The forecast highlights where antimicrobial demand may rise. Human decision-makers use this information to plan availability and support.
              The model does not allocate subsidies, make enforcement decisions, or prescribe drugs. It is decision support only.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 md:mt-0 mt-2">
            {["Model does not allocate subsidies", "Model does not make enforcement decisions", "Model does not prescribe drugs"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
