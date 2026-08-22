# Cursor_changes 6 — Admin seed + contradiction fixes

## Admin national data (copy from `src/app/admin/page.tsx`, then one rename)

Keep magnitudes. These are researcher-scale, **not** a sum of 3 farms.

### RegionStat — copy `REGION_DATA` verbatim

UP 94200, RJ 87670, MH 69420, KA 73380, GJ 65960, MP 71200, TN 61200, WB 58900, AP 54300, BR 52100, HR 48700, OD 39400, TG 43800, PB 51340, CG 36200, JH 29800, HP 18200, UT 21400, JK 15600, NE 24700, KL 34200, GA 4800.  
Fields: id, state, zone, amu, change, anomalies, unexplained.

Also store demand fields from `DEMAND_LEVEL` on the same row (UP High/High/21/High need, … GA Low/Low/1/Stable, DL Medium/Low/10/Monitor).

### DistrictStat — copy `DISTRICT_DATA`

GJ: Kachchh, Ahmedabad, Rajkot, Surat, Vadodara, Bhavnagar, Jamnagar, Junagadh.  
MH: Pune, Nashik, Nagpur, Aurangabad, Amravati, Solapur, Kolhapur.  
UP: Lucknow, Agra, Kanpur, Varanasi, Meerut, Bareilly, Allahabad, Gorakhpur.  
RJ: Jaipur, Jodhpur, Bikaner, Udaipur, Kota, Ajmer.

### Anomaly — copy `ANOMALY_DATA` with **one** farm rename

| id | farm (seed) | change vs dummy |
|---|---|---|
| A001 | Farm 247 | unchanged |
| **A002** | **Meena Poultry** | unchanged — must stay Punjab / Oxytetracycline / Gumboro (IBD) / EXPLAINED / 22 Aug 2026 / history `[96,100,98,102,97,99,101,98,100,108,154,148]` |
| A003 | Farm 18 | unchanged |
| A004 | Farm 91 | unchanged |
| **A005** | **Shree Krishna Dairy** | dummy said `Krishna Dairy` — rename only. Keep Haryana / Amoxicillin / Mastitis / EXPLAINED / LOW / 19 Aug 2026 / history `[99,101,100,98,102,100,99,101,98,105,138,132]` |
| A006–A012 | as in page.tsx | A007 **Shanti Farms** stays (different from Shanti Dairy) |

### HealthAmU — copy `HEALTH_DATA` verbatim

Gumboro (IBD) Poultry 54 / 21 Explained; Mastitis Dairy 31 / 14 Explained; etc.

### MonthlyAmU

Labels Jan–Aug; values `[112, 108, 115, 110, 114, 118, 156, 182]`.

### TimelineCallout

- month 5, `Gumboro outbreak · Punjab`, `#F97316` (tied to Meena Poultry / A002)
- month 6, `Mastitis cluster · MH`, `#EF4444`

### ForecastSeries + FORECAST_SUMMARY

Oxytetracycline `#D4724A` hist `[82,85,88,84,87,90,112,118]` fore `[128,134,142,148]` need High change 23 rec Stock up `#B91C1C` `#FEE2E2`.  
Amoxicillin `#2D6A4F` hist `[60,62,58,64,61,63,65,64]` fore `[63,64,66,65]` need Medium change 0.  
Enrofloxacin `#6B7280` hist `[40,38,42,36,39,37,35,34]` fore `[32,30,29,28]` need Low change -12.

### RegionalPlanning — copy `REGIONAL_PLANNING` (MH, RJ, UP, BR, HR, GJ, MP, TN, WB, AP, KA, OD)

### SavedInsight — copy `SAVED_INSIGHTS_INIT` I001–I003

### ResearchNote — copy `NOTES_INIT` N001–N002, author Dr. Mehta

## Contradiction register (dummy today → seed)

