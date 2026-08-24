import { describe, expect, it } from "vitest";

import { FORECAST_DEFAULTS, parseForecastSlots } from "./parse-slots";

describe("parseForecastSlots", () => {
  it("keeps current slots when the prompt is empty", () => {
    const { slots, understood } = parseForecastSlots("  ", FORECAST_DEFAULTS);
    expect(slots).toEqual(FORECAST_DEFAULTS);
    expect(understood).toEqual({});
  });

  it("treats a full allowed-set list as All", () => {
    const text = [
      "medicine include ONE of oxytetracycline, amoxicillin, enrofloxacin",
      "species include ONE of dairy, poultry, small ruminants",
      "region include ONE of Maharashtra, Gujarat, Rajasthan, Punjab, Karnataka",
      "forecast include ONE of next 30 days, next 60 days, next 90 days, Q4 2026",
    ].join("\n");
    const { slots } = parseForecastSlots(text);
    expect(slots.medicine).toBe("All Medicines");
    expect(slots.species).toBe("All Species");
    expect(slots.region).toBe("All Regions");
    expect(slots.period).toBe("Next 30 days");
  });

  it("selects a single listed medicine, species, region, and horizon", () => {
    const text = [
      "medicine include ONE of oxytetracycline",
      "species include ONE of dairy",
      "region include ONE of Maharashtra",
      "forecast include ONE of next 90 days",
    ].join("\n");
    const { slots, understood } = parseForecastSlots(text);
    expect(slots).toEqual({
      medicine: "Oxytetracycline",
      species: "Dairy",
      region: "Maharashtra",
      period: "Next 90 days",
    });
    expect(understood).toEqual(slots);
  });

  it("parses short free text", () => {
    const { slots } = parseForecastSlots("oxytetracycline in Maharashtra next 90 days");
    expect(slots.medicine).toBe("Oxytetracycline");
    expect(slots.region).toBe("Maharashtra");
    expect(slots.period).toBe("Next 90 days");
    expect(slots.species).toBe("All Species");
  });

  it("leaves unmatched slots at the current defaults", () => {
    const current = {
      medicine: "Amoxicillin",
      species: "Poultry",
      region: "Gujarat",
      period: "Next 60 days",
    };
    const { slots } = parseForecastSlots("Q4 2026", current);
    expect(slots.medicine).toBe("Amoxicillin");
    expect(slots.species).toBe("Poultry");
    expect(slots.region).toBe("Gujarat");
    expect(slots.period).toBe("Q4 2026");
  });
});
