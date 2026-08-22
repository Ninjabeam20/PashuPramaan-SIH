export interface DispatchStatSummary {
  active_dispatches: number;
  ready_to_dispatch: number;
  under_withdrawal: number;
  blocked: number;
}

export interface DispatchItem {
  id: string;
  product: string;
  animal_flock: string;
  date: string;
  status: "cleared" | "withdrawal" | "blocked";
}

export interface DispatchSafetyOutcome {
  eligible: boolean;
  withdrawal: {
    status: "cleared" | "active";
    detail: string;
  };
  mrl: {
    status: "within_limit" | "exceeded";
    lab_result_ppm: string;
    permitted_ppm: string;
  } | null;
  prescription: {
    signed: boolean;
  };
  lab_assay: {
    available: boolean;
  };
}

export const getDispatches = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    summary: {
      active_dispatches: 1,
      ready_to_dispatch: 3,
      under_withdrawal: 2,
      blocked: 1
    } as DispatchStatSummary,
    items: [
      {
        id: "DSP-024",
        product: "Milk",
        animal_flock: "MP-104",
        date: "Today",
        status: "cleared"
      },
      {
        id: "DSP-023",
        product: "Milk",
        animal_flock: "MP-108",
        date: "Yesterday",
        status: "withdrawal"
      },
      {
        id: "DSP-022",
        product: "Meat",
        animal_flock: "Flock-07",
        date: "20 Aug",
        status: "blocked"
      }
    ] as DispatchItem[]
  };
};

export const checkDispatchSafety = async (product: string, animalIds: string[]): Promise<DispatchSafetyOutcome> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Hardcode a blocked scenario for MP-108 as a dummy rule, or if Meat + Flock-07
  if (animalIds.includes("MP-108") || (product === "Meat" && animalIds.includes("Flock-07"))) {
    return {
      eligible: false,
      withdrawal: {
        status: "active",
        detail: "Active (clears in 2 days)"
      },
      mrl: {
        status: "exceeded",
        lab_result_ppm: "0.15",
        permitted_ppm: "0.10"
      },
      prescription: {
        signed: true
      },
      lab_assay: {
        available: true
      }
    };
  }

  // Default passing scenario
  return {
    eligible: true,
    withdrawal: {
      status: "cleared",
      detail: "CLEARED"
    },
    mrl: {
      status: "within_limit",
      lab_result_ppm: "0.04",
      permitted_ppm: "0.10"
    },
    prescription: {
      signed: true
    },
    lab_assay: {
      available: true
    }
  };
};

export interface DispatchDetail {
  id: string;
  product: string;
  animal_flock: string;
  date: string;
  status: "cleared" | "withdrawal" | "blocked";
  timeline: { label: string; status: "complete" | "current" | "upcoming" }[];
  cleared_checklist?: string[];
  withdrawal_detail?: {
    clears_label: string;
    treatment_id: string;
  };
  blocked_detail?: {
    failed_gates: { gate: string; message: string }[];
    warnings: { icon: string; message: string }[];
  };
}

export const getDispatchDetail = async (dispatchId: string): Promise<DispatchDetail> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (dispatchId === "DSP-024") {
    return {
      id: "DSP-024",
      product: "Milk",
      animal_flock: "MP-104",
      date: "Today",
      status: "cleared",
      timeline: [
        { label: "Treatment", status: "complete" },
        { label: "Withdrawal", status: "complete" },
        { label: "Safety Check", status: "complete" },
        { label: "Dispatch", status: "complete" }
      ],
      cleared_checklist: [
        "Withdrawal Cleared",
        "MRL Within Limit",
        "Eligible",
        "Passport Generated"
      ]
    };
  }

  if (dispatchId === "DSP-023") {
    return {
      id: "DSP-023",
      product: "Milk",
      animal_flock: "MP-108",
      date: "Yesterday",
      status: "withdrawal",
      timeline: [
        { label: "Treatment", status: "complete" },
        { label: "Withdrawal", status: "current" },
        { label: "Safety Check", status: "upcoming" },
        { label: "Dispatch", status: "upcoming" }
      ],
      withdrawal_detail: {
        clears_label: "Clears: 24 Aug, 10:30 AM",
        treatment_id: "trt-2"
      }
    };
  }

  // DSP-022 Blocked fallback
  return {
    id: dispatchId,
    product: "Meat",
    animal_flock: "Flock-07",
    date: "20 Aug",
    status: "blocked",
    timeline: [
      { label: "Treatment", status: "complete" },
      { label: "Withdrawal", status: "complete" },
      { label: "Safety Check", status: "current" },
      { label: "Dispatch", status: "upcoming" }
    ],
    blocked_detail: {
      failed_gates: [
        { gate: "MRL", message: "MRL Above Limit \u2014 Lab: 0.14 ppm / Permitted: 0.10 ppm" }
      ],
      warnings: [
        { icon: "\u26A0", message: "Prescription Unsigned" }
      ]
    }
  };
};
