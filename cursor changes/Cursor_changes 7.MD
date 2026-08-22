# Cursor_changes 7 — Express GET routes and DTO mapping

Base: `http://localhost:4000`. Browser uses `/api/...` via Next rewrite.  
Router files: `server/src/routes/farmer.ts`, `vet.ts`, `admin.ts`, `auth.ts`.  
Services return **exact dummy TypeScript shapes**.

## Health / auth

| method | path | response |
|---|---|---|
| GET | `/api/health` | `{ ok: true }` |
| POST | `/api/auth/login` | `{ role, userId, name: "Dummy User" }` echo of body; **no JWT, no password check** |

## Farmer (`server/src/services/farmer.ts`)

Always scoped to `farm-krishna`.

| method | path | dummy function | DTO |
|---|---|---|---|
| GET | `/api/farmer/dashboard` | `getFarmerDashboard` | `{ farm: { name, status, animal_count, clear_count, under_treatment_count, waiting_count }, attention_items[], quick_actions[], medicine_stock[] }` |
| GET | `/api/farmer/farm` | `getFarmDetail` | `FarmDetail` |
| GET | `/api/farmer/animals/:id` | `getAnimalDetail` | `AnimalDetail` (404 if not Krishna) |
| GET | `/api/farmer/treatments` | `getTreatments` | `{ summary: TreatmentSummary, items: TreatmentItem[] }` |
| GET | `/api/farmer/treatments/:id` | `getTreatmentDetail` | `TreatmentDetail` |
| GET | `/api/farmer/prescription-options` | `getPrescriptionOptions` | `PrescriptionOption[]` from signed Krishna Rx + emergency option |
| GET | `/api/farmer/dispatches` | `getDispatches` | `{ summary, items: DispatchItem[] }` |
| GET | `/api/farmer/dispatches/:id` | `getDispatchDetail` | `DispatchDetail` |
| GET | `/api/farmer/dispatch/safety` | `checkDispatchSafety` | query `product`, `animalIds` (comma-separated) → `DispatchSafetyOutcome` |
| GET | `/api/farmer/insights` | `getFarmInsights` | query `range=30d\|60d\|90d` → `FarmInsights` |

### Dashboard assembly

- `farm.animal_count` = Animal count where farmId=krishna
- `under_treatment_count` / `waiting_count` / `clear_count` from `Animal.status`
- `attention_items`: withdrawal treatments first (MP-104 HIGH), then stock variant=red (Oxytetracycline MEDIUM)
- `quick_actions`: keep the three objects from `farmer-dashboard.ts`
- `medicine_stock`: from MedicineStock home labels

### Farm assembly

- species_overview: group Krishna animals by type
- animals: all 48
- recent_activity: Activity where farmId=krishna

### Prescription options (signed Krishna Rx + emergency)

Mirror dummy ids where possible:

- opt from Rx-208 Oxytetracycline 10 mg/kg Injection rx_id `"208"` (dummy used `"201"` — use real rx number **without Rx- prefix** or keep `Rx-208`; UI only displays drug_name. Prefer `rx_id: "Rx-208"` string the list already uses)
- Amoxicillin from Rx-198
- Ivermectin from completed trt-5 (rx may be null)
- Vitamin B12 rx_id null (unsigned)
- emergency option: `{ id: "opt-emergency", drug_name: "No signed Rx — Emergency Log", dosage: "", route: "", rx_id: null, is_emergency_exception: true }`

## Vet (`server/src/services/vet.ts`)

| method | path | dummy function | DTO |
|---|---|---|---|
| GET | `/api/vet/dashboard` | `getVetDashboard` | current dashboard object (vet, workload, alerts, attention_items, insights, prescriptions, recent_activity, recent_outcomes) |
| GET | `/api/vet/prescriptions` | `getPrescriptionsList` | `PrescriptionsData` |
| GET | `/api/vet/prescriptions/:rxId` | `getPrescriptionForSigning` | `PrescriptionSignDetail` for **that** id |
| GET | `/api/vet/prescriptions/:rxId/emergency` | `getEmergencyForCountersigning` | `PrescriptionSignDetail` (404 if not unsigned_emergency) |
| GET | `/api/vet/patients` | `getVetPatients` | `PatientsData` |
| GET | `/api/vet/cases/:id` | `getCaseDetail` | `CaseDetail` — resolve id as rxId **or** animalId **or** attn-* mapped to Rx |
| GET | `/api/vet/farms` | (new, for modal) | `{ id, name }[]` the three farms |

### Prescriptions list item mapping

```
status_badges from RxStatus:
  sign_req → { text: "SIGN-REQ", variant: "sign" }
  unsigned_emergency → { text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true }
  signed → { text: "SIGNED", variant: "signed", dot: true }
  countersigned → { text: "COUNTERSIGNED", variant: "countersigned", dot: true }
  voided → { text: "VOIDED", variant: "voided" }
aware_badges from aware + cia
action_target: sign_req → sign_flow; unsigned_emergency → countersign_flow; else read_only
action_text: sign_flow/countersign_flow → "Review"; else "View"
```

### Case detail resolution

- `Flock P-01`, ids containing `P-01`, `attn-2`, `Rx-207` → Meena Gumboro payload
- `Rx-205`, `MP-118`, `attn` for 205 → Enrofloxacin mastitis + stewardship
- `Rx-208`, `MP-104` → Oxytetracycline mastitis signed
- unknown → 404 JSON `{ error: "not_found" }` (do not return a random default case)

## Admin (`server/src/services/admin.ts`)

| method | path | payload |
|---|---|---|
| GET | `/api/admin/overview` | `{ regions: RegionRow[], districts: Record<string, DistrictRow[]>, monthlyAmU, monthlyLabels, healthEvents, demandLevel }` |
| GET | `/api/admin/anomalies` | `{ items: AnomalyRow[] }` |
| GET | `/api/admin/health` | `{ items: HealthRow[] }` |
| GET | `/api/admin/forecast` | `{ series, summary, demandLevel, regionalPlanning }` |
| GET | `/api/admin/workspace` | `{ insights: SavedInsight[], notes: ResearchNote[] }` |

Types live in `src/lib/api/dummy/admin.ts` and must match the interfaces currently inside `src/app/admin/page.tsx` (`RegionRow`, `DistrictRow`, `AnomalyRow`, `HealthRow`, `SavedInsight`, `ResearchNote`).

## Errors

- 404 `{ error: "not_found" }`
- 400 `{ error: "invalid_body" }`
- Sign PIN mismatch: 401 `{ error: "Incorrect PIN" }` / `{ error: "Invalid PIN" }` so existing client `throw new Error` paths can map `message` from JSON
