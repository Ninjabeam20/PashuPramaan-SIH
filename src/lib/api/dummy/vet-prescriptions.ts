export interface PrescriptionsData {
  summary: {
    all_count: number;
    awaiting_signature_count: number;
    unsigned_emergency_count: number;
    signed_count: number;
    voided_count: number;
  };
  items: Array<{
    rx_id: string;
    farm: string;
    animal_flock: string;
    diagnosis: string;
    status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    aware_badges: Array<{ text: string; variant: string; dot?: boolean }>;
    date_label: string;
    action_text: string;
    action_target: "sign_flow" | "countersign_flow" | "read_only";
  }>;
}

export const getPrescriptionsList = async (): Promise<PrescriptionsData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    summary: {
      all_count: 8,
      awaiting_signature_count: 2,
      unsigned_emergency_count: 0,
      signed_count: 4,
      voided_count: 1,
    },
    items: [
      {
        rx_id: "Rx-208",
        farm: "Shanti Dairy",
        animal_flock: "MP-104",
        diagnosis: "Clinical mastitis",
        status_badges: [{ text: "SIGN-REQ", variant: "sign" }],
        aware_badges: [{ text: "ACCESS", variant: "access" }],
        date_label: "10:42",
        action_text: "Review",
        action_target: "sign_flow"
      },
      {
        rx_id: "Rx-207",
        farm: "Meena Poultry",
        animal_flock: "Flock P-01",
        diagnosis: "Gumboro (IBD)",
        status_badges: [{ text: "COUNTERSIGNED", variant: "countersigned", dot: true }],
        aware_badges: [],
        date_label: "09:18",
        action_text: "Review",
        action_target: "read_only" 
      },
      {
        rx_id: "Rx-205",
        farm: "Krishna Dairy",
        animal_flock: "MP-118",
        diagnosis: "Clinical mastitis",
        status_badges: [{ text: "SIGN-REQ", variant: "sign" }],
        aware_badges: [{ text: "WATCH", variant: "watch" }, { text: "CIA", variant: "cia" }],
        date_label: "Yesterday",
        action_text: "Review",
        action_target: "sign_flow"
      },
      {
        rx_id: "Rx-201",
        farm: "Shanti Dairy",
        animal_flock: "MP-101",
        diagnosis: "Clinical mastitis",
        status_badges: [{ text: "SIGNED", variant: "signed", dot: true }],
        aware_badges: [{ text: "ACCESS", variant: "access" }],
        date_label: "Yesterday",
        action_text: "View",
        action_target: "read_only"
      },
      {
        rx_id: "Rx-198",
        farm: "Krishna Dairy",
        animal_flock: "MP-112",
        diagnosis: "Mastitis",
        status_badges: [{ text: "SIGNED", variant: "signed", dot: true }],
        aware_badges: [{ text: "ACCESS", variant: "access" }],
        date_label: "17 Aug",
        action_text: "View",
        action_target: "read_only"
      },
      {
        rx_id: "Rx-194",
        farm: "Meena Poultry",
        animal_flock: "Flock P-02",
        diagnosis: "Colibacillosis",
        status_badges: [{ text: "SIGNED", variant: "signed", dot: true }],
        aware_badges: [{ text: "WATCH", variant: "watch" }],
        date_label: "15 Aug",
        action_text: "View",
        action_target: "read_only"
      },
      {
        rx_id: "Rx-189",
        farm: "Shanti Dairy",
        animal_flock: "MP-097",
        diagnosis: "Foot rot",
        status_badges: [{ text: "SIGNED", variant: "signed", dot: true }],
        aware_badges: [{ text: "ACCESS", variant: "access" }],
        date_label: "12 Aug",
        action_text: "View",
        action_target: "read_only"
      },
      {
        rx_id: "Rx-183",
        farm: "Krishna Dairy",
        animal_flock: "MP-088",
        diagnosis: "Respiratory infection",
        status_badges: [{ text: "VOIDED", variant: "voided" }],
        aware_badges: [{ text: "RESERVE", variant: "reserve" }, { text: "CIA", variant: "cia" }],
        date_label: "10 Aug",
        action_text: "View",
        action_target: "read_only"
      }
    ]
  };
};
