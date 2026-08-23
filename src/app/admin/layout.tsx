"use client";
import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SAVED_INSIGHTS_INIT, SavedInsight, TabId } from "@/components/admin/AdminShared";

type AdminContextType = {
  savedInsights: SavedInsight[];
  setSavedInsights: React.Dispatch<React.SetStateAction<SavedInsight[]>>;
  navigateAnomaly: string | null;
  setNavigateAnomaly: React.Dispatch<React.SetStateAction<string | null>>;
  anomaliesStatusFilter: string;
  setAnomaliesStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  anomaliesMedicineFilter: string;
  setAnomaliesMedicineFilter: React.Dispatch<React.SetStateAction<string>>;
  analyticsMetricFilter: string;
  setAnalyticsMetricFilter: React.Dispatch<React.SetStateAction<string>>;
  analyticsStateFilter: string;
  setAnalyticsStateFilter: React.Dispatch<React.SetStateAction<string>>;
  handleNavigate: (tab: TabId, filters?: { status?: string; medicine?: string; metric?: string; state?: string }) => void;
  saveInsight: (ins: SavedInsight) => void;
  openAnalysis: (anomalyId: string) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);
export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(SAVED_INSIGHTS_INIT);
  const [navigateAnomaly, setNavigateAnomaly] = useState<string|null>(null);
  const [anomaliesStatusFilter, setAnomaliesStatusFilter] = useState<string>("All");
  const [anomaliesMedicineFilter, setAnomaliesMedicineFilter] = useState<string>("All Medicines");
  const [analyticsMetricFilter, setAnalyticsMetricFilter] = useState<string>("AMU");
  const [analyticsStateFilter, setAnalyticsStateFilter] = useState<string>("All States");

  const saveInsight = (ins: SavedInsight) => {
    setSavedInsights(prev => {
      if (prev.some(p => p.linkedAnomalyId === ins.linkedAnomalyId && ins.linkedAnomalyId)) return prev;
      return [ins, ...prev];
    });
  };

  const openAnalysis = (anomalyId: string) => {
    setNavigateAnomaly(anomalyId);
    setAnomaliesStatusFilter("All");
    setAnomaliesMedicineFilter("All Medicines");
    router.push("/admin/anomalies");
  };

  const handleNavigate = (tab: TabId, filters?: { status?: string; medicine?: string; metric?: string; state?: string }) => {
    if (tab === "anomalies") {
      setAnomaliesStatusFilter(filters?.status ?? "All");
      setAnomaliesMedicineFilter(filters?.medicine ?? "All Medicines");
      setNavigateAnomaly(null);
    } else if (tab === "analytics") {
      setAnalyticsMetricFilter(filters?.metric ?? "AMU");
      setAnalyticsStateFilter(filters?.state ?? "All States");
    } else {
      setNavigateAnomaly(null);
    }
    router.push(`/admin/${tab}`);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id:"overview",  label:"Overview" },
    { id:"analytics", label:"AMU & Regional Analytics" },
    { id:"anomalies", label:"Anomalies" },
    { id:"health",    label:"Health × AMU" },
    { id:"forecast",  label:"Forecast & Planning" },
    { id:"workspace", label:"Research Workspace" },
  ];

  const activeTabId = pathname.split("/").pop() as TabId;

  return (
    <AdminContext.Provider value={{
      savedInsights, setSavedInsights,
      navigateAnomaly, setNavigateAnomaly,
      anomaliesStatusFilter, setAnomaliesStatusFilter,
      anomaliesMedicineFilter, setAnomaliesMedicineFilter,
      analyticsMetricFilter, setAnalyticsMetricFilter,
      analyticsStateFilter, setAnalyticsStateFilter,
      handleNavigate, saveInsight, openAnalysis
    }}>
      <div style={{ background:"#F5F3EE", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" }}>
        {/* NavBar */}
        <nav style={{ background:"#fff", borderBottom:"1px solid #E8E4DC", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:52, position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <div style={{ width:28, height:28, background:"#1A2E24", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.6 2 4 3.8 4 6c0 1.4.6 2.6 1.6 3.4L4.4 14h7.2l-1.2-4.6C11.4 8.6 12 7.4 12 6c0-2.2-1.6-4-4-4z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span style={{ fontWeight:600, fontSize:14, color:"#111827", letterSpacing:"-0.01em" }}>PashuPramaan</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:2, overflowX:"auto" }}>
            {tabs.map(t => {
              const isActive = activeTabId === t.id;
              return (
                <Link key={t.id} href={`/admin/${t.id}`}
                  style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13,
                    fontWeight: isActive ? 500 : 400,
                    background: isActive ? "#DCF0E4" : "transparent",
                    color: isActive ? "#1A3A25" : "#6B7280",
                    transition:"background 0.15s, color 0.15s", whiteSpace:"nowrap", textDecoration:"none" }}>
                  {t.label}
                </Link>
              );
            })}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <span style={{ fontSize:13, color:"#6B7280", fontWeight:500 }}>EN</span>
            <button style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:4 }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="1.8">
                <path d="M15 17H20L18.6 15.6A1.5 1.5 0 0118 14.5V11a6 6 0 00-4-5.66V5a2 2 0 00-4 0v.34A6 6 0 006 11v3.5a1.5 1.5 0 01-.6 1.1L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ position:"absolute", top:2, right:2, width:7, height:7, background:"#EF4444", borderRadius:"50%", border:"1.5px solid #fff" }}/>
            </button>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"#2D6A4F", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>DR</div>
          </div>
        </nav>
        {children}
      </div>
    </AdminContext.Provider>
  );
}
