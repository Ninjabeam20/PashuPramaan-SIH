# Cursor_changes 4 — Seed: users, farms, animals

Source files: `farmer-dashboard.ts`, `farm-detail.ts`, `animal-detail.ts`, `vet-patients.ts`, `vet-dashboard.ts`, `vet-prescriptions.ts`.  
Unification rules: `Cursor_changes 6.MD`.

## Users (`User`)

| id | name | role | userId | farmId |
|---|---|---|---|---|
| `user-ankita` | Ankita | farmer | `ankita` | `farm-krishna` |
| `user-bankey` | Dr. Bankey | vet | `bankey` | null |
| `user-admin` | Dr. Mehta | admin | `admin` | null |

Login page does not validate these. They exist so rows have owners.

## Farms (`Farm`)

| id | name (canonical) | region | zone | status | species |
|---|---|---|---|---|---|
| `farm-krishna` | **Shree Krishna Dairy** | Haryana | North | GOOD | Dairy |
| `farm-shanti` | Shanti Dairy | Karnataka* | South | GOOD | Dairy |
| `farm-meena` | Meena Poultry | Punjab | North | GOOD | Poultry |

\*Vet dummy never gave Shanti Dairy a state. Admin `A007` is a different entity **Shanti Farms** (poultry, Karnataka). Keep both names. Shanti Dairy stays dairy for vet caseload.

Never store the string `Krishna Dairy`. Every API response uses `Shree Krishna Dairy`.

## Shree Krishna Dairy — 48 animals (lock)

Dashboard lock (`farmer-dashboard.ts` + `farm-detail.ts`):

- `animal_count` / `total_animals` = **48**
- cows **10** · buffaloes **20** · goats **18**
- `under_treatment_count` = **3**
- `waiting_count` = **2**
- `clear_count` = **43** (48 − 3 − 2)

Species overview lock:

| species | count | healthy | under_treatment | waiting |
|---|---|---|---|---|
| Cows | 10 | 8 | 1 | 1 |
| Buffaloes | 20 | 18 | 1 | 1 |
| Goats | 18 | 17 | 1 | 0 |

### Named / story animals (must match prescriptions & treatments)

| id | type | status | breed | notes |
|---|---|---|---|---|
| **MP-104** | Cow | `under_treatment` | Gir | Female, DOB `12 Mar 2021`, Dairy, registered `01 Jan 2022`. Oxytetracycline withdrawal. **Not Buffalo. Not Shanti Dairy.** |
| MP-105 | Cow | healthy | Sahiwal | Listed on my-farm today |
| MP-110 | Cow | healthy | Gir | Listed on my-farm today |
| **MP-118** | Cow | `waiting` | Sahiwal | Rx-205 Enrofloxacin SIGN-REQ (CIA/WATCH) |
| MP-120 | Cow | healthy | — | filler |
| MP-121 | Cow | healthy | — | filler |
| MP-122 | Cow | healthy | — | filler |
| MP-123 | Cow | healthy | — | filler |
| MP-124 | Cow | healthy | — | filler |
| MP-125 | Cow | healthy | — | filler |
| **MP-106** | Buffalo | `under_treatment` | Murrah | Amoxicillin Active, vet signed. Dummy farm-detail listed this as healthy — **wrong**; active tx ⇒ under_treatment |
| MP-107 | Buffalo | healthy | Murrah | |
| **MP-109** | Buffalo | `waiting` | Murrah | Vitamin B12 unsigned (pending vet) |
| **MP-112** | Buffalo | healthy | Murrah | Vet patient “Improved”; farmer view clear. Rx-198 signed Mastitis |
| **MP-088** | Buffalo | healthy | Murrah | Rx-183 VOIDED. Vet patient “No Change” |
| MP-126 … MP-140 | Buffalo | healthy | Murrah | 15 fillers so buffaloes = 20 (named buffaloes = 5: 106,107,109,112,088) |

Buffalo named = 5; need 15 healthy fillers **MP-126–MP-140** → 20 total. UT=1 (106), waiting=1 (109), healthy=18.

| id | type | status | notes |
|---|---|---|---|
| **MP-108** | Goat | healthy | Completed Ivermectin; dummy treatments called this a Cow — **wrong** |
| MP-111 | Goat | healthy | Listed on my-farm |
| **MP-141** | Goat | `under_treatment` | Needed so goats UT = 1 (the original 8-row table had zero goat UT vs overview “1”) |
| MP-142 … MP-156 | Goat | healthy | 15 fillers + MP-108 + MP-111 = 17 healthy, plus MP-141 UT = 18 |

Default filler fields: Female, Dairy, DOB `01 Jan 2020`, registered `15 Jun 2021`, breed `Unknown` for cows / `Murrah` buffalo / `Jamunapari` goat.

## Shanti Dairy animals (vet caseload)

| id | type | status | notes |
|---|---|---|---|
| MP-101 | Cow | healthy | Rx-201 SIGNED Clinical mastitis (recovered) |
| MP-097 | Cow | healthy | Rx-189 SIGNED Foot rot; vet patient Recovered |
| MP-157 | Cow | healthy | spare so farm is non-empty beyond two IDs |

## Meena Poultry animals

| id | typeLabel | status | notes |
|---|---|---|---|
| **Flock P-01** | Flock (Broiler) | `under_treatment` | Rx-207 unsigned emergency, Gumboro, Oxytetracycline. Dummy patients said Recovered + dummy prescriptions said COUNTERSIGNED — **both wrong** |
| Flock P-02 | Flock (Broiler) | healthy | Rx-194 SIGNED Colibacillosis |
| Flock-07 | Flock (Broiler) | `under_treatment` | DSP-022 meat blocked (MRL). Lives on Meena, **not** on Ankita’s farmer dispatch list |

## Farmer my-farm table

`GET /api/farmer/farm` `animals[]` returns **all 48** Krishna IDs (counts must match). Featured IDs stay first in seed order: MP-104, 105, 106, 107, 108, 109, 110, 111, then 118, 112, 088, then fillers.

## Animal detail lock (MP-104)

`GET /api/farmer/animals/MP-104` must return:

```
type: "Cow"
status: "under_treatment"
breed: "Gir"
sex: "Female"
date_of_birth: "12 Mar 2021"
production_type: "Dairy"
registered_on: "01 Jan 2022"
current_treatment.drug: "Oxytetracycline"
current_treatment.route: "Injection"
current_treatment.dosage: "10 mg/kg"
current_treatment.administered_at: "Administered Today, 08:15 AM"
current_treatment.signed_badge: { text: "Vet Signed", variant: "vet_signed" }
current_treatment.withdrawal: { dose_time: "Dose", now_pct: 30, clear_label: "Clear", product_message: "Milk clears tomorrow, 10:30 AM" }
```
