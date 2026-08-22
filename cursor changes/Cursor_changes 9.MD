# Cursor_changes 9 — Frontend wiring (no visual redesign)

## `src/lib/api/client.ts`

```
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || res.statusText);
  }
  return res.json();
}
```

Paths are absolute from site root: `"/api/farmer/dashboard"`.

## Dummy files become one-liners (keep types)

Example `getFarmDetail`:

```
export const getFarmDetail = async (): Promise<FarmDetail> =>
  apiGet<FarmDetail>("/api/farmer/farm");
```

`loginUser` stays:

```
export const loginUser = async (role: string, userId: string, _password: string) => {
  return { role, userId, name: "Dummy User" };
};
```

Optional: also `apiPost("/api/auth/login", { role, userId, password })` but ignore failure; UI routing still uses selected `role`.

## Admin page extract (`src/app/admin/page.tsx`)

Today ~2000 lines with module-level constants. Required mechanical change:

1. Cut types `RegionRow`, `DistrictRow`, `AnomalyRow`, `HealthRow`, `SavedInsight`, `ResearchNote` into `src/lib/api/dummy/admin.ts` and re-export.
2. Cut data constants into Express seed (already listed in `Cursor_changes 6.MD`).
3. Add `function AdminApp()` (or keep default export) that:

```
const overview = useQuery({ queryKey: ["admin-overview"], queryFn: getAdminOverview });
const anomalies = useQuery({ queryKey: ["admin-anomalies"], queryFn: getAdminAnomalies });
…
if (!overview.data) return loading pulse (same style as farmer home loading);
return <AdminLoaded data={...} />;
```

4. Pass `REGION_DATA` etc. as **props** into existing `OverviewTab`, `ForecastTab`, `WorkspaceTab`, `DemandMap` (they currently close over module constants). Markup/styles inside those functions stay.
5. `amuById`, `INDIA_STATES_LIST`, `demandFill` stay helper functions; they take `regions` / `demandLevel` as arguments instead of closure.
6. `SAVED_INSIGHTS_INIT` / `NOTES_INIT` initial useState replaced by query data.
7. Do not change NavBar, Card, maps, table CSS.

## Hardcoded dummy labels to bind

| file | today | bind to |
|---|---|---|
| `src/components/vet/PatientDetailModal.tsx` | `Cow · Shanti Dairy` | `${patient.type} · ${patient.farm}` from `getVetPatients` item / a `GET /api/vet/patients/:id` if added. If no detail endpoint, pass the `PatientItem` from the table click. |
| `src/components/vet/RecordFollowUpModal.tsx` | same subtitle | props `type`, `farm` |
| `src/components/vet/NewPrescriptionModal.tsx` | options Shanti / Krishna / Meena | `farms.map(f => <option value={f.name}>{f.name}</option>)` including **Shree Krishna Dairy** |
| `src/components/farmer/StartDispatchModal.tsx` | `Shree Krishna Dairy` | `farmData.farm.name` from `getFarmDetail` (already fetched on dispatch page — pass as prop) |
| `src/components/farmer/RecordHealthEventModal.tsx` | hardcoded `<option>MP-104</option>` | options from `getFarmDetail().animals` |

Do not restyle those controls. Only the string source changes.

## `next.config.ts`

```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
```

Per `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/rewrites.md`.

## Root `package.json` scripts (exact)

```
"dev": "next dev",
"dev:server": "npm run dev --prefix server",
"dev:all": "concurrently -n next,api -c cyan,magenta \"npm run dev\" \"npm run dev:server\"",
"db:up": "docker compose up -d",
"db:migrate": "npm run prisma:migrate --prefix server",
"db:seed": "npm run prisma:seed --prefix server",
"db:check": "npm run check --prefix server"
```

## `server/package.json` scripts (exact)

```
"dev": "tsx watch src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"prisma:migrate": "prisma migrate dev --name init",
"prisma:seed": "tsx prisma/seed.ts",
"check": "tsx scripts/consistency-check.ts"
```

Dependencies: `express`, `@prisma/client`, `dotenv`.  
Dev: `typescript`, `tsx`, `prisma`, `@types/express`, `@types/node`.

## `docker-compose.yml`

```
services:
  postgres:
    image: postgres:16
    container_name: pashupramaan-pg
    environment:
      POSTGRES_USER: pashupramaan
      POSTGRES_PASSWORD: pashupramaan
      POSTGRES_DB: pashupramaan
    ports:
      - "5432:5432"
    volumes:
      - pashupramaan_pg:/var/lib/postgresql/data
volumes:
  pashupramaan_pg:
```

## `.env.example`

```
DATABASE_URL=postgresql://pashupramaan:pashupramaan@localhost:5432/pashupramaan
PORT=4000
```
