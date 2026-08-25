import { API_BASE } from "@/lib/api/base-url";
import { getToken } from "./auth-utils";
import { store } from "@/lib/seed/store";
import { farmCounts, stockQuantityLabel, stockStatus } from "@/lib/seed/project";
import type { StockLevel } from "@/lib/seed/types";

const STOCK_LEVELS = new Set<StockLevel>(["restock", "monitor", "good"]);

function buildFromSeed() {
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
}

function normalizeMedicineStock(
  items: Array<{ name: string; quantity_label: string; status: unknown }> | undefined,
) {
  return (items ?? []).map((item) => {
    if (item.status && typeof item.status === "object" && "text" in (item.status as object)) {
      return item as { name: string; quantity_label: string; status: { text: string; variant: string } };
    }
    const level = typeof item.status === "string" && STOCK_LEVELS.has(item.status as StockLevel)
      ? (item.status as StockLevel)
      : "good";
    return {
      name: item.name,
      quantity_label: item.quantity_label,
      status: stockStatus(level),
    };
  });
}

export const getFarmerDashboard = async () => {
  const token = getToken();
  // Without a real login token, use the canonical seed (tests + unauthenticated browse).
  // With a token, prefer the API; fall back to seed if auth/shape fails so the page never crashes.
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/dashboard`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.farm?.name) {
          return {
            ...data,
            medicine_stock: normalizeMedicineStock(data.medicine_stock),
          };
        }
      }
    } catch {
      // API unavailable — fall through to seed
    }
  }
  return buildFromSeed();
};
