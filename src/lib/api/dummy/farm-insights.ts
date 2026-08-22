export interface FarmInsights {
  range: "30d" | "90d";
  at_a_glance: {
    medicine_demand_level: "Low" | "Moderate" | "High";
    animals_needing_attention: number;
    upcoming_followups: number;
  };
  medicine_demand: {
    level: "Low" | "Moderate" | "High";
    range_label: string;
    summary: string;
    chart_data: { month: string; past_usage: number | null; forecast: number | null }[];
    now_index: number; // For rendering the vertical reference line
  };
  farm_heatmap: { entity: string; level: "Low" | "Moderate" | "High" }[];
  medicines_to_watch: {
    name: string;
    trend: "up" | "flat" | "down";
    subtitle: string;
    level: "Higher" | "Stable" | "Lower";
  }[];
  attention_items: {
    icon: "warning_amber" | "check_green" | "warning_purple";
    title: string;
    description: string;
  }[];
  why_this_matters: {
    text: string;
    highlight: string;
  };
}

export const getFarmInsights = async (range: "30d" | "90d"): Promise<FarmInsights> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (range === "90d") {
    return {
      range: "90d",
      at_a_glance: {
        medicine_demand_level: "High",
        animals_needing_attention: 5,
        upcoming_followups: 4,
      },
      medicine_demand: {
        level: "High",
        range_label: "90 days",
        summary: "Demand is expected to rise sharply over the next 90 days.",
        chart_data: [
          { month: "Mar", past_usage: 10, forecast: null },
          { month: "Apr", past_usage: 15, forecast: null },
          { month: "May", past_usage: 22, forecast: null },
          { month: "Jun", past_usage: 20, forecast: null },
          { month: "Jul", past_usage: 28, forecast: null },
          { month: "Aug", past_usage: 25, forecast: null },
          { month: "Sep", past_usage: 32, forecast: null },
          { month: "Oct", past_usage: 35, forecast: 35 },
          { month: "Nov", past_usage: null, forecast: 45 },
          { month: "Dec", past_usage: null, forecast: 60 },
          { month: "Jan", past_usage: null, forecast: 75 },
        ],
        now_index: 7,
      },
      farm_heatmap: [
        { entity: "Cow A", level: "Low" },
        { entity: "Cow B", level: "High" },
        { entity: "Cow C", level: "Moderate" },
        { entity: "Buffalo A", level: "High" },
        { entity: "Goat Grp", level: "High" },
        { entity: "Buffalo B", level: "Moderate" },
        { entity: "Flock P-01", level: "High" },
        { entity: "Cow D", level: "Low" },
        { entity: "Goat B", level: "Moderate" },
      ],
      medicines_to_watch: [
        { name: "Oxytetracycline", trend: "up", subtitle: "Higher demand expected", level: "Higher" },
        { name: "Ivermectin", trend: "up", subtitle: "Higher demand expected", level: "Higher" },
        { name: "Vitamin B Complex", trend: "flat", subtitle: "Stable", level: "Stable" },
      ],
      attention_items: [
        { icon: "warning_amber", title: "Oxytetracycline", description: "Demand may increase significantly." },
        { icon: "warning_amber", title: "5 animals", description: "Treatment follow-ups approaching." },
        { icon: "warning_purple", title: "Flock P-01", description: "Health event escalating." },
      ],
      why_this_matters: {
        text: "Oxytetracycline demand is expected to increase because treatment activity has increased compared with the previous period. Higher usage is associated with an active health event on the farm. Ivermectin usage is also climbing rapidly.",
        highlight: "Higher usage is associated with an active health event on the farm.",
      },
    };
  }

  return {
    range: "30d",
    at_a_glance: {
      medicine_demand_level: "Moderate",
      animals_needing_attention: 3,
      upcoming_followups: 2,
    },
    medicine_demand: {
      level: "Moderate",
      range_label: "30 days",
      summary: "Demand is expected to remain steady over the next 30 days.",
      chart_data: [
        { month: "Mar", past_usage: 10, forecast: null },
        { month: "Apr", past_usage: 15, forecast: null },
        { month: "May", past_usage: 22, forecast: null },
        { month: "Jun", past_usage: 20, forecast: null },
        { month: "Jul", past_usage: 28, forecast: null },
        { month: "Aug", past_usage: 25, forecast: null },
        { month: "Sep", past_usage: 32, forecast: null },
        { month: "Oct", past_usage: 35, forecast: 35 },
        { month: "Nov", past_usage: null, forecast: 38 },
        { month: "Dec", past_usage: null, forecast: 36 },
        { month: "Jan", past_usage: null, forecast: 34 },
      ],
      now_index: 7,
    },
    farm_heatmap: [
      { entity: "Cow A", level: "Low" },
      { entity: "Cow B", level: "Moderate" },
      { entity: "Cow C", level: "Low" },
      { entity: "Buffalo A", level: "Moderate" },
      { entity: "Goat Grp", level: "High" },
      { entity: "Buffalo B", level: "Moderate" },
      { entity: "Flock P-01", level: "Moderate" },
      { entity: "Cow D", level: "Low" },
      { entity: "Goat B", level: "Moderate" },
    ],
    medicines_to_watch: [
      { name: "Oxytetracycline", trend: "up", subtitle: "Higher demand expected", level: "Higher" },
      { name: "Ivermectin", trend: "flat", subtitle: "Stable", level: "Stable" },
      { name: "Vitamin B Complex", trend: "down", subtitle: "Lower demand expected", level: "Lower" },
    ],
    attention_items: [
      { icon: "warning_amber", title: "Oxytetracycline", description: "Demand may increase next week." },
      { icon: "warning_amber", title: "2 animals", description: "Treatment follow-up approaching." },
      { icon: "check_green", title: "4 animals", description: "Cleared for dispatch." },
      { icon: "warning_purple", title: "Flock P-01", description: "Health event remains on watch." },
    ],
    why_this_matters: {
      text: "Oxytetracycline demand is expected to increase because treatment activity has increased compared with the previous period. Higher usage is associated with an active health event on the farm. Ivermectin and Vitamin B Complex usage remains within normal range.",
      highlight: "Higher usage is associated with an active health event on the farm.",
    },
  };
};
