# PashuPramaan — Repository Memory

Living record of repo state and what each commit changed. **Update this file in the same session whenever code or docs change.** Do not invent commits; only record what `git log` and the working tree actually show.

**Last updated:** 2026-08-25  
**Branch:** `main` (local; not pushed)  
**HEAD:** `af8241b` — Record improvements.md in repository memory.  
**qr-fixes:** `f4761a9` (kept)

## Current tree (uncommitted)

- Lab dashboard overview: `GET /api/lab/dashboard` now returns pipeline KPIs (receipt / testing / verification / hold), outcomes (reports / passed / violations), product mix, actionable attention (up to 5), and activity from sample/report timestamps. Frontend [`src/app/lab/dashboard/page.tsx`](src/app/lab/dashboard/page.tsx) shows clickable card grids and empty states. Builder lives in `backend/app/lab_workflow.py` (`build_lab_dashboard`); covered by `backend/test_lab_workflow.py`.
- Forecast & Planning is now on-demand exponential smoothing, not hardcoded series. Uncommitted: `backend/app/forecast/` (DGP, panel loader, SES/Holt/Holt-Winters, `GET /api/admin/forecast`), `backend/data/amu_monthly_panel.csv` (36 months, history only), `backend/test_forecast.py`, `src/components/admin/ForecastTab.tsx`, `src/lib/forecast/parse-slots.ts`, `src/lib/api/dummy/admin-forecast.ts`. Also modified: `backend/app/api/admin.py`, `backend/requirements.txt` (numpy/pandas/statsmodels), admin layout React Query provider, `query-keys.ts`. Do not commit Python `__pycache__` or `pashu-verifier/public/reference/`.
- Farmer Insights charts now use the same Punjab×Dairy AMU panel. `GET /api/farmer/insights?range=30d|60d|90d` runs ES for the demand card (3 history months + 1/2/3 forecast months). Farm Performance / Health & Treatment plot the last 12 history months with display-only festive multipliers (dairy milk peaks at Holi/Diwali; medicine/health follow a poultry-style festive dip) plus a gentle uptrend — panel CSV/DGP unchanged. Frontend passes `range`; Farm Performance uses a dual Y-axis; dual charts show all 12 month ticks. Tests in `backend/test_forecast.py` (`test_farmer_insights_range_changes_forecast`).
- Parked items: `improvements.md`.

**Remotes:**
- `origin` → https://github.com/Ninjabeam20/PashuPramaan-SIH.git (SIH push target)
- `upstream` → https://github.com/sofiaabidi/PashuPramaan.git (original remote)

---

## Branch `feat/stage1-canonical-seed` — Stage 1 of `docs/plan.md`

Two commits, pushed to `origin/feat/stage1-canonical-seed`, **not merged**:
`907a4ed` feat(seed) · `908bfd5` docs. Canonical dummy data + read adapters, **no mutations**
(stages 2–6 still open).

**New — `src/lib/seed/`:** the only place entity rows live.
- `types.ts` canonical entity types · `ids.ts` recurring id constants · `canonical.ts` seed rows with
  `// CONFLICT:` notes for every resolution · `store.ts` module-level state + getters (`resetStore()`)
  · `project.ts` shared badge/label/count projections · `query-keys.ts` the keys pages actually use
  · `seed.test.ts` 15 vitest tests (id uniqueness, referential integrity, adapter smoke tests).

**Rewritten as view adapters (interfaces and return shapes unchanged):** all 17 read modules under
`src/lib/api/dummy/` (`auth.ts` untouched). `AdminShared.tsx` now re-exports `REGION_DATA`,
`DISTRICT_DATA`, `ANOMALY_DATA`, `HEALTH_DATA`, `MONTHLY_*`, `HEALTH_EVENTS` and the `RegionRow` /
`DistrictRow` / `AnomalyRow` / `HealthRow` types from seed — no admin JSX changed.

**Story fixes now visible:** MP-104 is a Buffalo under treatment at Shree Krishna Dairy; home reads
48 = 45 clear + 2 under treatment + 1 waiting and species overview matches; attention names
Oxytetracycline (not "Medicine A"); every treatment detail opens its own animal; `DSP-024` is under
withdrawal and `DSP-023` cleared; `Rx-207` is an unsigned emergency everywhere; the sign flow branches
on `rxId`; vet alerts equal the unsigned-emergency count (1); the lab pipeline is monotonic —
`MLK-2026-00124` is in testing with no results/report row, the CLEARED milk report belongs to
`MLK-2026-00118`, `MEAT-2026-00091` is awaiting receipt only; admin anomaly A002 still joins Meena
Poultry (and A005 now joins Shree Krishna Dairy).

