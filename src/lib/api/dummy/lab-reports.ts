import { store } from "@/lib/seed/store";

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

export const REPORTS_SUMMARY: ReportsSummary[] = store.getState().labReportTotals;

export async function fetchLabReports(): Promise<LabReport[]> {
  await new Promise((r) => setTimeout(r, 500));

  // CONFLICT: the milk report said CLEARED for MLK-2026-00124 while the testing queue and
  // dashboard still had that lot on the bench. A report only exists once the lab has one
  // (plan resolution 13) — the CLEARED milk report now belongs to MLK-2026-00118, the milk
  // dispatch that really is finished, and EGG-2026-00241 gets its report when it is verified.
  return store
    .getLabSamples()
    .filter((sample) => sample.report !== null)
    .map((sample) => {
      const report = sample.report!;
      return {
        id: sample.dispatchId,
        product: sample.product,
        productSub: sample.productSub,
        source: sample.sourceName,
        sample: sample.sampleId,
        animal: sample.animalId ?? (sample.batchLabel ? `Batch ${sample.batchLabel}` : "—"),
        date: sample.resultDate ?? sample.date,
        status: report.status,
        statusColor: report.statusColor,
        refNo: report.refNo,
        verifiedBy: report.verifiedBy,
        verifiedOn: report.verifiedOn,
        assessments: report.assessments.map((row) => ({ ...row })),
        mrl: { ...report.mrl },
        withdrawal: { ...report.withdrawal },
        outcome: report.outcome,
        outcomeOk: report.outcomeOk,
      };
    });
}
