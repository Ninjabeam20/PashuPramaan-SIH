export type AwaitingSample = {
  id: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  sample: string;
  arrival: string;
  priority: string;
  priorityColor: "red" | "amber" | "neutral" | "green" | "sage";
  reason: string;
  action: string;
  highlighted: boolean;
};

export type ReadySampleTest = {
  name: string;
  status: "done" | "active" | "pending";
};

export type ReadySample = {
  id: string;
  product: string;
  source: string;
  sample: string;
  tests: ReadySampleTest[];
  action: string;
};

export type TestingQueueData = {
  awaiting: AwaitingSample[];
  ready: ReadySample[];
};

export async function fetchTestingQueue(): Promise<TestingQueueData> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    awaiting: [
      {
        id: "MLK-2026-00131",
        product: "Milk",
        productSub: "Raw Milk",
        source: "Mahalaxmi Dairy",
        sourceSub: "Animal: MP-087",
        sample: "LAB-MLK-00992",
        arrival: "Expected today · 10:45 AM",
        priority: "HIGH PRIORITY",
        priorityColor: "red",
        reason: "Targeted residue test required",
        action: "Receive Sample →",
        highlighted: true,
      },
      {
        id: "MEAT-2026-00091",
        product: "Meat",
        productSub: "Batch M-56",
        source: "Green Valley Livestock",
        sourceSub: "",
        sample: "LAB-MT-00481",
        arrival: "Received 15 min ago",
        priority: "MODERATE",
        priorityColor: "amber",
        reason: "",
        action: "Receive →",
        highlighted: false,
      },
      {
        id: "EGG-2026-00255",
        product: "Eggs",
        productSub: "Flock FLK-2026-051",
        source: "Sunrise Poultry",
        sourceSub: "",
        sample: "LAB-EGG-01142",
        arrival: "Expected today · 12:30 PM",
        priority: "ROUTINE",
        priorityColor: "neutral",
        reason: "",
        action: "Receive →",
        highlighted: false,
      },
    ],
    ready: [
      {
        id: "MLK-2026-00124",
        product: "Milk",
        source: "Shree Krishna Dairy",
        sample: "LAB-MLK-00981",
        tests: [
          { name: "Product Quality", status: "done" },
          { name: "Microbiological Safety", status: "active" },
          { name: "Antimicrobial Residue", status: "pending" },
        ],
        action: "Continue Testing →",
      },
      {
        id: "MEAT-2026-00091",
        product: "Meat",
        source: "Green Valley Livestock",
        sample: "LAB-MT-00481",
        tests: [
          { name: "Quality Assessment", status: "pending" },
          { name: "Microbiology", status: "pending" },
          { name: "Antimicrobial Residue", status: "pending" },
        ],
        action: "Start Testing →",
      },
    ]
  };
}

export type WorkspaceData = {
  dispatchId: string;
  sampleId: string;
  product: string;
  productSub: string;
  source: string;
  sourceSub: string;
  condition: string;
  temperature: string;
  riskLevel: string;
  antimicrobialContext: string;
  antimicrobialStatus: string;
  assessments: Array<{ num: number; label: string; state: "done" | "active" | "pending" }>;
};

export async function fetchTestingWorkspace(sampleId: string): Promise<WorkspaceData> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    dispatchId: "MLK-2026-00124",
    sampleId: sampleId,
    product: "Raw Milk",
    productSub: "Milk",
    source: "Shree Krishna Dairy",
    sourceSub: "MP-104",
    condition: "✓ Acceptable",
    temperature: "4.2°C",
    riskLevel: "MODERATE",
    antimicrobialContext: "Amoxicillin · Last administered 15 Aug 2026",
    antimicrobialStatus: "✓ Withdrawal completed before dispatch. Residue testing still required.",
    assessments: [
      { num: 1, label: "Product Quality", state: "done" },
      { num: 2, label: "Microbiological Safety", state: "active" },
      { num: 3, label: "Antimicrobial Residue", state: "pending" },
    ],
  };
}
