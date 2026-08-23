# PashuPramaan — Frontend ↔ Backend API Contract (living doc)

Status legend: `DUMMY` = frontend uses local mock data now · `NEEDED` = backend must implement before integration · `DONE` = wired to real API.

Stack assumption: FastAPI + PostgreSQL backend, JWT auth, JSON over REST. All timestamps ISO 8601 UTC. All money/quantity fields explicit units.

---

## 1. Auth

### POST /api/auth/login
Status: `DUMMY`

**Request**
```json
{
  "role": "farmer | vet | admin",
  "user_id": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "token": "jwt-string",
  "user": {
    "id": "uuid",
    "name": "Ankita",
    "role": "farmer",
    "farm_id": "uuid | null",
    "locale": "en | hi"
  }
}
```

**Response 401** — invalid credentials
**Response 403** — role/user_id mismatch

Open questions for backend:
- Is `role` used server-side to validate against the account, or purely a UI hint before the real role comes back in the JWT claims?
- Password reset flow (`Forgot Password?` link on login) — endpoint TBD.
- Signup (`Sign Up` link) — endpoint TBD, likely admin-approved for vets, self-serve for farmers.

---

## 2. Farmer Dashboard (Home page)

### GET /api/farmer/dashboard
Status: `DUMMY` — mocked in `lib/api/dummy/farmer-dashboard.ts`

**Response 200**
```json
{
  "farm": {
    "id": "uuid",
    "name": "Shree Krishna Dairy",
    "status": "good | attention | critical",
    "animal_count": 48,
    "clear_count": 43,
    "under_treatment_count": 3,
    "waiting_count": 2
  },
  "attention_items": [
    {
      "id": "uuid",
      "priority": "high | medium | low",
      "type": "withdrawal_active | mrl_fail | stock_low | rx_pending | health_event | follow_up",
      "title": "MP-104",
      "subtitle": "Withdrawal active",
      "detail": "Clears tomorrow",
      "link": "/my-farm/animals/{animal_id}"
    }
  ],
  "quick_actions": ["record_treatment", "health_event", "start_dispatch"],
  "medicine_stock": [
    {
      "name": "Oxytetracycline",
      "quantity_label": "17 vials",
      "status": {
        "text": "Restock recommended",
        "variant": "red"
      }
    }
  ]
}
```

Open questions for backend:
- `attention_items` — is priority/ordering computed server-side (per the "attention centre" spec) or does frontend sort by a priority field?
- Is `insight.medicines` the same payload as Prophet's farm-level forecast (Layer 1), or a separate summarized endpoint?
- Real-time refresh: polling interval vs push (websocket/SSE) for dashboard counts once withdrawal clocks tick over.

---

## 3. My Farm

### GET /api/farmer/farm
Status: `DUMMY` — mocked in `lib/api/dummy/farm-detail.ts`

**Response 200**
```json
{
  "farm": {
    "name": "Shree Krishna Dairy",
    "status": "good | attention | critical",
    "total_animals": 48,
    "cows_count": 10,
    "buffaloes_count": 20,
    "goats_count": 18,
    "under_treatment_count": 3
  },
  "species_overview": [
    {
      "species": "Cows",
      "count": 10,
      "healthy_count": 8,
      "under_treatment_count": 1,
      "waiting_count": 1
    },
    {
      "species": "Buffaloes",
      "count": 20,
      "healthy_count": 18,
      "under_treatment_count": 1,
      "waiting_count": 1
    },
    {
      "species": "Goats",
      "count": 18,
      "healthy_count": 17,
      "under_treatment_count": 1,
      "waiting_count": 0
    }
  ],
  "animals": [
    {
      "id": "MP-104",
      "type": "Cow | Buffalo | Goat",
      "status": "under_treatment | healthy | waiting"
    }
  ],
  "recent_activity": [
    {
      "icon": "clock",
      "title": "Treatment recorded",
      "subject": "MP-104",
      "time_label": "Today"
    }
  ]
}
```

Search and species/status filtering on the "Your Animals" table are client-side against this
full `animals` array for now — no query params yet. If the real animal list grows large,
backend should expose pagination + filter query params (`?type=cow&status=under_treatment&
search=MP-1`) so this doesn't stay a full-list client-side filter forever.

### POST /api/farmer/animals
Status: `DUMMY` — client-side only for now (`AddAnimalModal` appends to local state feeding
`my-farm/page.tsx`, no network call yet). Real endpoint shape below, matches the built form.

**Request**
```json
{
  "type": "cow | buffalo | goat | sheep | pig | poultry_flock | other",
  "tag_id": "MP-110",
  "breed": "Gir | string, optional",
  "sex": "male | female",
  "date_of_birth": "2024-03-01 | null",
  "production_type": "dairy | meat | dual"
}
```

**Response 201**
```json
{
  "id": "MP-110",
  "type": "cow",
  "breed": "Gir",
  "sex": "male",
  "date_of_birth": "2024-03-01",
  "production_type": "dairy",
  "status": "healthy",
  "farm_id": "uuid"
}
```

**Response 409** — `tag_id` already exists for this farm (frontend currently warns client-side
against the in-memory list; backend should enforce this as the source of truth once wired up).

Notes for backend:
- `type: poultry_flock` represents a flock, not a single animal — frontend swaps the tag-id
  field's label to "FLOCK ID" and placeholder to "e.g. P-01" when this type is selected, but
  sends the same `tag_id` field either way. Confirm whether flocks need a different id schema
  or count differently toward `total_animals` (one flock = one unit, or a flock size field is
  needed?) — currently sent as 1 unit, same as any other animal.
- `species_overview` (Section 3, GET /api/farmer/farm) only has cards for cow/buffalo/goat.
  Adding a sheep/pig/poultry_flock/other animal currently only updates `total_animals` and the
  table — no matching overview card exists yet. This is a known frontend gap, not a backend
  one, but backend should be aware the dashboard undercounts these types visually until a
  card (or a generic "Other" card) is designed.
- `date_of_birth` optional per the mockup ("Date of Birth / Age" — implies age can be entered
  instead of a birthdate in some future revision; current form only captures a date).

### GET /api/farmer/animals/{animal_id}
Status: `DUMMY` — mocked in `lib/api/dummy/farm-detail.ts` (`getAnimalDetail`). Powers the
"View →" AnimalDetailModal on My Farm.

**Response 200**
```json
{
  "id": "MP-104",
  "type": "Cow",
  "status": "under_treatment",
  "breed": "Gir",
  "sex": "Female",
  "date_of_birth": "2021-03-12",
  "production_type": "Dairy",
  "registered_on": "2022-01-01",
  "current_treatment": {
    "drug": "Oxytetracycline",
    "route": "Injection",
    "dosage": "10 mg/kg",
    "administered_at": "2026-08-22T08:15:00Z",
    "signed_badge": { "text": "Vet Signed", "variant": "green" },
    "withdrawal": {
      "dose_time": "2026-08-22T08:15:00Z",
      "now_pct": 30,
      "clear_label": "Milk clears tomorrow, 10:30 AM",
      "product": "milk"
    }
  }
}
```
`current_treatment: null` when the animal has no active/recent treatment — frontend omits the
whole "CURRENT TREATMENT" section and withdrawal ribbon in that case (e.g. a "Healthy" animal).

