export const getFarmerDashboard = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        farm: {
          name: "Shree Krishna Dairy",
          status: "GOOD",
          animal_count: 48,
          clear_count: 43,
          under_treatment_count: 3,
          waiting_count: 2,
        },
        attention_items: [
          {
            id: "1",
            priority: "HIGH",
            title: "MP-104",
            subtitle: "Withdrawal active",
            detail: "Clears tomorrow",
            type: "animal"
          },
          {
            id: "2",
            priority: "MEDIUM",
            title: "Medicine A",
            subtitle: "Stock running low",
            detail: "Reorder recommended",
            type: "medicine"
          }
        ],
        quick_actions: [
          { id: "record_treatment", label: "Record Treatment", action: "record_treatment" },
          { id: "health_event", label: "Health Event", action: "health_event" },
          { id: "start_dispatch", label: "Start Dispatch", action: "start_dispatch" }
        ],
        insight: {
          demand_level: "High",
          window_days: 30,
          medicines: [
            { name: "Oxytetracycline", demand_pct: 84, level: "High" },
            { name: "Ivermectin", demand_pct: 61, level: "Medium" },
            { name: "Vitamin B Complex", demand_pct: 45, level: "Normal" }
          ],
          recommendation: "Oxytetracycline demand is high. Consider restocking in the next 7-10 days."
        },
        top_medicines_by_demand: [
          { rank: "01", name: "Oxytetracycline", level: "High" },
          { rank: "02", name: "Ivermectin", level: "Medium" },
          { rank: "03", name: "Vitamin B Complex", level: "Normal" }
        ]
      });
    }, 500);
  });
};
