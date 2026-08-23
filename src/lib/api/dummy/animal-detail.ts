import { store } from "@/lib/seed/store";
import { animalStatus, signatureBadge, withdrawalDto } from "@/lib/seed/project";
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
  await new Promise((resolve) => setTimeout(resolve, 400));

  const animal = store.getAnimal(animalId);

  // Animals added during this session that are not seeded yet fall back to a
  // healthy placeholder, exactly as before the store existed.
  if (!animal) {
    return {
      id: animalId,
      type: "Cow",
      status: "healthy",
      breed: "Unknown",
      sex: "Female",
      date_of_birth: "01 Jan 2020",
      production_type: "Dairy",
      registered_on: "15 Jun 2021",
      current_treatment: null,
    };
  }

  const treatment = store.getOpenTreatment(animal.id);

  return {
    id: animal.id,
    type: animal.species,
    status: animalStatus(animal.id),
    breed: animal.breed,
    sex: animal.sex,
    date_of_birth: animal.dateOfBirth,
    production_type: animal.productionType,
    registered_on: animal.registeredOn,
    current_treatment: treatment
      ? {
          drug: treatment.drug,
          route: treatment.route,
          dosage: treatment.dosage,
          administered_at: treatment.administeredLabel,
          signed_badge: signatureBadge(treatment),
          withdrawal: treatment.withdrawal ? withdrawalDto(treatment.withdrawal) : null,
        }
      : null,
  };
};
