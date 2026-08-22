export interface FarmInsights {
  range: "30d" | "60d" | "90d";
  medicine_stock: {
    name: string;
    current_stock: string;
    recent_usage: string;
    status: { text: string; variant: string };
  }[];
  demand_forecast: {
    chart_data: { month: string; past_usage: number | null; forecast: number | null }[];
    now_index: number;
    current_stock: string;
    expected_requirement: string;
    status: { text: string; variant: string };
  };
  most_used_medicines: {
    rank: number;
    name: string;
    usage: string;
    usage_value: number;
  }[];
  farm_health_map: {
    species: string;
    level: "Low" | "Moderate" | "High";
    detail: string;
  }[];
  farm_performance: {
    chart_data: { month: string; milk_output: number; medicine_cost: number }[];
  };
  health_treatment_trends: {
    chart_data: { month: string; health_events: number; treatments: number }[];
  };
}

export const getFarmInsights = async (range: "30d" | "60d" | "90d"): Promise<FarmInsights> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Determine forecast data based on range
  let forecastData: { month: string; past_usage: number | null; forecast: number | null }[];
  if (range === "30d") {
    forecastData = [
      { month: "Mar", past_usage: 10, forecast: null },
      { month: "Apr", past_usage: 15, forecast: null },
      { month: "May", past_usage: 12, forecast: null },
      { month: "Jun", past_usage: 20, forecast: null },
      { month: "Jul", past_usage: 18, forecast: null },
      { month: "Aug", past_usage: 25, forecast: null },
      { month: "Sep", past_usage: 32, forecast: null },
      { month: "Oct", past_usage: 35, forecast: 35 },
      { month: "Nov", past_usage: null, forecast: 38 },
    ];
  } else if (range === "60d") {
    forecastData = [
      { month: "Mar", past_usage: 10, forecast: null },
      { month: "Apr", past_usage: 15, forecast: null },
      { month: "May", past_usage: 12, forecast: null },
      { month: "Jun", past_usage: 20, forecast: null },
      { month: "Jul", past_usage: 18, forecast: null },
      { month: "Aug", past_usage: 25, forecast: null },
      { month: "Sep", past_usage: 32, forecast: null },
      { month: "Oct", past_usage: 35, forecast: 35 },
      { month: "Nov", past_usage: null, forecast: 45 },
      { month: "Dec", past_usage: null, forecast: 42 },
    ];
  } else {
    // 90d
    forecastData = [
      { month: "Mar", past_usage: 10, forecast: null },
      { month: "Apr", past_usage: 15, forecast: null },
      { month: "May", past_usage: 12, forecast: null },
      { month: "Jun", past_usage: 20, forecast: null },
      { month: "Jul", past_usage: 18, forecast: null },
      { month: "Aug", past_usage: 25, forecast: null },
      { month: "Sep", past_usage: 32, forecast: null },
      { month: "Oct", past_usage: 35, forecast: 35 },
      { month: "Nov", past_usage: null, forecast: 45 },
      { month: "Dec", past_usage: null, forecast: 60 },
      { month: "Jan", past_usage: null, forecast: 75 },
    ];
  }

  return {
    range,
    medicine_stock: [
      { name: "Oxytetracycline", current_stock: "17 vials", recent_usage: "4 used", status: { text: "Restock recommended", variant: "red" } },
      { name: "Ivermectin", current_stock: "32 doses", recent_usage: "3 used", status: { text: "Good", variant: "green" } },
      { name: "Vitamin B Complex", current_stock: "60 doses", recent_usage: "2 used", status: { text: "Good", variant: "green" } },
      { name: "Amoxicillin", current_stock: "8 vials", recent_usage: "2 used", status: { text: "Monitor", variant: "amber" } },
    ],
    demand_forecast: {
      chart_data: forecastData,
      now_index: 7,
      current_stock: "17 vials",
      expected_requirement: "25 vials",
      status: { text: "Restock Recommended", variant: "red" }
    },
    most_used_medicines: [
      { rank: 1, name: "Oxytetracycline", usage: "25 used", usage_value: 100 },
      { rank: 2, name: "Ivermectin", usage: "18 used", usage_value: 72 },
      { rank: 3, name: "Vitamin B Complex", usage: "11 used", usage_value: 44 },
    ],
    farm_health_map: [
      { species: "Cattle", level: "Moderate", detail: "10 animals · 1 under treatment" },
      { species: "Buffaloes", level: "High", detail: "20 animals · 2 under treatment" },
      { species: "Goats", level: "Low", detail: "18 animals · 0 under treatment" },
      { species: "Poultry", level: "High", detail: "Flock P-01 · emergency tx" },
    ],
    farm_performance: {
      chart_data: [
        { month: "Mar", milk_output: 100, medicine_cost: 110 },
        { month: "Apr", milk_output: 120, medicine_cost: 105 },
        { month: "May", milk_output: 140, medicine_cost: 130 },
        { month: "Jun", milk_output: 130, medicine_cost: 110 },
        { month: "Jul", milk_output: 160, medicine_cost: 90 },
        { month: "Aug", milk_output: 175, medicine_cost: 80 },
      ]
    },
    health_treatment_trends: {
      chart_data: [
        { month: "Mar", health_events: 5, treatments: 8 },
        { month: "Apr", health_events: 7, treatments: 12 },
        { month: "May", health_events: 4, treatments: 9 },
        { month: "Jun", health_events: 10, treatments: 15 },
        { month: "Jul", health_events: 8, treatments: 11 },
        { month: "Aug", health_events: 13, treatments: 18 },
      ]
    }
  };
};
