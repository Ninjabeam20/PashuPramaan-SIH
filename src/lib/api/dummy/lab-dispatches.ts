export type LabDispatchItem = {
  id: string;
  date: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  sample: string;
  sampleStatus: string;
  sampleColor: "green" | "blue" | "red" | "amber" | "neutral";
  risk: string;
  riskColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral";
  status: string;
  statusColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral";
  action: string;
  clickable: boolean;
};

export async function fetchLabDispatches(): Promise<LabDispatchItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "MLK-2026-00124",
      date: "22 Aug · 10:30 AM",
      product: "Milk",
      productSub: "Raw milk",
      source: "Shree Krishna Dairy",
      sourceSub: "Animal: MP-104",
      sample: "LAB-MLK-00981",
      sampleStatus: "Received",
      sampleColor: "green",
      risk: "MODERATE",
      riskColor: "amber",
      status: "READY FOR TESTING",
      statusColor: "amber",
      action: "View →",
      clickable: true,
    },
    {
      id: "MEAT-2026-00087",
      date: "22 Aug · 08:45 AM",
      product: "Meat",
      productSub: "Batch M-42",
      source: "Green Valley Livestock",
      sourceSub: "Batch: M-42",
      sample: "LAB-MT-00472",
      sampleStatus: "Testing",
      sampleColor: "blue",
      risk: "HIGH",
      riskColor: "red",
      status: "IN PROGRESS",
      statusColor: "sage",
      action: "Continue →",
      clickable: false,
    },
    {
      id: "EGG-2026-00241",
      date: "21 Aug · 04:20 PM",
      product: "Eggs",
      productSub: "Flock dispatch",
      source: "Sunrise Poultry",
      sourceSub: "Flock: FLK-2026-042",
      sample: "LAB-EGG-01128",
      sampleStatus: "Complete",
      sampleColor: "green",
      risk: "LOW",
      riskColor: "green",
      status: "AWAITING VERIFICATION",
      statusColor: "amber",
      action: "Review →",
      clickable: false,
    },
    {
      id: "MLK-2026-00118",
      date: "21 Aug · 11:15 AM",
      product: "Milk",
      productSub: "Raw milk",
      source: "Mahalaxmi Dairy",
      sourceSub: "Animal: MP-087",
      sample: "LAB-MLK-00972",
      sampleStatus: "Complete",
      sampleColor: "green",
      risk: "LOW",
      riskColor: "green",
      status: "COMPLETED",
      statusColor: "green",
      action: "View Report →",
      clickable: false,
    },
    {
      id: "MEAT-2026-00072",
      date: "20 Aug · 02:00 PM",
      product: "Meat",
      productSub: "Batch M-18",
      source: "Raj Farms",
      sourceSub: "Batch: M-18",
      sample: "LAB-MT-00461",
      sampleStatus: "On Hold",
      sampleColor: "red",
      risk: "HIGH",
      riskColor: "red",
      status: "ON HOLD",
      statusColor: "red",
      action: "Review →",
      clickable: false,
    },
  ];
}

export type LabTestItem = {
  num: string;
  title: string;
  checks: string[];
  status: string;
  statusColor: string;
  action: string;
  active: boolean;
  badge: string | null;
};

export type LabAssessmentItem = {
  label: string;
  status: string;
  color: string;
};

export type LabActivityLog = {
  time: string;
  title: string;
  desc: string;
  icon: "active" | "done" | "neutral";
};

export type LabDispatchDetail = {
  id: string;
  product: string;
  source: string;
  date: string;
  time: string;
  quantity: string;
  linkedAnimal: string;
  currentSample: string;
  risk: string;
  riskColor: "amber" | "red" | "green" | "sage" | "blue" | "neutral" | string;
  riskReason: string;
  overallStatus: string;
  stages: Array<{ label: string; state: "done" | "active" | "upcoming" }>;
  tests: LabTestItem[];
  assessment: LabAssessmentItem[];
  notes: {
    condition: string;
    temperature: string;
    container: string;
    receivedBy: string;
    receivedAt: string;
  };
  activity: LabActivityLog[];
};

export async function fetchLabDispatchDetail(dispatchId: string): Promise<LabDispatchDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Dummy response
  return {
    id: dispatchId,
    product: "Raw Milk",
    source: "Shree Krishna Dairy",
    date: "22 Aug 2026",
    time: "10:30 AM",
    quantity: "850 L",
    linkedAnimal: "MP-104",
    currentSample: "LAB-MLK-00981",
    risk: "MODERATE",
    riskColor: "amber",
    riskReason: "Recent antimicrobial exposure",
    overallStatus: "TESTING IN PROGRESS",
    stages: [
      { label: "Created", state: "done" },
      { label: "Received", state: "done" },
      { label: "Testing", state: "active" },
      { label: "Verification", state: "upcoming" },
      { label: "Assessment", state: "upcoming" },
    ],
    tests: [
      {
        num: "01",
        title: "Product Quality",
        checks: ["Fat", "SNF", "Acidity", "Adulteration screen"],
        status: "COMPLETED",
        statusColor: "green",
        action: "View Results →",
        active: false,
        badge: null,
      },
      {
        num: "02",
        title: "Microbiological Safety",
        checks: ["Standard plate count", "Coliform screening", "Pathogen screen"],
        status: "IN PROGRESS",
        statusColor: "amber",
        action: "Continue Testing →",
        active: true,
        badge: null,
      },
      {
        num: "03",
        title: "Antimicrobial Residue",
        checks: ["Beta-lactam screen", "Targeted residue analysis"],
        status: "PENDING",
        statusColor: "neutral",
        action: "Start Test →",
        active: false,
        badge: "Triggered by treatment history",
      },
    ],
    assessment: [
      { label: "Traceability", status: "Complete", color: "green" },
      { label: "Withdrawal Check", status: "Passed", color: "green" },
      { label: "Product Quality", status: "Complete", color: "green" },
      { label: "Microbiological Safety", status: "In Progress", color: "amber" },
      { label: "Residue Testing", status: "Pending", color: "neutral" },
    ],
    notes: {
      condition: "Acceptable",
      temperature: "4.2°C",
      container: "Intact",
      receivedBy: "Dr. Priya Sharma",
      receivedAt: "22 Aug · 11:05 AM",
    },
    activity: [
      { time: "12:10 PM", title: "Microbiological testing started", desc: "Status updated to In Progress.", icon: "active" },
      { time: "11:20 AM", title: "Product quality testing completed", desc: "Results submitted by Dr. Priya Sharma.", icon: "done" },
      { time: "11:05 AM", title: "Sample received and registered", desc: "LAB-MLK-00981 linked to this dispatch.", icon: "done" },
      { time: "10:30 AM", title: "Dispatch created", desc: "Milk dispatch submitted from Shree Krishna Dairy.", icon: "neutral" },
    ],
  };
}