**Tooling:** `npm test` → `vitest run` (`vitest.config.mts`, `@` alias). README tree updated with
`src/lib/seed/`, the lab routes/components and the full dummy module list.

**Verified:** headless-chromium click-through of the Stage 1 verify list — 27/27 checks, no console
errors — plus `npx tsc --noEmit` and `eslint` clean on changed files (AdminShared's 18 pre-existing
lint errors unchanged).

**Known leftovers (page literals, stage 4/6):** `src/app/lab/dispatches/[dispatchId]/page.tsx`
hardcodes "· Holstein Cow", "Clinical Mastitis" and a "Continue Testing →" button for every lot;
`LabDispatchesTable.tsx` hardcodes "of 48 dispatches"; the lab dispatches header stats are literals.

---

### `d342ff0` — Park merge leftovers in improvements.md for later (2026-08-24)

Root `improvements.md`: stop-and-fix rule, file refs for missing enums, MRL false pass, lab VERIFIED on fail, dummy dispatch-detail QR, plus pre-existing leftovers. No product code.

---

## Live App Router endpoints

| Route | Role | Status |
|---|---|---|
| `/` | — | Redirects to `/login` |
| `/login` | All | Farmer → `/farmer/home`, Vet → `/vet/home`, Admin → `/admin/overview`, Lab → `/lab/dashboard` |
| `/farmer/home` | Farmer | Live |
| `/farmer/my-farm` | Farmer | Live |
| `/farmer/treatments` | Farmer | Live |
| `/farmer/dispatch` | Farmer | Live (header Start Dispatch removed; card CTA kept) |
| `/farmer/insights` | Farmer | Live (Add Stock half-width, right-aligned) |
| `/vet/home` | Vet | Live |
| `/vet/prescriptions` | Vet | Live |
| `/vet/prescriptions/[rxId]` | Vet | Live |
| `/vet/prescriptions/[rxId]/sign` | Vet | Live |
| `/vet/prescriptions/[rxId]/countersign` | Vet | Live |
| `/vet/patients` | Vet | Live |
| `/lab/dashboard` | Lab | Live |
| `/lab/dispatches` | Lab | Live |
| `/lab/dispatches/[dispatchId]` | Lab | Live |
| `/lab/testing-queue` | Lab | Live |
| `/lab/testing-workspace/[sampleId]` | Lab | Live |
| `/lab/results` | Lab | Live |
| `/lab/reports` | Lab | Live |
| `/admin` | Admin / Researcher | Live (D3 choropleth; click → district page) |
| `/admin/overview` | Admin | Live |
| `/admin/analytics` | Admin | Live |
| `/admin/anomalies` | Admin | Live |
| `/admin/health` | Admin | Live |
| `/admin/forecast` | Admin | Live (filters call `GET /api/admin/forecast`; SES/Holt/Holt-Winters) |
| `/admin/workspace` | Admin | Live |
| `/admin/states/[slug]` | Admin / Researcher | Live (34 state/UT district maps, dummy headcount) |

Public verifier (separate Next.js app in `pashu-verifier/`; local port 3001). **Live Vercel (this folder only):** `https://pashu-verifier.vercel.app`

| Route | Role | Status |
|---|---|---|
| `/verify/[passportId]` | Public | Reads hosted Supabase `passports`. `status=REVOKED` → Not Verified; `status=VALID` → Verified. Lab writes change the row; no Vercel redeploy. |

---

### `3fb8e46` — Merge qr-fixes into main (2026-08-24)

Local merge only (not pushed). Combined `qr-fixes` (`f4761a9`) into `origin/main` (`d49cb73`). Passport/QR and lab-connection from `qr-fixes`; vet follow-up dashboard from main.

Resolutions: `farmer.py` kept `_ensure_open_lab_sample` plus main’s animal fallback, `mrlVerdict` exceeded check, and `followUpDue`. `lab.py` kept `extract_mrl_from_sample` and Supabase updates, plus main’s CLEARED/BLOCKED gating and live withdrawal dates (`is_verified=mrl_ok`). Dropped duplicate Alembic `e6f261e2386c` in favor of `893a29eb66a3`.

### `fae9403` — Keep lab dispatches newest-first and make Complete Test work from View (2026-08-24)

Lab lists sort newest-first and paginate 15/page. Opening a dispatch or workspace creates the 3-test plan if missing so Complete Test works from Dispatches → View, not only Queue → Receive Sample. Send to Lab keeps the farmer modal open with a 3-second toast.

### `6e7da23` — Fix lab sample insert so Generate Passport can create a new queue row (2026-08-24)

