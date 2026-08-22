// Dummy API for the Vet Signature Flow

export interface PrescriptionSignDetail {
  rx_id: string;
  diagnosis: string;
  farm: string;
  animal: string;
  status_badges: { text: string; variant: string }[];
  requires_stewardship_notice: boolean;
  
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  
  health_event?: {
    name: string;
    onset: string;
  };
  
  previous_treatment?: {
    drug: string;
    duration: string;
    outcome_badge: { text: string; variant: string };
  };

  stewardship?: {
    aware_badge?: { text: string; variant: string };
    cia_badge?: { text: string; variant: string };
    guidance: string[];
  };
}

export const getPrescriptionForSigning = async (rxId: string): Promise<PrescriptionSignDetail> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Default to the Rx-205 case which requires notice
  return {
    rx_id: rxId,
    diagnosis: "Clinical mastitis",
    farm: "Krishna Dairy",
    animal: "MP-118",
    status_badges: [
      { text: "SIGN", variant: "sign" },
      { text: "WATCH", variant: "watch" },
      { text: "CIA", variant: "cia" }
    ],
    requires_stewardship_notice: true,
    
    prescription: {
      drug: "Enrofloxacin",
      route: "Intramuscular",
      dose: "5 mg/kg",
      frequency: "Once daily",
      duration: "5 days",
      reason: "Non-responsive to first-line treatment"
    },
    
    health_event: {
      name: "Clinical mastitis",
      onset: "18 Aug"
    },
    
    previous_treatment: {
      drug: "Amoxicillin",
      duration: "3 days",
      outcome_badge: { text: "RECOVERED", variant: "recovered" }
    },
    
    stewardship: {
      aware_badge: { text: "WATCH", variant: "watch" },
      cia_badge: { text: "CIA", variant: "cia" },
      guidance: [
        "CIA drugs require clinical justification for use.",
        "AWaRe Watch drugs should be reserved for specific cases where first-line options are insufficient.",
        "Your signature confirms this prescription is clinically justified."
      ]
    }
  };
};

export const submitSignature = async (
  rxId: string, 
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string }
) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  if (payload.pin !== "1234") {
    throw new Error("Incorrect PIN");
  }

  // Generate a dummy signature reference
  const ref = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');

  return {
    signed_by: payload.typed_name || "Dr. Bankey", // Fallback if they only drew
    date_time: "22 Aug \u00b7 03:45 pm",
    status: "signed",
    signature_reference: `Signed \u00b7 ${ref}`
  };
};
