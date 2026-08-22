# Cursor_changes 5 — Seed: medicines, Rx, treatments, dispatches, events

## Medicines + Krishna stock (farmer home + insights)

From `farmer-dashboard.ts` + `farm-insights.ts`:

| medicine | quantity | unit | recent_usage | statusText | variant |
|---|---|---|---|---|---|
| Oxytetracycline | 17 | vials | 4 | Restock recommended | red |
| Ivermectin | 32 | doses | 3 | Stock sufficient / Good | green (home: “Stock sufficient”; insights: “Good” — use **Good** on insights, **Stock sufficient** on home via service mapping from same row: if variant red → Restock recommended; if green && vials/doses oxytet-style… **Keep two label fields**: `homeLabel` / `insightsLabel` on MedicineStock, or derive: `red` → both restock; `green` → home “Stock sufficient” if name Ivermectin else “Good”; `amber` → “Monitor”) |

Simplest: store `homeQuantityLabel` already formatted (`17 vials`) plus `insightsStatusText`. Seed both explicitly:

| name | home quantity_label | home status | insights current_stock | insights recent | insights status |
|---|---|---|---|---|---|
| Oxytetracycline | 17 vials | Restock recommended / red | 17 vials | 4 used | Restock recommended / red |
| Ivermectin | 32 doses | Stock sufficient / green | 32 doses | 3 used | Good / green |
| Vitamin B Complex | 60 doses | Good / green | 60 doses | 2 used | Good / green |
| Amoxicillin | 8 vials | Monitor / amber | 8 vials | 2 used | Monitor / amber |

Most-used (insights): Oxytetracycline 25 used / 100, Ivermectin 18 / 72, Vitamin B Complex 11 / 44.

Demand forecast `current_stock` / `expected_requirement` = `17 vials` / `25 vials` (oxytet). Chart series: copy `farm-insights.ts` 30d/60d/90d arrays into `InsightChart.payload`.

Farm performance + health_treatment_trends: copy arrays from `farm-insights.ts` unchanged.

Farm health map (Krishna only — **drop poultry row** that named Flock P-01):

| species | level | detail |
|---|---|---|
| Cattle | Moderate | `10 animals · 1 under treatment` |
| Buffaloes | High | `20 animals · 1 under treatment` (dummy said 2; lock to 1 to match species_overview) |
| Goats | Moderate | `18 animals · 1 under treatment` (dummy said 0 + poultry; lock to 1) |

## Prescriptions (Dr. Bankey)

Status lock: **Rx-207 = unsigned_emergency** (not countersigned). **Rx-208 = signed** Oxytetracycline for MP-104 (matches farmer treatment). Dummy had Rx-208 SIGN-REQ Amoxicillin at Shanti — **wrong**.

| rx_id | farm | animal | diagnosis | drug | status | aware | cia | date_label | action_target |
|---|---|---|---|---|---|---|---|---|---|
| Rx-208 | Shree Krishna Dairy | MP-104 | Clinical mastitis | Oxytetracycline | **signed** | ACCESS | false | 10:42 | read_only |
| Rx-207 | Meena Poultry | Flock P-01 | Gumboro (IBD) | Oxytetracycline | **unsigned_emergency** | none | false | 09:18 | countersign_flow |
| Rx-205 | Shree Krishna Dairy | MP-118 | Clinical mastitis | Enrofloxacin | sign_req | WATCH | true | Yesterday | sign_flow |
| Rx-209 | Shree Krishna Dairy | MP-109 | Supportive therapy | Vitamin B12 | sign_req | ACCESS | false | Today | sign_flow |
| Rx-201 | Shanti Dairy | MP-101 | Clinical mastitis | Amoxicillin | signed | ACCESS | false | Yesterday | read_only |
| Rx-198 | Shree Krishna Dairy | MP-112 | Mastitis | Amoxicillin | signed | ACCESS | false | 17 Aug | read_only |
| Rx-194 | Meena Poultry | Flock P-02 | Colibacillosis | Oxytetracycline | signed | WATCH | false | 15 Aug | read_only |
| Rx-189 | Shanti Dairy | MP-097 | Foot rot | Amoxicillin | signed | ACCESS | false | 12 Aug | read_only |
| Rx-183 | Shree Krishna Dairy | MP-088 | Respiratory infection | Enrofloxacin | voided | RESERVE | true | 10 Aug | read_only |

Computed vet prescriptions summary (must equal list lengths):

- all_count = 9 (8 original + Rx-209 for the second SIGN-REQ)
- awaiting_signature_count = 2 (Rx-205, Rx-209)
- unsigned_emergency_count = **1** (Rx-207)
- signed_count = 5 (208, 201, 198, 194, 189)
- voided_count = 1 (Rx-183)

Rx-205 sign-flow payload (from `vet-sign-flow.ts`, farm name fixed):

