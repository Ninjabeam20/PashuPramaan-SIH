import { describe, expect, it } from "vitest";

import { store } from "./store";
import { getFarmDetail } from "@/lib/api/dummy/farm-detail";
import { getFarmerDashboard } from "@/lib/api/dummy/farmer-dashboard";
import { getTreatments, getTreatmentDetail } from "@/lib/api/dummy/treatments";
import { getDispatches } from "@/lib/api/dummy/dispatch";
import { getPrescriptionsList } from "@/lib/api/dummy/vet-prescriptions";
import { getVetDashboard } from "@/lib/api/dummy/vet-dashboard";
import { getPrescriptionForSigning } from "@/lib/api/dummy/vet-sign-flow";
import { getVetPatients } from "@/lib/api/dummy/vet-patients";
import { fetchTestingQueue } from "@/lib/api/dummy/lab-testing";
import { fetchLabResults } from "@/lib/api/dummy/lab-results";
import { fetchLabReports } from "@/lib/api/dummy/lab-reports";
import { fetchLabDispatches } from "@/lib/api/dummy/lab-dispatches";

const duplicates = (ids: string[]): string[] => ids.filter((id, i) => ids.indexOf(id) !== i);

describe("canonical ids", () => {
  it("has one row per id in every collection", () => {
    const state = store.getState();
    expect(duplicates(state.farms.map((f) => f.id))).toEqual([]);
    expect(duplicates(state.animals.map((a) => a.id))).toEqual([]);
    expect(duplicates(state.prescriptions.map((p) => p.id))).toEqual([]);
    expect(duplicates(state.treatments.map((t) => t.id))).toEqual([]);
    expect(duplicates(state.farmerDispatches.map((d) => d.id))).toEqual([]);
    expect(duplicates(state.labSamples.map((s) => s.dispatchId))).toEqual([]);
    expect(duplicates(state.labSamples.map((s) => s.sampleId))).toEqual([]);
    expect(duplicates(state.adminAnomalies.map((a) => a.id))).toEqual([]);
  });

  it("resolves every reference to a real row", () => {
    const state = store.getState();
    const farmIds = state.farms.map((f) => f.id);
    const animalIds = state.animals.map((a) => a.id);
    const rxIds = state.prescriptions.map((p) => p.id);
    const treatmentIds = state.treatments.map((t) => t.id);
    const dispatchIds = state.farmerDispatches.map((d) => d.id);

    state.animals.forEach((animal) => expect(farmIds).toContain(animal.farmId));
    state.healthEvents.forEach((event) => expect(animalIds).toContain(event.animalId));
    state.prescriptions.forEach((rx) => {
      expect(farmIds).toContain(rx.farmId);
      expect(animalIds).toContain(rx.animalId);
    });
    state.treatments.forEach((treatment) => {
      expect(animalIds).toContain(treatment.animalId);
      expect(farmIds).toContain(treatment.farmId);
      if (treatment.prescriptionId) expect(rxIds).toContain(treatment.prescriptionId);
    });
    state.farmerDispatches.forEach((dispatch) => {
      expect(animalIds).toContain(dispatch.animalId);
      if (dispatch.treatmentId) expect(treatmentIds).toContain(dispatch.treatmentId);
      if (dispatch.labDispatchId) expect(store.getLabSample(dispatch.labDispatchId)).toBeDefined();
    });
    state.prescriptionOptions.forEach((option) => {
      if (option.prescriptionId) expect(rxIds).toContain(option.prescriptionId);
    });
    state.labSamples.forEach((sample) => {
      if (sample.farmId) expect(farmIds).toContain(sample.farmId);
      if (sample.animalId) expect(animalIds).toContain(sample.animalId);
      if (sample.farmerDispatchId) expect(dispatchIds).toContain(sample.farmerDispatchId);
    });
  });
});

describe("farmer adapters", () => {
  it("shows MP-104 as a Buffalo under treatment", async () => {
    const farm = await getFarmDetail();
    const mp104 = farm.animals.find((a) => a.id === "MP-104");
    expect(mp104).toMatchObject({ type: "Buffalo", status: "under_treatment" });
    expect(farm.farm.name).toBe("Shree Krishna Dairy");
  });

  it("keeps home counts and species overview in step with the roster", async () => {
    const farm = await getFarmDetail();
    const dashboard = await getFarmerDashboard();

    expect(dashboard.farm.animal_count).toBe(farm.farm.total_animals);
    expect(dashboard.farm.under_treatment_count).toBe(farm.farm.under_treatment_count);
    expect(
      dashboard.farm.clear_count + dashboard.farm.under_treatment_count + dashboard.farm.waiting_count,
    ).toBe(dashboard.farm.animal_count);

    const rosterUnderTreatment = farm.animals.filter((a) => a.status === "under_treatment").length;
    expect(farm.farm.under_treatment_count).toBe(rosterUnderTreatment);
    expect(
      farm.species_overview.reduce((sum, row) => sum + row.under_treatment_count, 0),
    ).toBe(rosterUnderTreatment);
  });

  it("names the low medicine instead of 'Medicine A'", async () => {
    const dashboard = await getFarmerDashboard();
    const medicine = dashboard.attention_items.find((item) => item.type === "medicine");
    expect(medicine?.title).toBe("Oxytetracycline");
  });

  it("opens each treatment on its own animal", async () => {
    const { items } = await getTreatments();
    expect(items.find((t) => t.id === "trt-1")).toMatchObject({ animal_flock: "MP-104", species: "Buffalo" });

    const trt2 = await getTreatmentDetail("trt-2");
    expect(trt2.animal_id).toBe("Flock P-01");
    expect(trt2.species).toBe("Poultry");
  });

  it("puts DSP-024 under withdrawal while MP-104's course runs", async () => {
    const { items, summary } = await getDispatches();
    expect(items.find((d) => d.id === "DSP-024")?.status).toBe("withdrawal");
    expect(summary.under_withdrawal).toBe(items.filter((d) => d.status === "withdrawal").length);
  });
});

