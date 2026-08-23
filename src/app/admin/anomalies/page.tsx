"use client";
import { AnomaliesTab } from "@/components/admin/AdminShared";
import { useAdmin } from "../layout";

export default function AnomaliesPage() {
  const { saveInsight, navigateAnomaly, anomaliesStatusFilter, anomaliesMedicineFilter } = useAdmin();
  return <AnomaliesTab onSaveInsight={saveInsight} initialSelected={navigateAnomaly} initialStatusFilter={anomaliesStatusFilter} initialMedicineFilter={anomaliesMedicineFilter} />;
}
