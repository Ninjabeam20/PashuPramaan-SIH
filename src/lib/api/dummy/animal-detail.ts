import { WithdrawalData, BadgeData } from "./treatments";

export interface AnimalDetail {
  id: string;
  type: string;
  status: "under_treatment" | "healthy" | "waiting";
  breed: string;
  sex: string;
  date_of_birth: string;
  production_type: string;
  registered_on: string;
  current_treatment: {
    drug: string;
    route: string;
    dosage: string;
    administered_at: string;
    signed_badge: BadgeData;
    withdrawal: WithdrawalData | null;
  } | null;
}

export const getAnimalDetail = async (animalId: string): Promise<AnimalDetail> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (animalId === "MP-104") {
    return {
      id: "MP-104",
      type: "Buffalo",
      status: "under_treatment",
      breed: "Gir",
      sex: "Female",
      date_of_birth: "12 Mar 2021",
      production_type: "Dairy",
      registered_on: "01 Jan 2022",
      current_treatment: {
        drug: "Oxytetracycline",
        route: "Injection",
        dosage: "10 mg/kg",
        administered_at: "Administered Today, 08:15 AM",
        signed_badge: { text: "Vet Signed", variant: "vet_signed" },
        withdrawal: {
          dose_time: "Dose",
          now_pct: 30,
          clear_label: "Clear",
          product_message: "Milk clears tomorrow, 10:30 AM"
        }
      }
    };
  }

  // Default healthy fallback
  return {
    id: animalId,
    type: "Cow",
    status: "healthy",
    breed: "Unknown",
    sex: "Female",
    date_of_birth: "01 Jan 2020",
    production_type: "Dairy",
    registered_on: "15 Jun 2021",
    current_treatment: null
  };
};