Open questions for backend:
- `species_overview` counts (`healthy_count` + `under_treatment_count` + `waiting_count`) should
  sum to `count` per species — should the backend guarantee this invariant, or does frontend
  need to defensively handle a mismatch (e.g. an animal in more than one bucket)?
- Is "Waiting" here the same concept as the farmer-home "Waiting" stat (animals mid-withdrawal-
  clock), or a different status (e.g. awaiting initial registration/vet visit)? Naming collision
  with farmer-dashboard's `waiting_count` — confirm these mean the same thing before wiring both
  screens to the same backend field.
- `recent_activity` on this page vs. the vet dashboard's `recent_activity` — same shape, same
  underlying event log? If so, backend should expose one activity-log endpoint filtered by
  farm/vet rather than two separate feed implementations.

## 4. Treatments

### GET /api/farmer/treatments
Status: `DUMMY` — mocked in `lib/api/dummy/treatments.ts` (`getTreatments`)

**Response 200**
```json
{
  "summary": {
    "active_count": 2,
    "withdrawal_ongoing_count": 2,
    "awaiting_vet_unsigned_count": 2,
    "completed_count": 1
  },
  "items": [
    {
      "id": "uuid",
      "animal_id": "MP-104",
      "species": "Buffalo",
      "feed_batch": null,
      "drug": "Oxytetracycline",
      "route": "Injection",
      "dosage": "10 mg/kg",
      "administered_at": "2026-08-22T08:15:00Z",
      "status_badge": { "text": "Withdrawal Active", "variant": "amber" },
      "secondary_badges": [
        { "text": "Vet Signed", "variant": "green" },
        { "text": "Lab ≤ MRL", "variant": "green" }
      ],
      "withdrawal": {
        "dose_time": "2026-08-22T08:15:00Z",
        "now_pct": 30,
        "clear_label": "Milk clears tomorrow, 10:30 AM",
        "product": "milk"
      }
    },
    {
      "id": "uuid",
      "animal_id": "Flock P-01",
      "species": "Poultry",
      "feed_batch": "FB-012",
      "drug": "Oxytetracycline",
      "route": "Medicated Feed",
      "dosage": "200 mg/L water",
      "administered_at": "2026-08-20T00:00:00Z",
      "status_badge": { "text": "Withdrawal Active", "variant": "amber" },
      "secondary_badges": [
        { "text": "Emergency / Unsigned", "variant": "purple" },
        { "text": "No lab assay", "variant": "muted" }
      ],
      "withdrawal": {
        "dose_time": "2026-08-20T00:00:00Z",
        "now_pct": 55,
        "clear_label": "Eggs clear in 4 days",
        "product": "eggs"
      }
    }
  ]
}
```
`withdrawal: null` for treatments with status Active-no-withdrawal or Completed — frontend
omits the WithdrawalRibbon in that case. Search/filter (by animal/medicine, status pills,
species select) are client-side against this full list for now — same pagination caveat as
Section 3.

### GET /api/farmer/treatments/{treatment_id}
Status: `DUMMY` — mocked in `lib/api/dummy/treatments.ts` (`getTreatmentDetail`). Powers the
"View details →" side panel (TreatmentDetailPanel).

**Response 200**
```json
{
  "id": "uuid",
  "animal_id": "MP-104",
  "species": "Buffalo",
  "status_badges": [
    { "text": "Withdrawal Active", "variant": "amber" },
    { "text": "Vet Signed", "variant": "green" },
    { "text": "Lab ≤ MRL", "variant": "green" }
  ],
  "medicine": "Oxytetracycline",
  "route": "Injection",
  "dose": "10 mg/kg",
  "administered_at": "2026-08-22T08:15:00Z",
  "reason": "Respiratory infection",
  "withdrawal": {
    "dose_time": "2026-08-22T08:15:00Z",
    "now_pct": 30,
    "clear_label": "Milk clears tomorrow, 10:30 AM",
    "product": "milk"
  },
  "timeline": [
    { "label": "Prescription", "status": "complete" },
    { "label": "Dose Given", "status": "complete" },
    { "label": "Withdrawal", "status": "current" },
    { "label": "Clear", "status": "upcoming" }
  ]
}
```

### GET /api/farmer/prescription-options
Status: `DUMMY` — mocked in `lib/api/dummy/treatments.ts` (`getPrescriptionOptions`). Powers
Step 2 ("What") of the Record Treatment wizard.

**Response 200**
```json
{
  "items": [
    {
      "id": "uuid",
      "drug": "Oxytetracycline",
      "dosage": "10 mg/kg",
      "route": "Injection",
      "rx_id": "RX-201",
      "signed": true,
      "is_emergency_exception": false
    },
    {
      "id": "uuid",
      "drug": "Vitamin B12",
      "dosage": "5 mL",
      "route": "Injection",
      "rx_id": null,
      "signed": false,
      "is_emergency_exception": false
    },
    {
      "id": "emergency",
      "drug": null,
      "rx_id": null,
      "signed": false,
      "is_emergency_exception": true
    }
  ]
}
```

### POST /api/farmer/treatments
Status: `NEEDED` — powers the final "Start Withdrawal Clock" submit. Frontend currently appends
a client-side approximated treatment (with a placeholder withdrawal ribbon) to local state
rather than calling a real endpoint — flagged in code as temporary, since real withdrawal-window
math (formulary hours per drug × species × product, per the withdrawal-vs-MRL spec) is backend
logic, not something the frontend should compute.

**Request**
```json
{
  "animal_ids": ["MP-104", "Flock P-01"],
  "prescription_option_id": "uuid | \"emergency\"",
  "timing": "now | backdated",
  "backdated_at": "ISO 8601 | null, required if timing=backdated, must be within 72h"
}
```

**Response 201** — same shape as a single `GET /api/farmer/treatments` item, with `withdrawal`
computed server-side from the formulary.

Open questions for backend:
- Multi-animal submission (Step 1 allows selecting several animals/flocks at once) — does this
  create one treatment record per animal, or one record covering all selected animals? Frontend
  currently treats it as producing one list entry per submission regardless of animal count —
  confirm this matches the intended data model.
- `is_emergency_exception: true` submissions — do these bypass validation that would otherwise
  require a `prescription_option_id`, and do they need to appear in the vet's "Unsigned
  Emergency" inbox (Section 7) automatically? These are likely the same underlying event.
- Backdated timing cap (72h) — enforced client-side only right now (A6 spec). Backend should
  re-validate, not trust the client.

---

## 5. Dispatch

### GET /api/farmer/dispatches
Status: `DUMMY` — mocked in `lib/api/dummy/dispatch.ts` (`getDispatches`)

**Response 200**
```json
{
  "summary": {
    "active_count": 1,
    "ready_count": 3,
    "under_withdrawal_count": 2,
    "blocked_count": 1
  },
  "items": [
    {
      "id": "DSP-024",
      "product": "Milk",
      "animal_flock": "MP-104",
      "date_label": "Today",
      "status": "cleared | withdrawal | blocked",
      "status_badge": { "text": "Cleared", "variant": "green", "icon": "check" }
    }
  ]
}
```

