"use client";
import { WorkspaceTab } from "@/components/admin/AdminShared";
import { useAdmin } from "../layout";

export default function WorkspacePage() {
  const { savedInsights, saveInsight, openAnalysis } = useAdmin();
  return <WorkspaceTab savedInsights={savedInsights} onSaveInsight={saveInsight} onOpenAnalysis={openAnalysis} />;
}
