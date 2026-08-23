import { store } from "@/lib/seed/store";
import { labTestingFinished } from "@/lib/seed/project";

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

const RESULT_VIEW = {
  on_hold: { status: "ACTION REQUIRED", statusColor: "red" as const, action: "Review →", outcome: "hold" as const },
  awaiting_verification: { status: "AWAITING VERIFICATION", statusColor: "amber" as const, action: "Review Assessment →", outcome: "released" as const },
  verified: { status: "VERIFIED", statusColor: "green" as const, action: "View Report →", outcome: "released" as const },
};

export async function fetchLabResults(): Promise<LabResult[]> {
  await new Promise((r) => setTimeout(r, 500));

  // CONFLICT: results listed MLK-2026-00124 as awaiting verification while the testing
  // queue still had it on the bench. A lot only reaches this table once every test is
  // done (plan resolution 13), so it is the queue and this list that now agree.
  return store
    .getLabSamples()
    .filter((sample) => labTestingFinished(sample) && sample.stage in RESULT_VIEW)
    .map((sample) => {
      const view = RESULT_VIEW[sample.stage as keyof typeof RESULT_VIEW];
      return {
        id: sample.dispatchId,
        product: sample.productLabel,
        source: sample.sourceName,
        sample: sample.sampleId,
        date: sample.resultDate ?? sample.date,
        tests: sample.tests.map((test) => ({
          label: test.name,
          result: test.result ?? "PENDING",
          ok: test.ok,
        })),
        status: view.status,
        statusColor: view.statusColor,
        action: view.action,
        outcome: view.outcome,
      };
    });
}
