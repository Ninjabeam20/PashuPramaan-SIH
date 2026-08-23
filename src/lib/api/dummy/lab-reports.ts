export type ReportMrl = {
  drug: string;
  measured: number;
  limit: number;
  unit: string;
  ratio: number;
  verdict: string;
  verdictOk: boolean;
};

export type ReportWithdrawal = {
  drug: string;
  administered: string;
  completed: string;
  /** If the string contains "Completed" it will be styled green; otherwise red */
  status: string;
};

export type ReportAssessment = {
  label: string;
  result: string;
  ok: boolean;
  detail: string;
};

export type LabReport = {
  id: string;
  product: string;
  productSub: string;
  source: string;
  sample: string;
  animal: string;
  date: string;
  status: string;
  statusColor: "green" | "red" | "amber" | "neutral";
  refNo: string;
  verifiedBy: string;
  verifiedOn: string;
  assessments: ReportAssessment[];
  mrl: ReportMrl;
  withdrawal: ReportWithdrawal;
  outcome: string;
  outcomeOk: boolean;
};

export type ReportsSummary = {
  v: string;
  l: string;
  color: "neutral" | "green" | "red" | "amber";
};

const MOCK_REPORTS: LabReport[] = [
  {
    id: "MLK-2026-00124",
    product: "Milk",
    productSub: "Raw Milk",
    source: "Shree Krishna Dairy",
    sample: "LAB-MLK-00981",
    animal: "MP-104",
    date: "23 Aug 2026",
    status: "CLEARED",
    statusColor: "green",
    refNo: "LAB-REF-2026-00124",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "23 Aug 2026 · 4:20 PM",
    assessments: [
      { label: "Product Quality",        result: "Compliant",    ok: true,  detail: "Fat 3.8% · SNF 8.6% · Acidity Normal · No adulteration" },
      { label: "Microbiological Safety", result: "Compliant",    ok: true,  detail: "SPC 4,200 CFU/mL · Coliform ND · Pathogen ND" },
      { label: "Antimicrobial Residue",  result: "Within Limit", ok: true,  detail: "Beta-lactam · Tetracycline screened" },
    ],
    mrl: { drug: "Amoxicillin (Beta-lactam)", measured: 3.2,  limit: 4.0,  unit: "μg/kg",  ratio: 0.80, verdict: "WITHIN MRL",  verdictOk: true  },
    withdrawal: { drug: "Amoxicillin",     administered: "15 Aug 2026", completed: "20 Aug 2026", status: "Completed before dispatch"     },
    outcome: "CLEARED FOR DISPATCH",
    outcomeOk: true,
  },
  {
    id: "MEAT-2026-00087",
    product: "Meat",
    productSub: "Batch M-42",
    source: "Green Valley Livestock",
    sample: "LAB-MT-00472",
    animal: "Batch M-42",
    date: "23 Aug 2026",
    status: "ON HOLD",
    statusColor: "red",
    refNo: "LAB-REF-2026-00087",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "—",
    assessments: [
      { label: "Product Quality",        result: "Compliant",       ok: true,  detail: "pH 5.7 · Appearance normal · Odour normal" },
      { label: "Microbiological Safety", result: "Compliant",       ok: true,  detail: "Aerobic count within range · E. coli ND · Salmonella ND" },
      { label: "Antimicrobial Residue",  result: "Review Required", ok: false, detail: "Tetracycline detected above threshold" },
    ],
    mrl: { drug: "Tetracycline", measured: 220, limit: 100, unit: "μg/kg", ratio: 2.20, verdict: "EXCEEDS MRL", verdictOk: false },
    withdrawal: { drug: "Oxytetracycline", administered: "10 Aug 2026", completed: "18 Aug 2026", status: "Disputed — review required" },
    outcome: "ON HOLD",
    outcomeOk: false,
  },
  {
    id: "EGG-2026-00241",
    product: "Eggs",
    productSub: "Flock dispatch",
    source: "Sunrise Poultry",
    sample: "LAB-EGG-01128",
    animal: "FLK-2026-042",
    date: "22 Aug 2026",
    status: "CLEARED",
    statusColor: "green",
    refNo: "LAB-REF-2026-00241",
    verifiedBy: "Laboratory Authority",
    verifiedOn: "22 Aug 2026 · 3:45 PM",
    assessments: [
      { label: "Physical Quality",       result: "Compliant",    ok: true, detail: "Avg weight 62g · Shell integrity 100% · Cleanliness acceptable" },
      { label: "Microbiological Safety", result: "Compliant",    ok: true, detail: "No significant pathogen detected" },
      { label: "Antimicrobial Residue",  result: "Within Limit", ok: true, detail: "Enrofloxacin screened" },
    ],
    mrl: { drug: "Enrofloxacin", measured: 0.06, limit: 0.1, unit: "mg/kg", ratio: 0.60, verdict: "WITHIN MRL", verdictOk: true },
    withdrawal: { drug: "Enrofloxacin", administered: "8 Aug 2026", completed: "18 Aug 2026", status: "Completed before dispatch" },
    outcome: "CLEARED FOR DISPATCH",
    outcomeOk: true,
  },
];

export const REPORTS_SUMMARY: ReportsSummary[] = [
  { v: "128", l: "Completed",       color: "neutral" },
  { v: "112", l: "Released",        color: "green"   },
  { v: "6",   l: "On Hold",         color: "red"     },
  { v: "10",  l: "Awaiting Verif.", color: "amber"   },
];

export async function fetchLabReports(): Promise<LabReport[]> {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_REPORTS;
}
