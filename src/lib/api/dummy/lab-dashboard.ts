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
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    summary: [
      { value: "12", label: "Awaiting Receipt", sub: "3 high priority", color: "amber" },
      { value: "18", label: "Tests in Progress", sub: "11 dispatches", color: "neutral" },
      { value: "7", label: "Awaiting Verification", sub: "Ready for review", color: "amber" },
      { value: "2", label: "On Hold", sub: "Action required", color: "red" },
    ],
    attention: [
      {
        id: "MLK-2026-00124", type: "MILK",
        title: "Shree Krishna Dairy",
        desc: "Beta-lactam residue testing required.",
        status: "HIGH PRIORITY", statusColor: "amber",
        action: "Start Testing →",
        page: "/lab/testing-workspace/MLK-2026-00124",
      },
      {
        id: "MEAT-2026-00087", type: "MEAT",
        title: "Green Valley Livestock",
        desc: "Withdrawal verification requires review.",
        status: "REVIEW REQUIRED", statusColor: "red",
        action: "View Dispatch →",
        page: "/lab/dispatches/MEAT-2026-00087",
      },
      {
        id: "EGG-2026-00241", type: "EGGS",
        title: "Sunrise Poultry",
        desc: "Assessment is awaiting verification.",
        status: "ACTION REQUIRED", statusColor: "amber",
        action: "Review Results →",
        page: "/lab/results",
      },
    ],
    activity: [
      { text: "Result submitted for MLK-2026-00118", time: "10 min ago", icon: "check" },
      { text: "Sample LAB-00921 received and registered", time: "1 hour ago", icon: "inbox" },
      { text: "MEAT-2026-00072 placed on hold", time: "Yesterday", icon: "hold" },
      { text: "EGG-2026-00217 cleared for dispatch", time: "Yesterday", icon: "dispatch" },
    ],
  };
}
