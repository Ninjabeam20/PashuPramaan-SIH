"use client";
import { OverviewTab } from "@/components/admin/AdminShared";
import { useAdmin } from "../layout";

export default function OverviewPage() {
  const { handleNavigate } = useAdmin();
  return <OverviewTab onNavigate={handleNavigate} />;
}
