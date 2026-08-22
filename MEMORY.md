# PashuPramaan — Repository Memory

Living record of repo state and what each commit changed. **Update this file in the same session whenever code or docs change.** Do not invent commits; only record what `git log` and the working tree actually show.

**Last updated:** 2026-08-22  
**Branch:** `main`  
**HEAD:** `baa5f02` — Fea: Farmer & Vet Possible Finalization (pre-admin commit)

**Remotes:**
- `origin` → https://github.com/Ninjabeam20/PashuPramaan-SIH.git (empty private SIH repo; first push target)
- `upstream` → https://github.com/sofiaabidi/PashuPramaan.git (original remote)

---

## Current tree (staging for SIH push)

| Path | Change |
|---|---|
| `src/app/admin/page.tsx` | Researcher/Admin dashboard at `/admin`. D3 GeoJSON choropleth; dummy AMU / demand colors (green → yellow → orange → red). |
| `src/components/admin/IndiaChoroplethMap.tsx` | **New.** D3 Mercator + `geoPath` map used by Overview, Analytics, Forecast. Client-only mount to avoid hydration mismatch. |
| `src/lib/admin/india-geo.ts` | **New.** GeoJSON state name → dummy region id (`NE` covers NE states). |
| `src/data/india-states.json` | **New.** Simplified India states GeoJSON (islands dropped so the mainland fills the frame). |
| `src/app/globals.css` | Additive scrollbar styles from the Vite `index.css`. |
| `tsconfig.json` | Excludes `Create Dashboard Page/` (scratch Vite source). |
| `src/app/(auth)/login/page.tsx` | Admin role `router.push("/admin")`. |
| `src/app/page.tsx` | `/` redirects to `/login`. |
| `README.md` | Portal access table, admin routes, D3 note, backend direction, clone URL set to SIH repo, directory tree includes admin/data. |
| `Create Dashboard Page/` | Untracked Vite source used for the admin port. Do not compile. |
| `package.json` / `package-lock.json` | Added `d3` and `@types/d3`. |
| `.gitignore` | Ignores `.playwright-mcp/` and root `admin-*.png` screenshots. |
| `.cursor/rules/repo-memory.mdc` | Keep this file current. |

**Not committed (local only):** `.playwright-mcp/`, root `admin-*.png` verification screenshots.

Verification (2026-08-22): `npm run build` exit 0 after D3 map. Overview choropleth labels sit on state centroids (RJ/UP/MH/…). No hydration errors after client-only mount. Farmer `/farmer/home` and vet `/vet/home` still render. App routes on disk match the table below.

---

## Live App Router endpoints

| Route | Role | Status |
|---|---|---|
| `/` | — | Redirects to `/login` |
| `/login` | All | Farmer → `/farmer/home`, Vet → `/vet/home`, Admin → `/admin` |
| `/farmer/home` | Farmer | Live |
| `/farmer/my-farm` | Farmer | Live |
| `/farmer/treatments` | Farmer | Live |
| `/farmer/dispatch` | Farmer | Live |
| `/farmer/insights` | Farmer | Live |
| `/vet/home` | Vet | Live |
| `/vet/prescriptions` | Vet | Live |
| `/vet/prescriptions/[rxId]` | Vet | Live |
| `/vet/prescriptions/[rxId]/sign` | Vet | Live |
| `/vet/prescriptions/[rxId]/countersign` | Vet | Live |
| `/vet/patients` | Vet | Live |
| `/admin` | Admin / Researcher | Live (single client page, tabbed) |

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

---

## How to update this file

1. After any code or docs change, add a row under **Current tree** (or a new commit section if the user asked to commit).
2. If a route is added or wired, update **Live App Router endpoints**.
3. After a commit, move the working-tree row into a new **Commit history** section using `git log -1 --format='%h %s'` and `git show --stat`.
4. Bump **Last updated** and **HEAD**.
