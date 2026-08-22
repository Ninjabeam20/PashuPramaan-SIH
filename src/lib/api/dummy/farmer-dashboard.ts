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
        medicine_stock: [
          { name: "Oxytetracycline", quantity_label: "17 vials", status: { text: "Restock recommended", variant: "red" } },
          { name: "Ivermectin", quantity_label: "32 doses", status: { text: "Stock sufficient", variant: "green" } },
          { name: "Vitamin B Complex", quantity_label: "60 doses", status: { text: "Good", variant: "green" } },
          { name: "Amoxicillin", quantity_label: "8 vials", status: { text: "Monitor", variant: "amber" } }
        ]
      });
    }, 500);
  });
};
