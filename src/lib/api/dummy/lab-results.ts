export type LabResultTest = {
  label: string;
  result: string;
  ok: boolean;
};

export type LabResult = {
  id: string;
  product: string;
  source: string;
  sample: string;
  date: string;
  tests: LabResultTest[];
  status: string;
  statusColor: "amber" | "red" | "green" | "neutral";
  action: string;
  /** "hold" routes directly to the On Hold sub-screen; anything else goes to Assessment */
  outcome: "hold" | "released";
};

const MOCK_RESULTS: LabResult[] = [
  {
    id: "MLK-2026-00124",
    product: "Raw Milk",
    source: "Shree Krishna Dairy",
    sample: "LAB-MLK-00981",
    date: "23 Aug 2026",
    tests: [
      { label: "Product Quality",        result: "COMPLIANT",    ok: true  },
      { label: "Microbiological Safety", result: "COMPLIANT",    ok: true  },
      { label: "Antimicrobial Residue",  result: "WITHIN LIMIT", ok: true  },
    ],
    status: "AWAITING VERIFICATION",
    statusColor: "amber",
    action: "Review Assessment →",
    outcome: "released",
  },
  {
    id: "MEAT-2026-00087",
    product: "Meat",
    source: "Green Valley Livestock",
    sample: "LAB-MT-00472",
    date: "23 Aug 2026",
    tests: [
      { label: "Product Quality",        result: "COMPLIANT",       ok: true  },
      { label: "Microbiological Safety", result: "COMPLIANT",       ok: true  },
      { label: "Antimicrobial Residue",  result: "REVIEW REQUIRED", ok: false },
    ],
    status: "ACTION REQUIRED",
    statusColor: "red",
    action: "Review →",
    outcome: "hold",
  },
  {
    id: "EGG-2026-00241",
    product: "Eggs",
    source: "Sunrise Poultry",
    sample: "LAB-EGG-01128",
    date: "22 Aug 2026",
    tests: [
      { label: "Physical Quality",       result: "COMPLIANT",    ok: true },
      { label: "Microbiological Safety", result: "COMPLIANT",    ok: true },
      { label: "Antimicrobial Residue",  result: "WITHIN LIMIT", ok: true },
    ],
    status: "VERIFIED",
    statusColor: "green",
    // "View Report →" — this triggers onOpenReport → router.push("/lab/reports")
    action: "View Report →",
    outcome: "released",
  },
];

export async function fetchLabResults(): Promise<LabResult[]> {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_RESULTS;
}
