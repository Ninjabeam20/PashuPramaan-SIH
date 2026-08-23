export interface VetOption {
  id: string;
  name: string;
  designation: string;
}

export const getAvailableVets = async (): Promise<VetOption[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    {
      id: "vet-1",
      name: "Dr. Bankey",
      designation: "Veterinary Officer",
    },
    {
      id: "vet-2",
      name: "Dr. Sofia Abidi",
      designation: "Senior Vet Surgeon",
    },
    {
      id: "vet-3",
      name: "Dr. Anil Sharma",
      designation: "Field Veterinarian",
    }
  ];
};