### GET /api/farmer/dispatches/{dispatch_id}
Status: `DUMMY` — mocked in `lib/api/dummy/dispatch.ts` (`getDispatchDetail`). Powers the
per-row "View →" DispatchDetailModal, with three conditional bodies driven by `status`.

**Response 200 (status: cleared)**
```json
{
  "id": "DSP-024",
  "product": "Milk",
  "animal_flock": "MP-104",
  "date_label": "Today",
  "status": "cleared",
  "timeline": [
    { "label": "Treatment", "status": "complete" },
    { "label": "Withdrawal", "status": "complete" },
    { "label": "Safety Check", "status": "complete" },
    { "label": "Dispatch", "status": "complete" }
  ],
  "cleared_checklist": [
    "Withdrawal Cleared",
    "MRL Within Limit",
    "Eligible",
    "Passport Generated"
  ]
}
```

**Response 200 (status: withdrawal)**
```json
{
  "id": "DSP-023",
  "product": "Milk",
  "animal_flock": "MP-108",
  "date_label": "Yesterday",
  "status": "withdrawal",
  "timeline": [
    { "label": "Treatment", "status": "complete" },
    { "label": "Withdrawal", "status": "current" },
    { "label": "Safety Check", "status": "upcoming" },
    { "label": "Dispatch", "status": "upcoming" }
  ],
  "withdrawal_detail": { "clears_label": "Clears: 24 Aug, 10:30 AM" }
}
```

**Response 200 (status: blocked)**
```json
{
  "id": "DSP-022",
  "product": "Meat",
  "animal_flock": "Flock-07",
  "date_label": "20 Aug",
  "status": "blocked",
  "timeline": [
    { "label": "Treatment", "status": "complete" },
    { "label": "Withdrawal", "status": "current" },
    { "label": "Safety Check", "status": "upcoming" },
    { "label": "Dispatch", "status": "upcoming" }
  ],
  "blocked_detail": {
    "failed_gates": [
      { "gate": "mrl", "message": "MRL Above Limit — Lab: 0.14 ppm / Permitted: 0.10 ppm" }
    ],
    "warnings": [
      { "icon": "warning", "message": "Prescription Unsigned" }
    ]
  }
}
```

### POST /api/farmer/dispatch/safety-check
Status: `NEEDED` — **this is the actual farm-gate lock.** Powers Step 3 of the Start Dispatch
wizard. Frontend currently computes pass/block from dummy per-animal `withdrawal_status` /
`mrl_status` fields via `checkDispatchSafety(product, animalIds)` in `lib/api/dummy/dispatch.ts`
— this must be replaced by a real backend check, not left client-computed, once real data exists.

**Request**
```json
{ "product": "milk | meat | eggs", "animal_ids": ["MP-104"] }
```

**Response 200 (eligible)**
```json
{
  "eligible": true,
  "withdrawal": { "status": "cleared", "detail": null },
  "mrl": { "status": "within_limit", "lab_result_ppm": 0.04, "permitted_ppm": 0.10 },
  "prescription": { "signed": true },
  "lab_assay": { "available": true }
}
```

**Response 200 (blocked)** — per the product spec, dispatch blocking must be a **hard gate, not
a soft warning**. Whether this should be `200` with `eligible: false` (so the frontend can
render the detailed blocked-gate breakdown) or a `409` per the general fails-closed convention
(see Conventions section below) needs to be settled — frontend currently expects a `200` with
`eligible: false` so it can show which specific gate failed and why, rather than a bare error.
Flag this mismatch to backend before wiring up.
```json
{
  "eligible": false,
  "withdrawal": { "status": "active", "detail": "Clears in 2 days" },
  "mrl": { "status": "exceeded", "lab_result_ppm": 0.14, "permitted_ppm": 0.10 },
  "prescription": { "signed": false },
  "lab_assay": { "available": true }
}
```

### POST /api/farmer/dispatch/passport
Status: `NEEDED` — powers "Generate PashuPramaan Passport", only callable when the safety check
above returned `eligible: true`. Frontend currently appends a client-side generated dispatch
entry to local state on this action — flagged as temporary.

**Request**
```json
{ "product": "meat", "animal_ids": ["MP-108"], "safety_check_id": "uuid" }
```

**Response 201**
```json
{
  "passport_id": "PP-2026-024",
  "dispatch_id": "DSP-024",
  "product": "Meat",
  "farm": "Shree Krishna Dairy",
  "animal_flock": "MP-108",
  "dispatch_date": "2026-08-22",
  "withdrawal": "Cleared",
  "mrl": "Within Limit",
  "prescription": "Vet Signed",
  "lab": "No assay on file",
  "qr_verify_url": "https://.../verify/PP-2026-024"
}
```
Per the product spec, the passport must be honest about lab status — `"No assay on file"` is a
valid, non-blocking value when no lab sample exists (time-cleared but not lab-certified), not
an error state.

Open questions for backend:
- Confirmed with product spec: this endpoint **must fail closed** — see the Conventions section.
  Need to resolve the 200-with-eligible-false vs 409 question above before frontend integration.
- `safety_check_id` — does the passport endpoint need to reference a specific prior safety-check
  call (to prevent a stale/replayed pass), or does it re-run the check itself server-side before
  issuing? Given the "no fake lab certificate" principle in the spec, re-checking at generation
  time seems safer than trusting a client-supplied prior result.
- QR code generation — is `qr_verify_url` enough for frontend to render the QR client-side, or
  does backend return a pre-rendered QR image?

---

## 6. Insights

### GET /api/farmer/insights?range=30d|60d|90d
Status: `DUMMY` — mocked in `lib/api/dummy/farm-insights.ts` (`getFarmInsights`)

**Response 200**
```json
{
  "range": "30d",
  "medicine_stock": [
    {
      "name": "Oxytetracycline",
      "current_stock": "17 vials",
      "recent_usage": "4 used",
      "status": { "text": "Restock recommended", "variant": "red" }
    }
  ],
  "demand_forecast": {
    "chart_data": [
      { "month": "Mar", "past_usage": 10, "forecast": null },
      { "month": "Sep", "past_usage": 32, "forecast": null },
      { "month": "Oct", "past_usage": 35, "forecast": 35 },
      { "month": "Nov", "past_usage": null, "forecast": 38 }
    ],
    "now_index": 7,
    "current_stock": "17 vials",
    "expected_requirement": "25 vials",
    "status": { "text": "Restock Recommended", "variant": "red" }
  },
  "most_used_medicines": [
    { "rank": 1, "name": "Oxytetracycline", "usage": "25 used", "usage_value": 100 }
  ],
  "farm_health_map": [
    { "species": "Cattle", "level": "Moderate", "detail": "10 animals · 1 under treatment" },
    { "species": "Poultry", "level": "High", "detail": "Flock P-01 · emergency tx" }
  ],
  "farm_performance": {
    "chart_data": [
      { "month": "Mar", "milk_output": 100, "medicine_cost": 110 }
    ]
  },
  "health_treatment_trends": {
    "chart_data": [
      { "month": "Mar", "health_events": 5, "treatments": 8 }
    ]
  }
}
```

