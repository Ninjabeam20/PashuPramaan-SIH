import { store } from "@/lib/seed/store";
import { labAntimicrobial, labSourceSub, labTestingStarted, priorityColor } from "@/lib/seed/project";

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

  const awaiting: AwaitingSample[] = store.getAwaitingLabSamples().map((sample) => ({
    id: sample.dispatchId,
    product: sample.product,
    productSub: sample.productSub,
    source: sample.sourceName,
    sourceSub: labSourceSub(sample),
    sample: sample.sampleId,
    arrival: sample.arrival,
    priority: sample.priority,
    priorityColor: priorityColor(sample.priority),
    reason: sample.receiptReason,
    action: sample.priority === "HIGH PRIORITY" ? "Receive Sample →" : "Receive →",
    highlighted: sample.priority === "HIGH PRIORITY",
  }));

  // CONFLICT: MEAT-2026-00091 used to sit in both lists at once. A lot is either awaiting
  // receipt or on the bench, never both (plan resolution 16) — the two lists are now
  // disjoint slices of the same stage field.
  const ready: ReadySample[] = store
    .getLabSamples()
    .filter((sample) => sample.stage === "received" || sample.stage === "testing")
    .map((sample) => ({
      id: sample.dispatchId,
      product: sample.product,
      source: sample.sourceName,
      sample: sample.sampleId,
      tests: sample.tests.map((test) => ({ name: test.name, status: test.state })),
      action: labTestingStarted(sample) ? "Continue Testing →" : "Start Testing →",
    }));

  return { awaiting, ready };
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

  // Accepts either the lab dispatch id (what the dashboard links with) or the physical
  // sample id, and falls back to the lot currently on the bench.
  const sample =
    store.getLabSample(sampleId) ??
    store.getLabSamples().find((s) => s.stage === "testing") ??
    store.getLabSamples()[0];

  const antimicrobial = labAntimicrobial(sample);

  return {
    dispatchId: sample.dispatchId,
    sampleId: sample.sampleId,
    product: sample.productLabel,
    productSub: sample.product,
    source: sample.sourceName,
    sourceSub: sample.animalId ?? sample.batchLabel ?? "",
    condition: `✓ ${sample.receipt.condition}`,
    temperature: sample.receipt.temperature,
    riskLevel: sample.risk,
    // CONFLICT: the workspace claimed "Amoxicillin · withdrawal completed" for a lot whose
    // farmer treatment (trt-1, Oxytetracycline) is still inside its withdrawal window.
    // The context now derives from the linked farmer dispatch.
    antimicrobialContext: antimicrobial.context,
    antimicrobialStatus: antimicrobial.status,
    assessments: sample.tests.map((test, index) => ({
      num: index + 1,
      label: test.name,
      state: test.state,
    })),
  };
}
