// Dummy API for the Vet Signature Flow

export interface PrescriptionSignDetail {
  rx_id: string;
  farm: string;
  animal: string;
  diagnosis: string;
  status_badges: { text: string; variant: string; dot?: boolean }[];
  prescription: {
    drug: string;
    route: string;
    dose: string;
    frequency: string;
    duration: string;
    reason: string;
  };
  requires_stewardship_notice: boolean;
  confirmation_heading?: string;
  confirmation_text?: string;
  
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
      { text: "SIGN-REQ", variant: "sign" },
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

export const getEmergencyForCountersigning = async (rxId: string): Promise<PrescriptionSignDetail> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    rx_id: rxId,
    farm: "Meena Poultry",
    animal: "Flock P-01",
    diagnosis: "Gumboro (IBD)",
    status_badges: [
      { text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true }
    ],
    prescription: {
      drug: "Oxytetracycline",
      dose: "20 mg/kg",
      route: "Oral",
      frequency: "Once daily",
      duration: "5 days",
      reason: "Gumboro-associated secondary infection"
    },
    confirmation_heading: "Countersignature confirmation",
    confirmation_text: "By countersigning, I confirm that I have reviewed this emergency administration record and am formally adding my countersignature to authorize it.",
    // Other fields unused by countersign but matching interface
    requires_stewardship_notice: false
  };
};

export const submitCountersignature = async (
  rxId: string,
  payload: { typed_name: string; has_drawn_signature: boolean; pin: string }
) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating network & cryptographic delay
  
  if (payload.pin !== "1234") {
    throw new Error("Invalid PIN");
  }

  const now = new Date();
  const formatTime = () => {
    return `${now.getDate()} Aug \u00b7 ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}`;
  };

  const ref = Math.floor(1000000 + Math.random() * 9000000).toString();

  return {
    countersigned_by: payload.typed_name || "Dr. Bankey",
    date_time: formatTime(),
    status: "countersigned",
    reference: `Countersigned \u00b7 ${ref}`,
    disclaimer_text: "This countersignature records your formal review and authorization of the emergency administration. The original emergency administration record has been retained."
  };
};
