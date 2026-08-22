# Cursor_changes 3 — Prisma schema (`server/prisma/schema.prisma`)

Datasource: `postgresql` via `env("DATABASE_URL")`. Generator: `prisma-client-js`. Seed command: `tsx prisma/seed.ts`.

IDs that the UI already shows (`MP-104`, `Rx-208`, `DSP-024`, `A002`) are stored as the primary `id` string, not UUIDs.

## Enums

```
Role            farmer | vet | admin
AnimalStatus    healthy | under_treatment | waiting
AnimalType      Cow | Buffalo | Goat | Flock
RxStatus        sign_req | unsigned_emergency | signed | countersigned | voided
TreatmentStatus Active | Withdrawal | Unsigned | Completed
DispatchStatus  cleared | withdrawal | blocked
AwareLevel      ACCESS | WATCH | RESERVE | none
```

## Models (fields)

### User
`id` String PK · `name` String · `role` Role · `userId` String unique (login field, e.g. `ankita`) · `farmId` String? FK Farm · `locale` String default `en`

Seed rows: `user-ankita`, `user-bankey`, `user-admin`.

### Farm
`id` String PK · `name` String unique · `region` String · `zone` String · `status` String (farmer UI uses `GOOD`) · `species` String (`Dairy` | `Poultry`)

Seed PKs: `farm-krishna`, `farm-shanti`, `farm-meena`.

### Animal
`id` String PK (`MP-104`, `Flock P-01`) · `farmId` FK · `type` AnimalType · `typeLabel` String (UI: `Cow` / `Buffalo` / `Goat` / `Flock (Broiler)`) · `status` AnimalStatus · `breed` String · `sex` String · `dateOfBirth` String (display, e.g. `12 Mar 2021`) · `productionType` String · `registeredOn` String · `feedBatch` String?

### Medicine
`id` String PK · `name` String unique  
Seed: `Oxytetracycline`, `Ivermectin`, `Vitamin B Complex`, `Amoxicillin`, `Enrofloxacin`, `Vitamin B12`, `Penicillin`.

### MedicineStock
`id` String PK · `farmId` FK · `medicineId` FK · `quantity` Int · `unit` String (`vials` | `doses`) · `recentUsage` Int · `statusText` String · `statusVariant` String (`red` | `green` | `amber`)

### Prescription
`id` String PK (`Rx-208`) · `farmId` FK · `animalId` FK · `vetId` FK User · `diagnosis` String · `status` RxStatus · `drug` String · `route` String · `dose` String · `frequency` String · `duration` String · `reason` String · `aware` AwareLevel · `cia` Boolean · `isEmergency` Boolean · `dateLabel` String · `administeredAt` String · `signedBy` String? · `signedAt` String? · `signatureRef` String? · `countersignedBy` String? · `countersignedAt` String? · `countersignRef` String? · `stewardshipGuidance` String[] · `requiresStewardshipNotice` Boolean

### Treatment
`id` String PK (`trt-1`) · `farmId` FK · `animalId` FK · `prescriptionId` String? FK · `drugName` String · `route` String · `dose` String · `routeDosage` String (pre-joined UI string) · `administeredTime` String · `status` TreatmentStatus · `reason` String · `feedBatch` String? · `labMrlOk` Boolean · `withdrawalNowPct` Int? · `withdrawalMessage` String? · `badges` Json (array of `{ text, variant }`) · `timeline` Json (array of `{ label, status }`)

### Dispatch
`id` String PK (`DSP-024`) · `farmId` FK · `animalId` FK · `product` String · `dateLabel` String · `status` DispatchStatus · `timeline` Json · `clearedChecklist` Json? · `withdrawalClearsLabel` String? · `withdrawalTreatmentId` String? · `blockedGates` Json? · `blockedWarnings` Json? · `labResultPpm` String? · `permittedPpm` String?

### HealthEvent
`id` String PK · `farmId` FK · `animalId` FK? · `name` String · `onset` String · `notes` String?

### FollowUp
`id` String PK · `animalId` FK · `vetId` FK · `dateLabel` String · `outcome` String · `notes` String?

### Activity
`id` String PK · `farmId` String? · `vetId` String? · `icon` String · `title` String · `subject` String · `timeLabel` String · `description` String?

### RegionStat
`id` String PK (`UP`, `RJ`, …) · `state` String · `zone` String · `amu` Int · `change` Int · `anomalies` Int · `unexplained` Int · `demand` String · `currentAmuLevel` String · `demandChange` Int · `signal` String

### DistrictStat
`id` String PK · `regionId` FK RegionStat · `district` String · `amu` Int · `change` Int · `anomalies` Int · `unexplained` Int

### Anomaly
`id` String PK (`A001`) · `farmName` String · `region` String · `medicine` String · `amuChange` Int · `baseline` Int · `healthEvent` String? · `status` String · `severity` String · `species` String · `date` String · `history` Int[]

### HealthAmU
`id` String PK · `event` String · `species` String · `amuChange` Int · `farmsAffected` Int · `classification` String

### MonthlyAmU
`id` Int PK · `monthIndex` Int (0–7) · `label` String · `value` Int

### TimelineCallout
`id` String PK · `month` Int · `label` String · `color` String  
Seed: month 5 `Gumboro outbreak · Punjab`; month 6 `Mastitis cluster · MH`.

### ForecastSeries
`id` String PK · `medicine` String · `color` String · `hist` Int[] · `fore` Int[] · `need` String · `change` Int · `rec` String · `recColor` String · `recBg` String

### RegionalPlanning
`id` String PK (`MH`) · `state` String · `predDemand` String · `currentAmu` String · `change` Int · `signal` String

### SavedInsight
`id` String PK (`I001`) · `title` String · `summary` String · `tags` String[] · `date` String · `linkedTo` String · `linkedAnomalyId` String?

### ResearchNote
`id` String PK (`N001`) · `observation` String · `hypothesis` String · `evidence` String[] · `nextInvestigation` String · `associatedWith` Json · `date` String · `author` String

### InsightChart (farmer insights non-stock series)
`id` String PK · `kind` String (`forecast_30d` | `forecast_60d` | `forecast_90d` | `farm_performance` | `health_trends`) · `payload` Json

Farmer insights stock is **not** duplicated here; it is assembled from `MedicineStock` on GET.
