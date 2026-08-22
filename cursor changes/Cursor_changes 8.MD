# Cursor_changes 8 — Express POST routes and handler wiring

After every successful POST, the matching GET must show the write. Clients call `queryClient.invalidateQueries` instead of only patching local React state.

## Farmer writes

### POST `/api/farmer/animals`

Caller: `src/app/farmer/my-farm/page.tsx` `handleAddAnimal`.  
Body = `AnimalFormData` from `src/components/farmer/AddAnimalModal.tsx` (`id`, `type`, `breed`, `sex`, `dob`, `productionType`).  
Server: insert Animal on `farm-krishna`, status `healthy`; insert Activity `Animal registered`.  
Reject duplicate id with 409.  
Client: await POST, invalidate `["farm-detail"]`, `["farmer-dashboard"]`. Keep existing local state update **or** replace it with refetch; refetch is preferred so counts stay correct.

### POST `/api/farmer/treatments`

Caller: `src/app/farmer/treatments/page.tsx` `handleRecordTreatment`.  
Body: `{ animalIds: string[], prescription, timing, backdatedTime }` (same object the modal already builds).  
Server: for each animalId, insert Treatment (status Withdrawal if not emergency else Unsigned), badges as the page already constructs, link prescription if `rx_id` present, set animal status `under_treatment` or `waiting`.  
Client: POST then invalidate `["treatments"]`, `["farm-detail"]`, `["farmer-dashboard"]`, `["vet-dashboard"]`, `["vet-prescriptions"]`.

### POST `/api/farmer/dispatches`

Caller: `src/components/farmer/StartDispatchModal.tsx` after safety check passes / generate.  
Body: `{ product, animalIds: string[] }`.  
Server: create Dispatch id `DSP-0xx` next, dateLabel `Today`, status from safety outcome.  
Client: invalidate `["dispatches"]`.

Safety remains GET `/api/farmer/dispatch/safety` (already used conceptually by `checkDispatchSafety`).

### POST `/api/farmer/medicine-stock`

Caller: `src/components/farmer/MedicineStockTable.tsx` `handleAddStock(medicineName, quantity, unit)`.  
Server: increment MedicineStock.quantity for Krishna + that medicine name; if unit matches, add numbers; refresh status: qty≤8 vials or name Oxytetracycline && qty\<20 → red Restock recommended; ≤10 amber Monitor; else green.  
Client: invalidate `["farm-insights"]`, `["farmer-dashboard"]`.

### POST `/api/farmer/health-events`

Caller: `src/components/farmer/RecordHealthEventModal.tsx` (today the modal has no API).  
Body: whatever fields the modal already collects (animal select + event).  
Server: insert HealthEvent + Activity.  
Client: close modal, invalidate farm + dashboard.

## Vet writes

### POST `/api/vet/prescriptions`

Caller: `src/app/vet/prescriptions/page.tsx` `handleSaveNewRx`.  
Body: `NewPrescriptionModal` formData + `nextRxId`.  
Server: insert Prescription status `sign_req`, farm resolved by name, animal by id (create stub animal on that farm if missing so the row is consistent).  
Client: invalidate `["vet-prescriptions"]`, `["vet-dashboard"]`. Stop using `setQueryData` as the only write.

### POST `/api/vet/prescriptions/:rxId/sign`

Caller: `src/app/vet/prescriptions/[rxId]/sign/page.tsx` (already `submitSignature`).  
Body: `{ typed_name, has_drawn_signature, pin, drawn_image }`.  
If `pin !== "1234"` → 401 `{ error: "Incorrect PIN" }`.  
Else set status `signed`, signedBy, signatureRef hex, date_time formatted like dummy `22 Aug · 03:45 pm`.  
Return `{ signed_by, date_time, status: "signed", signature_reference }`.  
Also flip linked Treatment Unsigned → Active/Withdrawal and animal waiting → under_treatment.

### POST `/api/vet/prescriptions/:rxId/countersign`

Caller: countersign page.  
PIN `1234` or 401 `{ error: "Invalid PIN" }`.  
Set status `countersigned`. Return dummy-shaped `{ countersigned_by, date_time, status, reference, disclaimer_text }`.  
Flock P-01 / Rx-207: animal may move to recovered **only after** countersign.

### POST `/api/vet/patients/:id/follow-ups`

Caller: `PatientDetailModal` `handleSaveFollowUp`.  
Body: modal fields (outcome, notes).  
Insert FollowUp; update patient last_follow_up to today label.

## Admin writes

### POST `/api/admin/insights`

Caller: `src/app/admin/page.tsx` `handleSaveInsight`.  
Body: `SavedInsight`. Insert. Return workspace list or the created row.

### POST `/api/admin/notes`

Caller: `WorkspaceTab` `submitNote`.  
Body: `ResearchNote`. Insert.

## Query keys to invalidate (existing keys — reuse)

- `["farmer-dashboard"]` — `src/app/farmer/home/page.tsx`
- `["farm-detail"]` — my-farm
- `["treatments"]` — treatments page
- `["dispatches"]` — dispatch page
- `["farm-insights", range]` — insights
- `["vet-dashboard"]` — vet home
- `["vet-prescriptions"]` — prescriptions page
- `["vet-patients"]` — patients page
- `["rx-sign", rxId]` — sign pages
- `["admin-overview"]`, `["admin-anomalies"]`, `["admin-health"]`, `["admin-forecast"]`, `["admin-workspace"]` — new, used by admin page

## Express `server/src/index.ts` sketch

```
import express from "express";
import farmer from "./routes/farmer";
import vet from "./routes/vet";
import admin from "./routes/admin";
import auth from "./routes/auth";

const app = express();
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", auth);
app.use("/api/farmer", farmer);
app.use("/api/vet", vet);
app.use("/api/admin", admin);
app.listen(Number(process.env.PORT) || 4000);
```

No CORS required if Next rewrite is used. CORS `*` is still OK for hitting `:4000` directly in the consistency script.
