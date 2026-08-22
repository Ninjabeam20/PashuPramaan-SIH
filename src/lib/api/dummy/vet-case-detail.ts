export interface CaseDetail {
  id: string;
  label: string;
  title: string;
  animal: {
    id: string;
    species_type: string;
  };
  farm_name: string;
  status_badges: Array<{ text: string; variant: string; dot?: boolean }>;
  health_event?: {
    name: string;
    onset: string;
  };
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  stewardship?: {
    aware_badge?: { text: string; variant: string };
    cia_badge?: { text: string; variant: string };
  };
  treatment_history?: {
    previous_episode: string;
    outcome_badge: { text: string; variant: string };
    completed_date: string;
  };
}

export const getCaseDetail = async (caseId: string): Promise<CaseDetail> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Determine mock data based on caseId or return a default
  if (caseId.includes("P-01") || caseId === "attn-2") {
    // Unsigned emergency case mock
    return {
      id: "Flock P-01",
      label: "Flock P-01",
      title: "Gumboro (IBD)",
      animal: {
        id: "Flock P-01",
        species_type: "Poultry \u00b7 Broiler"
      },
      farm_name: "Meena Poultry",
      status_badges: [
        { text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true }
      ],
      health_event: {
        name: "Gumboro (IBD)",
        onset: "Today"
      },
      prescription: {
        drug: "Oxytetracycline",
        route: "Drinking water",
        dose: "20 mg/kg",
        frequency: "Once daily",
        duration: "3 days",
        reason: "Outbreak control"
      }
    };
  }

  // Default / RX-205 mock
  return {
    id: caseId,
    label: "RX-205",
    title: "Clinical mastitis",
    animal: {
      id: "MP-118",
      species_type: "Buffalo \u00b7 Dairy"
    },
    farm_name: "Krishna Dairy",
    status_badges: [
      { text: "SIGN-REQ", variant: "sign" },
      { text: "WATCH", variant: "watch" },
      { text: "CIA", variant: "cia" }
    ],
    health_event: {
      name: "Clinical mastitis",
      onset: "18 Aug"
    },
    prescription: {
      drug: "Enrofloxacin",
      route: "Intramammary",
      dose: "10 mL",
      frequency: "Twice daily",
      duration: "3 days",
      reason: "Acute mastitis"
    },
    stewardship: {
      aware_badge: { text: "WATCH", variant: "watch" },
      cia_badge: { text: "CIA", variant: "cia" }
    },
    treatment_history: {
      previous_episode: "Clinical mastitis",
      outcome_badge: { text: "RECOVERED", variant: "recovered" },
      completed_date: "12 Aug"
    }
  };
};
