"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { IndiaChoroplethMap } from "@/components/admin/IndiaChoroplethMap"
import { StateDistrictMap } from "@/components/admin/StateDistrictMap"
import { geoNameToSlug, slugFromRegionId } from "@/lib/admin/india-geo"

// ─── Types ───────────────────────────────────────────────────────────────────

export type TabId = "overview" | "analytics" | "anomalies" | "health" | "forecast" | "workspace"

// ─── Regional / AMU Data ──────────────────────────────────────────────────────

export interface RegionRow {
  id: string; state: string; zone: string;
  amu: number; change: number; anomalies: number; unexplained: number;
}

export const REGION_DATA: RegionRow[] = [
  { id:"UP",  state:"Uttar Pradesh",    zone:"North",  amu:94200, change:18, anomalies:22, unexplained:8 },
  { id:"RJ",  state:"Rajasthan",        zone:"North",  amu:87670, change:31, anomalies:14, unexplained:7 },
  { id:"MH",  state:"Maharashtra",      zone:"West",   amu:69420, change:23, anomalies:17, unexplained:5 },
  { id:"KA",  state:"Karnataka",        zone:"South",  amu:73380, change:8,  anomalies:6,  unexplained:1 },
  { id:"GJ",  state:"Gujarat",          zone:"West",   amu:65960, change:11, anomalies:9,  unexplained:2 },
  { id:"MP",  state:"Madhya Pradesh",   zone:"Central",amu:71200, change:15, anomalies:11, unexplained:3 },
  { id:"TN",  state:"Tamil Nadu",       zone:"South",  amu:61200, change:12, anomalies:8,  unexplained:2 },
  { id:"WB",  state:"West Bengal",      zone:"East",   amu:58900, change:9,  anomalies:7,  unexplained:3 },
  { id:"AP",  state:"Andhra Pradesh",   zone:"South",  amu:54300, change:6,  anomalies:5,  unexplained:1 },
  { id:"BR",  state:"Bihar",            zone:"East",   amu:52100, change:21, anomalies:12, unexplained:4 },
  { id:"HR",  state:"Haryana",          zone:"North",  amu:48700, change:14, anomalies:7,  unexplained:2 },
  { id:"OD",  state:"Odisha",           zone:"East",   amu:39400, change:5,  anomalies:4,  unexplained:1 },
  { id:"TG",  state:"Telangana",        zone:"South",  amu:43800, change:7,  anomalies:6,  unexplained:2 },
  { id:"PB",  state:"Punjab",           zone:"North",  amu:51340, change:-3, anomalies:4,  unexplained:0 },
  { id:"CG",  state:"Chhattisgarh",     zone:"Central",amu:36200, change:10, anomalies:4,  unexplained:1 },
  { id:"JH",  state:"Jharkhand",        zone:"East",   amu:29800, change:8,  anomalies:3,  unexplained:1 },
  { id:"HP",  state:"Himachal Pradesh", zone:"North",  amu:18200, change:4,  anomalies:2,  unexplained:0 },
  { id:"UT",  state:"Uttarakhand",      zone:"North",  amu:21400, change:6,  anomalies:2,  unexplained:0 },
  { id:"JK",  state:"J&K & Ladakh",     zone:"North",  amu:15600, change:3,  anomalies:2,  unexplained:0 },
  { id:"NE",  state:"North-East States",zone:"East",   amu:24700, change:7,  anomalies:3,  unexplained:1 },
  { id:"KL",  state:"Kerala",           zone:"South",  amu:34200, change:5,  anomalies:3,  unexplained:0 },
  { id:"GA",  state:"Goa",             zone:"West",   amu:4800,  change:2,  anomalies:1,  unexplained:0 },
]

export const amuById = Object.fromEntries(REGION_DATA.map(r => [r.id, r]))

export interface DistrictRow {
  district: string; amu: number; change: number; anomalies: number; unexplained: number;
}

export const DISTRICT_DATA: Record<string, DistrictRow[]> = {
  GJ: [
    { district:"Kachchh",   amu:12400, change:18, anomalies:3, unexplained:1 },
    { district:"Ahmedabad", amu:8920,  change:11, anomalies:2, unexplained:0 },
    { district:"Rajkot",    amu:9100,  change:15, anomalies:2, unexplained:1 },
    { district:"Surat",     amu:7840,  change:8,  anomalies:1, unexplained:0 },
    { district:"Vadodara",  amu:6800,  change:6,  anomalies:1, unexplained:0 },
    { district:"Bhavnagar", amu:7200,  change:12, anomalies:2, unexplained:0 },
    { district:"Jamnagar",  amu:5600,  change:9,  anomalies:1, unexplained:0 },
    { district:"Junagadh",  amu:4900,  change:14, anomalies:1, unexplained:0 },
  ],
  MH: [
    { district:"Pune",        amu:14200, change:22, anomalies:4, unexplained:2 },
    { district:"Nashik",      amu:11800, change:19, anomalies:3, unexplained:1 },
    { district:"Nagpur",      amu:10200, change:17, anomalies:2, unexplained:0 },
    { district:"Aurangabad",  amu:9400,  change:24, anomalies:3, unexplained:1 },
    { district:"Amravati",    amu:7800,  change:28, anomalies:3, unexplained:1 },
    { district:"Solapur",     amu:8100,  change:21, anomalies:2, unexplained:0 },
    { district:"Kolhapur",    amu:6700,  change:12, anomalies:1, unexplained:0 },
  ],
  UP: [
    { district:"Lucknow",   amu:12400, change:16, anomalies:3, unexplained:1 },
    { district:"Agra",      amu:10800, change:21, anomalies:4, unexplained:2 },
    { district:"Kanpur",    amu:11200, change:18, anomalies:3, unexplained:1 },
    { district:"Varanasi",  amu:9600,  change:14, anomalies:2, unexplained:1 },
    { district:"Meerut",    amu:8900,  change:22, anomalies:3, unexplained:1 },
    { district:"Bareilly",  amu:7400,  change:11, anomalies:2, unexplained:0 },
    { district:"Allahabad", amu:8200,  change:19, anomalies:2, unexplained:1 },
    { district:"Gorakhpur", amu:7100,  change:15, anomalies:2, unexplained:1 },
  ],
  RJ: [
    { district:"Jaipur",  amu:14600, change:28, anomalies:3, unexplained:2 },
    { district:"Jodhpur", amu:12800, change:33, anomalies:3, unexplained:2 },
    { district:"Bikaner", amu:11200, change:31, anomalies:2, unexplained:1 },
    { district:"Udaipur", amu:9800,  change:24, anomalies:2, unexplained:1 },
    { district:"Kota",    amu:10200, change:29, anomalies:2, unexplained:1 },
    { district:"Ajmer",   amu:8900,  change:26, anomalies:2, unexplained:0 },
  ],
}

// ─── Anomaly Data ─────────────────────────────────────────────────────────────

export interface AnomalyRow {
  id: string; farm: string; region: string; medicine: string;
  amuChange: number; baseline: number; healthEvent: string | null;
  status: "UNEXPLAINED" | "EXPLAINED"; severity: "HIGH" | "MEDIUM" | "LOW";
  species: string; date: string;
  // 12-month historical AMU (normalised units for chart)
  history: number[];
}

