# Cursor_changes 2 — Exact file inventory

## Create (new)

### Root

- `docker-compose.yml` — Postgres 16, container `pashupramaan-pg`, db/user/password `pashupramaan`, port `5432:5432`, volume `pashupramaan_pg`
- `.env.example` — `DATABASE_URL`, `PORT=4000`, `NEXT_PUBLIC_API_ORIGIN=http://localhost:3000`
- `.env` — local copy of `.env.example` (gitignored via existing `.env*`)
- `.gitignore` patch: add `!.env.example` and `/server/node_modules` and `/server/dist`

### `server/` (Express + Prisma)

- `server/package.json`
- `server/tsconfig.json`
- `server/prisma/schema.prisma`
- `server/prisma/seed.ts`
- `server/src/index.ts` — Express listen `:4000`, `express.json()`, mount routers, `GET /api/health`
- `server/src/db.ts` — PrismaClient singleton
- `server/src/constants.ts` — `FARMER_FARM_NAME`, `VET_NAME`, `PIN = "1234"`
- `server/src/routes/auth.ts`
- `server/src/routes/farmer.ts`
- `server/src/routes/vet.ts`
- `server/src/routes/admin.ts`
- `server/src/services/farmer.ts` — view-models matching dummy DTOs
- `server/src/services/vet.ts`
- `server/src/services/admin.ts`
- `server/src/services/labels.ts` — date labels (`Today`, `Yesterday`, `22 Aug`)
- `server/scripts/consistency-check.ts` — GET/POST assertions (see `Cursor_changes 10.MD`)

### Next.js API client

- `src/lib/api/client.ts` — `apiGet<T>(path)`, `apiPost<T>(path, body)`; base path `""` so browser hits `/api/...` (rewrite)
- `src/lib/api/dummy/admin.ts` — types + `getAdminOverview`, `getAdminAnomalies`, `getAdminHealth`, `getAdminForecast`, `getAdminWorkspace`, `saveAdminInsight`, `saveAdminNote`

## Modify (connection only; no visual redesign)

### Root config

- `package.json` — add scripts:
  - `"dev:server": "npm run dev --prefix server"`
  - `"dev:all": "concurrently -n next,api -c cyan,magenta \"npm run dev\" \"npm run dev:server\""`
  - `"db:up": "docker compose up -d"`
  - `"db:migrate": "npm run prisma:migrate --prefix server"`
  - `"db:seed": "npm run prisma:seed --prefix server"`
  - `"db:check": "npm run check --prefix server"`
- `package.json` devDependency: `concurrently`
- `next.config.ts` — async `rewrites()` returning `{ source: "/api/:path*", destination: "http://localhost:4000/api/:path*" }`
- `tsconfig.json` — exclude `server` (Express has its own tsconfig)
- `MEMORY.md` — record `backend` branch work under Current tree

### Dummy modules → HTTP clients (keep every existing `export interface` and function name)