```
farm: Shree Krishna Dairy
animal: MP-118
drug: Enrofloxacin · Intramuscular · 5 mg/kg · Once daily · 5 days
reason: Non-responsive to first-line treatment
requires_stewardship_notice: true
health_event: Clinical mastitis / 18 Aug
previous_treatment: Amoxicillin 3 days RECOVERED
guidance: the three CIA/WATCH strings already in vet-sign-flow.ts
```

Rx-207 emergency payload (from `getEmergencyForCountersigning`):

```
farm: Meena Poultry · animal: Flock P-01
Oxytetracycline · Oral · 20 mg/kg · Once daily · 5 days
reason: Gumboro-associated secondary infection
confirmation_heading / confirmation_text: keep verbatim from vet-sign-flow.ts
```

Rx-208 sign detail (per-id, not the old hardcoded MP-118 payload):

```
farm: Shree Krishna Dairy · animal: MP-104 · Cow
Oxytetracycline · Injection · 10 mg/kg
status_badges: SIGNED
withdrawal message: Milk clears tomorrow, 10:30 AM
```

## Farmer treatments (Krishna only — no Flock P-01)

| id | animal | species (must = Animal.type) | drug | status | badges |
|---|---|---|---|---|---|
| trt-1 | MP-104 | Cow | Oxytetracycline | Withdrawal | Withdrawal Active, Vet Signed, Lab ≤ MRL |
| trt-3 | MP-106 | Buffalo | Amoxicillin | Active | Active, Vet Signed |
| trt-4 | MP-109 | Buffalo | Vitamin B12 | Unsigned | Active, Pending Vet Signature |
| trt-5 | MP-108 | Goat | Ivermectin | Completed | Completed, Vet Signed, Lab ≤ MRL |
| trt-6 | MP-118 | Cow | Enrofloxacin | Unsigned | Pending Vet Signature, WATCH, CIA |
| trt-7 | MP-141 | Goat | Oxytetracycline | Withdrawal | Withdrawal Active, Vet Signed |

Computed farmer treatment summary:

- active_treatments = 1 (trt-3)
- withdrawal_ongoing = 2 (trt-1, trt-7)
- awaiting_vet_unsigned = 2 (trt-4, trt-6)
- completed = 1 (trt-5)

trt-1 detail (`getTreatmentDetail`): animal_id MP-104, species **Cow**, medicine Oxytetracycline, route Injection, dose 10 mg/kg, administered `Today, 08:15 AM`, reason `Clinical mastitis` (aligned with Rx-208; dummy said Respiratory infection), withdrawal now_pct 30, timeline Prescription/Dose Given complete, Withdrawal current, Clear upcoming.

## Dispatches (Krishna farmer list)

MP-104 is in withdrawal ⇒ **cannot** be `cleared`. Dummy DSP-024 cleared MP-104 — **wrong**.

| id | product | animal | date | status | why |
|---|---|---|---|---|---|
| DSP-024 | Milk | **MP-105** | Today | cleared | healthy cow, signed history none needed; checklist Withdrawal Cleared / MRL Within Limit / Eligible / Passport Generated |
| DSP-023 | Milk | **MP-104** | Yesterday | withdrawal | matches oxytet withdrawal; `clears_label: Clears: 24 Aug, 10:30 AM`; `treatment_id: trt-1` |
| DSP-025 | Milk | MP-108 | 20 Aug | cleared | completed ivermectin |

Do **not** put DSP-022 / Flock-07 on the farmer list (wrong farm). Keep DSP-022 as a Meena row only if a vet/admin query needs it; farmer `GET /api/farmer/dispatches` excludes it.

Farmer dispatch summary computed from Krishna rows: implement from actual statuses (e.g. active_dispatches / ready_to_dispatch / under_withdrawal / blocked). With the three rows above: cleared 2, withdrawal 1, blocked 0. Dummy 1/3/2/1 will change; **counts follow rows**.

`checkDispatchSafety` rules:

- If any selected animal has TreatmentStatus Withdrawal or Unsigned → `eligible: false`, withdrawal active.
- If animal id is MP-104 → withdrawal active, detail `Active (clears tomorrow, 10:30 AM)`, mrl within_limit (lab 0.04 / 0.10), prescription signed true.
- Else default eligible true, withdrawal CLEARED, mrl 0.04/0.10, signed true, lab available.

## Health events / follow-ups / activity

HealthEvent:

- `he-104` MP-104 Clinical mastitis onset `Today`
- `he-118` MP-118 Clinical mastitis onset `18 Aug`
- `he-p01` Flock P-01 Gumboro (IBD) onset `Today`

FollowUp (vet patients `last_follow_up`):

- MP-104 `22 Aug` · MP-118 `20 Aug` · Flock P-01 `21 Aug` · MP-112 `17 Aug` · MP-097 `16 Aug` · MP-088 `14 Aug`

Farmer recent_activity (`farm-detail.ts`):

- Treatment recorded / MP-104 / Today
- Health check completed / MP-108 / Yesterday
- Animal registered / MP-109 / 2 days ago

Vet recent_activity / recent_outcomes: rebuild from prescriptions + follow-ups so they cannot drift (see `Cursor_changes 7.MD`).
