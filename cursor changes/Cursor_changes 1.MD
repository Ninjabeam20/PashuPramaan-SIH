# Cursor_changes 1 — Index, locked decisions, architecture

Branch: `backend` (created from `main` at `d859918`).  
Stack: existing Next.js 16 App Router + **new** Express + **new** Docker PostgreSQL.  
Do **not** re-scaffold Next.js. Do **not** restyle UI.

## File set (this series)

| File | Contents |
|---|---|
| `Cursor_changes 1.MD` | This index, decisions, architecture |
| `Cursor_changes 2.MD` | Every path to create / modify / leave untouched |
| `Cursor_changes 3.MD` | Prisma models and field list |
| `Cursor_changes 4.MD` | Seed: users, farms, animals (all 48 + other farms) |
| `Cursor_changes 5.MD` | Seed: medicines, stock, prescriptions, treatments, dispatches, events |
| `Cursor_changes 6.MD` | Seed: admin national datasets + contradiction fixes |
| `Cursor_changes 7.MD` | Express GET routes and DTO mapping |
| `Cursor_changes 8.MD` | Express POST routes and page-handler wiring |
| `Cursor_changes 9.MD` | Frontend dummy clients, admin extract, hardcoded labels |
| `Cursor_changes 10.MD` | Consistency tests, runbook, MEMORY.md, out of scope |

## Locked decisions (already answered)

1. Scope = all three roles: every live farmer, vet, and admin route.
2. PostgreSQL is source of truth. Seed from current dummy files. “In memory” = keep `MEMORY.md` updated.
3. Postgres runs in **local Docker Compose**.
4. **No JWT this branch.** Login stays the dummy client check in `src/app/(auth)/login/page.tsx`. Express routes are open (dev-only). Still seed 3 users for ownership.
5. Pages/components/layout stay visually identical. Allowed: swap `src/lib/api/dummy/*` to `fetch`, add POSTs inside existing handlers, extract admin hardcoded datasets.
6. Writes persist in Postgres. Unify dummy contradictions by reading files, not inventing new farms.

## Demo context (no auth)

- Farmer GETs always return **Ankita / Shree Krishna Dairy**.
- Vet GETs always return **Dr. Bankey’s caseload** (Shree Krishna Dairy, Shanti Dairy, Meena Poultry).
- Admin GETs return national aggregates plus farm-level rows that name those same farms/drugs/events.
- Sign / countersign PIN stays **`1234`** (from `src/lib/api/dummy/vet-sign-flow.ts`).

## Architecture

```
UI pages/components
  → src/lib/api/dummy/* (thin fetch clients, same exported types)
  → fetch("/api/...")
  → next.config.ts rewrite /api/:path* → http://localhost:4000/api/:path*
  → Express :4000
  → Prisma
  → Postgres 16 (Docker)
```

Dashboards are **computed from relational rows** on each GET. Do not store JSON blobs per page.

## Ports / env

- Next.js: `3000`
- Express: `4000`
- Postgres: `5432`
- DB name: `pashupramaan`
- `DATABASE_URL=postgresql://pashupramaan:pashupramaan@localhost:5432/pashupramaan`
- Commit `.env.example`. Real `.env` stays gitignored.

## Existing dummy sources (read these; do not invent shapes)

- `src/lib/api/dummy/auth.ts`
- `src/lib/api/dummy/farmer-dashboard.ts`
- `src/lib/api/dummy/farm-detail.ts`
- `src/lib/api/dummy/animal-detail.ts`
- `src/lib/api/dummy/treatments.ts`
- `src/lib/api/dummy/dispatch.ts`
- `src/lib/api/dummy/farm-insights.ts`
- `src/lib/api/dummy/vet-dashboard.ts`
- `src/lib/api/dummy/vet-prescriptions.ts`
- `src/lib/api/dummy/vet-sign-flow.ts`
- `src/lib/api/dummy/vet-case-detail.ts`
- `src/lib/api/dummy/vet-patients.ts`
- `src/app/admin/page.tsx` (inline `REGION_DATA`, `DISTRICT_DATA`, `ANOMALY_DATA`, `HEALTH_DATA`, `FORECAST_*`, `SAVED_INSIGHTS_INIT`, `NOTES_INIT`)

DTO contract = the TypeScript interfaces in those dummy files. **Not** `docs/api-contract.md` (that file still assumes FastAPI and does not match the UI).
