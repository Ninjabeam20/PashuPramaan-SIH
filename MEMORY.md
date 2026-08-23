# PashuPramaan — Repository Memory

Living record of repo state and what each commit changed. **Update this file in the same session whenever code or docs change.** Do not invent commits; only record what `git log` and the working tree actually show.

**Last updated:** 2026-08-23 (plan: 4-role canonical dummy data)  
**Branch:** `main`  
**HEAD:** `3f8f95e` — Fea: Added proper logo  
**Note:** Uncommitted navbar height and type alignment across farmer, vet, and admin shells.

**Remotes:**
- `origin` → https://github.com/Ninjabeam20/PashuPramaan-SIH.git (SIH push target)
- `upstream` → https://github.com/sofiaabidi/PashuPramaan.git (original remote)

---

## Current tree (unstaged on `main`)

- Added `docs/plan.md` — 4-role dummy-data audit (farmer, vet, lab, admin), conflict resolutions, and staged execution (Stage 1 first, then 2–6). Pointer: `docs/superpowers/plans/2026-08-23-canonical-dummy-data.md`. Implementation not started.
- Admin sticky nav height `52` → `64` in `src/app/admin/layout.tsx` and unused `NavBar` in `src/components/admin/AdminShared.tsx` so it matches farmer/vet `h-16`.
- Vet header now uses `h-16` / `h-full` like farmer (`src/app/vet/layout.tsx`).
- Navbar type unified to farmer: links `14px` / weight `500`, logo `40px`, EN `12px` / `600`, avatar `32px` / `14px` (vet + admin layouts; AdminShared `NavBar`).
- Also modified: `package-lock.json` (unrelated to this change).

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
| `/admin/forecast` | Admin | Live |
| `/admin/workspace` | Admin | Live |
| `/admin/states/[slug]` | Admin / Researcher | Live (34 state/UT district maps, dummy headcount) |

---

## Commit history (oldest → newest)

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

---

## How to update this file

1. After any code or docs change, add a row under **Current tree** (or a new commit section if the user asked to commit).
2. If a route is added or wired, update **Live App Router endpoints**.
3. After a commit, move the working-tree row into a new **Commit history** section using `git log -1 --format='%h %s'` and `git show --stat`.
4. Bump **Last updated** and **HEAD**.