- `src/lib/api/dummy/auth.ts` — `loginUser` stays local dummy (no JWT). Optional no-op `POST /api/auth/login`.
- `src/lib/api/dummy/farmer-dashboard.ts` — `getFarmerDashboard` → `GET /api/farmer/dashboard`
- `src/lib/api/dummy/farm-detail.ts` — `getFarmDetail` → `GET /api/farmer/farm`
- `src/lib/api/dummy/animal-detail.ts` — `getAnimalDetail(id)` → `GET /api/farmer/animals/:id`
- `src/lib/api/dummy/treatments.ts` — `getTreatments` → `GET /api/farmer/treatments`; `getPrescriptionOptions` → `GET /api/farmer/prescription-options`; `getTreatmentDetail(id)` → `GET /api/farmer/treatments/:id`; add `recordTreatment(body)` → `POST /api/farmer/treatments`
- `src/lib/api/dummy/dispatch.ts` — `getDispatches` → `GET /api/farmer/dispatches`; `getDispatchDetail(id)` → `GET /api/farmer/dispatches/:id`; `checkDispatchSafety` → `GET /api/farmer/dispatch/safety?product=&animalIds=`; add `createDispatch(body)` → `POST /api/farmer/dispatches`
- `src/lib/api/dummy/farm-insights.ts` — `getFarmInsights(range)` → `GET /api/farmer/insights?range=`; add `addMedicineStock(body)` → `POST /api/farmer/medicine-stock`
- `src/lib/api/dummy/vet-dashboard.ts` — `getVetDashboard` → `GET /api/vet/dashboard`
- `src/lib/api/dummy/vet-prescriptions.ts` — `getPrescriptionsList` → `GET /api/vet/prescriptions`; add `createPrescription(body)` → `POST /api/vet/prescriptions`; add `getVetFarms` → `GET /api/vet/farms`
- `src/lib/api/dummy/vet-sign-flow.ts` — `getPrescriptionForSigning(rxId)` → `GET /api/vet/prescriptions/:rxId`; `getEmergencyForCountersigning(rxId)` → `GET /api/vet/prescriptions/:rxId/emergency`; `submitSignature` → `POST /api/vet/prescriptions/:rxId/sign`; `submitCountersignature` → `POST /api/vet/prescriptions/:rxId/countersign`
- `src/lib/api/dummy/vet-case-detail.ts` — `getCaseDetail(id)` → `GET /api/vet/cases/:id`
- `src/lib/api/dummy/vet-patients.ts` — `getVetPatients` → `GET /api/vet/patients`; add `recordFollowUp(id, body)` → `POST /api/vet/patients/:id/follow-ups`

### Page / component handlers (markup unchanged; add fetch + invalidate)

- `src/app/farmer/my-farm/page.tsx` — `handleAddAnimal` → `POST /api/farmer/animals` then invalidate `["farm-detail"]`
- `src/app/farmer/treatments/page.tsx` — `handleRecordTreatment` → `recordTreatment` then invalidate `["treatments"]`, `["farm-detail"]`, `["farmer-dashboard"]`
- `src/app/farmer/dispatch/page.tsx` + `src/components/farmer/StartDispatchModal.tsx` — persist created dispatch
- `src/components/farmer/MedicineStockTable.tsx` — `handleAddStock` → `POST /api/farmer/medicine-stock` then invalidate `["farm-insights"]`, `["farmer-dashboard"]`
- `src/components/farmer/RecordHealthEventModal.tsx` — submit → `POST /api/farmer/health-events`
- `src/app/vet/prescriptions/page.tsx` — `handleSaveNewRx` → `POST /api/vet/prescriptions` then invalidate `["vet-prescriptions"]`, `["vet-dashboard"]`
- `src/app/vet/prescriptions/[rxId]/sign/page.tsx` — already calls `submitSignature`; keep, now hits Express
- `src/app/vet/prescriptions/[rxId]/countersign/page.tsx` — already calls `submitCountersignature`
- `src/components/vet/PatientDetailModal.tsx` — `handleSaveFollowUp` → POST follow-up; bind hardcoded “Cow · Shanti Dairy” to fetched patient
- `src/components/vet/RecordFollowUpModal.tsx` — bind hardcoded farm/type subtitle to props
- `src/components/vet/NewPrescriptionModal.tsx` — farm `<option>`s from `GET /api/vet/farms` (`Shree Krishna Dairy`, `Shanti Dairy`, `Meena Poultry`)
- `src/app/admin/page.tsx` — replace inline datasets with `useQuery` against `src/lib/api/dummy/admin.ts`; `handleSaveInsight` POSTs; same markup

## Do not touch (visual / out of scope)

- `src/app/layout.tsx`, farmer/vet `layout.tsx`
- `src/components/ui/*` styling
- `src/components/admin/IndiaChoroplethMap.tsx`, `src/lib/admin/india-geo.ts`, `src/data/india-states.json`
- `Create Dashboard Page/` — removed 2026-08-23 (leftover Vite/Figma scaffold; live admin is `src/app/admin`)
- `docs/api-contract*.md` (optional status notes only; not the DTO source)
- Login card markup; keep “Namaste, Ankita” in `src/app/farmer/home/page.tsx`
- No JWT, no password hashing, no Neon/Vercel Postgres
