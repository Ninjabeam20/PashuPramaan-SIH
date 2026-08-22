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
  "insight": {
    "demand_level": "high | medium | low",
    "window_days": 30,
    "medicines": [
      { "name": "Oxytetracycline", "demand_pct": 84, "level": "high" },
      { "name": "Ivermectin", "demand_pct": 61, "level": "medium" },
      { "name": "Vitamin B Complex", "demand_pct": 45, "level": "normal" }
    ],
    "recommendation": "Oxytetracycline demand is high. Consider restocking in the next 7–10 days."
  },
  "top_medicines_by_demand": [
    { "rank": 1, "name": "Oxytetracycline", "level": "high" },
    { "rank": 2, "name": "Ivermectin", "level": "medium" },
    { "rank": 3, "name": "Vitamin B Complex", "level": "normal" }
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

### GET /api/farmer/insights?range=30d|90d
Status: `DUMMY` — mocked in `lib/api/dummy/farm-insights.ts` (`getFarmInsights`)

**Response 200**
```json
{
  "range": "30d",
  "at_a_glance": {
    "medicine_demand_level": "moderate",
    "animals_needing_attention": 3,
    "upcoming_followups": 2
  },
  "medicine_demand": {
    "level": "moderate",
    "range_label": "30 days",
    "summary": "Demand is expected to remain steady over the next 30 days.",
    "chart_data": [
      { "month": "Mar", "past_usage": 10, "forecast": null },
      { "month": "Sep", "past_usage": 62, "forecast": null },
      { "month": "Oct", "past_usage": null, "forecast": 68 },
      { "month": "Nov", "past_usage": null, "forecast": 70 }
    ],
    "now_index": 6
  },
  "farm_heatmap": [
    { "entity": "Cow A", "level": "low" },
    { "entity": "Goat Grp", "level": "high" }
  ],
  "medicines_to_watch": [
    { "name": "Oxytetracycline", "trend": "up", "subtitle": "Higher demand expected", "level": "higher" },
    { "name": "Ivermectin", "trend": "flat", "subtitle": "Stable", "level": "stable" },
    { "name": "Vitamin B Complex", "trend": "down", "subtitle": "Lower demand expected", "level": "lower" }
  ],
  "attention_items": [
    { "icon": "warning", "title": "Oxytetracycline", "description": "Demand may increase next week." },
    { "icon": "check", "title": "4 animals", "description": "Cleared for dispatch." },
    { "icon": "health_event", "title": "Flock P-01", "description": "Health event remains on watch." }
  ],
  "why_this_matters": {
    "text": "Oxytetracycline demand is expected to increase because treatment activity has increased compared with the previous period. Higher usage is associated with an active health event on the farm. Ivermectin and Vitamin B Complex usage remains within normal range.",
    "highlight": "Higher usage is associated with an active health event on the farm."
  }
}
```

Open questions for backend:
- This is presented in the product spec as Prophet's farm-level demand forecast (Layer 1) —
  confirm `medicine_demand.chart_data` maps directly to Prophet's output rather than being a
  separately-summarized endpoint (same open question flagged in Section 2 for the dashboard's
  smaller demand widget — these two are likely the same forecast at different granularity).
- `why_this_matters.highlight` — sent as an exact substring of `text` for the frontend to
  highlight inline. Confirm backend can guarantee substring match (encoding/whitespace) rather
  than frontend needing fuzzy matching.
- `farm_heatmap` levels — same low/moderate/high vocabulary as the vet/admin national heatmap
  (G10, "explained vs unexplained")? If the color/level system is meant to be shared across
  farmer, vet, and admin views, worth standardizing the enum now.

## 7. Vet role

### GET /api/vet/dashboard
Status: `DUMMY` — mocked in `lib/api/dummy/vet-dashboard.ts`. Covers page 1 of 2 (Home).
Page 2 (Prescriptions detail / sign flow) not yet specced.

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
  "emergency_alert": {
    "farm": "Meena Poultry",
    "animal_flock": "Flock P-01",
    "drug": "Oxytetracycline",
    "administered_at": "2026-08-22T09:18:00Z",
    "badge": "unsigned_emergency"
  },
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
  "treatment_evidence": {
    "case_title": "Clinical mastitis · Buffalo",
    "similar_case_count": 47,
    "recovery_pct": 82,
    "recovery_label": "Recovered or improved",
    "disclaimer": "Supporting evidence from recorded cases. Not a recommendation."
  },
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

### GET /api/vet/prescriptions/{rx_id}
Status: `NEEDED` — powers the "Review & Sign" detail modal (specced from mockup, not yet built
in frontend — next prompt). Expected shape based on the modal design:

```json
{
  "rx_id": "RX-205",
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
  "stewardship": {
    "aware": "WATCH",
    "cia": "CIA"
  },
  "treatment_history": [
    {
      "label": "Previous episode",
      "outcome_badge": { "text": "RECOVERED", "variant": "green" },
      "detail": "Treatment completed · 12 Aug"
    }
  ]
}
```

### GET /api/vet/cases/{case_id}
Status: `DUMMY` — mocked in `lib/api/dummy/vet-dashboard.ts` (or `vet-case-detail.ts`) as
`getCaseDetail`. Powers CaseDetailModal, opened from every "Review →" / "Review & Sign →" /
"Review & Countersign →" link on vet home (attention cards, prescriptions table, emergency
alert banner) — one modal, conditional content.

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
frontend omits that section entirely when absent (confirmed via the unsigned-emergency variant
of this modal, where `stewardship` is empty/not applicable). `action_label` is sent by the
backend rather than inferred client-side from which link was clicked, so the footer button
label/action stays consistent even if the modal is deep-linked or reopened.

The primary action button in this modal is NOT wired to a real submit yet — see sign/countersign
endpoints below, both still `NEEDED`.

### POST /api/vet/prescriptions/{rx_id}/sign
Status: `NEEDED` — the actual sign ceremony (B7: ECDSA P-256 + wet-ink/typed name + vet PIN).
Not built yet — modal from Image 3 will initially just log the rx_id on "Review & Sign" click
per current frontend scope. Real request/response shape TBD when the sign ceremony UI is
specced.

### POST /api/vet/emergencies/{event_id}/countersign
Status: `NEEDED` — countersigning an unsigned emergency administration (B5). Shape TBD.

Open questions for backend:
- Is `workload.status` ("action_needed") computed from a threshold on the four counts, or is
  it an independent field the backend sets based on other rules (e.g. any unsigned_emergency > 0
  forces action_needed regardless of counts)?
- `attention_items` ordering/priority — same question as the farmer dashboard: server-sorted or
  client-sorted?
- `treatment_evidence` — is this always tied to the *most recent* prescription being reviewed,
  or a static "most relevant case this vet is looking at" computed some other way? The mockup
  shows one evidence card on the dashboard home — is that per-vet, or per-selected-case?
- Similar-case evidence (`recovery_pct`, `similar_case_count`) — confirmed hidden when n < 10
  per G11 spec. Does the dashboard-level card follow the same rule, or only the per-Rx modal one?
- `aware_badge` on the prescriptions table — is this always present, or only for signed/reviewed
  Rx (Rx-207 in the mockup has no aware badge, just UNSIGNED EMERGENCY)?

## 8. Admin / Regulator role
Status: `NEEDED` — pages undecided. Expect: exception queue, national heatmap, anomaly explained/unexplained (G10), planning panel.

---

## Conventions for all future endpoints
- Auth: `Authorization: Bearer <jwt>` on every call except `/api/auth/login`.
- Pagination: `?page=1&page_size=20`, response wraps list in `{ "items": [...], "total": n }`.
- Errors: `{ "error": { "code": "string", "message": "string" } }`.
- Dispatch/sale-gate specifically returns `409` on block (never a soft 200 with a warning flag) per the "fails closed" design rule.

---
*Last updated: all 5 farmer pages (Home, My Farm, Treatments, Dispatch, Insights) + vet Home
covered, including every modal/panel built so far (Add Animal, Record Treatment wizard, Start
Dispatch wizard + passport, Animal Detail, Treatment Detail panel, Dispatch Detail, vet Case
Detail). Remaining gaps: vet page 2 (Prescriptions), the actual sign/countersign ceremony
endpoints, the dispatch safety-check 200-vs-409 question (see Section 5), and the entire
Admin/Regulator role. Update this file every time a new page's data shape is decided — don't
let it drift from the frontend dummy data.*