Open questions for backend:
- Is `demand_forecast.chart_data` still mapped directly to Prophet's output? Does the backend handle the 60d increment, or is that computed differently?
- `farm_health_map` details — strings like `"10 animals · 1 under treatment"` or `"Flock P-01 · emergency tx"` are sent fully constructed by the backend because rules differ per species (e.g., poultry uses flock ID rather than animal count). Confirm the backend will handle this formatting.

### POST /api/farmer/medicine-stock
Status: `NEEDED` — powers the "+ Add Stock" modal on the Insights page (and potentially Home page). Frontend currently handles this entirely in local state.

**Request**
```json
{
  "medicine": "Oxytetracycline",
  "quantity_received": 50,
  "unit": "vials",
  "date_received": "2026-08-22"
}
```

**Response 201**
```json
{
  "success": true,
  "medicine": "Oxytetracycline",
  "new_stock_label": "67 vials"
}
```

Open questions for backend:
- Does the backend expect normalized units (e.g. converting `mL` to `doses` based on formulary), or does it just blindly append string units if they differ from the current stock?

## 7. Vet role

### GET /api/vet/dashboard
Status: `DUMMY` — mocked in `lib/api/dummy/vet-dashboard.ts`. Covers vet Home (page 1 of 2).

**Response 200**
```json
{
  "vet": { "name": "Dr. Bankey" },
  "workload": {
    "awaiting_signature": 2,
    "unsigned_emergency": 1,
    "follow_up": 3,
    "stewardship_review": 2,
    "status": "action_needed | clear"
  },
  "alerts": [
    {
      "id": "uuid",
      "farm": "Meena Poultry",
      "animal_flock": "Flock P-01",
      "drug": "Oxytetracycline",
      "administered_at": "2026-08-22T09:18:00Z",
      "badge": "unsigned_emergency"
    }
  ],
  "insights": [
    {
      "id": "uuid",
      "type": "treatment_evidence",
      "case_title": "Clinical mastitis · Buffalo",
      "similar_case_count": 47,
      "recovery_pct": 82,
      "recovery_label": "Recovered or improved",
      "disclaimer": "Supporting evidence from recorded cases. Not a recommendation."
    }
  ],
  "attention_items": [
    {
      "id": "uuid",
      "type": "prescription_awaiting_signature | unsigned_emergency | stewardship_review",
      "priority_color": "orange | red | purple",
      "label": "Prescription awaiting signature",
      "link_text": "Review & Sign",
      "title": "Shanti Dairy · MP-104",
      "diagnosis": "Clinical mastitis",
      "detail": "Amoxicillin · administered 10:42",
      "badges": [
        { "text": "SIGN", "variant": "orange" },
        { "text": "ACCESS", "variant": "green" }
      ]
    }
  ],
  "prescriptions": {
    "total": 4,
    "items": [
      {
        "rx_id": "RX-208",
        "farm": "Shanti Dairy",
        "animal_flock": "MP-104",
        "diagnosis": "Clinical mastitis",
        "status_badges": [{ "text": "SIGN", "variant": "orange" }],
        "aware_badge": { "text": "ACCESS", "variant": "green" },
        "time": "10:42",
        "action_text": "Review"
      }
    ]
  },
  "recent_activity": [
    {
      "time": "10:42",
      "title": "Rx-208 · MP-104",
      "description": "Prescription awaiting signature"
    }
  ],
  "recent_outcomes": [
    {
      "animal_flock": "MP-101",
      "diagnosis": "Clinical mastitis",
      "detail": "Treatment completed · 18 Aug",
      "outcome_badge": { "text": "RECOVERED", "variant": "green" }
    }
  ]
}
```

**Breaking shape change from the earlier draft:** `emergency_alert` and `treatment_evidence`
were originally single nullable objects — now `alerts` and `insights` are arrays (possibly
empty). The Alerts/Insights panels on vet home cap visible items and show a "View More →"
modal listing the rest when the array exceeds what comfortably fits; an empty array renders a
calm "No alerts" / "No insights" empty state. `recent_activity` and `recent_outcomes` follow
the same cap + "View More" pattern via the same shared list-panel component — backend can
return full history for both; capping is a frontend display concern, not something this
endpoint needs to paginate.

### GET /api/vet/cases/{case_id}
Status: `DUMMY` — mocked in `lib/api/dummy/vet-dashboard.ts` (`getCaseDetail`). Powers
CaseDetailModal, opened from every "Review →" / "Review & Sign →" / "Review & Countersign →"
link on vet home (attention cards, prescriptions table, alerts panel) and on the Prescriptions
list page — one modal, conditional content, reused everywhere a case needs a quick-look view.

**Response 200**
```json
{
  "case_id": "RX-205",
  "diagnosis": "Clinical mastitis",
  "animal_flock": { "id": "MP-118", "species": "Buffalo", "type": "Dairy" },
  "farm": "Krishna Dairy",
  "status_badges": [
    { "text": "SIGN", "variant": "orange" },
    { "text": "WATCH", "variant": "amber" },
    { "text": "CIA", "variant": "purple" }
  ],
  "linked_health_event": { "title": "Clinical mastitis", "onset": "2026-08-18" },
  "prescription": {
    "drug": "Enrofloxacin",
    "route": "Intramammary",
    "dose": "10 mL",
    "frequency": "Twice daily",
    "duration": "3 days",
    "reason": "Acute mastitis"
  },
  "stewardship": [
    { "text": "WATCH", "variant": "amber" },
    { "text": "CIA", "variant": "purple" }
  ],
  "treatment_history": [
    {
      "label": "Previous episode",
      "outcome_badge": { "text": "RECOVERED", "variant": "green" },
      "detail": "Treatment completed · 12 Aug"
    }
  ],
  "action_label": "Review & Sign | Review & Countersign | Review | Close"
}
```
`linked_health_event`, `stewardship`, and `treatment_history` are each independently nullable —
frontend omits that section entirely when absent (confirmed via the unsigned-emergency variant,
where `stewardship` is empty). `action_label` is sent by the backend rather than inferred
client-side from which link was clicked, so the modal's primary button routes consistently:
`"Review & Sign"` → navigates to the sign flow (below), `"Review & Countersign"` → navigates to
the countersign flow (below), `"Review"` → navigates to the read-only prescription view,
`"Close"` → no action available, button hidden/replaced.

---

### GET /api/vet/prescriptions/{rx_id}/for-signing
Status: `DUMMY` — mocked in `lib/api/dummy/vet-sign-flow.ts` (`getPrescriptionForSigning`).
Powers the 3-step Review & Sign flow. Extends the `GET /api/vet/cases/{case_id}` shape above
with fields specific to the sign ceremony.

