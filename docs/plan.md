# Canonical dummy data + cross-page writes

**Canonical copy:** this file (`docs/plan.md`). Dated mirror: `docs/superpowers/plans/2026-08-23-canonical-dummy-data.md`.

## Execution flow (first → next)

Do **one stage per agent session**. Do not skip ahead. After each stage, run the click-through in that stage’s **Verify** list, then stop and wait for confirmation.

| Order | Stage | What to implement | Stop when |
|-------|--------|-------------------|-----------|
| **FIRST** | Stage 1 | `src/lib/seed/` + dummy GETs read the store. **No mutations.** | Read-only click-through across farmer, vet, lab, admin passes |
| **NEXT** | Stage 2 | Farmer writes (add animal, treatment, stock, health event, dispatch) | Farmer cross-page updates work |
| Then | Stage 3 | Vet writes (new Rx, sign, countersign) | Vet home + prescriptions stay in sync |
| Then | Stage 4 | Lab writes (receive, complete, verify) | Lab queues/results/reports stay in sync |
| Then | Stage 5 | Admin `farm_id` join + leftover writes | Anomalies still join Meena Poultry |
| Last | Stage 6 | Contract freeze (no dropped DTO fields; grep leftover `local*` state) | Ready to merge |

Dummy modules live at **`src/lib/api/dummy/*.ts`** (imports `@/lib/api/dummy/...`). Login is **`src/app/(auth)/login/page.tsx`**.