Insert `LabSample` before `FarmerDispatch` to avoid FK order issues. README records live URL `https://pashu-verifier.vercel.app`. Local Postgres `dispatch_status_enum` gained `LAB_PENDING` (already in the SQLAlchemy model) so new lab rows can be stored. `.env` `VERIFY_PUBLIC_BASE_URL` is local-only.

### `66f8918` — Add public passport verifier and one-click Generate Passport lab notify (2026-08-24)

Generate Passport writes an unverified hosted Supabase passport, returns a QR URL, and creates (or reuses) a lab sample. Lab Approve/Release sets `VALID`; Hold stays `REVOKED`. Added sibling `pashu-verifier/` Next.js app. Local Postgres schema unchanged in this commit. Secrets not committed.

---

### `30fa32b` — Initial scaffold: login, farmer home, vet home (2026-08-22)

Bootstrapped Next.js 16 App Router. Added login (`/login` with farmer / vet / admin role select; admin redirect not wired), farmer shell + home, vet shell + home, UI primitives, dummy auth/dashboard APIs, React Query provider, first `docs/api-contract.md`.

### `6abdb46` — Fea: Frontend of all Farmer Pages (2026-08-22)

Shipped remaining farmer routes: my-farm, treatments, dispatch, insights, plus farmer modals/tables/withdrawal UI. Added dummy APIs for animals, treatments, dispatch, insights. Started vet case-detail work. Added extra API contract drafts.

### `2977f47` — Fea: Progress in Vets 1st Page (2026-08-22)

Vet home refinements. Added prescription detail + 4-step sign flow (`/vet/prescriptions/[rxId]`, `/sign`) and sign-flow dummy API.

### `0ad8354` — Fea: Third iteration of Frontend (2026-08-22)

Vet prescriptions registry, new-prescription modal, countersign route and flow, shared PIN/signature capture, vet dashboard widgets. Farmer health-event and health-history modals.

### `baa5f02` — Fea: Farmer & Vet Possible Finalization (2026-08-22)

Farmer insights rewrite (forecast chart, medicine stock, heatmap). Vet patients directory + patient detail + follow-up modal. Extended API contract (`docs/api-contract (3).md`).

### `112f8ec` — Fea: Admin researcher dashboard with D3 India map (2026-08-22)

Ported the researcher UI to `/admin`. Login admin role and `/` now route correctly. Replaced boxy SVG states with D3 + simplified India GeoJSON choropleth (dummy AMU/demand colors). Added `IndiaChoroplethMap`, `india-geo.ts`, `india-states.json`. README clone URL set to `Ninjabeam20/PashuPramaan-SIH`; directory tree includes admin/data. Kept Vite source under `Create Dashboard Page/` (excluded from `tsconfig`). Ignored `.playwright-mcp/` and root `admin-*.png`.

### `d859918` — Record 112f8ec in MEMORY after the admin dashboard commit (2026-08-22)

Moved the admin working-tree notes into commit history and pointed remotes at the SIH `origin`.

### `d0616b4` — Keep MEMORY HEAD and remotes in sync with d859918 (2026-08-22)

MEMORY-only: pointed **HEAD** at `d859918` after that docs commit. No product files.

### `6cead1e` — map changes made to india map (2026-08-23)

Admin choropleth uses the pre-2019 unified Jammu & Kashmir outline (J&K + Ladakh dissolved, official northern claim through Aksai Chin) plus official Arunachal Pradesh. Heatmap colors and dummy AMU/demand data unchanged. Farmer dispatch: header Start Dispatch removed (card CTA kept). Insights: Add Stock half-width and right-aligned. Pushed to `origin/backend`.

### `f3effda` — major frontend remodelling , backend integration , map naming and changes, individual states and districts added-ug (2026-08-23)

National choropleth labels every mainland state/UT. Clicking a state opens `/admin/states/[slug]` (34 district pages) with dummy livestock tables and district GeoJSON. Spec docs under `cursor changes/`. Pushed to `origin/backend`. Fast-forward merged into `main` and pushed `origin/main`.

### `b509fed` — docs: add four-role canonical dummy-data plan (2026-08-23)

Added `docs/plan.md` (audit + staged canonical dummy store for farmer, vet, lab, admin). Pointer at `docs/superpowers/plans/2026-08-23-canonical-dummy-data.md`. No product code.

---

## How to update this file

1. After any code or docs change, add a row under **Current tree** (or a new commit section if the user asked to commit).
2. If a route is added or wired, update **Live App Router endpoints**.
3. After a commit, move the working-tree row into a new **Commit history** section using `git log -1 --format='%h %s'` and `git show --stat`.
4. Bump **Last updated** and **HEAD**.