| Location | Wrong today | Canonical seed |
|---|---|---|
| `animal-detail.ts` MP-104 type | Buffalo | Cow (Gir is cattle) |
| `treatments.ts` trt-1 species | Buffalo | Cow |
| `treatments.ts` trt-3 MP-106 species | Goat | Buffalo |
| `treatments.ts` trt-5 MP-108 species | Cow | Goat |
| `treatments.ts` trt-2 | Flock P-01 on farmer list | Remove; Flock P-01 is Meena only |
| `farm-detail.ts` MP-106 status | healthy | under_treatment (active Amoxicillin) |
| `vet-patients.ts` MP-104 farm | Shanti Dairy | Shree Krishna Dairy |
| `vet-patients.ts` Flock P-01 status | Recovered | Under Treatment (unsigned emergency) |
| `vet-prescriptions.ts` Rx-207 | COUNTERSIGNED, unsigned_emergency_count 0 | UNSIGNED EMERGENCY, count 1 |
| `vet-prescriptions.ts` Rx-208 farm/drug | Shanti / Amoxicillin SIGN-REQ | Shree Krishna / Oxytetracycline signed |
| `vet-dashboard.ts` attn-1 title | Shanti Dairy · MP-104 | Shree Krishna Dairy · MP-104 (and attn type follows Rx-208 signed → move SIGN-REQ attn to Rx-205 / MP-118) |
| `vet-dashboard.ts` alerts / titles | Krishna Dairy | Shree Krishna Dairy |
| `vet-sign-flow.ts` getPrescriptionForSigning | same MP-118 payload for every rxId | per-row from Prescription |
| `vet-case-detail.ts` default | always RX-205 | lookup by caseId / rxId / attn id / animal id |
| `dispatch.ts` DSP-024 | Milk MP-104 cleared | Milk **MP-105** cleared (104 still in withdrawal) |
| `dispatch.ts` DSP-023 | MP-108 withdrawal, treatment_id trt-2 | MP-104 withdrawal, treatment_id **trt-1** |
| `farm-insights.ts` health map poultry | Flock P-01 on Ankita farm | drop poultry row |
| `admin/page.tsx` A005 farm | Krishna Dairy | Shree Krishna Dairy |
| `NewPrescriptionModal.tsx` option | Krishna Dairy | Shree Krishna Dairy |
| `PatientDetailModal.tsx` | hardcoded Cow · Shanti Dairy | bind to fetched patient |

## Vet dashboard computed fields (after seed)

workload:

- awaiting_signature = count RxStatus sign_req = 2
- unsigned_emergency = 1
- follow_up = count FollowUp-due patients (use 3 if three patients have follow_up_due flag; seed Flock P-01, MP-118, MP-088 as due if needed to keep the widget at 3)
- stewardship_review = count cia\|\|aware WATCH among open Rx = Rx-205 + Rx-183 (voided still reviewable) = 2
- status = `action_needed` if any of the above > 0

alerts: unsigned_emergency prescriptions only, plus extra unsigned if any. Seed at least:

1. Meena Poultry · Flock P-01 · Oxytetracycline · 09:18
2. Do not attach MP-105 Shanti Amoxicillin alert (MP-105 is Krishna healthy). Second/third alerts: only if those animals truly have unsigned emergency Rx. Prefer **only real unsigned emergencies** (just Rx-207) even if the dummy showed 3 fake alerts. Dummy extra alerts (MP-105, MP-118 as unsigned_emergency) **contradict** Rx statuses — drop them.

attention_items: one row per sign_req + unsigned_emergency + stewardship open:

- attn Rx-205 Shree Krishna Dairy · MP-118 SIGN-REQ WATCH CIA
- attn Rx-207 Meena Poultry · Flock P-01 UNSIGNED EMERGENCY
- attn Rx-209 Shree Krishna Dairy · MP-109 SIGN-REQ
- stewardship row for MP-118 CIA (may share Rx-205)

prescriptions widget on vet home: latest 4 from the prescriptions table.

## Vet patients computed

Items (6):

| id | type | farm | status text | last_follow_up |
|---|---|---|---|---|
| MP-104 | Cow | Shree Krishna Dairy | Under Treatment | 22 Aug |
| MP-118 | Cow | Shree Krishna Dairy | Needs Attention (unsigned Rx) | 20 Aug |
| Flock P-01 | Flock (Broiler) | Meena Poultry | Under Treatment | 21 Aug |
| MP-112 | Buffalo | Shree Krishna Dairy | Improved | 17 Aug |
| MP-097 | Cow | Shanti Dairy | Recovered | 16 Aug |
| MP-088 | Buffalo | Shree Krishna Dairy | No Change | 14 Aug |

Summary = counts of those 6, not hardcoded.
