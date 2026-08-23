import { store } from "@/lib/seed/store";
import { farmCounts, stockQuantityLabel, stockStatus } from "@/lib/seed/project";

export const getFarmerDashboard = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const farm = store.getFarmerFarm();
  const counts = farmCounts();
  const stock = store.getMedicineStock();

  const attention_items: Array<{
    id: string;
    priority: string;
    title: string;
    subtitle: string;
    detail: string;
    type: string;
  }> = [];

  // Animals whose product is still inside a withdrawal window.
  store
    .getFarmerTreatments()
    .filter((treatment) => treatment.phase === "withdrawal")
    .forEach((treatment, index) => {
      attention_items.push({
        id: `attn-withdrawal-${index + 1}`,
        priority: "HIGH",
        title: treatment.animalId,
        subtitle: "Withdrawal active",
        detail: treatment.withdrawal?.productMessage ?? "Withdrawal in progress",
        type: "animal",
      });
    });

  // CONFLICT: the medicine row was titled "Medicine A" while the stock list below it
  // named the drug. Titled with the medicine that needs restocking (plan resolution 17).
  stock
    .filter((medicine) => medicine.level === "restock")
    .forEach((medicine, index) => {
      attention_items.push({
        id: `attn-stock-${index + 1}`,
        priority: "MEDIUM",
        title: medicine.name,
        subtitle: "Stock running low",
        detail: "Reorder recommended",
        type: "medicine",
      });
    });

  return {
    farm: {
      name: farm.name,
      status: counts.underTreatment > 3 ? "ATTENTION" : "GOOD",
      animal_count: counts.total,
      clear_count: counts.clear,
      under_treatment_count: counts.underTreatment,
      waiting_count: counts.waiting,
    },
    attention_items,
    quick_actions: [
      { id: "record_treatment", label: "Record Treatment", action: "record_treatment" },
      { id: "health_event", label: "Health Event", action: "health_event" },
      { id: "start_dispatch", label: "Start Dispatch", action: "start_dispatch" },
    ],
    medicine_stock: stock.map((medicine) => ({
      name: medicine.name,
      quantity_label: stockQuantityLabel(medicine),
      status: stockStatus(medicine.level),
    })),
  };
};
