# Cursor_changes 10 — Consistency checks, runbook, MEMORY.md, out of scope

## `server/scripts/consistency-check.ts`

Hit `http://localhost:4000` (not the Next rewrite). Exit 1 on first failure. Assertions:

1. `GET /api/health` → `{ ok: true }`
2. Farmer MP-104:
   - `GET /api/farmer/animals/MP-104` type `Cow`, farm implied Krishna, drug `Oxytetracycline`, withdrawal message contains `tomorrow`
   - `GET /api/farmer/farm` animals includes `{ id: "MP-104", type: "Cow", status: "under_treatment" }`
   - `GET /api/farmer/treatments` item `trt-1`.species === `Cow` && animal_flock === `MP-104`
   - `GET /api/vet/patients` item MP-104.farm === `Shree Krishna Dairy` && type `Cow`
   - `GET /api/vet/prescriptions` Rx-208 farm/animal/drug === Shree Krishna Dairy / MP-104 / Oxytetracycline
3. Flock P-01:
   - not present in `GET /api/farmer/treatments` items
   - vet prescriptions Rx-207 status unsigned emergency, farm Meena Poultry
   - vet dashboard workload.unsigned_emergency === 1
   - `GET /api/admin/anomalies` A002 farm `Meena Poultry`, healthEvent `Gumboro (IBD)`, medicine `Oxytetracycline`
4. Counts:
   - farmer dashboard animal_count === farm animals.length === 48
   - under_treatment + waiting + clear === 48
   - treatment summary fields === filtered item lengths
   - vet unsigned_emergency_count === number of items with countersign_flow
   - vet awaiting_signature_count === number of sign_flow items
5. No string `Krishna Dairy` (without Shree) in farmer dashboard, farm, treatments, vet dashboard, vet prescriptions, vet patients, admin anomalies A005
6. Writes:
   - POST animal `{ id: "MP-TEST", type: "Cow", ... }` then GET farm lists MP-TEST and animal_count 49
   - POST sign Rx-205 with pin `0000` → error Incorrect PIN; pin `1234` → status signed; GET prescriptions Rx-205 signed; GET farmer treatments MP-118 no longer Unsigned
   - POST countersign Rx-207 pin `1234` → GET Rx-207 countersigned; unsigned_emergency_count 0

The write tests mutate the DB. Run them **after** read assertions, then re-seed (`npm run db:seed`) to restore demo data. Document that in the script footer log.

## Manual runbook

```
docker compose up -d
cd server && npx prisma migrate dev --name init && npx tsx prisma/seed.ts
cd .. && npm run dev:all
```

Walk:

1. `/login` any password, role Farmer → `/farmer/home` shows Shree Krishna Dairy, 48, MP-104 withdrawal, oxytet restock
2. `/farmer/my-farm` MP-104 Cow under treatment; open detail = Gir + Oxytetracycline
3. `/farmer/treatments` no Flock P-01; MP-104 Cow
4. `/farmer/dispatch` DSP-024 is MP-105 cleared; DSP-023 MP-104 withdrawal
5. `/farmer/insights` stock 17 vials oxytet; no poultry flock row
6. Login Vet → `/vet/home` Dr. Bankey; unsigned emergency Meena / Flock P-01; no “Krishna Dairy” without Shree
7. `/vet/prescriptions` Rx-207 unsigned emergency; Rx-208 signed MP-104
8. Open Rx-205 sign flow → Enrofloxacin MP-118 Shree Krishna Dairy (not a generic default)
9. `/vet/patients` MP-104 Shree Krishna Dairy Cow
10. `/admin` map still colours; A002 Meena Poultry Gumboro; A005 Shree Krishna Dairy

## MEMORY.md updates (same session as code)

Under **Current tree** (uncommitted until asked to commit):

- Branch `backend`
- Added `server/` Express+Prisma, `docker-compose.yml`, `.env.example`
- Next rewrite `/api/*` → `:4000`
- `src/lib/api/dummy/*` are HTTP clients
- Admin datasets loaded via API
- Added `Cursor_changes 1.MD` … `Cursor_changes 10.MD`

Live App Router table: routes unchanged. Add a **Live Express endpoints** table listing the GET/POST paths from `Cursor_changes 7.MD` / `8.MD`.

Bump **Last updated** and **Branch** to `backend`. Do not invent a commit hash. HEAD stays `d859918` until a commit exists.

## Implementation order (when coding, not this doc task)

1. Branch already created: `backend`
2. Docker + server scaffold + rewrite (`plan todo: branch-scaffold`)
3. Prisma schema + `seed.ts` (`schema-seed`)
4. GET services + routes (`express-reads`)
5. POST services + routes (`express-writes`)
6. Dummy clients + admin extract + handlers (`wire-clients`)
7. `consistency-check.ts` + MEMORY.md (`verify-memory`)

## Out of scope

- JWT, password hashing, role middleware
- Vercel/Neon hosting
- CSS, layout, new screens
- Changing “Namaste, Ankita”
- Rewriting `docs/api-contract.md` to FastAPI
- `Create Dashboard Page/` Vite app
- Editing the Cursor plan file `.cursor/plans/Backend Express Postgres-3e2f859a.plan.md`

## Reference map (dummy → server)

| Dummy file | Server service | Seed tables |
|---|---|---|
| `farmer-dashboard.ts` | `services/farmer.ts` dashboard() | Animal, MedicineStock, Treatment |
| `farm-detail.ts` | farm() | Animal, Activity |
| `animal-detail.ts` | animal(id) | Animal, Treatment |
| `treatments.ts` | treatments(), treatment(id) | Treatment, Prescription |
| `dispatch.ts` | dispatches(), safety() | Dispatch, Treatment |
| `farm-insights.ts` | insights(range) | MedicineStock, InsightChart |
| `vet-dashboard.ts` | dashboard() | Prescription, FollowUp, Activity |
| `vet-prescriptions.ts` | prescriptions() | Prescription |
| `vet-sign-flow.ts` | prescription(id), sign(), countersign() | Prescription |
| `vet-case-detail.ts` | case(id) | Prescription, HealthEvent |
| `vet-patients.ts` | patients() | Animal, FollowUp, Prescription |
| `admin/page.tsx` constants | `services/admin.ts` | RegionStat, DistrictStat, Anomaly, HealthAmU, ForecastSeries, SavedInsight, ResearchNote |
