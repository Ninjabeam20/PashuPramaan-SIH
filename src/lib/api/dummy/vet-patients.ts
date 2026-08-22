export interface PatientItem {
  id: string;
  type: string;
  farm: string;
  status: { text: string; variant: string; dot?: boolean };
  last_follow_up: string;
}

export interface PatientsData {
  summary: {
    all_count: number;
    under_treatment_count: number;
    follow_up_due_count: number;
    recovered_count: number;
    needs_attention_count: number;
  };
  items: PatientItem[];
}

export const getVetPatients = async (): Promise<PatientsData> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    summary: {
      all_count: 6,
      under_treatment_count: 1,
      follow_up_due_count: 1,
      recovered_count: 2,
      needs_attention_count: 1,
    },
    items: [
      {
        id: "MP-104",
        type: "Cow",
        farm: "Shanti Dairy",
        status: { text: "Under Treatment", variant: "patient_under_treatment", dot: true },
        last_follow_up: "22 Aug"
      },
      {
        id: "MP-118",
        type: "Cow",
        farm: "Krishna Dairy",
        status: { text: "Improved", variant: "improved", dot: true },
        last_follow_up: "20 Aug"
      },
      {
        id: "Flock P-01",
        type: "Flock (Broiler)",
        farm: "Meena Poultry",
        status: { text: "Recovered", variant: "recovered", dot: true },
        last_follow_up: "21 Aug"
      },
      {
        id: "MP-112",
        type: "Buffalo",
        farm: "Krishna Dairy",
        status: { text: "Improved", variant: "improved", dot: true },
        last_follow_up: "17 Aug"
      },
      {
        id: "MP-097",
        type: "Cow",
        farm: "Shanti Dairy",
        status: { text: "Recovered", variant: "recovered", dot: true },
        last_follow_up: "16 Aug"
      },
      {
        id: "MP-088",
        type: "Buffalo",
        farm: "Krishna Dairy",
        status: { text: "No Change", variant: "no_change", dot: true },
        last_follow_up: "14 Aug"
      }
    ]
  };
};