export const ANOMALY_DATA: AnomalyRow[] = [
  { id:"A001", farm:"Farm 247",       region:"Maharashtra",  medicine:"Oxytetracycline", amuChange:68, baseline:100, healthEvent:null,                  status:"UNEXPLAINED", severity:"HIGH",   species:"Dairy",   date:"24 Aug 2026", history:[98,102,97,104,99,101,100,98,103,115,142,168] },
  { id:"A002", farm:"Meena Poultry",  region:"Punjab",       medicine:"Oxytetracycline", amuChange:54, baseline:100, healthEvent:"Gumboro (IBD)",         status:"EXPLAINED",   severity:"MEDIUM", species:"Poultry", date:"22 Aug 2026", history:[96,100,98,102,97,99,101,98,100,108,154,148] },
  { id:"A003", farm:"Farm 18",        region:"Gujarat",      medicine:"Amoxicillin",     amuChange:41, baseline:100, healthEvent:"Mastitis",              status:"EXPLAINED",   severity:"MEDIUM", species:"Dairy",   date:"21 Aug 2026", history:[101,99,102,97,100,98,102,99,101,110,141,138] },
  { id:"A004", farm:"Farm 91",        region:"Rajasthan",    medicine:"Enrofloxacin",    amuChange:73, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Dairy",   date:"20 Aug 2026", history:[100,103,98,101,99,102,98,101,100,118,148,173] },
  { id:"A005", farm:"Krishna Dairy",  region:"Haryana",      medicine:"Amoxicillin",     amuChange:38, baseline:100, healthEvent:"Mastitis",              status:"EXPLAINED",   severity:"LOW",    species:"Dairy",   date:"19 Aug 2026", history:[99,101,100,98,102,100,99,101,98,105,138,132] },
  { id:"A006", farm:"Farm 334",       region:"Uttar Pradesh",medicine:"Oxytetracycline", amuChange:82, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Poultry", date:"18 Aug 2026", history:[102,98,101,99,103,100,98,102,104,122,158,182] },
  { id:"A007", farm:"Shanti Farms",   region:"Karnataka",    medicine:"Enrofloxacin",    amuChange:29, baseline:100, healthEvent:"Respiratory infection",  status:"EXPLAINED",   severity:"LOW",    species:"Poultry", date:"17 Aug 2026", history:[98,100,99,101,100,98,102,99,100,104,129,125] },
  { id:"A008", farm:"Farm 512",       region:"Rajasthan",    medicine:"Oxytetracycline", amuChange:61, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"MEDIUM", species:"Dairy",   date:"16 Aug 2026", history:[101,99,102,98,100,103,99,101,100,114,145,161] },
  { id:"A009", farm:"Greenview Dairy",region:"Maharashtra",  medicine:"Penicillin",      amuChange:44, baseline:100, healthEvent:"Foot rot",              status:"EXPLAINED",   severity:"MEDIUM", species:"Dairy",   date:"15 Aug 2026", history:[100,102,98,101,99,100,103,99,101,108,144,139] },
  { id:"A010", farm:"Farm 88",        region:"Gujarat",      medicine:"Enrofloxacin",    amuChange:57, baseline:100, healthEvent:null,                    status:"UNEXPLAINED", severity:"HIGH",   species:"Poultry", date:"14 Aug 2026", history:[99,101,100,102,98,101,99,103,101,116,148,157] },
  { id:"A011", farm:"Farm 203",       region:"Bihar",        medicine:"Amoxicillin",     amuChange:35, baseline:100, healthEvent:"Colibacillosis",        status:"EXPLAINED",   severity:"LOW",    species:"Poultry", date:"13 Aug 2026", history:[100,98,101,99,102,100,98,101,99,104,135,130] },
  { id:"A012", farm:"Sunrise Poultry",region:"West Bengal",  medicine:"Oxytetracycline", amuChange:47, baseline:100, healthEvent:"Newcastle disease",     status:"EXPLAINED",   severity:"MEDIUM", species:"Poultry", date:"12 Aug 2026", history:[102,99,101,98,100,102,99,101,100,109,147,142] },
]

// ─── Health × AMU Data ────────────────────────────────────────────────────────

export interface HealthRow {
  event: string; species: string; amuChange: number;
  farmsAffected: number; classification: "Explained" | "Unexplained" | "Mixed";
}

export const HEALTH_DATA: HealthRow[] = [
  { event:"Gumboro (IBD)",         species:"Poultry", amuChange:54, farmsAffected:21, classification:"Explained"   },
  { event:"Mastitis",              species:"Dairy",   amuChange:31, farmsAffected:14, classification:"Explained"   },
  { event:"None recorded",         species:"Poultry", amuChange:47, farmsAffected:9,  classification:"Unexplained" },
  { event:"Foot Rot",              species:"Dairy",   amuChange:28, farmsAffected:11, classification:"Explained"   },
  { event:"Respiratory infection", species:"Poultry", amuChange:36, farmsAffected:7,  classification:"Explained"   },
  { event:"Newcastle disease",     species:"Poultry", amuChange:41, farmsAffected:8,  classification:"Explained"   },
  { event:"None recorded",         species:"Dairy",   amuChange:62, farmsAffected:5,  classification:"Unexplained" },
  { event:"Colibacillosis",        species:"Poultry", amuChange:29, farmsAffected:12, classification:"Explained"   },
  { event:"Mastitis + other",      species:"Dairy",   amuChange:38, farmsAffected:6,  classification:"Mixed"       },
]

// Monthly AMU index for the national timeline chart (Jan–Aug 2026)
export const MONTHLY_AMU     = [112, 108, 115, 110, 114, 118, 156, 182]
export const MONTHLY_LABELS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"]
export const HEALTH_EVENTS   = [
  { month: 5, label: "Gumboro outbreak · Punjab", color: "#F97316" },
  { month: 6, label: "Mastitis cluster · MH",     color: "#EF4444" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function amuFill(amu: number): string {
  if (amu < 25000) return "#22C55E"
  if (amu < 45000) return "#86EFAC"
  if (amu < 65000) return "#FDE047"
  if (amu < 80000) return "#FB923C"
  return "#EF4444"
}
export function amuStroke(amu: number): string {
  if (amu < 25000) return "#15803D"
  if (amu < 45000) return "#16A34A"
  if (amu < 65000) return "#CA8A04"
  if (amu < 80000) return "#C2410C"
  return "#B91C1C"
}

export function changePill(change: number) {
  if (change > 20) return { bg:"#FEE2E2", text:"#B91C1C", label:`↑ ${change}%` }
  if (change > 0)  return { bg:"#FEF9EE", text:"#92400E", label:`↑ ${change}%` }
  if (change < 0)  return { bg:"#D1FAE5", text:"#065F46", label:`↓ ${Math.abs(change)}%` }
  return              { bg:"#F3F4F6", text:"#6B7280", label:"—" }
}

export const severityStyle = {
  HIGH:   { bg:"#FEE2E2", text:"#B91C1C" },
  MEDIUM: { bg:"#FFEDD5", text:"#C2410C" },
  LOW:    { bg:"#FEF3C7", text:"#92400E" },
}
export const statusStyle = {
  UNEXPLAINED: { bg:"#FEE2E2", text:"#B91C1C" },
  EXPLAINED:   { bg:"#D1FAE5", text:"#065F46" },
}
export const classStyle = {
  Explained:   { bg:"#D1FAE5", text:"#065F46", dot:"#10B981" },
  Unexplained: { bg:"#FEE2E2", text:"#B91C1C", dot:"#EF4444" },
  Mixed:       { bg:"#FEF3C7", text:"#92400E", dot:"#F59E0B" },
}

// ─── Shared Components ────────────────────────────────────────────────────────

export function NavBar({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string }[] = [
    { id:"overview",  label:"Overview" },
    { id:"analytics", label:"AMU & Regional Analytics" },
    { id:"anomalies", label:"Anomalies" },
    { id:"health",    label:"Health × AMU" },
    { id:"forecast",  label:"Forecast & Planning" },
    { id:"workspace", label:"Research Workspace" },
  ]
  return (
    <nav style={{ background:"#fff", borderBottom:"1px solid #E8E4DC", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:64, position:"sticky", top:0, zIndex:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <div style={{ width:28, height:28, background:"#1A2E24", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.6 2 4 3.8 4 6c0 1.4.6 2.6 1.6 3.4L4.4 14h7.2l-1.2-4.6C11.4 8.6 12 7.4 12 6c0-2.2-1.6-4-4-4z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <span style={{ fontWeight:600, fontSize:14, color:"#111827", letterSpacing:"-0.01em" }}>PashuPramaan</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:2, overflowX:"auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14,
              fontWeight: 500,
              background: activeTab === t.id ? "#DCF0E4" : "transparent",
              color: activeTab === t.id ? "#1A3A25" : "#6B7280",
              transition:"background 0.15s, color 0.15s", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <span style={{ fontSize:12, color:"#6B7280", fontWeight:600 }}>EN</span>
        <button style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:4 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="1.8">
            <path d="M15 17H20L18.6 15.6A1.5 1.5 0 0118 14.5V11a6 6 0 00-4-5.66V5a2 2 0 00-4 0v.34A6 6 0 006 11v3.5a1.5 1.5 0 01-.6 1.1L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ position:"absolute", top:2, right:2, width:7, height:7, background:"#EF4444", borderRadius:"50%", border:"1.5px solid #fff" }}/>
        </button>
        <div style={{ width:32, height:32, borderRadius:"50%", background:"#2D6A4F", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700 }}>DR</div>
      </div>
    </nav>
  )
}

export function SL({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:4 }}>{children}</p>
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"#fff", borderRadius:10, border:"1px solid #E8E4DC", ...style }}>{children}</div>
}

export interface AttentionCardProps { title:string; sub:string; level:"HIGH"|"MEDIUM"|"LOW"|"INFO"; link:string; icon:string; onClick?: () => void }
export function AttentionCard({ title, sub, level, link, icon, onClick }: AttentionCardProps) {
  const a = { HIGH:{border:"#EF4444",badge:"#FEE2E2",bt:"#B91C1C"}, MEDIUM:{border:"#F97316",badge:"#FFEDD5",bt:"#C2410C"}, LOW:{border:"#F59E0B",badge:"#FEF3C7",bt:"#92400E"}, INFO:{border:"#6B7280",badge:"#F3F4F6",bt:"#374151"} }[level]
  return (
    <div 
      onClick={onClick}
      style={{ background:"#fff", borderRadius:8, border:"1px solid #E8E4DC", borderLeft:`4px solid ${a.border}`, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"#F5F3EE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}>{icon}</div>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:"#111827", lineHeight:1.3 }}>{title}</p>
            <p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{sub}</p>
          </div>
        </div>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", background:a.badge, color:a.bt, padding:"2px 8px", borderRadius:10, flexShrink:0, marginTop:2 }}>{level}</span>
      </div>
      <button 
        type="button" 
        onClick={(e) => { e.stopPropagation(); onClick?.(); }} 
        style={{ fontSize:12, fontWeight:500, color:"#2D6A4F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left", padding:0 }}
      >
        {link} →
      </button>
    </div>
  )
}

export function SelectField({ label, value, options, onChange }: { label:string; value:string; options:string[]; onChange:(v:string)=>void }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ appearance:"none", WebkitAppearance:"none", background:"#fff", border:"1px solid #E8E4DC", borderRadius:6, padding:"7px 28px 7px 10px", fontSize:13, fontWeight:500, color:"#111827", fontFamily:"inherit", cursor:"pointer", outline:"none", minWidth:130 }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
          style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
    </div>
  )
}

export const TH_STYLE: React.CSSProperties = {
  fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em",
  padding:"10px 16px", textAlign:"left", borderBottom:"1px solid #E8E4DC", whiteSpace:"nowrap",
}

// ─── India Map ────────────────────────────────────────────────────────────────

export function IndiaMap({ highlightId, onHover, onClick }: { highlightId:string|null; onHover:(id:string|null)=>void; onClick?:(id:string, geoName:string)=>void }) {
  return (
    <IndiaChoroplethMap
      highlightId={highlightId}
      onHover={onHover}
      onClick={onClick}
      getFill={(id) => {
        const row = amuById[id]
        return row ? amuFill(row.amu) : "#E5E7EB"
      }}
      getStroke={(id) => {
        const row = amuById[id]
        return row ? amuStroke(row.amu) : "#D1D5DB"
      }}
      legendTitle="AMU Volume"
      legendItems={[
        { color: "#22C55E", label: "< 25k · Low" },
        { color: "#86EFAC", label: "25–45k" },
        { color: "#FDE047", label: "45–65k" },
        { color: "#FB923C", label: "65–80k" },
        { color: "#EF4444", label: "> 80k · High" },
      ]}
      renderTip={(id, geoName) => {
        const row = amuById[id]
        if (!row) return <p style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>{geoName}</p>
        return (
          <>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, marginBottom: 6 }}>{row.state}</p>
            {geoName !== row.state && (
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginBottom: 6 }}>{geoName}</p>
            )}
            {[{ k: "AMU", v: row.amu.toLocaleString('en-IN') }, { k: "Change", v: `↑ ${row.change}%` }, { k: "Anomalies", v: row.anomalies }, { k: "Unexplained", v: row.unexplained }].map(({ k, v }) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 3 }}>
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

// ─── District grid ────────────────────────────────────────────────────────────

export function DistrictGrid({ stateId, highlightId, onHover }: { stateId:string; highlightId:string|null; onHover:(id:string|null)=>void }) {
  const districts = DISTRICT_DATA[stateId] ?? []
  const stateName = REGION_DATA.find(r => r.id === stateId)?.state ?? stateId
  return (
    <div style={{ padding:16 }}>
      <p style={{ fontSize:12, color:"#6B7280", marginBottom:12 }}>District-level AMU · {stateName}</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(96px, 1fr))", gap:8 }}>
        {districts.map((d, i) => {
          const hid = `d-${i}`; const hov = highlightId === hid
          return (
            <div key={d.district} onMouseEnter={() => onHover(hid)} onMouseLeave={() => onHover(null)}
              style={{ background:hov?"#2D6A4F":amuFill(d.amu), border:`1px solid ${hov?"#1A4030":amuStroke(d.amu)}`, borderRadius:6, padding:"10px 8px", cursor:"default", transition:"background 0.12s" }}>
              <p style={{ fontSize:11, fontWeight:600, color:hov?"#fff":"#111827", lineHeight:1.2, marginBottom:3 }}>{d.district}</p>
              <p style={{ fontSize:10, fontFamily:"monospace", color:hov?"rgba(255,255,255,0.8)":"#6B7280" }}>{d.amu.toLocaleString('en-IN')}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sparkline chart (used in anomaly detail) ─────────────────────────────────

export function SparklineChart({ data, baseline }: { data: number[]; baseline: number }) {
  const W = 420; const H = 100; const PAD = { t:10, r:10, b:24, l:32 }
  const cw = W - PAD.l - PAD.r; const ch = H - PAD.t - PAD.b
  const minV = Math.min(...data) * 0.92
  const maxV = Math.max(...data) * 1.05
  const toX = (i: number) => PAD.l + (i / (data.length - 1)) * cw
  const toY = (v: number) => PAD.t + ch - ((v - minV) / (maxV - minV)) * ch
  const baseY = toY(baseline)
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")
  const area = `M${toX(0)},${H - PAD.b} L${data.map((v, i) => `${toX(i)},${toY(v)}`).join(" L")} L${toX(data.length-1)},${H-PAD.b} Z`
  const months = ["S","O","N","D","J","F","M","A","M","J","J","A"]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
      {/* Baseline ref */}
      <line x1={PAD.l} y1={baseY} x2={W-PAD.r} y2={baseY} stroke="#E8E4DC" strokeWidth="1" strokeDasharray="4,3"/>
      <text x={PAD.l - 4} y={baseY + 3} textAnchor="end" style={{ fontSize:8, fill:"#9CA3AF" }}>Base</text>
      {/* Area fill */}
      <path d={area} fill="#2D6A4F" fillOpacity="0.08"/>
      {/* Line */}
      <polyline points={pts} fill="none" stroke="#2D6A4F" strokeWidth="1.5"/>
      {/* Spike highlight — last 3 points */}
      <polyline points={data.slice(9).map((v,i) => `${toX(9+i)},${toY(v)}`).join(" ")} fill="none" stroke="#EF4444" strokeWidth="2"/>
      {/* Month labels */}
      {months.map((m, i) => (
        <text key={i} x={toX(i)} y={H - PAD.b + 12} textAnchor="middle" style={{ fontSize:8, fill:"#9CA3AF" }}>{m}</text>
      ))}
    </svg>
  )
}

// ─── AMU Timeline Chart (Tab 4) ───────────────────────────────────────────────

export function AMUTimelineChart() {
  const W = 600; const H = 160; const PAD = { t:16, r:16, b:40, l:40 }
  const cw = W - PAD.l - PAD.r; const ch = H - PAD.t - PAD.b
  const maxV = Math.max(...MONTHLY_AMU) * 1.08
  const barW = (cw / MONTHLY_AMU.length) * 0.6
  const gap   = (cw / MONTHLY_AMU.length)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map(f => {
        const y = PAD.t + ch * (1 - f)
        return <line key={f} x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#F3F0EB" strokeWidth="1"/>
      })}
      {/* Bars */}
      {MONTHLY_AMU.map((v, i) => {
        const bh = (v / maxV) * ch
        const x = PAD.l + i * gap + (gap - barW) / 2
        const y = PAD.t + ch - bh
        const isSpike = v > 140
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh}
              fill={isSpike ? "#FDDCB0" : "#B8DFC0"} stroke={isSpike ? "#D47820" : "#6CB87A"} strokeWidth="0.5" rx="2"/>
            {isSpike && (
              <text x={x + barW/2} y={y - 4} textAnchor="middle" style={{ fontSize:8, fill:"#C2410C", fontWeight:600 }}>{v}</text>
            )}
            <text x={x + barW/2} y={H - PAD.b + 12} textAnchor="middle" style={{ fontSize:9, fill:"#9CA3AF" }}>{MONTHLY_LABELS[i]}</text>
          </g>
        )
      })}
      {/* Health event markers */}
      {HEALTH_EVENTS.map(ev => {
        const x = PAD.l + ev.month * gap + gap / 2
        return (
          <g key={ev.month}>
            <line x1={x} y1={PAD.t} x2={x} y2={H - PAD.b} stroke={ev.color} strokeWidth="1" strokeDasharray="3,2" opacity="0.6"/>
            <polygon points={`${x},${H-PAD.b+4} ${x-5},${H-PAD.b+14} ${x+5},${H-PAD.b+14}`} fill={ev.color}/>
            <text x={x} y={H - PAD.b + 28} textAnchor="middle" style={{ fontSize:7.5, fill:ev.color, fontWeight:600 }}>{ev.label}</text>
          </g>
        )
      })}
      {/* Y-axis label */}
      <text x={PAD.l - 6} y={PAD.t + ch / 2} textAnchor="middle" transform={`rotate(-90, ${PAD.l - 16}, ${PAD.t + ch/2})`} style={{ fontSize:8, fill:"#9CA3AF" }}>AMU Index</text>
    </svg>
  )
}

// ─── Tab 1 — Overview ─────────────────────────────────────────────────────────

export function OverviewTab({ onNavigate }: { onNavigate?: (tab: TabId, filters?: { status?: string; medicine?: string; metric?: string; state?: string }) => void }) {
  const [hoverId, setHoverId] = useState<string|null>(null)

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px 48px" }}>
      <div style={{ marginBottom:24 }}>
        <SL>Researcher Overview</SL>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#111827", lineHeight:1.2, margin:"4px 0 6px" }}>AMU & Regional Overview</h1>
        <p style={{ fontSize:14, color:"#6B7280" }}>Monitor antimicrobial usage, emerging anomalies, and regional demand.</p>
      </div>

      <Card style={{ padding:"20px 24px", marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div><SL>National Overview</SL><p style={{ fontSize:15, fontWeight:600, color:"#111827" }}>India · Q3 2024</p></div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#FEF3C7", borderRadius:20, padding:"4px 10px" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#F59E0B" }}/>
            <span style={{ fontSize:11, fontWeight:600, color:"#92400E" }}>MODERATE ALERT</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" }}>
          {[{value:"69,420",label:"Total AMU",color:"#111827"},{value:"↑ 18%",label:"vs previous period",color:"#C2410C"},{value:"17",label:"Active anomalies",color:"#111827"},{value:"5",label:"Unexplained",color:"#B91C1C"}].map(({value,label,color},i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width:1, background:"#E8E4DC", height:36, margin:"0 24px" }}/>}
              <div><p style={{ fontSize:26, fontWeight:700, color, lineHeight:1.1 }}>{value}</p><p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{label}</p></div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>Needs your attention</h2>
          <button 
            onClick={() => onNavigate?.("anomalies")} 
            style={{ fontSize:13, fontWeight:500, color:"#2D6A4F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
          >
            View all anomalies →
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
          <AttentionCard 
            icon="⚠️" 
            level="HIGH"   
            title="5 unexplained AMU anomalies require investigation" 
            sub="No correlated health event · flagged by system" 
            link="Review anomalies"
            onClick={() => onNavigate?.("anomalies", { status: "UNEXPLAINED" })}
          />
          <AttentionCard 
            icon="📈" 
            level="MEDIUM" 
            title="Maharashtra demand predicted to increase"          
            sub="Model confidence: 87% · Next 30 days" 
            link="View forecast"
            onClick={() => onNavigate?.("forecast")}
          />
          <AttentionCard 
            icon="💊" 
            level="MEDIUM" 
            title="2 regions showing elevated CIA usage"             
            sub="Punjab 34% · Haryana 32% · Above threshold"   
            link="View CIA report"
            onClick={() => onNavigate?.("analytics", { metric: "CIA Usage" })}
          />
          <AttentionCard 
            icon="🔗" 
            level="INFO"   
            title="12 anomalies linked to recorded health events"   
            sub="Associated with IBD, mastitis outbreaks"       
            link="View Health × AMU"
            onClick={() => onNavigate?.("health")}
          />
        </div>
      </div>

      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>Regional AMU</h2>
          <button 
            onClick={() => onNavigate?.("analytics")} 
            style={{ fontSize:13, fontWeight:500, color:"#2D6A4F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
          >
            View full analytics →
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card style={{ padding:16, overflow:"hidden" }}>
            <IndiaMap 
              highlightId={hoverId} 
              onHover={setHoverId} 
              onClick={(_id, geoName) => onNavigate?.("analytics", { state: geoName })}
            />
          </Card>
          <Card style={{ overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #E8E4DC" }}><SL>By State</SL></div>
            <div style={{ overflowY:"auto", maxHeight:380 }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr>
                  {["State","AMU","Change","Anomalies","Unexplained"].map((h,i) => (
                    <th key={h} style={{ ...TH_STYLE, textAlign: i===0?"left":"right" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {REGION_DATA.slice(0,8).map((row, i) => {
                    const cp = changePill(row.change)
                    return (
                      <tr key={row.id} onMouseEnter={() => setHoverId(row.id)} onMouseLeave={() => setHoverId(null)}
                        onClick={() => onNavigate?.("analytics", { state: row.state })}
                        style={{ borderBottom:"1px solid #F3F0EB", background:hoverId===row.id?"#F5F3EE":i%2===0?"#fff":"#FDFCFA", transition:"background 0.1s", cursor: "pointer" }}>
                        <td style={{ padding:"10px 16px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background:amuFill(row.amu), border:"1px solid rgba(0,0,0,0.08)", flexShrink:0 }}/>
                            <span style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{row.state}</span>
                          </div>
                        </td>
                        <td style={{ padding:"10px 16px", textAlign:"right", fontFamily:"monospace", fontSize:13, color:"#374151" }}>{row.amu.toLocaleString('en-IN')}</td>
                        <td style={{ padding:"10px 16px", textAlign:"right" }}><span style={{ fontSize:11, fontWeight:600, background:cp.bg, color:cp.text, padding:"2px 7px", borderRadius:10 }}>{cp.label}</span></td>
                        <td style={{ padding:"10px 16px", textAlign:"right", fontSize:13, color:"#374151" }}>{row.anomalies}</td>
                        <td style={{ padding:"10px 16px", textAlign:"right", fontSize:12, fontWeight:600, color:row.unexplained>0?"#B91C1C":"#9CA3AF" }}>{row.unexplained>0?row.unexplained:"—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2 — Analytics ────────────────────────────────────────────────────────

export const INDIA_STATES_LIST = ["All States", ...REGION_DATA.map(r => r.state)]
export const DISTRICT_OPTIONS: Record<string, string[]> = {
  "All States": ["All Districts"],
  "Gujarat": ["All Districts", ...DISTRICT_DATA.GJ.map(d => d.district)],
  "Maharashtra": ["All Districts", ...DISTRICT_DATA.MH.map(d => d.district)],
  "Uttar Pradesh": ["All Districts", ...DISTRICT_DATA.UP.map(d => d.district)],
  "Rajasthan": ["All Districts", ...DISTRICT_DATA.RJ.map(d => d.district)],
}
export const YEARS = ["2026","2025","2024","2023","2022"]
export const METRICS = ["AMU","AMU Change %","Predicted Demand","Anomalies","Unexplained Anomalies","CIA Usage","Explained vs Unexplained AMU"]

export function AnalyticsTab({ initialMetricFilter = "AMU", initialStateFilter = "All States" }: { initialMetricFilter?: string; initialStateFilter?: string }) {
  const router = useRouter()
  const [stateFilter, setStateFilter] = useState(initialStateFilter)
  const [districtFilter, setDistrictFilter] = useState("All Districts")
  const [yearFilter, setYearFilter] = useState("2026")
  const [metricFilter, setMetricFilter] = useState(initialMetricFilter)
  const [hoverId, setHoverId] = useState<string|null>(null)

  const [drillStateId, setDrillStateId] = useState<string|null>(() => {
    if (initialStateFilter && initialStateFilter !== "All States") {
      const match = REGION_DATA.find(r => r.state === initialStateFilter)
      return match ? match.id : (geoNameToSlug(initialStateFilter)?.toUpperCase() ?? null)
    }
    return null
  })
  const [drillDistrict, setDrillDistrict] = useState<string|null>(null)

  React.useEffect(() => {
    if (initialMetricFilter) setMetricFilter(initialMetricFilter)
  }, [initialMetricFilter])

  React.useEffect(() => {
    if (initialStateFilter && initialStateFilter !== "All States") {
      setStateFilter(initialStateFilter)
      const match = REGION_DATA.find(r => r.state === initialStateFilter)
      const sid = match ? match.id : (geoNameToSlug(initialStateFilter)?.toUpperCase() ?? null)
      setDrillStateId(sid)
      setDrillDistrict(null)
      setDistrictFilter("All Districts")
    } else if (initialStateFilter === "All States") {
      setStateFilter("All States")
      setDrillStateId(null)
      setDrillDistrict(null)
      setDistrictFilter("All Districts")
    }
  }, [initialStateFilter])

  const activeState = drillStateId ? REGION_DATA.find(r => r.id === drillStateId) : null
  const activeDistrict = drillDistrict
    ? DISTRICT_DATA[drillStateId ?? ""]?.find(d => d.district === drillDistrict)
    : null

  function handleMapClick(_id: string, geoName: string) {
    const slug = geoNameToSlug(geoName)
    const row = REGION_DATA.find(r => r.id === _id)
    const stateId = _id || (row ? row.id : (slug ? slug.toUpperCase() : "MH"))
    setDrillStateId(stateId)
    setDrillDistrict(null)
    const name = row?.state ?? geoName
    if (name) setStateFilter(name)
  }
  function handleBack() {
    if (drillDistrict) { setDrillDistrict(null); setDistrictFilter("All Districts") }
    else { setDrillStateId(null); setStateFilter("All States"); setDistrictFilter("All Districts") }
  }

  // Summary data for the right panel
  const summary = activeDistrict
    ? { label: drillDistrict!, amu: activeDistrict.amu, change: activeDistrict.change, anomalies: activeDistrict.anomalies, unexplained: activeDistrict.unexplained }
    : activeState
    ? { label: activeState.state, amu: activeState.amu, change: activeState.change, anomalies: activeState.anomalies, unexplained: activeState.unexplained }
    : { label:"All India", amu: REGION_DATA.reduce((s,r)=>s+r.amu,0), change:18, anomalies:REGION_DATA.reduce((s,r)=>s+r.anomalies,0), unexplained:REGION_DATA.reduce((s,r)=>s+r.unexplained,0) }

  return (
    <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 24px 48px" }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <button onClick={() => { setDrillStateId(null); setDrillDistrict(null); setStateFilter("All States") }}
            style={{ fontSize:12, color: drillStateId ? "#2D6A4F" : "#9CA3AF", background:"none", border:"none", cursor: drillStateId?"pointer":"default", fontFamily:"inherit", fontWeight:500, padding:0 }}>India</button>
          {drillStateId && <>
            <span style={{ color:"#D1D5DB" }}>/</span>
            <button onClick={() => { setDrillDistrict(null); setDistrictFilter("All Districts") }}
              style={{ fontSize:12, color: drillDistrict ? "#2D6A4F" : "#111827", background:"none", border:"none", cursor: drillDistrict?"pointer":"default", fontFamily:"inherit", fontWeight:500, padding:0 }}>{activeState?.state}</button>
          </>}
          {drillDistrict && <>
            <span style={{ color:"#D1D5DB" }}>/</span>
            <span style={{ fontSize:12, color:"#111827", fontWeight:500 }}>{drillDistrict}</span>
          </>}
        </div>
        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", lineHeight:1.2, margin:"0 0 4px" }}>AMU & Regional Analytics</h1>
        <p style={{ fontSize:13, color:"#6B7280" }}>Explore antimicrobial usage across states and districts.</p>
      </div>

      <Card style={{ padding:"14px 18px", marginBottom:18, display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-end" }}>
        <SelectField label="State" value={stateFilter} options={INDIA_STATES_LIST}
          onChange={v => { setStateFilter(v); setDistrictFilter("All Districts"); setDrillDistrict(null); setDrillStateId(v==="All States"?null:REGION_DATA.find(r=>r.state===v)?.id??geoNameToSlug(v)?.toUpperCase()??null) }}/>
        <SelectField label="District" value={districtFilter} options={DISTRICT_OPTIONS[stateFilter]??["All Districts"]}
          onChange={v => { setDistrictFilter(v); setDrillDistrict(v==="All Districts"?null:v) }}/>
        <SelectField label="Year"   value={yearFilter}   options={YEARS}   onChange={setYearFilter}/>
        <SelectField label="Metric" value={metricFilter} options={METRICS} onChange={setMetricFilter}/>
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#10B981" }}/>
            <span style={{ fontSize:12, color:"#6B7280" }}>Live · {yearFilter}</span>
          </div>
          {(drillStateId || drillDistrict) && (
            <button onClick={handleBack} style={{ fontSize:12, fontWeight:500, color:"#2D6A4F", border:"1px solid #2D6A4F", borderRadius:6, padding:"5px 12px", background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
          )}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 272px", gap:16 }}>
        {/* Map / District vector map */}
        <Card style={{ padding:16, overflow:"hidden" }}>
          {!drillStateId ? (
            <IndiaMap highlightId={hoverId} onHover={setHoverId} onClick={handleMapClick}/>
          ) : (
            <StateDistrictMap
              stateSlug={slugFromRegionId(drillStateId) || geoNameToSlug(activeState?.state ?? stateFilter) || "maharashtra"}
              stateName={activeState?.state ?? stateFilter}
              highlightDistrict={drillDistrict}
              onClickDistrict={(d) => {
                const next = d === drillDistrict ? null : d
                setDrillDistrict(next)
                setDistrictFilter(next ?? "All Districts")
              }}
              onBack={handleBack}
            />
          )}
        </Card>

        {/* Side summary panel — updates at each drill level */}
        <Card style={{ padding:20, display:"flex", flexDirection:"column" }}>
          <SL>Summary</SL>
          <p style={{ fontSize:14, fontWeight:600, color:"#111827", marginTop:2, marginBottom:16 }}>{summary.label}</p>
          {[
            { label:"Total AMU",       value: summary.amu.toLocaleString('en-IN') },
            { label:"Change vs prev.", value:`↑ ${summary.change}%`,          color:"#C2410C" },
            { label:"Active Anomalies",value:`${summary.anomalies}` },
            { label:"Unexplained",     value:`${summary.unexplained}`,         color: summary.unexplained>0?"#B91C1C":undefined },
            { label:"CIA Usage",       value:"8.2%",                          sub:"Critically Important" },
          ].map(({ label, value, color, sub }: { label:string; value:string; color?:string; sub?:string }) => (
            <div key={label} style={{ padding:"11px 0", borderBottom:"1px solid #F3F0EB", display:"flex", flexDirection:"column", gap:2 }}>
              <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
              <span style={{ fontSize:18, fontWeight:700, color:color??"#111827", lineHeight:1.1 }}>{value}</span>
              {sub && <span style={{ fontSize:11, color:"#9CA3AF" }}>{sub}</span>}
            </div>
          ))}
          <div style={{ marginTop:16 }}>
            <button style={{ width:"100%", background:"#2D6A4F", color:"#fff", fontSize:13, fontWeight:600, borderRadius:7, padding:"9px 0", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Export Data</button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Tab 3 — Anomalies ────────────────────────────────────────────────────────

// ─── Treatment Records Modal ──────────────────────────────────────────────────

export function TreatmentRecordsModal({ anomaly, onClose }: { anomaly: AnomalyRow; onClose: () => void }) {
  const isPoultry = anomaly.species === "Poultry"
  const animalId  = `MP-${parseInt(anomaly.id.replace("A","")) * 3 + 100}`
  const animalType = isPoultry ? "Flock" : anomaly.species === "Dairy" ? "Cow" : "Buffalo"
  const route     = isPoultry ? "Medicated Feed" : "Injection"
  const dose      = isPoultry ? "200 mg/L water" : "10 mg/kg"
  const reason    = anomaly.healthEvent ?? "Under investigation — no health event recorded"
  const vetSigned = anomaly.status === "EXPLAINED"
  const withdrawalPct = 30

  const chipStyle = (bg: string, text: string, border: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, background: bg, color: text,
    border: `1px solid ${border}`, borderRadius: 20, padding: "3px 10px",
  })

  const KVRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #F3F0EB" }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{value}</p>
    </div>
  )

  const TimelineStep = ({ label, step, done }: { label: string; step: number | "✓"; done: boolean }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: done ? "#2D6A4F" : step === withdrawalPct / 10 ? "#FEF3C7" : "#F3F4F6",
        border: `2px solid ${done ? "#2D6A4F" : "#E8E4DC"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? 13 : 11, fontWeight: 700,
        color: done ? "#fff" : "#6B7280",
      }}>
        {done ? "✓" : step}
      </div>
      <span style={{ fontSize: 10, color: "#6B7280", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </div>
  )

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #E8E4DC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Treatment Detail</p>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>{animalId} · {animalType}</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6B7280", lineHeight: 1 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <span style={chipStyle("#FEF3C7", "#92400E", "#FDE68A")}>Withdrawal Active</span>
            {vetSigned && <span style={chipStyle("#D1FAE5", "#065F46", "#A7F3D0")}>Vet Signed</span>}
            <span style={chipStyle("#CFFAFE", "#0E7490", "#A5F3FC")}>Lab ≤ MRL</span>
          </div>
        </div>

        {/* Key-value grid */}
        <div style={{ padding: "0 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <KVRow label="Medicine" value={anomaly.medicine} />
            <KVRow label="Route"    value={route} />
            <KVRow label="Dose"     value={dose} />
            <KVRow label="Administered" value={anomaly.date} />
          </div>
          <KVRow label="Reason" value={reason} />
        </div>

        {/* Withdrawal period */}
        <div style={{ margin: "0 22px 0", padding: "14px 16px", background: "#FFFBEB", borderRadius: 8, border: "1px solid #FDE68A" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#D97706", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Withdrawal Period</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#92400E" }}>Dose</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: "#FDE68A", color: "#92400E", padding: "2px 8px", borderRadius: 10 }}>Now ({withdrawalPct}%)</span>
            <span style={{ fontSize: 11, color: "#92400E" }}>Clear</span>
          </div>
          <div style={{ background: "#FDE68A", borderRadius: 4, height: 6, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${withdrawalPct}%`, background: "#D97706", borderRadius: 4 }}/>
          </div>
          <p style={{ fontSize: 11, color: "#D97706", fontWeight: 500, marginTop: 8 }}>
            {isPoultry ? "Eggs clear in 4 days" : "Milk clears tomorrow, 10:30 AM"}
          </p>
        </div>

        {/* Timeline */}
        <div style={{ padding: "16px 22px 0" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>Timeline</p>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <TimelineStep label="Prescription" step={1} done={true}/>
            <div style={{ flex: 0, height: 2, background: "#E8E4DC", width: 32, marginTop: 14 }}/>
            <TimelineStep label="Dose Given"   step={2} done={true}/>
            <div style={{ flex: 0, height: 2, background: "#E8E4DC", width: 32, marginTop: 14 }}/>
            <TimelineStep label="Withdrawal"   step={3} done={false}/>
            <div style={{ flex: 0, height: 2, background: "#E8E4DC", width: 32, marginTop: 14 }}/>
            <TimelineStep label="Clear"        step={4} done={false}/>
          </div>
        </div>

        {/* Farm context note */}
        <div style={{ margin: "14px 22px 0", padding: "10px 14px", background: "#F5F3EE", borderRadius: 8 }}>
          <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
            <strong>Farm:</strong> {anomaly.farm} · <strong>Region:</strong> {anomaly.region} · <strong>AMU deviation:</strong> +{anomaly.amuChange}% above baseline
          </p>
        </div>

        {/* Close button */}
        <div style={{ padding: "16px 22px 22px" }}>
          <button onClick={onClose}
            style={{ width: "100%", background: "#D4724A", color: "#fff", fontSize: 14, fontWeight: 600, borderRadius: 8, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function AnomalyDetail({ anomaly, onBack, onSaveInsight }: { anomaly: AnomalyRow; onBack: () => void; onSaveInsight?: (ins: SavedInsight) => void }) {
  const sv = severityStyle[anomaly.severity]
  const st = statusStyle[anomaly.status]
  const isUnexplained = anomaly.status === "UNEXPLAINED"
  const [showTreatment, setShowTreatment] = useState(false)
  const [insightSaved, setInsightSaved] = useState(false)

  function handleSaveInsight() {
    if (!onSaveInsight || insightSaved) return
    onSaveInsight({
      id: `I${Date.now()}`,
      title: `${anomaly.region} — ${anomaly.medicine} ${anomaly.status === "UNEXPLAINED" ? "unexplained anomaly" : "anomaly"}`,
      summary: `AMU increased ${anomaly.amuChange}% above baseline at ${anomaly.farm}. ${anomaly.healthEvent ? `Health event recorded: ${anomaly.healthEvent}.` : "No corresponding health event recorded."}`,
      tags: [anomaly.region, anomaly.medicine, anomaly.species, anomaly.status],
      date: anomaly.date,
      linkedTo: `Anomaly ${anomaly.id}`,
      linkedAnomalyId: anomaly.id,
    })
    setInsightSaved(true)
  }

  return (
    <>
    {showTreatment && <TreatmentRecordsModal anomaly={anomaly} onClose={() => setShowTreatment(false)}/>}
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px 48px" }}>
      {/* Back + header */}
      <button onClick={onBack} style={{ fontSize:13, fontWeight:500, color:"#2D6A4F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0, marginBottom:16, display:"flex", alignItems:"center", gap:4 }}>
        ← Back to anomalies
      </button>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <SL>Anomaly Investigation</SL>
          <h1 style={{ fontSize:24, fontWeight:700, color:"#111827", margin:"4px 0 4px" }}>{anomaly.farm}</h1>
          <p style={{ fontSize:13, color:"#6B7280" }}>{anomaly.region} · {anomaly.species} · {anomaly.date}</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, background:sv.bg, color:sv.text, padding:"3px 10px", borderRadius:10, letterSpacing:"0.04em" }}>{anomaly.severity}</span>
          <span style={{ fontSize:11, fontWeight:700, background:st.bg, color:st.text, padding:"3px 10px", borderRadius:10, letterSpacing:"0.04em" }}>{anomaly.status}</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        {/* Left — main detail */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* AMU stats row */}
          <Card style={{ padding:"18px 20px" }}>
            <SL>AMU Usage</SL>
            <div style={{ display:"flex", alignItems:"center", gap:0, marginTop:8 }}>
              {[
                { value:`+${anomaly.amuChange}%`, label:"AMU change", color:"#B91C1C" },
                { value:`+${anomaly.baseline}%`,   label:"Expected baseline range", color:"#374151" },
                { value: anomaly.medicine,          label:"Medicine",  color:"#111827" },
                { value: anomaly.species,           label:"Species",   color:"#111827" },
              ].map(({ value, label, color }, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width:1, background:"#E8E4DC", height:34, margin:"0 20px" }}/>}
                  <div>
                    <p style={{ fontSize:20, fontWeight:700, color, lineHeight:1.1 }}>{value}</p>
                    <p style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>{label}</p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Card>

          {/* Historical chart */}
          <Card style={{ padding:"16px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <SL>Historical AMU (12 months)</SL>
              <div style={{ display:"flex", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:16, height:2, background:"#2D6A4F" }}/><span style={{ fontSize:11, color:"#6B7280" }}>AMU</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:16, height:2, background:"#EF4444" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Current spike</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:16, height:2, background:"#E8E4DC", borderTop:"2px dashed #E8E4DC" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Baseline</span>
                </div>
              </div>
            </div>
            <SparklineChart data={anomaly.history} baseline={anomaly.baseline}/>
            <p style={{ fontSize:11, color:"#9CA3AF", marginTop:6 }}>Sep 2025 – Aug 2026 · normalised to baseline = 100</p>
          </Card>

          {/* Health events recorded */}
          <Card style={{ padding:"16px 20px" }}>
            <SL>Health Events Recorded</SL>
            {anomaly.healthEvent
              ? (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10, padding:"10px 14px", background:"#F0FAF4", borderRadius:8, border:"1px solid #BBE7C8" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", flexShrink:0 }}/>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"#065F46" }}>{anomaly.healthEvent}</p>
                    <p style={{ fontSize:11, color:"#6B7280", marginTop:1 }}>Recorded health event — AMU increase may be clinically associated.</p>
                  </div>
                </div>
              )
              : (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10, padding:"10px 14px", background:"#FFF7F7", borderRadius:8, border:"1px solid #FECACA" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#EF4444", flexShrink:0 }}/>
                  <p style={{ fontSize:13, color:"#6B7280" }}>No health event recorded for this farm during the period of elevated usage.</p>
                </div>
              )
            }
          </Card>

          {/* Similar farms */}
          <Card style={{ padding:"16px 20px" }}>
            <SL>Similar Farms in Region</SL>
            <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { farm:"Farm 249", change:"+8%",  status:"Within expected range" },
                { farm:"Farm 251", change:"+11%", status:"Within expected range" },
                { farm:"Farm 253", change:"+6%",  status:"Within expected range" },
              ].map(({ farm, change, status }) => (
                <div key={farm} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F3F0EB" }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{farm}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontFamily:"monospace", fontSize:12, color:"#059669" }}>{change}</span>
                    <span style={{ fontSize:11, color:"#6B7280" }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, color:"#9CA3AF", marginTop:8 }}>Nearby farms show usage within normal range during the same period.</p>
          </Card>
        </div>

        {/* Right — classification + investigation context */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Classification card */}
          <Card style={{ padding:"16px 18px", borderLeft:`4px solid ${isUnexplained?"#EF4444":"#10B981"}` }}>
            <SL>Classification</SL>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, marginBottom:8 }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:isUnexplained?"#EF4444":"#10B981" }}/>
              <span style={{ fontSize:14, fontWeight:700, color:isUnexplained?"#B91C1C":"#065F46" }}>{anomaly.status}</span>
            </div>
            <p style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>
              {isUnexplained
                ? "No corresponding health event is recorded in the system. This flags the pattern for investigation. It does not constitute a finding of misuse."
                : `A corresponding health event (${anomaly.healthEvent}) is recorded. AMU increases during disease episodes are expected. Clinical appropriateness is assessed separately.`}
            </p>
          </Card>

          {/* Investigation context */}
          <Card style={{ padding:"16px 18px" }}>
            <SL>Investigation Context</SL>
            <p style={{ fontSize:12, color:"#6B7280", marginTop:6, marginBottom:14 }}>Suggested follow-up steps for a complete picture:</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { icon:"🗂️",  text:"Review treatment records for this farm during the period" },
                { icon:"🏘️",  text:"Compare with neighbouring farms in the same district" },
                { icon:"🏥",  text:"Check whether a health event was recorded but not yet linked" },
                { icon:"🚚",  text:"Review supplier activity and procurement patterns" },
                { icon:"👩‍⚕️", text:"Contact the registered veterinarian for this farm" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{icon}</span>
                  <span style={{ fontSize:13, color:"#374151", lineHeight:1.4 }}>{text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card style={{ padding:"16px 18px" }}>
            <SL>Actions</SL>
            <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
              <button style={{ background:"#2D6A4F", color:"#fff", fontSize:13, fontWeight:600, borderRadius:7, padding:"9px 0", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                Flag for field investigation
              </button>
              <button onClick={() => setShowTreatment(true)}
                style={{ background:"transparent", color:"#2D6A4F", fontSize:13, fontWeight:500, borderRadius:7, padding:"9px 0", border:"1px solid #2D6A4F", cursor:"pointer", fontFamily:"inherit" }}>
                Request treatment records
              </button>
              {onSaveInsight && (
                <button onClick={handleSaveInsight}
                  style={{ background: insightSaved ? "#F0FAF4" : "transparent", color: insightSaved ? "#065F46" : "#374151", fontSize:13, fontWeight:500, borderRadius:7, padding:"9px 0", border:`1px solid ${insightSaved ? "#BBE7C8" : "#E8E4DC"}`, cursor: insightSaved ? "default" : "pointer", fontFamily:"inherit" }}>
                  {insightSaved ? "✓ Saved to Research Workspace" : "Save to Research Workspace"}
                </button>
              )}
              <button style={{ background:"transparent", color:"#6B7280", fontSize:13, fontWeight:500, borderRadius:7, padding:"9px 0", border:"1px solid #E8E4DC", cursor:"pointer", fontFamily:"inherit" }}>
                Mark as reviewed
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}

export function AnomaliesTab({ 
  onSaveInsight, 
  initialSelected,
  initialStatusFilter = "All",
  initialMedicineFilter = "All Medicines"
}: { 
  onSaveInsight?: (ins: SavedInsight) => void; 
  initialSelected?: string|null;
  initialStatusFilter?: string;
  initialMedicineFilter?: string;
}) {
  const [regionF,   setRegionF]   = useState("All Regions")
  const [speciesF,  setSpeciesF]  = useState("All Species")
  const [medicineF, setMedicineF] = useState(initialMedicineFilter)
  const [severityF, setSeverityF] = useState("All Severities")
  const [statusF,   setStatusF]   = useState(initialStatusFilter)
  const [selected,  setSelected]  = useState<AnomalyRow|null>(() =>
    initialSelected ? (ANOMALY_DATA.find(a => a.id === initialSelected) ?? null) : null
  )

  React.useEffect(() => {
    if (initialStatusFilter !== undefined) setStatusF(initialStatusFilter)
  }, [initialStatusFilter])

  React.useEffect(() => {
    if (initialMedicineFilter !== undefined) setMedicineF(initialMedicineFilter)
  }, [initialMedicineFilter])

  React.useEffect(() => {
    if (initialSelected) {
      setSelected(ANOMALY_DATA.find(a => a.id === initialSelected) ?? null)
    }
  }, [initialSelected])

  if (selected) return <AnomalyDetail anomaly={selected} onBack={() => setSelected(null)} onSaveInsight={onSaveInsight}/>

  const filtered = ANOMALY_DATA
    .filter(a => regionF   === "All Regions"    || a.region   === regionF)
    .filter(a => speciesF  === "All Species"    || a.species  === speciesF)
    .filter(a => medicineF === "All Medicines"  || a.medicine === medicineF)
    .filter(a => severityF === "All Severities" || a.severity === severityF)
    .filter(a => statusF   === "All"            || a.status   === statusF)

  const active       = filtered.length
  const unexplained  = filtered.filter(a => a.status === "UNEXPLAINED").length
  const explained    = filtered.filter(a => a.status === "EXPLAINED").length
  const highPriority = filtered.filter(a => a.severity === "HIGH").length

  const regions   = ["All Regions",    ...Array.from(new Set(ANOMALY_DATA.map(a => a.region)))]
  const species   = ["All Species",    ...Array.from(new Set(ANOMALY_DATA.map(a => a.species)))]
  const medicines = ["All Medicines",  ...Array.from(new Set(ANOMALY_DATA.map(a => a.medicine)))]

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 48px" }}>
      <div style={{ marginBottom:20 }}>
        <SL>Researcher · Anomalies</SL>
        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", margin:"4px 0 4px" }}>AMU Anomalies</h1>
        <p style={{ fontSize:13, color:"#6B7280" }}>Identify unusual antimicrobial usage patterns and prioritize investigations.</p>
      </div>

      {/* Filters */}
      <Card style={{ padding:"14px 18px", marginBottom:16, display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
        <SelectField label="Region"   value={regionF}   options={regions}                                                  onChange={setRegionF}/>
        <SelectField label="Species"  value={speciesF}  options={species}                                                  onChange={setSpeciesF}/>
        <SelectField label="Medicine" value={medicineF} options={medicines}                                                onChange={setMedicineF}/>
        <SelectField label="Severity" value={severityF} options={["All Severities","HIGH","MEDIUM","LOW"]}                onChange={setSeverityF}/>
        <SelectField label="Status"   value={statusF}   options={["All","UNEXPLAINED","EXPLAINED"]}                       onChange={setStatusF}/>
      </Card>

      {/* Summary counts */}
      <Card style={{ padding:"16px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" }}>
          {[
            { value:`${active}`,       label:"Active anomalies",          color:"#111827" },
            { value:`${unexplained}`,  label:"Unexplained",               color:"#B91C1C" },
            { value:`${explained}`,    label:"Explained by health event",  color:"#065F46" },
            { value:`${highPriority}`, label:"High priority",             color:"#C2410C" },
          ].map(({ value, label, color }, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width:1, background:"#E8E4DC", height:34, margin:"0 24px" }}/>}
              <div><p style={{ fontSize:22, fontWeight:700, color, lineHeight:1.1 }}>{value}</p><p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{label}</p></div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Status filter pills — mirroring prescriptions page */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[{label:`All ${ANOMALY_DATA.length}`,val:"All"},{label:`Unexplained ${ANOMALY_DATA.filter(a=>a.status==="UNEXPLAINED").length}`,val:"UNEXPLAINED"},{label:`Explained ${ANOMALY_DATA.filter(a=>a.status==="EXPLAINED").length}`,val:"EXPLAINED"},{label:`High ${ANOMALY_DATA.filter(a=>a.severity==="HIGH").length}`,val:"HIGH_ONLY"}].map(({ label, val }) => {
          const active2 = statusF === val || (val === "HIGH_ONLY" && severityF === "HIGH")
          return (
            <button key={val}
              onClick={() => { if (val === "HIGH_ONLY") { setSeverityF(severityF==="HIGH"?"All Severities":"HIGH"); setStatusF("All") } else { setStatusF(val); setSeverityF("All Severities") }}}
              style={{ fontSize:13, fontWeight: active2 ? 600 : 400, background: active2 ? "#1A2E24" : "#fff", color: active2 ? "#fff" : "#374151", border:"1px solid #E8E4DC", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontFamily:"inherit", transition:"background 0.12s,color 0.12s" }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* Anomaly table */}
      <Card style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #E8E4DC", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div><SL>Anomaly List</SL><p style={{ fontSize:12, color:"#6B7280" }}>{filtered.length} records · sorted by severity</p></div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Farm / Region","Species","Medicine","AMU Change","Baseline Range","Health Event","Status",""].map((h,i) => (
                  <th key={i} style={{ ...TH_STYLE, textAlign: i > 2 && i < 7 ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const sv = severityStyle[row.severity]
                const st = statusStyle[row.status]
                return (
                  <tr key={row.id}
                    style={{ borderBottom:"1px solid #F3F0EB", background: i%2===0?"#fff":"#FDFCFA", transition:"background 0.1s", cursor:"default" }}>
                    <td style={{ padding:"12px 16px" }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{row.farm}</p>
                      <p style={{ fontSize:11, color:"#6B7280", marginTop:1 }}>{row.region} · {row.date}</p>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#374151" }}>{row.species}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#374151" }}>{row.medicine}</td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, color:"#B91C1C" }}>+{row.amuChange}%</span>
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{ fontFamily:"monospace", fontSize:12, color:"#6B7280" }}>+{row.baseline}%</span>
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      {row.healthEvent
                        ? <span style={{ fontSize:12, color:"#065F46", background:"#D1FAE5", padding:"2px 8px", borderRadius:10, fontWeight:500 }}>{row.healthEvent}</span>
                        : <span style={{ fontSize:12, color:"#9CA3AF" }}>None</span>}
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
                        <span style={{ fontSize:10, fontWeight:700, background:sv.bg, color:sv.text, padding:"2px 7px", borderRadius:10 }}>{row.severity}</span>
                        <span style={{ fontSize:10, fontWeight:700, background:st.bg, color:st.text, padding:"2px 7px", borderRadius:10 }}>{row.status}</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <button onClick={() => setSelected(row)}
                        style={{ fontSize:12, fontWeight:600, color:"#2D6A4F", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                        {row.status === "UNEXPLAINED" ? "Investigate →" : "Review →"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Tab 4 — Health × AMU ─────────────────────────────────────────────────────

export function HealthAMUTab() {
  const [regionF,   setRegionF]   = useState("All Regions")
  const [speciesF,  setSpeciesF]  = useState("All Species")
  const [medicineF, setMedicineF] = useState("All Medicines")
  const [diseaseF,  setDiseaseF]  = useState("All Events")
  const [periodF,   setPeriodF]   = useState("Jan – Aug 2026")

  const filtered = HEALTH_DATA
    .filter(r => speciesF === "All Species"  || r.species === speciesF)
    .filter(r => diseaseF === "All Events"   || r.event   === diseaseF)

  const explained   = filtered.filter(r => r.classification === "Explained").length
  const unexplained = filtered.filter(r => r.classification === "Unexplained").length
  const mixed       = filtered.filter(r => r.classification === "Mixed").length

  const diseases  = ["All Events", ...Array.from(new Set(HEALTH_DATA.map(r => r.event)))]
  const speciesList = ["All Species","Dairy","Poultry"]

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 48px" }}>
      <div style={{ marginBottom:20 }}>
        <SL>Researcher · Contextual Analysis</SL>
        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", margin:"4px 0 4px" }}>Health × AMU</h1>
        <p style={{ fontSize:13, color:"#6B7280" }}>Understand antimicrobial-use changes in the context of recorded health events.</p>
      </div>

      {/* Filters */}
      <Card style={{ padding:"14px 18px", marginBottom:16, display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
        <SelectField label="Region"           value={regionF}   options={["All Regions","Maharashtra","Gujarat","Rajasthan","Punjab","Karnataka"]} onChange={setRegionF}/>
        <SelectField label="Species"          value={speciesF}  options={speciesList}  onChange={setSpeciesF}/>
        <SelectField label="Medicine"         value={medicineF} options={["All Medicines","Oxytetracycline","Amoxicillin","Enrofloxacin","Penicillin"]} onChange={setMedicineF}/>
        <SelectField label="Disease / Health Event" value={diseaseF} options={diseases} onChange={setDiseaseF}/>
        <SelectField label="Time Period"      value={periodF}   options={["Jan – Aug 2026","Q3 2025","Q2 2025","2024 Full Year"]} onChange={setPeriodF}/>
      </Card>

      {/* Summary */}
      <Card style={{ padding:"16px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap" }}>
          {[
            { value:"25",            label:"AMU spikes identified",    color:"#111827" },
            { value:`${explained}`,  label:"Explained by health events",color:"#065F46" },
            { value:`${unexplained}`,label:"Unexplained",               color:"#B91C1C" },
            { value:`${mixed}`,      label:"Mixed",                     color:"#92400E" },
          ].map(({ value, label, color }, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width:1, background:"#E8E4DC", height:34, margin:"0 24px" }}/>}
              <div><p style={{ fontSize:22, fontWeight:700, color, lineHeight:1.1 }}>{value}</p><p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{label}</p></div>
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Timeline chart */}
      <Card style={{ padding:"16px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div>
            <SL>National AMU Index Over Time</SL>
            <p style={{ fontSize:12, color:"#6B7280" }}>{periodF} · with recorded health events</p>
          </div>
          <div style={{ display:"flex", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:12, height:12, background:"#B8DFC0", borderRadius:2, border:"1px solid #6CB87A" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Normal</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:12, height:12, background:"#FDDCB0", borderRadius:2, border:"1px solid #D47820" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Elevated</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:10, height:10, clipPath:"polygon(50% 0%, 0% 100%, 100% 100%)", background:"#F97316" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Health event</span>
            </div>
          </div>
        </div>
        <AMUTimelineChart/>
        <p style={{ fontSize:11, color:"#9CA3AF", marginTop:8 }}>
          An AMU increase that overlaps with a recorded health event is flagged as EXPLAINED. The system does not infer causation.
        </p>
      </Card>

      {/* Two columns: table + analytical card */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
        {/* Breakdown table */}
        <Card style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #E8E4DC" }}>
            <SL>Breakdown by Health Event</SL>
            <p style={{ fontSize:12, color:"#6B7280" }}>{filtered.length} event types · {periodF}</p>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Health Event","Species","AMU Change","Farms Affected","Classification"].map((h, i) => (
                  <th key={h} style={{ ...TH_STYLE, textAlign: i > 1 ? "center" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const cs = classStyle[row.classification]
                return (
                  <tr key={i} style={{ borderBottom:"1px solid #F3F0EB", background: i%2===0?"#fff":"#FDFCFA" }}>
                    <td style={{ padding:"12px 16px" }}>
                      <p style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{row.event}</p>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#374151" }}>{row.species}</td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, color:"#C2410C" }}>+{row.amuChange}%</span>
                    </td>
                    <td style={{ padding:"12px 16px", textAlign:"center", fontSize:13, color:"#374151" }}>{row.farmsAffected}</td>
                    <td style={{ padding:"12px 16px", textAlign:"center" }}>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:cs.bg, color:cs.text, padding:"3px 10px", borderRadius:10 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:cs.dot }}/>
                        <span style={{ fontSize:11, fontWeight:600 }}>{row.classification}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>

        {/* Analytical card */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card style={{ padding:"16px 18px" }}>
            <SL>How Classification Works</SL>
            <p style={{ fontSize:12, color:"#6B7280", marginTop:6, marginBottom:14, lineHeight:1.5 }}>
              The system checks whether a recorded health event corresponds to each AMU spike. This is contextual analysis, not a causal or clinical finding.
            </p>
            {[
              { key:"Explained",   color:"#10B981", bg:"#D1FAE5", border:"#BBE7C8",
                desc:"AMU spike overlaps with a recorded health event. Increased usage during a disease episode is expected. Clinical appropriateness is assessed separately by a vet." },
              { key:"Unexplained", color:"#EF4444", bg:"#FFF7F7", border:"#FECACA",
                desc:"AMU spike has no corresponding health event recorded in the system. This flags the pattern for investigation — it does not constitute a finding of misuse." },
              { key:"Mixed",       color:"#F59E0B", bg:"#FFFBEB", border:"#FDE68A",
                desc:"Some farms in this cluster have recorded events while others do not. Individual farm-level investigation is recommended." },
            ].map(({ key, color, bg, border, desc }) => (
              <div key={key} style={{ background:bg, border:`1px solid ${border}`, borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color }}/>
                  <span style={{ fontSize:12, fontWeight:700, color }}>{key.toUpperCase()}</span>
                </div>
                <p style={{ fontSize:12, color:"#374151", lineHeight:1.45 }}>{desc}</p>
              </div>
            ))}
          </Card>

          <Card style={{ padding:"16px 18px", borderLeft:"4px solid #E8E4DC" }}>
            <SL>Research Note</SL>
            <p style={{ fontSize:12, color:"#374151", lineHeight:1.5, marginTop:8 }}>
              An antimicrobial-use spike should not automatically be treated as misuse. This system checks whether a corresponding health event exists — it does not make a clinical diagnosis or judgement about appropriateness.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Forecast data ───────────────────────────────────────────────────────────

// 12-month series: 8 historical + 4 forecast
export const FORECAST_SERIES = [
  { name:"Oxytetracycline", color:"#D4724A", hist:[82,85,88,84,87,90,112,118], fore:[128,134,142,148] },
  { name:"Amoxicillin",     color:"#2D6A4F", hist:[60,62,58,64,61,63,65,64],   fore:[63,64,66,65] },
  { name:"Enrofloxacin",    color:"#6B7280", hist:[40,38,42,36,39,37,35,34],   fore:[32,30,29,28] },
]

export const FORECAST_SUMMARY = [
  { medicine:"Oxytetracycline", need:"High",   change:23,  rec:"Stock up",              recColor:"#B91C1C", recBg:"#FEE2E2" },
  { medicine:"Amoxicillin",     need:"Medium", change:0,   rec:"Maintain current stock", recColor:"#92400E", recBg:"#FEF3C7" },
  { medicine:"Enrofloxacin",    need:"Low",    change:-12, rec:"No additional stock",    recColor:"#065F46", recBg:"#D1FAE5" },
]

export const DEMAND_LEVEL: Record<string, { demand:"High"|"Medium"|"Low"; change:number; currentAmu:"High"|"Medium"|"Low"; signal:"High need"|"Monitor"|"Stable" }> = {
  UP:{ demand:"High",   currentAmu:"High",   change:21, signal:"High need" },
  RJ:{ demand:"High",   currentAmu:"High",   change:34, signal:"High need" },
  MH:{ demand:"High",   currentAmu:"High",   change:21, signal:"High need" },
  BR:{ demand:"High",   currentAmu:"Medium", change:18, signal:"High need" },
  HR:{ demand:"High",   currentAmu:"Medium", change:16, signal:"High need" },
  GJ:{ demand:"Medium", currentAmu:"Medium", change:0,  signal:"Monitor"   },
  MP:{ demand:"Medium", currentAmu:"Medium", change:12, signal:"Monitor"   },
  TN:{ demand:"Medium", currentAmu:"Medium", change:8,  signal:"Monitor"   },
  WB:{ demand:"Medium", currentAmu:"Medium", change:7,  signal:"Monitor"   },
  AP:{ demand:"Medium", currentAmu:"Low",    change:5,  signal:"Monitor"   },
  TG:{ demand:"Medium", currentAmu:"Low",    change:6,  signal:"Monitor"   },
  PB:{ demand:"Medium", currentAmu:"Medium", change:-3, signal:"Monitor"   },
  KA:{ demand:"Low",    currentAmu:"Low",    change:4,  signal:"Stable"    },
  OD:{ demand:"Low",    currentAmu:"Low",    change:3,  signal:"Stable"    },
  CG:{ demand:"Low",    currentAmu:"Low",    change:5,  signal:"Stable"    },
  JH:{ demand:"Low",    currentAmu:"Low",    change:4,  signal:"Stable"    },
  HP:{ demand:"Low",    currentAmu:"Low",    change:2,  signal:"Stable"    },
  UT:{ demand:"Low",    currentAmu:"Low",    change:3,  signal:"Stable"    },
  JK:{ demand:"Low",    currentAmu:"Low",    change:1,  signal:"Stable"    },
  NE:{ demand:"Low",    currentAmu:"Low",    change:4,  signal:"Stable"    },
  KL:{ demand:"Low",    currentAmu:"Low",    change:3,  signal:"Stable"    },
  GA:{ demand:"Low",    currentAmu:"Low",    change:1,  signal:"Stable"    },
  DL:{ demand:"Medium", currentAmu:"Low",    change:10, signal:"Monitor"   },
}

export function demandFill(id: string): string {
  const d = DEMAND_LEVEL[id]?.demand
  if (d === "High")   return "#EF4444"
  if (d === "Medium") return "#FDE047"
  if (d === "Low")    return "#22C55E"
  return "#E5E7EB"
}
export function demandStroke(id: string): string {
  const d = DEMAND_LEVEL[id]?.demand
  if (d === "High")   return "#B91C1C"
  if (d === "Medium") return "#CA8A04"
  if (d === "Low")    return "#15803D"
  return "#D1D5DB"
}

export const REGIONAL_PLANNING = [
  { state:"Maharashtra",   id:"MH", predDemand:"High",   currentAmu:"High",   change:21, signal:"High need" },
  { state:"Rajasthan",     id:"RJ", predDemand:"High",   currentAmu:"High",   change:34, signal:"High need" },
  { state:"Uttar Pradesh", id:"UP", predDemand:"High",   currentAmu:"High",   change:21, signal:"High need" },
  { state:"Bihar",         id:"BR", predDemand:"High",   currentAmu:"Medium", change:18, signal:"High need" },
  { state:"Haryana",       id:"HR", predDemand:"High",   currentAmu:"Medium", change:16, signal:"High need" },
  { state:"Gujarat",       id:"GJ", predDemand:"Medium", currentAmu:"Medium", change:0,  signal:"Monitor"   },
  { state:"Madhya Pradesh",id:"MP", predDemand:"Medium", currentAmu:"Medium", change:12, signal:"Monitor"   },
  { state:"Tamil Nadu",    id:"TN", predDemand:"Medium", currentAmu:"Medium", change:8,  signal:"Monitor"   },
  { state:"West Bengal",   id:"WB", predDemand:"Medium", currentAmu:"Medium", change:7,  signal:"Monitor"   },
  { state:"Andhra Pradesh",id:"AP", predDemand:"Medium", currentAmu:"Low",    change:5,  signal:"Monitor"   },
  { state:"Karnataka",     id:"KA", predDemand:"Low",    currentAmu:"Low",    change:4,  signal:"Stable"    },
  { state:"Odisha",        id:"OD", predDemand:"Low",    currentAmu:"Low",    change:3,  signal:"Stable"    },
]

// ─── Forecast chart ───────────────────────────────────────────────────────────

export function ForecastLineChart() {
  const W=580, H=160, PAD={t:20, r:112, b:32, l:40}
  const cw=W-PAD.l-PAD.r, ch=H-PAD.t-PAD.b
  const ALL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const allValues = FORECAST_SERIES.flatMap(s => [...s.hist,...s.fore])
  const minV=Math.min(...allValues)*0.92, maxV=Math.max(...allValues)*1.05
  const toX = (i:number) => PAD.l + (i/(ALL_MONTHS.length-1))*cw
  const toY = (v:number) => PAD.t + ch - ((v-minV)/(maxV-minV))*ch
  const sepX = toX(7.5)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
      {/* Grid */}
      {[0,0.5,1].map(f => <line key={f} x1={PAD.l} y1={PAD.t+ch*(1-f)} x2={W-PAD.r} y2={PAD.t+ch*(1-f)} stroke="#F3F0EB" strokeWidth="1"/>)}
      {/* Historical / Forecast divider */}
      <line x1={sepX} y1={PAD.t-8} x2={sepX} y2={H-PAD.b+4} stroke="#E8E4DC" strokeWidth="1" strokeDasharray="3,2"/>
      <text x={sepX-6}  y={PAD.t-2} textAnchor="end"   style={{ fontSize:8, fill:"#9CA3AF" }}>Historical</text>
      <text x={sepX+6}  y={PAD.t-2} textAnchor="start" style={{ fontSize:8, fill:"#9CA3AF" }}>Forecast →</text>
      {/* Forecast shading */}
      <rect x={sepX} y={PAD.t-8} width={W-PAD.r-sepX} height={ch+12} fill="#F5F3EE" opacity="0.5"/>
      {/* Series */}
      {FORECAST_SERIES.map(s => {
        const all = [...s.hist, ...s.fore]
        const histPts = s.hist.map((v,i) => `${toX(i)},${toY(v)}`).join(" ")
        const forePts = s.fore.map((v,i) => `${toX(s.hist.length+i)},${toY(v)}`).join(" ")
        const joinPt  = `${toX(s.hist.length-1)},${toY(s.hist[s.hist.length-1])}`
        return (
          <g key={s.name}>
            <polyline points={histPts} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round"/>
            {/* Connect gap */}
            <polyline points={`${joinPt} ${toX(s.hist.length)},${toY(s.fore[0])}`} fill="none" stroke={s.color} strokeWidth="1.8" strokeDasharray="3,2" opacity="0.6"/>
            <polyline points={forePts} fill="none" stroke={s.color} strokeWidth="1.8" strokeLinejoin="round" strokeDasharray="4,3"/>
            {/* Endpoint dot */}
            <circle cx={toX(all.length-1)} cy={toY(all[all.length-1])} r="3" fill={s.color}/>
          </g>
        )
      })}
      {/* Month labels */}
      {ALL_MONTHS.map((m,i) => (
        <text key={m} x={toX(i)} y={H-PAD.b+12} textAnchor="middle" style={{ fontSize:8, fill:"#9CA3AF" }}>{m}</text>
      ))}
      {/* Legend — right side */}
      {FORECAST_SERIES.map((s,i) => (
        <g key={s.name} transform={`translate(${W-PAD.r+8}, ${PAD.t+i*20})`}>
          <line x1="0" y1="5" x2="16" y2="5" stroke={s.color} strokeWidth="1.8"/>
          <text x="20" y="9" style={{ fontSize:9, fill:"#374151" }}>{s.name}</text>
        </g>
      ))}
    </svg>
  )
}

// ─── Demand map (GeoJSON + D3, dummy DEMAND_LEVEL colors) ─────────────────────

export function DemandMap({ highlightId, onHover }: { highlightId:string|null; onHover:(id:string|null)=>void }) {
  return (
    <IndiaChoroplethMap
      highlightId={highlightId}
      onHover={onHover}
      getFill={demandFill}
      getStroke={demandStroke}
      legendTitle="Predicted Demand"
      legendItems={[
        { color: "#EF4444", label: "High" },
        { color: "#FDE047", label: "Medium" },
        { color: "#22C55E", label: "Low" },
      ]}
      renderTip={(id, geoName) => {
        const d = DEMAND_LEVEL[id]
        const title = amuById[id]?.state ?? geoName
        if (!d) return <p style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>{title}</p>
        return (
          <>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, marginBottom: 6 }}>{title}</p>
            {[{ k: "Predicted Demand", v: d.demand }, { k: "Expected Change", v: d.change > 0 ? `↑ ${d.change}%` : d.change < 0 ? `↓ ${Math.abs(d.change)}%` : "Stable" }, { k: "Planning Signal", v: d.signal }].map(({ k, v }) => (
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

// ─── Tab 5 — Forecast & Planning ─────────────────────────────────────────────

export function ForecastTab() {
  const [medicineF,  setMedicineF]  = useState("All Medicines")
  const [speciesF,   setSpeciesF]   = useState("All Species")
  const [regionF,    setRegionF]    = useState("All Regions")
  const [periodF,    setPeriodF]    = useState("Next 30 days")
  const [hoverId,    setHoverId]    = useState<string|null>(null)

  const needStyle = {
    High:   { bg:"#FEE2E2", text:"#B91C1C" },
    Medium: { bg:"#FEF3C7", text:"#92400E" },
    Low:    { bg:"#D1FAE5", text:"#065F46" },
  }
  const signalStyle = {
    "High need": { bg:"#FEE2E2", text:"#B91C1C", dot:"#EF4444" },
    "Monitor":   { bg:"#FEF3C7", text:"#92400E", dot:"#F59E0B" },
    "Stable":    { bg:"#D1FAE5", text:"#065F46", dot:"#10B981" },
  }

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 48px" }}>
      <div style={{ marginBottom:20 }}>
        <SL>Researcher · Decision Support</SL>
        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", margin:"4px 0 4px" }}>Forecast & Planning</h1>
        <p style={{ fontSize:13, color:"#6B7280" }}>Predict antimicrobial demand and support regional resource planning.</p>
      </div>

      {/* Filters */}
      <Card style={{ padding:"14px 18px", marginBottom:16, display:"flex", gap:16, flexWrap:"wrap", alignItems:"flex-end" }}>
        <SelectField label="Medicine"        value={medicineF} options={["All Medicines","Oxytetracycline","Amoxicillin","Enrofloxacin"]} onChange={setMedicineF}/>
        <SelectField label="Species"         value={speciesF}  options={["All Species","Dairy","Poultry","Small Ruminants"]}             onChange={setSpeciesF}/>
        <SelectField label="Region"          value={regionF}   options={["All Regions","Maharashtra","Gujarat","Rajasthan","Punjab","Karnataka"]} onChange={setRegionF}/>
        <SelectField label="Forecast Period" value={periodF}   options={["Next 30 days","Next 60 days","Next 90 days","Q4 2026"]}        onChange={setPeriodF}/>
      </Card>

      {/* Forecast chart */}
      <Card style={{ padding:"16px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <SL>30-Day Medicine Demand Forecast</SL>
            <p style={{ fontSize:12, color:"#6B7280" }}>Historical AMU with {periodF.toLowerCase()} projection · normalised index</p>
          </div>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:20, height:2, background:"#374151" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Historical</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:20, height:2, background:"#374151", borderTop:"2px dashed #374151" }}/><span style={{ fontSize:11, color:"#6B7280" }}>Forecast</span>
            </div>
          </div>
        </div>
        <ForecastLineChart/>
        <p style={{ fontSize:11, color:"#9CA3AF", marginTop:8 }}>
          Forecast is model-assisted and intended for planning purposes only. Human review is required before any procurement or allocation decisions.
        </p>
      </Card>

      {/* Forecast summary table */}
      <Card style={{ overflow:"hidden", marginBottom:16 }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #E8E4DC" }}>
          <SL>Medicine Forecast Summary</SL>
          <p style={{ fontSize:12, color:"#6B7280" }}>{periodF} · {speciesF}</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Medicine","Predicted Need","Change","Recommendation"].map((h,i) => (
                <th key={h} style={{ ...TH_STYLE, textAlign:i>0?"center":"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FORECAST_SUMMARY.map((row, i) => {
              const ns = needStyle[row.need as keyof typeof needStyle]
              const cp = row.change > 0 ? { bg:"#FEE2E2", text:"#B91C1C", label:`↑ ${row.change}%` }
                       : row.change < 0 ? { bg:"#D1FAE5", text:"#065F46", label:`↓ ${Math.abs(row.change)}%` }
                       : { bg:"#F3F4F6", text:"#6B7280", label:"→ Stable" }
              return (
                <tr key={row.medicine} style={{ borderBottom:"1px solid #F3F0EB", background:i%2===0?"#fff":"#FDFCFA" }}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background: FORECAST_SERIES.find(s=>s.name===row.medicine)?.color ?? "#6B7280", flexShrink:0 }}/>
                      <span style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{row.medicine}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"center" }}>
                    <span style={{ fontSize:11, fontWeight:700, background:ns.bg, color:ns.text, padding:"2px 10px", borderRadius:10 }}>{row.need}</span>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"center" }}>
                    <span style={{ fontSize:11, fontWeight:600, background:cp.bg, color:cp.text, padding:"2px 8px", borderRadius:10 }}>{cp.label}</span>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"center" }}>
                    <span style={{ fontSize:12, fontWeight:500, background:row.recBg, color:row.recColor, padding:"3px 10px", borderRadius:10 }}>{row.rec}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Regional planning section */}
      <div style={{ marginBottom:8 }}>
        <h2 style={{ fontSize:16, fontWeight:600, color:"#111827", marginBottom:4 }}>Regional Demand Outlook</h2>
        <p style={{ fontSize:13, color:"#6B7280", marginBottom:16 }}>State-level predicted demand for the {periodF.toLowerCase()}. Hover a state for details.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Demand map */}
        <Card style={{ padding:16, overflow:"hidden" }}>
          <div style={{ marginBottom:8 }}><SL>Predicted Demand Map</SL></div>
          <DemandMap highlightId={hoverId} onHover={setHoverId}/>
        </Card>

        {/* Regional table */}
        <Card style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #E8E4DC" }}><SL>Planning Signals by State</SL></div>
          <div style={{ overflowY:"auto", maxHeight:412 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["State","Predicted","Current AMU","Change","Signal"].map((h,i) => (
                    <th key={h} style={{ ...TH_STYLE, textAlign:i>0?"center":"left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONAL_PLANNING.map((row, i) => {
                  const ns = needStyle[row.predDemand as keyof typeof needStyle]
                  const na = needStyle[row.currentAmu as keyof typeof needStyle]
                  const ss = signalStyle[row.signal as keyof typeof signalStyle]
                  const cp = row.change > 0 ? { bg:"#FEE2E2", text:"#B91C1C", label:`↑ ${row.change}%` }
                           : row.change < 0 ? { bg:"#D1FAE5", text:"#065F46", label:`↓ ${Math.abs(row.change)}%` }
                           : { bg:"#F3F4F6", text:"#6B7280", label:"→ Stable" }
                  return (
                    <tr key={row.id}
                      onMouseEnter={() => setHoverId(row.id)} onMouseLeave={() => setHoverId(null)}
                      style={{ borderBottom:"1px solid #F3F0EB", background:hoverId===row.id?"#F5F3EE":i%2===0?"#fff":"#FDFCFA", transition:"background 0.1s" }}>
                      <td style={{ padding:"10px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:demandFill(row.id), border:"1px solid rgba(0,0,0,0.08)", flexShrink:0 }}/>
                          <span style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{row.state}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 16px", textAlign:"center" }}>
                        <span style={{ fontSize:11, fontWeight:700, background:ns.bg, color:ns.text, padding:"2px 7px", borderRadius:10 }}>{row.predDemand}</span>
                      </td>
                      <td style={{ padding:"10px 16px", textAlign:"center" }}>
                        <span style={{ fontSize:11, fontWeight:600, background:na.bg, color:na.text, padding:"2px 7px", borderRadius:10 }}>{row.currentAmu}</span>
                      </td>
                      <td style={{ padding:"10px 16px", textAlign:"center" }}>
                        <span style={{ fontSize:11, fontWeight:600, background:cp.bg, color:cp.text, padding:"2px 7px", borderRadius:10 }}>{cp.label}</span>
                      </td>
                      <td style={{ padding:"10px 16px", textAlign:"center" }}>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:ss.bg, padding:"2px 8px", borderRadius:10 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:ss.dot }}/>
                          <span style={{ fontSize:11, fontWeight:600, color:ss.text }}>{row.signal}</span>
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

      {/* AI-assisted note */}
      <Card style={{ padding:"16px 20px", borderLeft:"4px solid #E8E4DC" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
          <div style={{ flexShrink:0 }}>
            <SL>AI-Assisted Resource Planning</SL>
            <p style={{ fontSize:13, color:"#374151", lineHeight:1.55, marginTop:6, maxWidth:720 }}>
              The forecast highlights where antimicrobial demand may rise. Human decision-makers use this information to plan availability and support.
              The model does not allocate subsidies, make enforcement decisions, or prescribe drugs. It is decision support only.
            </p>
          </div>
          <div style={{ flexShrink:0, display:"flex", flexDirection:"column", gap:6 }}>
            {["Model does not allocate subsidies","Model does not make enforcement decisions","Model does not prescribe drugs"].map(t => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#9CA3AF", flexShrink:0 }}/>
                <span style={{ fontSize:11, color:"#6B7280" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Workspace data ───────────────────────────────────────────────────────────

export interface SavedInsight {
  id: string; title: string; summary: string; tags: string[]; date: string; linkedTo: string;
  linkedAnomalyId?: string;
}
export interface ResearchNote {
  id: string; observation: string; hypothesis: string;
  evidence: string[]; nextInvestigation: string;
  associatedWith: { type: string; value: string }[];
  date: string; author: string;
}

export const SAVED_INSIGHTS_INIT: SavedInsight[] = [
  {
    id:"I001",
    title:"Maharashtra — Oxytetracycline anomaly cluster",
    summary:"AMU increased 68% above baseline at Farm 247 during Aug 2026. No corresponding health event recorded. Pattern warrants investigation.",
    tags:["Maharashtra","Oxytetracycline","Dairy","UNEXPLAINED"],
    date:"24 Aug 2026",
    linkedTo:"Anomaly A001",
    linkedAnomalyId:"A001",
  },
  {
    id:"I002",
    title:"Rajasthan — Elevated CIA usage Q3 2026",
    summary:"Enrofloxacin usage 73% above baseline at Farm 91 in Rajasthan. No health event recorded. Neighbouring farms within normal range.",
    tags:["Rajasthan","Enrofloxacin","CIA","UNEXPLAINED"],
    date:"20 Aug 2026",
    linkedTo:"Anomaly A004",
    linkedAnomalyId:"A004",
  },
  {
    id:"I003",
    title:"Uttar Pradesh — Poultry AMU spike",
    summary:"Farm 334 showed 82% AMU increase with no recorded health event. Highest single-farm deviation in the dataset this period.",
    tags:["Uttar Pradesh","Oxytetracycline","Poultry","HIGH"],
    date:"18 Aug 2026",
    linkedTo:"Anomaly A006",
    linkedAnomalyId:"A006",
  },
]

export const NOTES_INIT: ResearchNote[] = [
  {
    id:"N001",
    observation:"AMU increased sharply among poultry farms in Maharashtra during August 2026.",
    hypothesis:"Increase may correlate with seasonal disease incidence — particularly Gumboro (IBD) — rather than non-clinical usage.",
    evidence:["17 anomalous farms identified","5 farms have no recorded health event","12 farms have at least one recorded health event during the period"],
    nextInvestigation:"Compare with Gumboro incidence data across neighbouring districts. Request vet sign-off records for the 5 unexplained farms.",
    associatedWith:[{type:"Region",value:"Maharashtra"},{type:"Medicine",value:"Oxytetracycline"},{type:"Species",value:"Poultry"}],
    date:"22 Aug 2026",
    author:"Dr. Mehta",
  },
  {
    id:"N002",
    observation:"Enrofloxacin (CIA) usage elevated in Rajasthan — particularly Jaipur and Jodhpur districts. 6 farms above threshold.",
    hypothesis:"Possible supplier-level factor or local prescribing pattern. Two farms report Gumboro — insufficient to explain full cluster.",
    evidence:["CIA usage 73% above baseline (Farm 91, Farm 512)","Neighbouring farms within normal range","Supplier activity not yet reviewed"],
    nextInvestigation:"Review supplier procurement records for Jaipur. Cross-reference prescribing veterinarians across the 6 farms.",
    associatedWith:[{type:"Region",value:"Rajasthan"},{type:"Medicine",value:"Enrofloxacin"},{type:"Anomaly",value:"A004"}],
    date:"18 Aug 2026",
    author:"Dr. Mehta",
  },
]

// ─── Tab 6 — Research Workspace ───────────────────────────────────────────────

export function WorkspaceTab({ savedInsights, onSaveInsight, onOpenAnalysis }: {
  savedInsights: SavedInsight[];
  onSaveInsight: (ins: SavedInsight) => void;
  onOpenAnalysis: (anomalyId: string) => void;
}) {
  const [notes, setNotes]             = useState<ResearchNote[]>(NOTES_INIT)
  const [addingNote, setAddingNote]   = useState(false)
  const [addingInsight, setAddingInsight] = useState(false)
  const [expandedNote, setExpandedNote] = useState<string|null>(null)
  const [newNote, setNewNote] = useState({ observation:"", hypothesis:"", evidence:"", nextInvestigation:"" })
  const [newInsight, setNewInsight]   = useState({ title:"", summary:"", tags:"", linkedTo:"" })

  function submitNote() {
    if (!newNote.observation.trim()) return
    const n: ResearchNote = {
      id: `N${Date.now()}`,
      observation: newNote.observation,
      hypothesis:  newNote.hypothesis,
      evidence:    newNote.evidence.split("\n").filter(Boolean),
      nextInvestigation: newNote.nextInvestigation,
      associatedWith: [],
      date: new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }),
      author: "Dr. Mehta",
    }
    setNotes([n, ...notes])
    setNewNote({ observation:"", hypothesis:"", evidence:"", nextInvestigation:"" })
    setAddingNote(false)
  }

  function submitInsight() {
    if (!newInsight.title.trim()) return
    onSaveInsight({
      id: `I${Date.now()}`,
      title: newInsight.title,
      summary: newInsight.summary,
      tags: newInsight.tags.split(",").map(t => t.trim()).filter(Boolean),
      date: new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }),
      linkedTo: newInsight.linkedTo,
    })
    setNewInsight({ title:"", summary:"", tags:"", linkedTo:"" })
    setAddingInsight(false)
  }

  const inputStyle: React.CSSProperties = {
    width:"100%", border:"1px solid #E8E4DC", borderRadius:6,
    padding:"8px 10px", fontSize:13, color:"#111827",
    fontFamily:"inherit", outline:"none", background:"#fff",
    resize:"vertical" as const,
  }

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px 48px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <SL>Researcher · Workspace</SL>
          <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", margin:"4px 0 4px" }}>Research Workspace</h1>
          <p style={{ fontSize:13, color:"#6B7280" }}>Save insights, document observations, and continue investigations.</p>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={() => setAddingNote(true)}
            style={{ background:"transparent", color:"#2D6A4F", fontSize:13, fontWeight:600, borderRadius:7, padding:"9px 16px", border:"1px solid #2D6A4F", cursor:"pointer", fontFamily:"inherit" }}>
            + Add Note
          </button>
          <button onClick={() => setAddingInsight(true)}
            style={{ background:"#2D6A4F", color:"#fff", fontSize:13, fontWeight:600, borderRadius:7, padding:"9px 16px", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
            + Add Insight
          </button>
        </div>
      </div>

      {/* ── Saved Insights ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>Saved Insights</h2>
          <span style={{ fontSize:12, color:"#9CA3AF" }}>{savedInsights.length} saved</span>
        </div>

        {/* Add insight form */}
        {addingInsight && (
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #E8E4DC", padding:"18px 20px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <SL>New Insight</SL>
              <button onClick={() => setAddingInsight(false)} style={{ fontSize:12, color:"#6B7280", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Title</label>
                <input value={newInsight.title} onChange={e => setNewInsight({...newInsight, title:e.target.value})} placeholder="Brief descriptive title" style={{ ...inputStyle, resize:"none" as const }}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Summary</label>
                <textarea rows={2} value={newInsight.summary} onChange={e => setNewInsight({...newInsight, summary:e.target.value})} placeholder="Key finding or observation" style={inputStyle}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Tags (comma-separated)</label>
                  <input value={newInsight.tags} onChange={e => setNewInsight({...newInsight, tags:e.target.value})} placeholder="e.g. Maharashtra, Oxytetracycline" style={{ ...inputStyle, resize:"none" as const }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Linked to</label>
                  <input value={newInsight.linkedTo} onChange={e => setNewInsight({...newInsight, linkedTo:e.target.value})} placeholder="e.g. Anomaly A001" style={{ ...inputStyle, resize:"none" as const }}/>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button onClick={() => setAddingInsight(false)} style={{ fontSize:13, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={submitInsight} style={{ fontSize:13, fontWeight:600, color:"#fff", background:"#2D6A4F", border:"none", borderRadius:6, padding:"8px 20px", cursor:"pointer", fontFamily:"inherit" }}>Save Insight</button>
            </div>
          </div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {savedInsights.length === 0 && (
            <div style={{ background:"#fff", borderRadius:8, border:"1px dashed #E8E4DC", padding:"28px", textAlign:"center" }}>
              <p style={{ fontSize:13, color:"#9CA3AF" }}>No insights saved yet. Use "Save to Research Workspace" from an anomaly detail view, or click "+ Add Insight" above.</p>
            </div>
          )}
          {savedInsights.map(ins => (
            <div key={ins.id} style={{ background:"#fff", borderRadius:8, border:"1px solid #E8E4DC", padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{ins.title}</p>
                    <span style={{ fontSize:11, color:"#9CA3AF", flexShrink:0 }}>{ins.date}</span>
                  </div>
                  <p style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginBottom:10 }}>{ins.summary}</p>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                    {ins.tags.map(tag => (
                      <span key={tag} style={{ fontSize:11, fontWeight:500, background:"#F5F3EE", color:"#374151", border:"1px solid #E8E4DC", padding:"2px 8px", borderRadius:10 }}>{tag}</span>
                    ))}
                  </div>
                  <p style={{ fontSize:11, color:"#9CA3AF" }}>Linked to: {ins.linkedTo}</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
                  {ins.linkedAnomalyId ? (
                    <button onClick={() => onOpenAnalysis(ins.linkedAnomalyId!)}
                      style={{ fontSize:12, fontWeight:600, color:"#2D6A4F", background:"none", border:"1px solid #2D6A4F", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                      Open Analysis →
                    </button>
                  ) : (
                    <button style={{ fontSize:12, fontWeight:500, color:"#9CA3AF", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"5px 12px", cursor:"default", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                      Open Analysis →
                    </button>
                  )}
                  <button onClick={() => setAddingNote(true)}
                    style={{ fontSize:12, fontWeight:500, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                    Edit Note
                  </button>
                  <button style={{ fontSize:12, fontWeight:500, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Research Notes ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>Research Notes</h2>
          <span style={{ fontSize:12, color:"#9CA3AF" }}>{notes.length} notes</span>
        </div>

        {/* Add note form */}
        {addingNote && (
          <div style={{ background:"#fff", borderRadius:8, border:"1px solid #E8E4DC", padding:"18px 20px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <SL>New Research Note</SL>
              <button onClick={() => setAddingNote(false)} style={{ fontSize:12, color:"#6B7280", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Observation</label>
                <textarea rows={3} value={newNote.observation} onChange={e => setNewNote({...newNote, observation:e.target.value})} placeholder="What did you observe?" style={inputStyle}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Hypothesis</label>
                <textarea rows={3} value={newNote.hypothesis} onChange={e => setNewNote({...newNote, hypothesis:e.target.value})} placeholder="What might explain it?" style={inputStyle}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Evidence (one item per line)</label>
                <textarea rows={3} value={newNote.evidence} onChange={e => setNewNote({...newNote, evidence:e.target.value})} placeholder="Supporting data points" style={inputStyle}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:4 }}>Next Investigation</label>
                <textarea rows={3} value={newNote.nextInvestigation} onChange={e => setNewNote({...newNote, nextInvestigation:e.target.value})} placeholder="What to investigate next?" style={inputStyle}/>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <button onClick={() => setAddingNote(false)} style={{ fontSize:13, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={submitNote} style={{ fontSize:13, fontWeight:600, color:"#fff", background:"#2D6A4F", border:"none", borderRadius:6, padding:"8px 20px", cursor:"pointer", fontFamily:"inherit" }}>Save Note</button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {notes.map(note => {
            const isExpanded = expandedNote === note.id
            return (
              <div key={note.id} style={{ background:"#fff", borderRadius:8, border:"1px solid #E8E4DC", borderLeft:"4px solid #2D6A4F", overflow:"hidden" }}>
                {/* Note header — always visible */}
                <div style={{ padding:"13px 18px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", cursor:"pointer" }}
                  onClick={() => setExpandedNote(isExpanded ? null : note.id)}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:"#111827", lineHeight:1.3 }}>{note.observation.length > 90 ? note.observation.slice(0,90)+"…" : note.observation}</p>
                    </div>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ fontSize:11, color:"#9CA3AF" }}>{note.author} · {note.date}</span>
                      {note.associatedWith.slice(0,3).map(a => (
                        <span key={a.value} style={{ fontSize:10, fontWeight:500, background:"#F5F3EE", color:"#374151", border:"1px solid #E8E4DC", padding:"1px 6px", borderRadius:8 }}>{a.type}: {a.value}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0, marginLeft:12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition:"transform 0.15s" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ borderTop:"1px solid #F3F0EB", padding:"16px 18px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
                      <div>
                        <SL>Observation</SL>
                        <p style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginTop:4 }}>{note.observation}</p>
                      </div>
                      <div>
                        <SL>Hypothesis</SL>
                        <p style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginTop:4 }}>{note.hypothesis}</p>
                      </div>
                      <div>
                        <SL>Evidence</SL>
                        <div style={{ marginTop:4 }}>
                          {note.evidence.map((e, i) => (
                            <div key={i} style={{ display:"flex", gap:8, marginBottom:4 }}>
                              <span style={{ fontSize:12, color:"#9CA3AF", flexShrink:0 }}>{i+1}.</span>
                              <span style={{ fontSize:13, color:"#374151" }}>{e}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <SL>Next Investigation</SL>
                        <p style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginTop:4 }}>{note.nextInvestigation}</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                      <button style={{ fontSize:12, fontWeight:500, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>Edit</button>
                      <button style={{ fontSize:12, fontWeight:500, color:"#374151", background:"none", border:"1px solid #E8E4DC", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>Export</button>
                      <button style={{ fontSize:12, fontWeight:600, color:"#2D6A4F", background:"none", border:"1px solid #2D6A4F", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>Continue investigation →</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Export ── */}
      <Card style={{ padding:"18px 20px" }}>
        <SL>Export</SL>
        <p style={{ fontSize:13, color:"#6B7280", marginTop:4, marginBottom:16 }}>Download data for external analysis or reporting.</p>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { label:"Export Current Analysis", primary:true },
            { label:"Export Anomaly Dataset",  primary:false },
            { label:"Export AMU Trends",       primary:false },
            { label:"Export CSV",              primary:false },
          ].map(({ label, primary }) => (
            <button key={label}
              style={{
                fontSize:13, fontWeight: primary ? 600 : 500,
                background: primary ? "#2D6A4F" : "transparent",
                color:      primary ? "#fff" : "#374151",
                border: primary ? "none" : "1px solid #E8E4DC",
                borderRadius:7, padding:"9px 18px", cursor:"pointer", fontFamily:"inherit",
              }}>
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