**Response 200**
```json
{
  "case_id": "RX-205",
  "diagnosis": "Clinical mastitis",
  "animal_flock": { "id": "MP-118", "species": "Buffalo", "type": "Dairy" },
  "farm": "Krishna Dairy",
  "status_badges": [
    { "text": "SIGN", "variant": "orange" },
    { "text": "WATCH", "variant": "amber" },
    { "text": "CIA", "variant": "purple" }
  ],
  "linked_health_event": { "title": "Clinical mastitis", "onset": "2026-08-18" },
  "prescription": {
    "drug": "Enrofloxacin",
    "route": "Intramammary",
    "dose": "5 mg/kg",
    "frequency": "Once daily",
    "duration": "5 days",
    "reason": "Non-responsive to first-line treatment"
  },
  "previous_treatment": {
    "drug": "Amoxicillin",
    "duration": "3 days",
    "outcome_badge": { "text": "RECOVERED", "variant": "green" }
  },
  "stewardship": {
    "aware": { "text": "WATCH", "variant": "amber" },
    "cia": { "text": "CIA", "variant": "purple" }
  },
  "requires_stewardship_notice": true,
  "stewardship_notice": {
    "text": "This prescription involves a Critically Important Antimicrobial (CIA) classified as AWaRe WATCH. This does not prevent signing, but requires your informed confirmation.",
    "highlights": ["a Critically Important Antimicrobial (CIA)", "AWaRe WATCH"]
  },
  "stewardship_guidance": [
    "CIA drugs require clinical justification for use.",
    "AWaRe Watch drugs should be reserved for specific cases where first-line options are insufficient.",
    "Your signature confirms this prescription is clinically justified."
  ]
}
```
`requires_stewardship_notice` drives whether the flow's Notice step is shown at all — when
`false`, frontend skips straight from Review to Sign and the step-indicator only shows two
chips instead of three. `stewardship_notice.highlights` is an array of exact substrings of
`stewardship_notice.text` for the frontend to render in bold/accent color inline, same pattern
as the Insights page's `why_this_matters.highlight`.

### POST /api/vet/prescriptions/{rx_id}/sign
Status: `NEEDED` — the real sign ceremony (B7: ECDSA P-256 + wet-ink/typed name + vet PIN).
Frontend currently uses `submitSignature()` in `lib/api/dummy/vet-sign-flow.ts`, which validates
a hardcoded demo PIN (`"1234"`) client-side and fabricates a plausible-looking reference string
— explicitly **not** representing real cryptographic signing, flagged with a code comment.

**Request**
```json
{
  "typed_name": "Sofia Abidi",
  "has_drawn_signature": true,
  "signature_image": "base64-png | null — drawn canvas content, if provided",
  "pin": "1234"
}
```

**Response 200**
```json
{
  "signed_by": "Dr. Bankey",
  "date_time": "2026-08-22T15:45:00Z",
  "status": "signed",
  "signature_reference": "29DA27C7"
}
```

**Response 401** — incorrect PIN (frontend shows inline "Incorrect PIN" error, does not
advance to the Signed step).

Open questions for backend:
- Real signature ceremony — what does "ECDSA P-256 + wet-ink + vet PIN" actually mean as a
  request payload? Is the drawn canvas image what gets hashed/signed, or is there a separate
  cryptographic keypair per vet that the PIN unlocks? The prototype explicitly does not
  implement this — needs a real spec before backend work starts, not just this dummy shape.
- Is the vet's "Signing PIN" (explicitly called out in the UI as distinct from their login
  password) stored/verified the same way as login credentials, or via a separate auth
  mechanism entirely?
- `signature_image` — store as-is for audit/display purposes (the Signed result screen renders
  it back), or discard after producing a cryptographic signature? Given the "not a CCA-licensed
  DSC" disclaimer in the product spec, likely just needs to be retained for display/audit trail.

---

### GET /api/vet/emergencies/{event_id}/for-countersigning
Status: `DUMMY` — mocked in `lib/api/dummy/vet-sign-flow.ts` (`getEmergencyForCountersigning`).
Powers the 2-step Review & Countersign flow (no Notice step — always exactly Review → Sign).

**Response 200**
```json
{
  "case_id": "RX-207",
  "diagnosis": "Gumboro (IBD)",
  "animal_flock": { "id": "Flock P-01", "species": "Poultry", "type": "Broiler" },
  "farm": "Meena Poultry",
  "status_badges": [{ "text": "UNSIGNED EMERGENCY", "variant": "red" }],
  "administration": {
    "drug": "Oxytetracycline",
    "dose": "20 mg/kg",
    "route": "Oral",
    "frequency": "Once daily",
    "duration": "5 days",
    "administered_at": "09:18"
  },
  "confirmation_text": "By countersigning, I confirm that I have reviewed this emergency administration record and am formally adding my countersignature to authorize it."
}
```

### POST /api/vet/emergencies/{event_id}/countersign
Status: `NEEDED` — countersigning an unsigned emergency administration (B5). Frontend uses
`submitCountersignature()` in `lib/api/dummy/vet-sign-flow.ts`, same dummy-PIN validation
pattern as the sign endpoint above, explicitly not representing a real signing ceremony.

**Request**
```json
{
  "typed_name": "Dr. Bankey",
  "has_drawn_signature": true,
  "signature_image": "base64-png | null",
  "pin": "1234"
}
```

**Response 200**
```json
{
  "countersigned_by": "Dr. Bankey",
  "date_time": "2026-08-22T18:57:00Z",
  "status": "countersigned",
  "reference": "63709157"
}
```

**Response 401** — incorrect PIN, same handling as the sign endpoint.

Open questions for backend: same cryptographic-ceremony questions as `POST .../sign` above —
these two endpoints will likely share the same underlying signing infrastructure once real.
Also: does countersigning retroactively update the original emergency administration record's
status, or create a linked-but-separate countersignature record (frontend copy — "The original
emergency administration record has been retained" — suggests the latter; confirm before
backend modeling).

---

### GET /api/vet/prescriptions
Status: `DUMMY` — mocked in `lib/api/dummy/vet-prescriptions.ts` (`getPrescriptionsList`).
Powers the Prescriptions list page (vet page 2).

