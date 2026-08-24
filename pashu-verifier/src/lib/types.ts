export type TimelineEvent = {
  date: string;
  label: string;
  type: "calendar" | "shield" | "flask" | "steth";
  ok: boolean;
};

export type PassportView = {
  passportId: string;
  isVerified: boolean;
  farm: string;
  district: string;
  product: { quantity: string; type: string };
  safety: {
    withdrawalCleared: boolean;
    vetCleared: boolean;
    labPassed: boolean;
  };
  lab: {
    testName: string;
    labId: string;
    result: number | null;
    permittedLimit: number;
    testDate: string;
  };
  timeline: TimelineEvent[];
};

export type PassportRow = {
  id: string;
  status?: string | null;
  is_verified?: boolean | null;
  farm_name?: string | null;
  district?: string | null;
  product_type?: string | null;
  quantity?: string | null;
  lab_results?: Record<string, unknown> | null;
  vet_signatures?: Record<string, unknown> | null;
  health_ledger?: TimelineEvent[] | null;
};

function asBool(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function rowToView(row: PassportRow): PassportView {
  const lab = (row.lab_results || {}) as Record<string, unknown>;
  const safety = (row.vet_signatures || {}) as Record<string, unknown>;
  const timeline = Array.isArray(row.health_ledger) ? row.health_ledger : [];
  const verifiedFromStatus = String(row.status || "").toUpperCase() === "VALID";
  return {
    passportId: row.id,
    isVerified: row.is_verified === true || (row.is_verified == null && verifiedFromStatus),
    farm: row.farm_name || "Unknown farm",
    district: (typeof row.district === "string" && row.district) || String(safety.district || "—"),
    product: {
      quantity: row.quantity || "",
      type: row.product_type || "",
    },
    safety: {
      withdrawalCleared: asBool(safety.withdrawalCleared),
      vetCleared: asBool(safety.vetCleared),
      labPassed: asBool(safety.labPassed),
    },
    lab: {
      testName: String(lab.testName || "Beta-Lactam Residue Screen"),
      labId: String(lab.labId || "—"),
      result: asNumber(lab.result),
      permittedLimit: asNumber(lab.permittedLimit) ?? 0.1,
      testDate: String(lab.testDate || "—"),
    },
    timeline,
  };
}
