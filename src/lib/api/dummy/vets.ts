import { store } from "@/lib/seed/store";

export interface VetOption {
  id: string;
  name: string;
  designation: string;
}

export const getAvailableVets = async (): Promise<VetOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return store.getVets().map((vet) => ({
    id: vet.id,
    name: vet.name,
    designation: vet.designation,
  }));
};