**Response 200**
```json
{
  "summary": {
    "all_count": 8,
    "awaiting_signature_count": 2,
    "unsigned_emergency_count": 0,
    "signed_count": 4,
    "voided_count": 1
  },
  "items": [
    {
      "rx_id": "RX-208",
      "farm": "Shanti Dairy",
      "animal_flock": "MP-104",
      "diagnosis": "Clinical mastitis",
      "status_badge": { "text": "SIGN", "variant": "orange" },
      "aware_badge": { "text": "ACCESS", "variant": "green" },
      "date_label": "10:42",
      "action": { "text": "Review", "target": "sign_flow" }
    },
    {
      "rx_id": "RX-207",
      "farm": "Meena Poultry",
      "animal_flock": "Flock P-01",
      "diagnosis": "Gumboro (IBD)",
      "status_badge": { "text": "COUNTERSIGNED", "variant": "blue" },
      "aware_badge": null,
      "date_label": "09:18",
      "action": { "text": "Review", "target": "read_only" }
    },
    {
      "rx_id": "RX-183",
      "farm": "Krishna Dairy",
      "animal_flock": "MP-088",
      "diagnosis": "Respiratory infection",
      "status_badge": { "text": "VOIDED", "variant": "voided" },
      "aware_badge": { "text": "RESERVE", "variant": "reserve" },
      "date_label": "10 Aug",
      "action": { "text": "View", "target": "read_only" }
    }
  ]
}
```
Search + filter pills (All/Awaiting signature/Unsigned emergency/Signed/Voided) are client-side
against this full list for now — same pagination caveat noted in Section 3. New badge variants
introduced here: `blue` (COUNTERSIGNED, reused from the countersign flow's result badge),
`voided` (muted gray + strikethrough text), `reserve` (distinct from `purple`/CIA — confirm
with product whether RESERVE and CIA should visually differ or if this is the same AWaRe/CIA
vocabulary rendered differently; the mockup shows both badges on the same VOIDED row, implying
they're independent classifications, not alternatives).

### POST /api/vet/prescriptions
Status: `NEEDED` — powers "Save Prescription" in the New Prescription modal. Frontend currently
appends a client-side-generated prescription (status always `"SIGN"`, per the modal's own
copy: "signature required in a separate step") to local state — flagged as temporary.

**Request**
```json
{
  "farm": "Krishna Dairy",
  "animal_flock_id": "MP-121",
  "diagnosis": "Clinical mastitis",
  "drug": "Amoxicillin",
  "dose": "10",
  "unit": "mL",
  "route": "Intramuscular",
  "frequency": "Twice daily",
  "duration": "3 days",
  "reason": "string, optional",
  "aware_classification": "ACCESS | WATCH | RESERVE | not_specified",
  "is_cia": false
}
```

**Response 201** — same shape as a `GET /api/vet/prescriptions` list item, `status_badge`
always `{ "text": "SIGN", "variant": "orange" }` on creation (a new prescription is never
created pre-signed).

Open questions for backend:
- `rx_id` generation — sequential per farm, per vet, or globally? Frontend currently guesses
  the next id client-side for display in the modal header before submission; backend should be
  the source of truth once wired.
- Does creating a prescription here immediately make it eligible for `POST
  /api/vet/prescriptions/{rx_id}/sign`, or is there an intermediate review/queue step not yet
  captured?

---

Open questions for backend (dashboard-level, from earlier draft — still open):
- Is `workload.status` ("action_needed") computed from a threshold on the four counts, or is
  it an independent field the backend sets based on other rules (e.g. any unsigned_emergency > 0
  forces action_needed regardless of counts)?
- `attention_items` ordering/priority — same question as the farmer dashboard: server-sorted or
  client-sorted?
- Insight cards of `type: "treatment_evidence"` — is this always tied to the *most recent*
  prescription being reviewed, or a static "most relevant case this vet is looking at" computed
  some other way? Now that `insights` is a list, could the backend return multiple evidence
  cards for different cases simultaneously, or is treatment evidence always exactly one item?
- Similar-case evidence (`recovery_pct`, `similar_case_count`) — confirmed hidden when n < 10
  per G11 spec. Does this apply per-insight-card, or only to the per-Rx sign-flow view?
- `aware_badge` on the prescriptions table/list — is this always present, or only for
  signed/reviewed Rx (RX-207 in the mockups has no aware badge, just its status badge)?

## 8. Vet Patients

### GET /api/vet/patients
Status: `DUMMY` — mocked in `lib/api/dummy/vet-patients.ts`

**Response 200**
```json
{
  "summary": {
    "all_count": 6,
    "under_treatment_count": 1,
    "follow_up_due_count": 1,
    "recovered_count": 2,
    "needs_attention_count": 1
  },
  "items": [
    {
      "id": "MP-104",
      "type": "Cow",
      "farm": "Shanti Dairy",
      "status": { "text": "Under Treatment", "variant": "patient_under_treatment", "dot": true },
      "last_follow_up": "22 Aug"
    }
  ]
}
```

### GET /api/vet/patients/{patient_id}
Status: `NEEDED` — frontend currently uses hardcoded mock data in `PatientDetailModal.tsx`.

**Response 200**
```json
{
  "id": "MP-104",
  "type": "Cow",
  "farm": "Shanti Dairy",
  "condition": "Clinical mastitis",
  "status": { "text": "Under Treatment", "variant": "patient_under_treatment", "dot": true },
  "current_treatment": "Amoxicillin · Intramammary · Twice daily",
  "last_follow_up": "22 Aug",
  "health_history": [
    {
      "date": "2026-08-22",
      "logs": [
        { "type": "health_event", "title": "Clinical mastitis onset" },
        { "type": "prescription", "title": "Amoxicillin prescribed (Rx-208)", "subtitle": "Vet: Dr. Bankey" },
        { "type": "follow_up", "title": "Follow-up recorded", "subtitle": "Vet: Dr. Bankey · Outcome: Improved" }
      ]
    }
  ]
}
```

### POST /api/vet/patients/{patient_id}/follow-up
Status: `NEEDED` — frontend uses local state in `RecordFollowUpModal.tsx`.

**Request**
```json
{
  "outcome": "Recovered | Improved | No Change | Worsened | Relapse",
  "notes": "string"
}
```

**Response 201**
```json
{
  "success": true,
  "follow_up_id": "uuid"
}
```

## 9. Admin / Regulator Dashboard

With the frontend refactored into a hierarchical structure under `/admin/*`, the backend must now support dedicated endpoints for each tab.

### GET /api/admin/overview
Status: `DUMMY` — derived from static constants in `components/admin/AdminShared.tsx`

**Response 200**
```json
{
  "summary_metrics": {
    "total_amu_kg": 984500,
    "amu_change_pct": 12,
    "active_anomalies": 124,
    "unexplained_anomalies": 38
  },
  "top_attention_items": [
    {
      "id": "A001",
      "type": "anomaly",
      "level": "HIGH",
      "title": "Unexplained +68% spike in Oxytetracycline",
      "subtitle": "Maharashtra · Dairy",
      "link": "/admin/anomalies?id=A001"
    }
  ],
  "regional_hotspots": [
    {
      "state_id": "MH",
      "state_name": "Maharashtra",
      "amu_change_pct": 23,
      "unexplained_anomalies": 5
    }
  ],
  "national_trend": {
    "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    "amu_values": [112, 108, 115, 110, 114, 118, 156, 182]
  }
}
```

### GET /api/admin/analytics
Status: `DUMMY` — derived from `REGION_DATA` and `DISTRICT_DATA`

**Response 200**
```json
{
  "states": [
    {
      "id": "UP",
      "state": "Uttar Pradesh",
      "zone": "North",
      "amu": 94200,
      "change": 18,
      "anomalies": 22,
      "unexplained": 8
    }
  ],
  "districts_by_state": {
    "MH": [
      {
        "district": "Pune",
        "amu": 14500,
        "change": 23,
        "anomalies": 4,
        "unexplained": 2
      }
    ]
  }
}
```
Open question for backend: Do we want to load all district data nationally upfront, or fetch districts on-demand `GET /api/admin/analytics/districts?state=MH` when a state is selected? Currently, the frontend holds all mock data in memory.

### GET /api/admin/anomalies
Status: `DUMMY` — derived from `ANOMALY_DATA`

**Response 200**
```json
{
  "items": [
    {
      "id": "A001",
      "farm": "Farm 247",
      "region": "Maharashtra",
      "medicine": "Oxytetracycline",
      "amu_change_pct": 68,
      "baseline": 100,
      "health_event": null,
      "status": "UNEXPLAINED",
      "severity": "HIGH",
      "species": "Dairy",
      "date": "2026-08-24",
      "history": [98, 102, 97, 104, 99, 101, 100, 98, 103, 115, 142, 168]
    }
  ]
}
```

### GET /api/admin/health-amu
Status: `DUMMY` — derived from `HEALTH_DATA`

**Response 200**
```json
{
  "items": [
    {
      "event": "Gumboro (IBD)",
      "species": "Poultry",
      "amu_change_pct": 54,
      "farms_affected": 21,
      "classification": "Explained"
    },
    {
      "event": "None recorded",
      "species": "Poultry",
      "amu_change_pct": 47,
      "farms_affected": 9,
      "classification": "Unexplained"
    }
  ],
  "monthly_trend": [
    { "month": "Mar", "health_events": 412, "amu_index": 115 }
  ]
}
```

### GET /api/admin/forecast
Status: `DUMMY`

**Response 200**
```json
{
  "series": [
    {
      "label": "Oxytetracycline · National",
      "historical": [110, 115, 112, 118, 156, 182],
      "forecast": [182, 195, 210, 205, 190, 175],
      "demand_level": "High",
      "expected_change": 32,
      "current_amu": "High",
      "signal": "High need"
    }
  ],
  "regional_planning": [
    {
      "region": "Maharashtra",
      "drug": "Oxytetracycline",
      "prediction": "+45% demand",
      "action": "Increase supply allocation"
    }
  ]
}
```

### GET /api/admin/workspace/insights
Status: `DUMMY` — powers the workspace

**Response 200**
```json
{
  "saved_insights": [
    {
      "id": "I001",
      "title": "Maharashtra — Oxytetracycline anomaly cluster",
      "summary": "Multiple unexplained spikes across 5 districts.",
      "tags": ["Maharashtra", "Oxytetracycline", "Unexplained"],
      "date": "2026-08-24",
      "linked_to": "Anomalies",
      "linked_anomaly_id": "A001"
    }
  ],
  "research_notes": [
    {
      "id": "N001",
      "observation": "Correlation between recent unseasonal rains and AMU spike.",
      "hypothesis": "Possible secondary respiratory infections driving usage.",
      "evidence": ["Regional weather data", "Health event reports"],
      "next_investigation": "Cross-reference with state veterinary department reports.",
      "associated_with": [{ "type": "Region", "value": "Maharashtra" }],
      "date": "2026-08-23",
      "author": "Dr. Sharma (Admin)"
    }
  ]
}
```

### POST /api/admin/workspace/insights
Status: `NEEDED` — Currently, saving insights from anomalies is handled in local React state (`AdminContext`). Backend must persist this to DB.

**Request**
```json
{
  "title": "string",
  "summary": "string",
  "tags": ["string"],
  "linked_anomaly_id": "string"
}
```
**Response 201**
```json
{
  "id": "I002",
  "success": true
}
```

---


## 10. Lab Technician Role

### GET /api/lab/dashboard
Status: `DUMMY` — mocked in `lib/api/dummy/lab-dashboard.ts`

**Response 200**
```json
{
  "summary": [
    { "value": "12", "label": "Awaiting Receipt", "sub": "3 high priority", "color": "amber" }
  ],
  "attention": [
    {
      "id": "MLK-2026-00124",
      "type": "MILK",
      "title": "Shree Krishna Dairy",
      "desc": "Beta-lactam residue testing required.",
      "status": "HIGH PRIORITY",
      "statusColor": "amber",
      "action": "Start Testing →",
      "page": "/lab/testing-workspace/MLK-2026-00124"
    }
  ],
  "activity": [
    {
      "text": "Result submitted for MLK-2026-00118",
      "time": "10 min ago",
      "icon": "check"
    }
  ]
}
```

### GET /api/lab/dispatches
Status: `DUMMY` — mocked in `lib/api/dummy/lab-dispatches.ts`

**Response 200**
```json
{
  "items": [
    {
      "id": "MLK-2026-00124",
      "date": "22 Aug · 10:30 AM",
      "product": "Milk",
      "productSub": "Raw milk",
      "source": "Shree Krishna Dairy",
      "sourceSub": "Animal: MP-104",
      "sample": "LAB-MLK-00981",
      "sampleStatus": "Received",
      "sampleColor": "green",
      "risk": "MODERATE",
      "riskColor": "amber",
      "status": "READY FOR TESTING",
      "statusColor": "amber",
      "action": "View →",
      "clickable": true
    }
  ]
}
```

### GET /api/lab/dispatches/{dispatchId}
Status: `DUMMY` — mocked in `lib/api/dummy/lab-dispatches.ts` (`fetchLabDispatchDetail`)

**Response 200**
```json
{
  "id": "MLK-2026-00124",
  "product": "Raw Milk",
  "source": "Shree Krishna Dairy",
  "date": "22 Aug 2026",
  "time": "10:30 AM",
  "quantity": "850 L",
  "linkedAnimal": "MP-104",
  "currentSample": "LAB-MLK-00981",
  "risk": "MODERATE",
  "riskReason": "Recent antimicrobial exposure",
  "overallStatus": "TESTING IN PROGRESS",
  "stages": [
    { "label": "Testing", "state": "active" }
  ],
  "tests": [
    {
      "num": "02",
      "title": "Microbiological Safety",
      "checks": ["Standard plate count", "Coliform screening", "Pathogen screen"],
      "status": "IN PROGRESS",
      "statusColor": "amber",
      "action": "Continue Testing →",
      "active": true,
      "badge": null
    }
  ],
  "assessment": [
    { "label": "Traceability", "status": "Complete", "color": "green" }
  ],
  "notes": {
    "condition": "Acceptable",
    "temperature": "4.2°C",
    "container": "Intact",
    "receivedBy": "Dr. Priya Sharma",
    "receivedAt": "22 Aug · 11:05 AM"
  },
  "activity": [
    {
      "time": "12:10 PM",
      "title": "Microbiological testing started",
      "desc": "Status updated to In Progress.",
      "icon": "active"
    }
  ]
}
```

### GET /api/lab/queue
Status: `DUMMY` — mocked in `lib/api/dummy/lab-testing.ts` (`fetchTestingQueue`)

**Response 200**
```json
{
  "awaiting": [
    {
      "id": "MLK-2026-00131",
      "product": "Milk",
      "productSub": "Raw Milk",
      "source": "Mahalaxmi Dairy",
      "sourceSub": "Animal: MP-087",
      "sample": "LAB-MLK-00992",
      "arrival": "Expected today · 10:45 AM",
      "priority": "HIGH PRIORITY",
      "priorityColor": "red",
      "reason": "Targeted residue test required",
      "action": "Receive Sample →",
      "highlighted": true
    }
  ],
  "ready": [
    {
      "id": "MLK-2026-00124",
      "product": "Milk",
      "source": "Shree Krishna Dairy",
      "sample": "LAB-MLK-00981",
      "tests": [
        { "name": "Product Quality", "status": "done" },
        { "name": "Microbiological Safety", "status": "active" },
        { "name": "Antimicrobial Residue", "status": "pending" }
      ],
      "action": "Continue Testing →"
    }
  ]
}
```

### GET /api/lab/workspace/{sampleId}
Status: `DUMMY` — mocked in `lib/api/dummy/lab-testing.ts` (`fetchTestingWorkspace`)

**Response 200**
```json
{
  "dispatchId": "MLK-2026-00124",
  "sampleId": "LAB-MLK-00981",
  "product": "Raw Milk",
  "productSub": "Milk",
  "source": "Shree Krishna Dairy",
  "sourceSub": "MP-104",
  "condition": "✓ Acceptable",
  "temperature": "4.2°C",
  "riskLevel": "MODERATE",
  "antimicrobialContext": "Amoxicillin · Last administered 15 Aug 2026",
  "antimicrobialStatus": "✓ Withdrawal completed before dispatch. Residue testing still required.",
  "assessments": [
    { "num": 1, "label": "Product Quality", "state": "done" },
    { "num": 2, "label": "Microbiological Safety", "state": "active" },
    { "num": 3, "label": "Antimicrobial Residue", "state": "pending" }
  ]
}
```

### POST /api/lab/workspace/{sampleId}/tests
Status: `NEEDED` — Single atomic submission per assay category.

**Request**
```json
{
  "test_category": "Microbiological Safety",
  "plateCount": 4200,
  "coliform": "Not Detected",
  "pathogen": "Not Detected",
  "organism": null,
  "notes": "Sample looks consistent.",
  "is_compliant": true
}
```
**Response 200**
```json
{
  "success": true,
  "message": "Test results submitted."
}
```
Open questions for backend:
- Do these microbiological safety fields (plateCount, coliform, pathogen) map directly to the `lab_assay` / `mrl.lab_result_ppm` fields mentioned in Section 5? The API contract focuses heavily on antimicrobial MRLs for dispatch safety logic. If these pathogen results need to be tracked on the dispatch passport or queried centrally, the backend `lab_assay` schema may need to explicitly include non-MRL tests (pathogen flags, CFU limits).

### GET /api/lab/results
Status: `DUMMY` — mocked in `lib/api/dummy/lab-results.ts`

**Response 200**
```json
{
  "items": [
    {
      "id": "MLK-2026-00124",
      "product": "Raw Milk",
      "source": "Shree Krishna Dairy",
      "sample": "LAB-MLK-00981",
      "date": "23 Aug 2026",
      "tests": [
        { "label": "Product Quality", "result": "COMPLIANT", "ok": true },
        { "label": "Microbiological Safety", "result": "COMPLIANT", "ok": true },
        { "label": "Antimicrobial Residue", "result": "WITHIN LIMIT", "ok": true }
      ],
      "status": "AWAITING VERIFICATION",
      "statusColor": "amber",
      "action": "Review Assessment →",
      "outcome": "released"
    }
  ]
}
```

### POST /api/lab/results/{resultId}/verify
Status: `NEEDED` — Final assessment submission to clear or hold the dispatch.

**Request**
```json
{
  "outcome": "released | hold",
  "remarks": "All checks passed successfully."
}
```
**Response 200**
```json
{
  "success": true,
  "new_status": "CLEARED FOR DISPATCH"
}
```

### GET /api/lab/reports
Status: `DUMMY` — mocked in `lib/api/dummy/lab-reports.ts`

**Response 200**
```json
{
  "summary": [
    { "v": "128", "l": "Completed", "color": "neutral" }
  ],
  "items": [
    {
      "id": "MLK-2026-00124",
      "product": "Milk",
      "productSub": "Raw Milk",
      "source": "Shree Krishna Dairy",
      "sample": "LAB-MLK-00981",
      "animal": "MP-104",
      "date": "23 Aug 2026",
      "status": "CLEARED",
      "statusColor": "green",
      "refNo": "LAB-REF-2026-00124",
      "verifiedBy": "Laboratory Authority",
      "verifiedOn": "23 Aug 2026 · 4:20 PM",
      "assessments": [
        { "label": "Microbiological Safety", "result": "Compliant", "ok": true, "detail": "SPC 4,200 CFU/mL · Coliform ND · Pathogen ND" }
      ],
      "mrl": {
        "drug": "Amoxicillin (Beta-lactam)",
        "measured": 3.2,
        "limit": 4.0,
        "unit": "μg/kg",
        "ratio": 0.80,
        "verdict": "WITHIN MRL",
        "verdictOk": true
      },
      "withdrawal": {
        "drug": "Amoxicillin",
        "administered": "15 Aug 2026",
        "completed": "20 Aug 2026",
        "status": "Completed before dispatch"
      },
      "outcome": "CLEARED FOR DISPATCH",
      "outcomeOk": true
    }
  ]
}
```
Open questions for backend:
- **MRL Consistency:** The `ReportMrl` struct contains `ratio` and `verdictOk` fields. Ensure the backend returns these pre-computed for consistency with the frontend.
- **Dispatch Safety Check Consistency:** The Farmer `POST /api/farmer/dispatch/safety-check` API returns an `mrl` object (e.g. `{"status": "within_limit", "lab_result_ppm": 0.04, "permitted_ppm": 0.10}`). The backend needs to ensure that when a Lab `CLEARED FOR DISPATCH` status is generated here, it maps accurately to `lab_assay: {available: true}` and sets the corresponding `mrl` status in the farmer's safety check API.

## Conventions for all future endpoints
- Auth: `Authorization: Bearer <jwt>` on every call except `/api/auth/login`.
- Pagination: `?page=1&page_size=20`, response wraps list in `{ "items": [...], "total": n }`.
- Errors: `{ "error": { "code": "string", "message": "string" } }`.
- Dispatch/sale-gate specifically returns `409` on block (never a soft 200 with a warning flag) per the "fails closed" design rule — **note this conflicts with the current dummy frontend behavior for `POST /api/farmer/dispatch/safety-check`, which expects a 200 with `eligible: false`; see Section 5, still unresolved.**

---
*Last updated: both Farmer and Vet roles are now functionally complete on dummy data —
all 5 farmer pages (Home, My Farm, Treatments, Dispatch, Insights) and all 3 vet pages (Home,
Prescriptions, Patients), including every modal/panel/flow built so far: farmer side — Add Animal,
Record Treatment wizard, Start Dispatch wizard + passport, Animal Detail, Treatment Detail
panel, Dispatch Detail, Add Medicine Stock modal; vet side — CaseDetailModal, the 3-step Review & Sign pipeline
(Review → Notice → Sign → Signed), the 2-step Review & Countersign pipeline (Review → Sign →
Countersigned), New Prescription modal, PatientDetailModal, and RecordFollowUpModal. Alerts/Insights/Recent Activity/Recent Outcomes
on vet home now use a shared capped-list-with-View-More pattern.

Remaining gaps: the real cryptographic sign/countersign ceremony (both endpoints are `NEEDED`,
current frontend uses dummy PIN "1234" validation only — flagged throughout as non-production),
the dispatch safety-check 200-vs-409 conflict (Section 5, unresolved), the RESERVE-vs-CIA badge
distinction (Section 7, unresolved). The Admin/Regulator dashboard is now designed with full hierarchical endpoints.

Update this file every time a new page's data shape is decided — don't let it drift from the
frontend dummy data.*