describe("vet adapters", () => {
  it("keeps Rx-207 an unsigned emergency everywhere", async () => {
    const list = await getPrescriptionsList();
    const rx207 = list.items.find((item) => item.rx_id === "Rx-207");
    expect(rx207?.status_badges[0].text).toBe("UNSIGNED EMERGENCY");
    expect(list.summary.unsigned_emergency_count).toBe(1);

    const dashboard = await getVetDashboard();
    expect(dashboard.workload.unsigned_emergency).toBe(1);
    expect(dashboard.alerts).toHaveLength(1);
    expect(dashboard.alerts[0].animal_flock).toBe("Flock P-01");
  });

  it("agrees on Rx-205's animal across dashboard, list and sign flow", async () => {
    const list = await getPrescriptionsList();
    const dashboard = await getVetDashboard();
    const signFlow = await getPrescriptionForSigning("Rx-205");

    expect(list.items.find((i) => i.rx_id === "Rx-205")?.animal_flock).toBe("MP-118");
    expect(dashboard.prescriptions.items.find((i) => i.rx_id === "Rx-205")?.animal_flock).toBe("MP-118");
    expect(signFlow.animal).toBe("MP-118");
  });

  it("branches the sign flow on the prescription", async () => {
    const rx208 = await getPrescriptionForSigning("Rx-208");
    expect(rx208).toMatchObject({
      rx_id: "Rx-208",
      farm: "Shree Krishna Dairy",
      animal: "MP-104",
      requires_stewardship_notice: false,
    });
    expect(rx208.prescription.drug).toBe("Oxytetracycline");

    const rx205 = await getPrescriptionForSigning("Rx-205");
    expect(rx205.prescription.drug).toBe("Enrofloxacin");
    expect(rx205.requires_stewardship_notice).toBe(true);
  });

  it("lists Flock P-01 as under treatment while its emergency is unsigned", async () => {
    const patients = await getVetPatients();
    const flock = patients.items.find((p) => p.id === "Flock P-01");
    expect(flock?.status.text).toBe("Under Treatment");
    expect(patients.summary.under_treatment_count).toBe(2);
  });
});

describe("lab adapters", () => {
  it("never lists a sample as both awaiting receipt and ready", async () => {
    const queue = await fetchTestingQueue();
    const awaiting = queue.awaiting.map((a) => a.id);
    const ready = queue.ready.map((r) => r.id);
    expect(awaiting.filter((id) => ready.includes(id))).toEqual([]);
    expect(awaiting).toContain("MEAT-2026-00091");
    expect(ready).not.toContain("MEAT-2026-00091");
  });

  it("keeps the milk lot on the bench instead of cleared", async () => {
    const results = await fetchLabResults();
    const reports = await fetchLabReports();
    const dispatches = await fetchLabDispatches();

    expect(results.map((r) => r.id)).not.toContain("MLK-2026-00124");
    expect(reports.map((r) => r.id)).not.toContain("MLK-2026-00124");
    expect(dispatches.find((d) => d.id === "MLK-2026-00124")?.status).toBe("IN PROGRESS");
  });

  it("tells one story per lot across dispatches, results and reports", async () => {
    const dispatches = await fetchLabDispatches();
    const results = await fetchLabResults();
    const reports = await fetchLabReports();

    results.forEach((result) => {
      const dispatch = dispatches.find((d) => d.id === result.id);
      expect(dispatch, `${result.id} missing from dispatches`).toBeDefined();
      expect(dispatch!.sample).toBe(result.sample);
      expect(dispatch!.source).toBe(result.source);
    });

    reports.forEach((report) => {
      const result = results.find((r) => r.id === report.id);
      expect(result, `${report.id} has a report but no result row`).toBeDefined();
      expect(report.sample).toBe(result!.sample);
    });
  });
});

describe("admin data", () => {
  it("joins the Meena Poultry anomaly to the vet's poultry farm", () => {
    const a002 = store.getState().adminAnomalies.find((row) => row.id === "A002");
    expect(a002?.healthEvent).toBe("Gumboro (IBD)");
    expect(a002?.farm).toBe("Meena Poultry");
    expect(store.getFarm(a002!.farmId!)?.name).toBe("Meena Poultry");
  });
});
