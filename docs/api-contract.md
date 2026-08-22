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

## 3. My Farm (page 2 — not yet designed)
Status: `NEEDED` — spec pending. Expect: animal/flock list, per-animal withdrawal ribbon (milk/meat/eggs separately), health event history.

## 4. Treatments (page 3 — not yet designed)
Status: `NEEDED` — spec pending. Expect: Rx list, dose wizard (3-step per A5), backdated dose ≤72h (A6), link to health event (B8).

## 5. Dispatch (page 4 — not yet designed)
Status: `NEEDED` — spec pending. Expect: sale-gate check (withdrawal + MRL), passport issuance, QR generation.

## 6. Insights (page 5 — not yet designed)
Status: `NEEDED` — spec pending. Expect: farm heatmap, forecast detail, stock recommendations.

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

## 8. Admin / Regulator role
Status: `NEEDED` — pages undecided. Expect: exception queue, national heatmap, anomaly explained/unexplained (G10), planning panel.

---

## Conventions for all future endpoints
- Auth: `Authorization: Bearer <jwt>` on every call except `/api/auth/login`.
- Pagination: `?page=1&page_size=20`, response wraps list in `{ "items": [...], "total": n }`.
- Errors: `{ "error": { "code": "string", "message": "string" } }`.
- Dispatch/sale-gate specifically returns `409` on block (never a soft 200 with a warning flag) per the "fails closed" design rule.

---
*Last updated: seeded from login + farmer-home mockups only. Update this file every time a new page's data shape is decided — don't let it drift from the frontend dummy data.*
