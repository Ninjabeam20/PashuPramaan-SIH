export interface TreatmentSummary {
  active_treatments: number;
  withdrawal_ongoing: number;
  awaiting_vet_unsigned: number;
  completed: number;
}

export interface BadgeData {
  text: string;
  variant: string;
}

export interface WithdrawalData {
  dose_time: string;
  now_pct: number;
  clear_label: string;
  product_message: string; // e.g. "Milk clears tomorrow, 10:30 AM"
}

export interface TreatmentItem {
  id: string;
  animal_flock: string;
  species: string;
  feed_batch?: string;
  drug_name: string;
  route_dosage: string;
  administered_time: string;
  status: "Active" | "Withdrawal" | "Completed" | "Unsigned";
  badges: BadgeData[];
  withdrawal?: WithdrawalData;
}

export interface PrescriptionOption {
  id: string;
  drug_name: string;
  dosage: string;
  route: string;
  rx_id: string | null; // null if pending signature or exception
  is_emergency_exception: boolean;
}

export const getTreatments = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    summary: {
      active_treatments: 2,
      withdrawal_ongoing: 2,
      awaiting_vet_unsigned: 2,
      completed: 1
    } as TreatmentSummary,
    items: [
      {
        id: "trt-1",
        animal_flock: "MP-104",
        species: "Buffalo",
        drug_name: "Oxytetracycline",
        route_dosage: "Injection \u00b7 10 mg/kg",
        administered_time: "Administered Today, 08:15 AM",
        status: "Withdrawal",
        badges: [
          { text: "Withdrawal Active", variant: "withdrawal_active" },
          { text: "Vet Signed", variant: "vet_signed" },
          { text: "Lab \u2264 MRL", variant: "lab_mrl" },
        ],
        withdrawal: {
          dose_time: "Dose",
          now_pct: 30,
          clear_label: "Clear",
          product_message: "Milk clears tomorrow, 10:30 AM"
        }
      },
      {
        id: "trt-2",
        animal_flock: "Flock P-01",
        species: "Poultry",
        feed_batch: "Feed Batch FB-012",
        drug_name: "Oxytetracycline",
        route_dosage: "Medicated Feed \u00b7 200 mg/L water",
        administered_time: "Administered 2 days ago",
        status: "Unsigned",
        badges: [
          { text: "Withdrawal Active", variant: "withdrawal_active" },
          { text: "Emergency / Unsigned", variant: "emergency_unsigned" },
          { text: "No lab assay", variant: "no_lab_assay" },
        ],
        withdrawal: {
          dose_time: "Dose",
          now_pct: 55,
          clear_label: "Clear",
          product_message: "Eggs clear in 4 days"
        }
      },
      {
        id: "trt-3",
        animal_flock: "MP-106",
        species: "Goat",
        drug_name: "Amoxicillin",
        route_dosage: "Injection \u00b7 7 mg/kg",
        administered_time: "Administered Yesterday, 14:00",
        status: "Active",
        badges: [
          { text: "Active", variant: "active" },
          { text: "Vet Signed", variant: "vet_signed" },
        ]
      },
      {
        id: "trt-4",
        animal_flock: "MP-109",
        species: "Buffalo",
        drug_name: "Vitamin B12",
        route_dosage: "Injection \u00b7 5 mL",
        administered_time: "Administered Today, 09:00 AM",
        status: "Unsigned",
        badges: [
          { text: "Active", variant: "active" },
          { text: "Pending Vet Signature", variant: "pending_vet_signature" },
        ]
      },
      {
        id: "trt-5",
        animal_flock: "MP-108",
        species: "Cow",
        drug_name: "Ivermectin",
        route_dosage: "Pour-on \u00b7 500 mcg/kg",
        administered_time: "Administered 5 days ago",
        status: "Completed",
        badges: [
          { text: "Completed", variant: "completed" },
          { text: "Vet Signed", variant: "vet_signed" },
          { text: "Lab \u2264 MRL", variant: "lab_mrl" },
        ]
      }
    ] as TreatmentItem[]
  };
};

export const getPrescriptionOptions = async (): Promise<PrescriptionOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: "opt-1", drug_name: "Oxytetracycline", dosage: "10 mg/kg", route: "Injection", rx_id: "201", is_emergency_exception: false },
    { id: "opt-2", drug_name: "Amoxicillin", dosage: "7 mg/kg", route: "Injection", rx_id: "198", is_emergency_exception: false },
    { id: "opt-3", drug_name: "Ivermectin", dosage: "500 mcg/kg", route: "Pour-on", rx_id: "195", is_emergency_exception: false },
    { id: "opt-4", drug_name: "Vitamin B12", dosage: "5 mL", route: "Injection", rx_id: null, is_emergency_exception: false },
    { id: "opt-5", drug_name: "Oxytetracycline", dosage: "Medicated Feed", route: "", rx_id: "189", is_emergency_exception: false },
    { id: "opt-6", drug_name: "No signed Rx \u2014 Emergency Log", dosage: "", route: "", rx_id: null, is_emergency_exception: true },
  ];
};

export interface TreatmentTimelineStep {
  label: string;
  status: "complete" | "current" | "upcoming";
}

export interface TreatmentDetail {
  id: string;
  animal_id: string;
  species: string;
  status_badges: BadgeData[];
  medicine: string;
  route: string;
  dose: string;
  administered_at: string;
  reason: string;
  withdrawal: WithdrawalData | null;
  timeline: TreatmentTimelineStep[];
}

export const getTreatmentDetail = async (treatmentId: string): Promise<TreatmentDetail> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (treatmentId === "trt-1") {
    return {
      id: "trt-1",
      animal_id: "MP-104",
      species: "Buffalo",
      status_badges: [
        { text: "Withdrawal Active", variant: "withdrawal_active" },
        { text: "Vet Signed", variant: "vet_signed" },
        { text: "Lab \u2264 MRL", variant: "lab_mrl" },
      ],
      medicine: "Oxytetracycline",
      route: "Injection",
      dose: "10 mg/kg",
      administered_at: "Today, 08:15 AM",
      reason: "Respiratory infection",
      withdrawal: {
        dose_time: "Dose",
        now_pct: 30,
        clear_label: "Clear",
        product_message: "Milk clears tomorrow, 10:30 AM"
      },
      timeline: [
        { label: "Prescription", status: "complete" },
        { label: "Dose Given", status: "complete" },
        { label: "Withdrawal", status: "current" },
        { label: "Clear", status: "upcoming" }
      ]
    };
  }

  // Generic fallback
  return {
    id: treatmentId,
    animal_id: "MP-106",
    species: "Goat",
    status_badges: [
      { text: "Active", variant: "active" },
      { text: "Vet Signed", variant: "vet_signed" },
    ],
    medicine: "Amoxicillin",
    route: "Injection",
    dose: "7 mg/kg",
    administered_at: "Yesterday, 14:00",
    reason: "Preventative",
    withdrawal: null,
    timeline: [
      { label: "Prescription", status: "complete" },
      { label: "Dose Given", status: "complete" },
      { label: "Withdrawal", status: "upcoming" },
      { label: "Clear", status: "upcoming" }
    ]
  };
};