Copy-paste agent prompts: **[Appendix: agent prompts](#appendix-agent-prompts)** at the bottom of this file.

---

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One in-memory canonical dataset per entity (all four roles), dummy GET adapters that keep today’s return shapes, and mutations that write the store then invalidate TanStack Query so other pages update.

**Architecture:** Introduce `src/lib/seed/` as the only place entity rows live. Keep every function in `src/lib/api/dummy/*.ts` as a **view adapter** (map store → existing DTO). Mutations update the store and `queryClient.invalidateQueries`. No new UI, no DTO field renames. Pause after each stage for a click-through check.

**Tech Stack:** Next.js App Router, TypeScript, TanStack Query (`src/providers/ReactQueryProvider.tsx`), existing dummy modules under `src/lib/api/dummy/`.

## Global Constraints

- **Audit first (done in this file):** do not invent new farms/animals to “fill gaps” except IDs that already appear on screen.
- **One canonical row per entity id.**
- **Conflict comments:** at the seed row, `// CONFLICT:` what disagreed and what we kept.
- **Preserve GET/mutation response shapes** already consumed by pages (`docs/api-contract (3).md` + TypeScript interfaces in dummy files). Adapters may *compute* fields; they must not change keys/nesting components already read.
- **Writes persist across pages** via the store + query invalidation — not `useState` copies of fetched lists.
- **Incremental stages** with a click-through gate between stages.
- **No visual/UI refactors.** Page files may change only data wiring (remove `localData` / `setQueryData` list hacks; call store mutations). Do not restyle, reorder layout, or rewrite JSX structure beyond that.
- **All four roles:** Farmer, Veterinarian, Lab Technician, Administrator/Researcher. Older notes (`cursor changes/Cursor_changes 1.MD`) scoped **three** roles and omitted lab; this plan includes lab + admin.
- **Out of scope:** `lab_app/` (legacy Vite), PostgreSQL/Express from old Cursor_changes docs, JWT, visual redesign.

---

## How this repo is actually laid out (all roles)

Login (`src/app/(auth)/login/page.tsx`) offers four roles and routes:

| Role | Login value | First URL (`src/app/(auth)/login/page.tsx`) | Layout |
|------|-------------|---------------------------------------------|--------|
| Farmer | `farmer` | `/farmer/home` | `src/app/farmer/layout.tsx` |
| Veterinarian | `vet` | `/vet/home` | `src/app/vet/layout.tsx` |
| Administrator | `admin` | `/admin/overview` | `src/app/admin/layout.tsx` |
| Lab | `lab` | `/lab/dashboard` | `src/app/lab/layout.tsx` |

**Dummy import alias used in pages:** `@/lib/api/dummy/...` → files on disk: `src/lib/api/dummy/*.ts`.

**This repo’s recurring IDs (use these in seed, not invented MP-101-style aliases):** animals `MP-104`…`MP-111`, `MP-118`, `MP-112`, `MP-097`, `MP-088`, `MP-101`, flocks `Flock P-01` / `Flock P-02` / `Flock-07`; treatments `trt-1`…`trt-5`; farmer dispatches `DSP-024`…; Rx `Rx-208`…; lab `MLK-2026-00124`, samples `LAB-MLK-00981`.

Dummy HTTP layer (all under `src/lib/api/dummy/`):

| File | Role | Exported reads (keep signatures) |
|------|------|----------------------------------|
| `auth.ts` | all | `loginUser` |
| `farmer-dashboard.ts` | farmer | `getFarmerDashboard` |
| `farm-detail.ts` | farmer | `getFarmDetail` |
| `animal-detail.ts` | farmer | `getAnimalDetail` |
| `treatments.ts` | farmer | `getTreatments`, `getPrescriptionOptions`, `getTreatmentDetail` |
| `dispatch.ts` | farmer | `getDispatches`, `checkDispatchSafety`, `getDispatchDetail` |
| `farm-insights.ts` | farmer | `getFarmInsights` |
| `vets.ts` | farmer | `getAvailableVets` |
| `vet-dashboard.ts` | vet | `getVetDashboard` |
| `vet-prescriptions.ts` | vet | `getPrescriptionsList` |
| `vet-case-detail.ts` | vet | `getCaseDetail` |
| `vet-sign-flow.ts` | vet | `getPrescriptionForSigning`, `submitSignature`, `getEmergencyForCountersigning`, `submitCountersignature` |
| `vet-patients.ts` | vet | `getVetPatients` |
| `lab-dashboard.ts` | lab | `fetchLabDashboard` |
| `lab-dispatches.ts` | lab | `fetchLabDispatches`, `fetchLabDispatchDetail` |
| `lab-testing.ts` | lab | `fetchTestingQueue`, `fetchTestingWorkspace` |
| `lab-results.ts` | lab | `fetchLabResults` |
| `lab-reports.ts` | lab | `fetchLabReports` |
| *(no admin dummy module)* | admin | Hardcoded datasets in `src/components/admin/AdminShared.tsx`; choropleth in `src/lib/admin/state-stats.ts` |

Live App Router (product UI — not `lab_app/`):

**Farmer** — `src/app/farmer/home`, `my-farm`, `treatments`, `dispatch`, `insights`

**Vet** — `src/app/vet/home`, `prescriptions`, `prescriptions/[rxId]`, `prescriptions/[rxId]/sign`, `prescriptions/[rxId]/countersign`, `patients`

**Lab** — `src/app/lab/dashboard`, `dispatches`, `dispatches/[dispatchId]`, `testing-queue`, `testing-workspace/[sampleId]`, `results`, `reports`

**Admin** — `src/app/admin/page.tsx` (national map), `overview`, `analytics`, `anomalies`, `health`, `forecast`, `workspace`, `states/[slug]`

---

## Stage 0 audit (constraint 1) — entity map

### Farms / sources (many display names, overlapping identities)

| Display name (as coded) | Where defined | Likely same real farm? |
|-------------------------|---------------|------------------------|
| Shree Krishna Dairy | `farmer-dashboard.ts`, `farm-detail.ts` | Farmer home farm |
| Krishna Dairy | `vet-prescriptions.ts`, `vet-dashboard.ts`, `vet-case-detail.ts`, `vet-patients.ts` | Same as Shree Krishna **if** we treat “Krishna” as one dairy — **conflict:** farmer never says “Krishna Dairy” |
| Shanti Dairy | vet dashboard + prescriptions + patients | Separate dairy in vet caseload |
| Meena Poultry / Meena Poultry | vet files vs `vet-dashboard.ts` alerts (`Meena Poultry`) | Same poultry; **spelling conflict** |
| Shree Krishna Dairy / Shree Krishna Dairy / Shree Krishna Dairy | `lab-dispatches.ts`, `lab-testing.ts`, `lab-dashboard.ts`, `lab-results.ts`, `lab-reports.ts` | Same dairy as farmer, **three spellings** |
| Green Valley Livestock / Green Valley Livestock | lab meat rows | One livestock source |
| Sunrise Poultry / Sunrise Poultry | lab egg rows | One poultry source |
| Mahalaxmi Dairy | lab milk `MLK-2026-00118` / `MLK-2026-00131` | Separate |
| Raj Farms | lab `MEAT-2026-00072` | Separate |
| Farm 247, Farm 334, Farm 512, Sunrise Poultry, … | `AdminShared.tsx` `ANOMALY_DATA` | National demo farms; **A002 Meena Poultry** should join vet Meena Poultry |

### Animals / flocks

| ID | Files | Conflicting facts |
|----|-------|-------------------|
| **MP-104** | farm-detail (Cow, under_treatment); animal-detail (Buffalo, Gir, oxytet); treatments `trt-1` (Buffalo, oxytet, withdrawal); farmer-dashboard attention; dispatch DSP-024 milk cleared; vet Rx-208 Shanti Dairy Cow; lab milk source “Animal: MP-104”; reports `animal: "MP-104"` | **Species Cow vs Buffalo.** **Farm Shree Krishna vs Shanti Dairy.** **Dispatch cleared vs withdrawal active.** |
| MP-105 | farm-detail Cow healthy; health-event modal option `MP-105` | Modal uses `MP-105` not farm’s `MP-105` |
| MP-106 | farm-detail Buffalo healthy; treatments `trt-3` **Goat** Amoxicillin | **Species + health vs under treatment** |
| MP-108 | farm-detail **Goat** healthy; treatments `trt-5` **Cow** Ivermectin completed; dispatch DSP-023 milk withdrawal | **Species goat vs cow.** Milk dispatch on a goat is a plot hole unless dairy goat. |
| MP-109 | farm-detail Buffalo waiting; treatments `trt-4` Vitamin B12 unsigned | Status waiting vs active treatment |
| MP-101 | vet Rx-201 / dashboard signed mastitis — **not on farm-detail roster** | Orphan ID |
| MP-118 | vet patients Cow Krishna Dairy; case-detail **Buffalo**; sign-flow animal **MP-118** (typo vs MP-118); dashboard **MP-118** | **Cow vs Buffalo; MP-118 vs MP-118** |
| MP-112, MP-097, MP-088 | vet patients + prescriptions | Not on farmer farm list (OK if other farms) |
| Flock P-01 | treatments unsigned emergency oxytet; vet Rx-207; patients Recovered; case-detail UNSIGNED EMERGENCY; dashboard Flock P-01 / Flock P-01 | **Recovered vs unsigned emergency.** **P-01 vs P-01 spelling.** |
| Flock P-02, Flock P-03 | prescriptions / dashboard outcomes | Not in farmer farm |
| Flock-07 | dispatch DSP-022 blocked meat | Not in farm-detail |
| FLK-2026-042 / FLK-2026-051 | lab eggs | Not linked to Flock P-01 |

### Prescriptions (`Rx-*`)

| ID | `vet-prescriptions.ts` | `vet-dashboard.ts` | Other |
|----|------------------------|--------------------|-------|
| Rx-208 | SIGN-REQ, Shanti, MP-104, mastitis | SIGN-REQ, Shanti, MP-104 | sign-flow **ignores id**, always Krishna / MP-118 / Enrofloxacin |
| Rx-207 | **COUNTERSIGNED**, Meena, Flock P-01, Gumboro | **UNSIGNED EMERGENCY**, Meena, Flock P-01, Gumboro (IBD) | case-detail unsigned emergency oxytet |
| Rx-205 | SIGN-REQ, Krishna, MP-118 | SIGN-REQ, Krishna, **MP-118** | case-detail Enrofloxacin intramammary vs sign-flow Enrofloxacin IM |
| Rx-201 | SIGNED, Shanti, MP-101 | SIGNED, Shanti, MP-101 | |
| Rx-198, 194, 189, 183 | list only | — | farmer `getPrescriptionOptions` uses **numeric** `201`, `198`, `195`, `189` not `Rx-201` |

### Treatments

| ID | List (`treatments.ts`) | Detail (`getTreatmentDetail`) | Dispatch link |
|----|------------------------|-------------------------------|---------------|
| trt-1 | MP-104 Buffalo oxytet withdrawal | matches | DSP-024 is MP-104 **cleared** (contradicts withdrawal) |
| trt-2 | Flock P-01 unsigned | fallback detail is **MP-106 Goat** if id ≠ trt-1 | DSP-023 `treatment_id: "trt-2"` but animal **MP-108** |
| trt-3..5 | list only | generic fallback (always MP-106 Goat) | |

### Farmer / lab dispatches (different ID namespaces)

Farmer `DSP-024` / `DSP-023` / `DSP-022` in `dispatch.ts` are **not** lab `MLK-2026-00124` / `MEAT-2026-00087` / `EGG-2026-00241`. They must become **linked** rows (farmer dispatch → lab sample) rather than remaining parallel universes.

### Lab samples (same business object, drifting ids/status)

| Business object | Dispatches | Testing | Results | Reports | Dashboard |
|-----------------|------------|---------|---------|---------|-----------|
| Milk 124 | `MLK-2026-00124`, sample `LAB-MLK-00981`, Shree Krishna, MP-104, READY FOR TESTING | ready `MLK-2026-00124`, sample **LAB-MLK-00981**, Shree Krishna Dairy; workspace animal **MP-104** | id **MLK-2026-00124**, sample LAB-MLK-00981, Shree Krishna Dairy | same as results, animal MP-104, **CLEARED**, amoxicillin MRL | attention Start Testing MLK-2026-00124 |
| Meat 087 | `MEAT-2026-00087`, LAB-MT-00472, Green Valley, IN PROGRESS | — (not in ready list) | **MEAT-2026-00087**, LAB-MT-00472, ACTION REQUIRED | ON HOLD tetracycline | View Dispatch |
| Eggs 241 | `EGG-2026-00241`, LAB-EGG-01128, Sunrise Poultry, AWAITING VERIFICATION | — | **EGG-2026-00241**, VERIFIED | CLEARED enrofloxacin, animal FLK-2026-042 | dashboard **EGG-2026-00241** Sunrise Poultry (id digit drift 241 vs 241) |
| Meat 091 | — | awaiting **and** ready `MEAT-2026-00091` (duplicate states) | — | — | |

### Medicine stock

| Name | Home (`farmer-dashboard.ts`) | Insights (`farm-insights.ts`) |
|------|------------------------------|-------------------------------|
| Oxytetracycline | 17 vials, Restock recommended | 17 vials, Restock recommended |
| Ivermectin | 32 doses | 32 doses |
| Vitamin B Complex | 60 doses | 60 doses |
| Amoxicillin | 8 vials Monitor | 8 vials Monitor |
| Attention item | title **"Medicine A"** | should be Oxytetracycline |

Home and insights **match numbers** today but are **duplicated literals**. Add-stock on insights (`MedicineStockTable.tsx`) does not update home.

### Vets

`vets.ts`: vet-1 Dr. Bankey, vet-2 Dr. Sofia Abidi, vet-3 Dr. Anil Sharma. Dashboard vet name Dr. Bankey. Sign PIN `1234` in `vet-sign-flow.ts`.

### Health events

No `health-events.ts`. Modal `RecordHealthEventModal.tsx` hardcodes animals `MP-104`, `MP-105` and **does not persist**. Insights charts are static series. Vet case-detail inlines Gumboro / mastitis onset.

### Admin

`AdminShared.tsx` national aggregates + anomalies. **A002 Meena Poultry + Gumboro + Oxytetracycline** is the only clear join to vet/farmer poultry story. `state-stats.ts` is hashed dummy headcount, not animal rows.

### Page-local writes (do not survive navigation)

| Action | File | Today |
|--------|------|--------|
| Add Animal | `src/app/farmer/my-farm/page.tsx` | `localData` / `setLocalData` |
| Record Treatment | `src/app/farmer/treatments/page.tsx` | `localTreatments` |
| Start Dispatch | `src/app/farmer/dispatch/page.tsx` | `localDispatches` |
| Add Stock | `src/components/farmer/MedicineStockTable.tsx` | component `useState` |
| Health Event | `RecordHealthEventModal.tsx` | close only |
| Book Vet | home modal | no store |
| New Rx | `src/app/vet/prescriptions/page.tsx` | `queryClient.setQueryData(["vet-prescriptions"])` only |
| Sign / Countersign | sign + countersign pages | `submit*` returns payload; **lists unchanged** |
| Lab receive / complete / verify | lab components | local view state / empty handlers |
| Admin save insight / note | `AdminShared.tsx` + `admin/layout.tsx` | React state, lost on refresh (acceptable to persist in store for demo) |

---

## Conflict resolutions (constraint 3) — implement as seed comments

Put each `// CONFLICT:` on the canonical row in `src/lib/seed/`.

1. **Farmer dairy name:** keep `Shree Krishna Dairy`. Treat vet `Krishna Dairy` as the same `farm_id`. Comment that vet strings said “Krishna Dairy”.
2. **Shanti Dairy / Meena Poultry:** separate `farm_id`s. Spell poultry **Meena Poultry** (prescriptions/patients); comment dashboard `Meena Poultry`.
3. **MP-104 species + farm:** **Buffalo**, farm **Shree Krishna Dairy** (animal-detail + treatments win over farm-detail Cow and over vet Shanti). Vet Rx-208 remains on MP-104 at this farm (comment: vet list said Shanti).
4. **MP-104 withdrawal vs DSP-024 cleared:** keep **active withdrawal** on `trt-1`. Set DSP-024 status to **`withdrawal`** (comment: list said cleared).
5. **DSP-023 `treatment_id`:** point to **`trt-5`** (MP-108), not `trt-2` (comment).
6. **MP-106:** **Buffalo** on Shree Krishna; `trt-3` species from animal (comment: list said Goat).
7. **MP-108:** **Goat**, dairy (milk OK). Treatment `trt-5` species Goat (comment: list said Cow).
8. **MP-118 vs MP-118:** canonical **`MP-118`**, species **Cow** (patients + prescriptions). Sign-flow/dashboard `MP-118` is a typo. Case-detail Buffalo → Cow.
9. **Rx-207:** **unsigned emergency** (dashboard + case-detail + farmer `trt-2`). Prescriptions “COUNTERSIGNED” was ahead of the story.
10. **Flock P-01 patient “Recovered”:** **Under treatment** while unsigned emergency exists.
11. **Sign-flow default body:** must **branch on `rxId`** (Rx-208 oxytet mastitis MP-104; Rx-205 CIA enrofloxacin MP-118). Comment: old function returned one Krishna/MP-118 payload for every id.
12. **Farmer Rx option ids:** store `rx_id: "Rx-201"` etc.; adapter may still show `201` in `PrescriptionOption.rx_id` **only if** current UI types require it — prefer mapping `"Rx-201"` → keep interface `string \| null` and pass `"Rx-201"` if components only display it. If any comparison assumes `"201"`, comment and keep adapter emitting `"201"` for that field until a safe check.
13. **Lab milk 124:** one sample `LAB-MLK-00981`, dispatch `MLK-2026-00124`, farm Shree Krishna Dairy, animal MP-104. Status **ready for testing** (not already CLEARED on reports). Reports row can exist as **draft/in progress** or omit until verify mutation; **do not** show CLEARED while queue says Start Testing. Comment: reports said CLEARED.
14. **Lab results ids:** use **MLK-2026-00124** (same as dispatch), not `MLK-2026-00124` vs `MLK-2026-00124` drift — unify to dispatch id `MLK-2026-00124`. Adapter maps to whatever `LabResult.id` the results table already displays; if UI shows `MLK-2026-00124`, keep that string as canonical.
15. **EGG dashboard 241 vs 241:** canonical `EGG-2026-00241`.
16. **MEAT-2026-00091:** **awaiting receipt only** (not also ready).
17. **Medicine A:** attention title **Oxytetracycline**.
18. **Health modal animals:** options from store (MP-104…), not MP-104.
19. **Admin A002:** `farm_id` = Meena Poultry. A001 Farm 247 stays distinct unless we later alias; comment no farmer farm named Farm 247.
20. **Link farmer DSP-024 milk → lab MLK-2026-00124** (same milk lot). Meat DSP-022 / Flock-07 may map to MEAT-2026-00087 **only with a comment** if species/source disagree (Flock-07 vs Green Valley Batch M-42) — **do not silently merge**; keep two meat entities until a comment chooses: **keep both**, relate DSP-022 as farmer-side blocked meat **without** overwriting lab Green Valley sample.

---

## Recommended state approach (constraint 5)

**Module-level mutable store in `src/lib/seed/store.ts`**, not Zustand/Redux.

- Dummy APIs already live in modules; a singleton store matches that and stays testable.
- TanStack Query is already the fetch cache (`ReactQueryProvider`).
- Persistence = JS heap for the tab session (enough for SIH demo). Optional `sessionStorage` later; not required in stage 1.
- Pages: `useMutation` → store function → `invalidateQueries` for affected keys (`farm-detail`, `treatments`, `dispatches`, `farmer-dashboard`, `vet-prescriptions`, `vet-dashboard`, lab keys, etc.).

Do **not** keep `localTreatments` / `localDispatches` / `localData` after stage 3+.

---

## Target files

**Create**

- `src/lib/seed/types.ts` — canonical types (`Farm`, `Animal`, `Prescription`, `Treatment`, `Dispatch`, `HealthEvent`, `Vet`, `MedicineStock`, `LabSample`, `LabResult`, `AdminAnomaly`, …)
- `src/lib/seed/ids.ts` — string unions / constants
- `src/lib/seed/canonical.ts` — initial arrays + CONFLICT comments
- `src/lib/seed/store.ts` — `getState()`, `resetStore()`, mutations
- `src/lib/seed/project.ts` — optional helpers to build DTOs
- `src/lib/seed/query-keys.ts` — exported query key list for invalidation
- `src/lib/seed/seed.test.ts` — uniqueness + adapter smoke tests (vitest or node:test; use whatever the repo already has — if none, a small `node --test` script)

**Modify (adapters only + mutations):** every `src/lib/api/dummy/*.ts` listed above.

**Modify (write wiring, no layout rewrite):** farmer my-farm, treatments, dispatch, insights `MedicineStockTable`, home health modal; vet prescriptions page, sign, countersign; lab receive/complete/verify handlers; optionally admin workspace save → store.

**Do not modify:** CSS, map GeoJSON, `lab_app/`, login visual.

---

## Execution stages (constraint 6)

Stop after each stage. User click-through is the gate.

### Stage 1 — Store + read adapters (no mutation wiring)

**Files:** create `src/lib/seed/*`; rewrite dummy GET bodies to read store; keep `await delay`.

**Tests:** every entity id unique per collection; `getFarmDetail().animals.find(MP-104).type === 'Buffalo'`; `getPrescriptionsList()` Rx-207 not COUNTERSIGNED.

- [ ] **Step 1:** Add `src/lib/seed/types.ts` with canonical interfaces (fields richer than DTOs; adapters slice/rename).
- [ ] **Step 2:** Add `canonical.ts` with farms, animals, prescriptions, treatments, dispatches, stock, vets, lab samples, admin anomalies copied from current literals then patched per resolutions + `// CONFLICT:` comments.
- [ ] **Step 3:** Add `store.ts` with `let state = structuredClone(initial)` and getters.
- [ ] **Step 4:** Point `getFarmDetail`, `getAnimalDetail`, `getTreatments`, `getFarmerDashboard`, `getDispatches`, `getFarmInsights`, vet GETs, lab GETs at the store. **Admin:** extract `REGION_DATA` / `ANOMALY_DATA` into seed and re-export from `AdminShared.tsx` so the file still exports the same names (UI import path can stay `AdminShared` to avoid JSX churn — re-export is allowed).
- [ ] **Step 5:** Run app, **read-only** click-through (below). Do not implement writes yet.

**Verify Stage 1**

1. Login farmer → Home: farm **Shree Krishna Dairy**, attention **MP-104** and **Oxytetracycline** (not Medicine A).
2. My Farm: MP-104 is **Buffalo** / under treatment; counts still add up visually (totals may shift slightly if we fix under_treatment_count — **recompute from animals** so UI numbers match roster).
3. Treatments: trt-1 buffalo oxytet; open detail for trt-2 and confirm flock P-01 not goat fallback.
4. Dispatch: DSP-024 **withdrawal** (not cleared).
5. Login vet → Home vs Prescriptions: Rx-207 **unsigned emergency** on both; Rx-205 animal **MP-118** everywhere.
6. Open sign for Rx-208: farm/animal/drug match list (not generic MP-118).
7. Login lab → Dashboard, Dispatches, Testing, Results, Reports: milk id/sample/farm/animal **one story**; meat 091 not in both awaiting and ready.
8. Login admin → Anomalies: Meena Poultry / Gumboro still visible.

If Stage 1 looks wrong, fix seed — do not start Stage 2.

---

### Stage 2 — Farmer writes

Mutations on store: `addAnimal`, `addTreatment`, `addHealthEvent`, `addDispatch`, `addMedicineStock`. Invalidations: `["farm-detail"]`, `["farmer-dashboard"]`, `["treatments"]`, `["dispatches"]`, `["farm-insights"]`, `["animal-detail", id]`.

Replace `localData` / `localTreatments` / `localDispatches` / stock `useState` with `useMutation` + invalidate. Health modal: `onSubmit` → store; animal `<select>` from `getFarmDetail` animals.

- [ ] Implement store mutations.
- [ ] Wire pages/modals.
- [ ] Keep modal JSX as-is aside from submit/options.

**Verify Stage 2**

1. My Farm → Add Animal `MP-199` → appear in table → Home animal_count +1 → Treatments modal animal list includes MP-199.
2. Record Treatment on MP-105 → Treatments list + My Farm status + Home attention if withdrawal.
3. Insights Add Stock oxytet → Home stock label increases.
4. Record Health Event on MP-104 → My Farm recent activity (and insights count if derived).
5. Start Dispatch eligible animal → Dispatch table → lab **not** required yet.

---

### Stage 3 — Vet writes

`addPrescription`, `signPrescription`, `countersignPrescription`. Invalidate `["vet-prescriptions"]`, `["vet-dashboard"]`, `["vet-patients"]`, `["sign-flow", rxId]`, farmer treatments if badges depend on signature.

Remove `setQueryData` append-only hack; append in store so Home prescriptions widget matches after refresh of queries.

Sign/countersign `submit*` must update prescription status in store (PIN still `1234`).

**Verify Stage 3**

1. New Rx → appears on `/vet/prescriptions` **and** `/vet/home`.
2. Sign Rx-208 → list SIGNED; farmer treatment MP-104 still signed; reopen sign read-only or signed state if UI supports it.
3. Countersign Rx-207 → dashboard unsigned emergency count drops; prescriptions status matches.

---

### Stage 4 — Lab writes

`receiveSample`, `completeTest`, `submitAssessment`, `verifyResult`. Invalidate lab query keys + farmer dispatch safety if MRL gates read lab rows.

**Verify Stage 4**

1. Receive awaiting sample → disappears from awaiting, appears in ready / dispatch status Received.
2. Complete workspace test → results list updates.
3. Verify result → reports status + farmer `checkDispatchSafety` for linked animal if applicable.

---

### Stage 5 — Admin join + leftover writes

Seed anomalies with `farm_id`. Saving workspace insight/note writes store. Book-vet can append `vetAppointments` if a list exists; else skip.

**Verify Stage 5**

1. Admin anomaly A002 still Gumboro / Meena Poultry.
2. Save insight → still there after switching admin tabs (same layout state or store).

---

### Stage 6 — Contract freeze

- [ ] Diff dummy **exported interfaces** vs `main`; no field dropped.
- [ ] Grep `localTreatments|localDispatches|localData|setQueryData\(\[\"vet-prescriptions\"\]`.
- [ ] Update `MEMORY.md` Live endpoints if lab routes missing from the table.
- [ ] Optionally add a short “canonical ids” section to `docs/api-contract (3).md` without changing JSON examples’ **keys**.

---

## Query keys (use consistently)

```
["farmer-dashboard"]
["farm-detail"]
["animal-detail", animalId]
["treatments"]
["treatment-detail", treatmentId]
["prescription-options"]
["dispatches"]
["dispatch-detail", id]
["dispatch-safety", product, animalIds]
["farm-insights", range]
["available-vets"]
["vet-dashboard"]
["vet-prescriptions"]
["vet-case", caseId]
["sign-flow", rxId]
["vet-patients"]
["lab-dashboard"]
["lab-dispatches"]
["lab-dispatch", id]
["lab-queue"]
["lab-workspace", sampleId]
["lab-results"]
["lab-reports"]
```

---

## Adapter sketch (preserve FarmDetail shape)

```ts
// src/lib/api/dummy/farm-detail.ts — keep FarmDetail interface unchanged
import { store } from "@/lib/seed/store";

export const getFarmDetail = async (): Promise<FarmDetail> => {
  await new Promise((r) => setTimeout(r, 500));
  const farm = store.getFarmerFarm(); // Shree Krishna Dairy
  const animals = store.getAnimalsByFarm(farm.id);
  // derive species_overview + under_treatment_count from animals
  return { farm: { name: farm.name, /* same keys */ }, species_overview: ..., animals: animals.map(a => ({ id: a.id, type: a.type, status: a.status })), recent_activity: store.activityForFarm(farm.id) };
};
```

---

## Why not Postgres in this plan

`cursor changes/Cursor_changes 1.MD` planned Express + Docker Postgres and **explicitly excluded lab**. This request is a **frontend canonical dummy** fix so farmer/vet/lab/admin tell one story **before** a backend. Postgres remains a later branch.

---

## Spec coverage

| Constraint | Where |
|------------|--------|
| 1 Audit | this file Stage 0 |
| 2 One source | `src/lib/seed/` |
| 3 Visible conflicts | `canonical.ts` comments + list above |
| 4 Same DTOs | adapter files keep interfaces |
| 5 Cross-page writes | stages 2–5 |
| 6 Incremental | stages 1–6 + verify lists |
| 7 No UI restyle | global constraints |
| 4th dashboard | Lab routes + `lab-*.ts` + admin |

---

## Pause rule

Implement **Stage 1 only**, then wait for confirmation before Stage 2.

---

## Appendix: agent prompts

### FIRST — Stage 1 only (paste this next)

```
Implement ONLY Stage 1 from docs/plan.md (Canonical dummy data + cross-page writes).

Do not implement Stages 2–6. Do not restyle UI. Do not change dummy GET/DTO shapes.

Create src/lib/seed/ (types, canonical data with // CONFLICT comments from the plan, store getters, query keys). Rewrite src/lib/api/dummy/*.ts GET functions to read the store while keeping exported interfaces and return shapes identical. Re-export admin datasets from seed if needed without changing AdminShared UI structure.

Then run the Stage 1 Verify click-through in docs/plan.md (farmer home/my-farm/treatments/dispatch, vet home/prescriptions/sign, lab dashboard/dispatches/testing/results/reports, admin anomalies). Fix seed conflicts if anything still disagrees.

Stop when Stage 1 verify passes and wait for confirmation.
```

### NEXT — Stage 2 (paste after Stage 1 is confirmed)

```
Continue docs/plan.md. Stage 1 is done. Implement ONLY Stage 2: farmer writes into the canonical store (addAnimal, addTreatment, addHealthEvent, addDispatch, addMedicineStock) with TanStack Query invalidation. Remove page-local list state on my-farm, treatments, dispatch, and medicine stock. Keep JSX/layout unchanged aside from data wiring.

Run the Stage 2 Verify list in docs/plan.md. Do not start Stage 3.
```

### After that (one prompt per stage)

- Stage 3: vet writes only (new Rx, sign, countersign) per docs/plan.md; verify; stop.
- Stage 4: lab writes only; verify; stop.
- Stage 5: admin join + leftover writes; verify; stop.
- Stage 6: contract freeze / grep; stop.
