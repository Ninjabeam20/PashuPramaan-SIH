# Parked improvements

If later work touches a listed file or shows a listed symptom, **stop that work, fix the related item first, then continue**. Append any new leftovers here. Do not pile features on a known landmine.

These were postponed after merging `qr-fixes` into `main`. They are not Git/merge blockers. Generate Passport QR and the lab → Supabase verifier path already work on the machine that has `LAB_PENDING` in Postgres.

## Must-fix if they start biting

### 1. Postgres enums missing: `LAB_PENDING`, `WORSENED`, `RELAPSE`

- Files: `backend/app/models.py`, `backend/alembic/versions/7dc43c184ced_init.py`, `backend/app/fix_enum.py` (`LAB_PENDING` only), `backend/app/api/farmer.py` (`_ensure_open_lab_sample`), `backend/app/api/vet.py`, `src/components/vet/RecordFollowUpModal.tsx`
- Symptom: 500 on Generate Passport / Send to Lab, or on vet follow-up save of Worsened / Relapse
- Note: this local DB already has `LAB_PENDING` (via `fix_enum.py`). A fresh clone that only runs Alembic may not.

### 2. Missing residue number counted as a pass

- Files: `backend/app/api/lab.py` (`verify_result`), `backend/app/supabase_passports.py` (`extract_mrl_from_sample`)
- Symptom: empty or unreadable MRL still clears the lot (`0.0 <= 0.10`)

### 3. Lab sample stays VERIFIED when residue failed

- File: `backend/app/api/lab.py` (`verify_result` sets `LabStage.VERIFIED` on every RELEASE)
- Symptom: lab list shows verified/released while the farmer lot is blocked and the public QR is Not Verified

### 4. Dispatch-detail QR is a dummy gov.in URL

- Files: `backend/app/api/farmer.py` (`get_dispatch_detail` `qr_data` / `passport_id`), `src/components/farmer/DispatchDetailModal.tsx`, `src/components/farmer/StartDispatchModal.tsx` (real QR is only here today)
- Symptom: scan from the lot-detail card 404s on the public verifier

## Pre-existing (not merge bugs)

- Seed tests vs `{ summary, items }`: `src/lib/seed/seed.test.ts`, `src/lib/api/dummy/lab-reports.ts`
- Generate Passport not gated on `eligible`: `src/components/farmer/StartDispatchModal.tsx`
- Treatment sets `followUpDue` but not Under Treatment: `backend/app/api/farmer.py` `create_treatment`

## Intended later fix (not now)

Alembic `ADD VALUE IF NOT EXISTS` for the missing enums, `FarmerDispatch.passportId`, honest `verify_result` gating, real QR on dispatch detail.
