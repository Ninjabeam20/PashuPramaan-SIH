import { store } from "@/lib/seed/store";
import {
  labSourceSub,
  labWithdrawalCheck,
  riskColor,
  stageView,
} from "@/lib/seed/project";
import type { LabSample, LabTest } from "@/lib/seed/types";

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

  return store.getReceivedLabSamples().map((sample) => {
    const view = stageView(sample.stage);
    return {
      id: sample.dispatchId,
      date: sample.dateLabel,
      product: sample.product,
      productSub: sample.productSub,
      source: sample.sourceName,
      sourceSub: labSourceSub(sample),
      sample: sample.sampleId,
      sampleStatus: view.sampleStatus,
      sampleColor: view.sampleColor,
      risk: sample.risk,
      riskColor: riskColor(sample.risk),
      status: view.status,
      statusColor: view.statusColor,
      action: view.action,
      // Every received lot now has a detail page, so every row opens.
      clickable: true,
    };
  });
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

const STAGE_LABELS = ["Created", "Received", "Testing", "Verification", "Assessment"] as const;

const testItem = (test: LabTest, index: number): LabTestItem => {
  const status = test.state === "done" ? "COMPLETED" : test.state === "active" ? "IN PROGRESS" : "PENDING";
  const statusColor = test.state === "done" ? "green" : test.state === "active" ? "amber" : "neutral";
  const action = test.state === "done" ? "View Results →" : test.state === "active" ? "Continue Testing →" : "Start Test →";

  return {
    num: String(index + 1).padStart(2, "0"),
    title: test.name,
    checks: test.checks,
    status,
    statusColor,
    action,
    active: test.state === "active",
    badge: test.trigger,
  };
};

const assessmentList = (sample: LabSample): LabAssessmentItem[] => [
  { label: "Traceability", status: "Complete", color: "green" },
  { label: "Withdrawal Check", ...labWithdrawalCheck(sample) },
  ...sample.tests.map((test) => ({
    label: test.name,
    status: test.state === "done" ? "Complete" : test.state === "active" ? "In Progress" : "Pending",
    color: test.state === "done" ? (test.ok ? "green" : "red") : test.state === "active" ? "amber" : "neutral",
  })),
];

export async function fetchLabDispatchDetail(dispatchId: string): Promise<LabDispatchDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // CONFLICT: this used to return the same Shree Krishna milk body for every id, so
  // opening the meat or egg dispatch showed milk. It now reads the requested lot.
  const sample = store.getLabSample(dispatchId);
  if (!sample) return null;

  const view = stageView(sample.stage);

  return {
    id: sample.dispatchId,
    product: sample.productLabel,
    source: sample.sourceName,
    date: sample.date,
    time: sample.time,
    quantity: sample.quantity,
    linkedAnimal: sample.animalId ?? sample.batchLabel ?? "—",
    currentSample: sample.sampleId,
    risk: sample.risk,
    riskColor: riskColor(sample.risk),
    riskReason: sample.riskReason,
    overallStatus: view.overallStatus,
    stages: STAGE_LABELS.map((label, index) => ({
      label,
      state: index < view.stageIndex ? "done" : index === view.stageIndex ? "active" : "upcoming",
    })),
    tests: sample.tests.map(testItem),
    assessment: assessmentList(sample),
    notes: {
      condition: sample.receipt.condition,
      temperature: sample.receipt.temperature,
      container: sample.receipt.container,
      receivedBy: sample.receipt.receivedBy,
      receivedAt: sample.receipt.receivedAt,
    },
    activity: sample.activity.map((row) => ({ ...row })),
  };
}
