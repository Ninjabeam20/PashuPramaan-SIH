-- Live table on project kznydayavtwhinkdzbfm (checked 2026-08-24 via REST):
--   passports (
--     id, status passport_status,   -- VALID | EXPIRED | REVOKED
--     product_type, quantity, farm_name, animal_id,
--     issue_date, expiry_date,
--     health_ledger jsonb, lab_results jsonb, vet_signatures jsonb
--   )
-- Public SELECT is allowed. INSERT/UPDATE with the anon key is correctly blocked by RLS.
--
-- This app does NOT require new columns. Mapping:
--   status = REVOKED  → Not Verified (default on Generate Passport)
--   status = VALID    → Verified (after lab Approve / Release)
--   district          → stored on vet_signatures.district
--   safety ticks      → vet_signatures.{withdrawalCleared,vetCleared,labPassed}
--   lab object        → lab_results
--   timeline          → health_ledger
--
-- Optional only — run if you later want dedicated columns. The app works without this.

ALTER TABLE passports
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS district TEXT;
