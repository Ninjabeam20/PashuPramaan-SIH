"use client";
import { AnalyticsTab } from "@/components/admin/AdminShared";
import { useAdmin } from "../layout";

export default function AnalyticsPage() {
  const { analyticsMetricFilter, analyticsStateFilter } = useAdmin();
  return <AnalyticsTab initialMetricFilter={analyticsMetricFilter} initialStateFilter={analyticsStateFilter} />;
}
