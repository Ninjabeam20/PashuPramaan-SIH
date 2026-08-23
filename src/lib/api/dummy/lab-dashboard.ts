import { store } from "@/lib/seed/store";

export type LabSummaryCard = {
  value: string;
  label: string;
  sub: string;
  color: "amber" | "neutral" | "red" | "green";
};

export type LabAttentionItem = {
  id: string;
  type: string;
  title: string;
  desc: string;
  status: string;
  statusColor: "amber" | "red" | "green";
  action: string;
  page: string;
};

export type LabActivityItem = {
  text: string;
  time: string;
  icon: "check" | "inbox" | "hold" | "dispatch";
};

export type LabDashboardData = {
  summary: LabSummaryCard[];
  attention: LabAttentionItem[];
  activity: LabActivityItem[];
};

export async function fetchLabDashboard(): Promise<LabDashboardData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const state = store.getState();
  const counters = state.labCounters;
  const highPriorityAwaiting = store.getAwaitingLabSamples().filter((s) => s.priority === "HIGH PRIORITY").length;

  return {
    summary: [
      { value: String(counters.awaitingReceipt), label: "Awaiting Receipt", sub: `${highPriorityAwaiting} high priority`, color: "amber" },
      { value: String(counters.testsInProgress), label: "Tests in Progress", sub: `${counters.dispatchesInProgress} dispatches`, color: "neutral" },
      { value: String(counters.awaitingVerification), label: "Awaiting Verification", sub: "Ready for review", color: "amber" },
      { value: String(counters.onHold), label: "On Hold", sub: "Action required", color: "red" },
    ],
    // Attention rows follow the sample's own stage, so the dashboard can no longer offer
    // "Start Testing" on a lot another page already reports as cleared.
    attention: store
      .getLabSamples()
      .filter((sample) => sample.attention !== null)
      .map((sample) => ({
        id: sample.dispatchId,
        type: sample.product === "Eggs" ? "EGGS" : sample.product.toUpperCase(),
        title: sample.sourceName,
        desc: sample.attention!.desc,
        status: sample.attention!.status,
        statusColor: sample.attention!.statusColor,
        action: sample.attention!.action,
        page: sample.attention!.page,
      })),
    activity: state.labActivity.map((row) => ({ text: row.text, time: row.time, icon: row.icon })),
  };
}
