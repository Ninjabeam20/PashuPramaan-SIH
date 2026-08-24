# 🌾 PashuPramaan (पशु प्रमाण)

> **Intelligent Livestock Health Management, Antimicrobial Stewardship (AMR/AWaRe), and Food Safety Provenance Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?style=flat-square&logo=react-query)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/License-Proprietary-green?style=flat-square)](#)

---

## 📖 Table of Contents

- [Executive Overview](#-executive-overview)
- [Key Pillars & Core Capabilities](#-key-pillars--core-capabilities)
- [User Roles & Key Workflows](#-user-roles--key-workflows)
  - [1. Farmer Portal](#1-farmer-portal)
  - [2. Veterinarian Portal](#2-veterinarian-portal)
  - [3. Researcher / Admin Portal](#3-researcher--admin-portal)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [API Contract & Data Architecture](#-api-contract--data-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Local Run](#installation--local-run)
  - [How to access the portals](#how-to-access-the-portals)
  - [Available Scripts](#available-scripts)
- [Design System & Theme Tokens](#-design-system--theme-tokens)
- [Core Safety & Stewardship Principles](#-core-safety--stewardship-principles)
- [Roadmap](#-roadmap)

---

## 🌟 Executive Overview:

**PashuPramaan (पशु प्रमाण)** is a next-generation livestock lifecycle, clinical health, and food supply chain verification platform. It solves the critical intersection between **livestock healthcare**, **antimicrobial resistance (AMR)** containment, and **consumer food safety**.

In dairy and livestock production, inadvertent antibiotic residues in milk, meat, and eggs pose severe human health hazards and fuel global AMR. PashuPramaan bridges dairy and livestock farmers, certified veterinary practitioners, testing laboratories, and regulatory authorities onto a unified, verifiable digital trail:

1. **Automated Withdrawal Period Tracking**: Dynamically calculates and counts down drug clearance timelines based on species, drug class, dosage, and route.
2. **Hard-Gated Food Safety Dispatch**: Enforces a strict *fail-closed* safety check preventing contaminated animal produce from dispatch or sale.
3. **PashuPramaan Food Safety Passport**: Generates tamper-evident, QR-verifiable clearance credentials for every milk/meat shipment.
4. **WHO AWaRe & CIA Antimicrobial Stewardship**: Integrates WHO AWaRe classification (Access, Watch, Reserve) and Critically Important Antimicrobial (CIA) oversight into veterinary prescription and signing ceremonies.
5. **Prophet-Powered Predictive Insights**: AI-assisted disease trend monitoring and medicine inventory forecasting at both farm and regional levels.

---

## 🛡️ Key Pillars & Core Capabilities

```mermaid
graph TD
    A[Livestock Health Record] -->|Prescription / Treatment| B(Withdrawal Clock & MRL Calculation)
    B --> C{Dispatch Safety Gate}
    C -->|Withdrawal Active / MRL Exceeded| D[❌ Dispatch Blocked - Fails Closed]
    C -->|Withdrawal Cleared & MRL Valid| E[✅ Passport Generated with QR Verification]
    
    V[Veterinarian] -->|AWaRe / CIA Warning Review| F[Digital Signing Ceremony]
    F -->|PIN + Canvas Signature| A
    
    A --> G[Prophet Demand & Epidemic Forecasting]
    G --> H[Farmer & Regional Insights]
```

### 1. ⏱️ Active Withdrawal Period Clocks
- Computes species- and product-specific clearance timelines (e.g., milk vs. meat vs. eggs).
- Visual status ribbons and live countdowns indicate active drug elimination and clear dates.
- Emergency backdating support (capped at 72 hours) for immediate field treatments.

### 2. 🚦 Hard-Gated Dispatch & Provenance Passports
- Real-time safety validation checks (Withdrawal status, Lab MRL assay results, Vet prescription status).
- Single-click generation of the **PashuPramaan Passport** featuring verifiable QR codes and provenance details.

### 3. ✍️ Digital Veterinary Signing Ceremony
- Structured review workflow displaying diagnosis, treatment history, and drug administration details.
- WHO AWaRe / CIA advisory step requiring conscious clinical affirmation when prescribing Watch or Reserve drugs.
- Multi-factor signing authorization: typed name, drawn wet-ink canvas signature, and secure vet PIN.
- Retroactive countersignature workflow for emergency farmer-administered interventions.

### 4. 📈 Predictive Medicine Demand & Disease Trends
- Dual-line historical vs. forecasted drug demand charts.
- Farm health heatmaps highlighting herd vulnerability and high-frequency conditions (e.g., Mastitis, IBD).
- Natural language "Why this matters" situational insights.

---

## 👥 User Roles & Key Workflows

### 1. Farmer Portal

| Route | View Name | Key Features |
|---|---|---|
| `/farmer/home` | **Farm Dashboard** | Herd status summary (Clear / Under Treatment / Waiting), high-priority attention alerts, quick actions (Record Treatment, Health Event, Start Dispatch), low-stock medicine alerts. |
| `/farmer/my-farm` | **Livestock Registry** | Species overview cards (Cows, Buffaloes, Goats, Poultry), searchable/filterable animal directory, Add Animal modal (with flock support), full animal health history modals. |
| `/farmer/treatments` | **Treatments & Withdrawal** | Active treatment list, 3-step Record Treatment wizard, drug route & dosage logs, treatment timeline side panels with withdrawal progress indicators. |
| `/farmer/dispatch` | **Dispatch & Safety Gate** | Past dispatch history, 3-step Start Dispatch wizard, automated multi-gate eligibility check, QR passport generation. |
| `/farmer/insights` | **Forecasting & Analytics** | 30d/90d demand projection charts, species risk heatmap, medicines-to-watch radar, AI explanatory summaries. |

### 2. Veterinarian Portal

| Route | View Name | Key Features |
|---|---|---|
| `/vet/home` | **Vet Command Center** | Workload stats (Awaiting Signature, Unsigned Emergency, Follow-up, Stewardship Review), Urgent attention queue, Clinical evidence insight cards (similar case recovery benchmarks), Recent activity & outcomes. |
| `/vet/prescriptions` | **Prescription Registry** | Filterable prescriptions table (Sign, Countersigned, Signed, Voided), New Prescription creation wizard with AWaRe/CIA classification. |
| `/vet/patients` | **Patient Directory** | Comprehensive patient profiles, cross-farm animal records, treatment histories, diagnostic logs. |
| **Sign Flow** | **Review & Sign Pipeline** | Step 1: Clinical Case Review → Step 2: AWaRe/CIA Stewardship Notice → Step 3: Signature Canvas + Vet PIN validation → Step 4: Signed Confirmation with signature reference ID. |
| **Countersign Flow** | **Emergency Countersign** | 2-step authorization pipeline for reviewing and countersigning emergency on-farm administrations. |

### 3. Researcher / Admin Portal

| Route | View Name | Key Features |
|---|---|---|
| `/admin` | **Researcher Dashboard** | Six in-page tabs: **Overview** (national AMU, India heatmap with all state abbreviations, click-through to district pages), **AMU & Regional Analytics** (same national map; click a state for its district page), **Anomalies**, **Health × AMU**, **Forecast & Planning**, **Research Workspace**. |
| `/admin/states/[slug]` | **State district register** | One page per mainland state/UT (34). District choropleth, hover headcount (Total / Male / Female), species table, state/district/year filters. Dummy livestock numbers. |

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   PashuPramaan Web App                 │
├────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router) + React 19 + TypeScript       │
│  Tailwind CSS v4 + Fraunces (Display) / Inter (Body)   │
│  TanStack React Query v5 (Data Fetching & State)      │
│  Recharts (Visualizations) + Leaflet (Geo Mapping)     │
│  Lucide React (Icons) + HTML5 Signature Canvas         │
└──────────────────────────┬─────────────────────────────┘
                           │ (REST / JSON / JWT)
┌──────────────────────────▼─────────────────────────────┐
│                 FastAPI Backend Service                │
├────────────────────────────────────────────────────────┤
│  FastAPI + PostgreSQL + SQLAlchemy                     │
│  ECDSA P-256 Signature Verification                    │
│  Prophet Time-Series Forecasting Models                │
│  Veterinary Drug Formulary & MRL Safety Gate Engine    │
└────────────────────────────────────────────────────────┘
```

- **Framework**: Next.js `16.3.2` (Turbopack, App Router)
- **UI & Runtime**: React `19.2.8`, TypeScript `5.x`
- **Styling**: Tailwind CSS `v4` with custom CSS variables design system
- **State & Server Cache**: TanStack React Query `v5.101.4`
- **Charts & Mapping**: Recharts `3.10.1`, Leaflet & React-Leaflet `5.0.0`, D3 + India GeoJSON choropleth on `/admin`, district GeoJSON on `/admin/states/[slug]`
- **Icons & Primitives**: Lucide React, Custom accessible UI components
- **Testing**: Vitest, React Testing Library, Playwright

**Backend direction:** Next.js can stay the UI and also host API routes. A separate **Express + PostgreSQL** service is a valid next step (the planned FastAPI backend can be swapped or deferred). Prefer one API layer, not both Express and FastAPI.

---

## 📂 Project Directory Structure

```
PashuPramaan/
├── docs/                                # API specifications & domain design contracts
│   ├── api-contract.md                  # Core Frontend ↔ Backend REST API contract
│   └── api-contract (3).md              # Extended contract with signing & dispatch specs
├── public/                              # Static public assets
│   ├── images/                          # High-res photography & assets
│   └── favicon.ico
├── src/
│   ├── app/                             # Next.js App Router root
│   │   ├── (auth)/                      # Authentication routes
│   │   │   └── login/                   # Multi-role login (Farmer, Vet, Admin → /admin)
│   │   ├── admin/                       # Researcher / Admin dashboard (`/admin`)
│   │   │   └── states/[slug]/           # Per-state district maps (`/admin/states/maharashtra`)
│   │   ├── farmer/                      # Farmer portal
│   │   │   ├── home/                    # Farmer dashboard
│   │   │   ├── my-farm/                 # Animal & herd management
│   │   │   ├── treatments/              # Treatment logging & withdrawal tracker
│   │   │   ├── dispatch/                # Dispatch safety checks & passports
│   │   │   ├── insights/                # Predictive demand analytics
│   │   │   └── layout.tsx               # Farmer navigation shell & header
│   │   ├── vet/                         # Veterinarian portal
│   │   │   ├── home/                    # Vet dashboard & workload center
│   │   │   ├── prescriptions/           # Prescriptions table & sign launcher
│   │   │   ├── patients/                # Patient directory & case viewer
│   │   │   └── layout.tsx               # Vet navigation shell
│   │   ├── lab/                         # Laboratory technician portal
│   │   │   ├── dashboard/               # Lab dashboard & attention queue
│   │   │   ├── dispatches/              # Dispatch registry + per-dispatch assessment
│   │   │   ├── testing-queue/           # Awaiting receipt & ready-for-testing lists
│   │   │   ├── testing-workspace/       # Per-sample testing workspace
│   │   │   ├── results/                 # Completed tests awaiting verification
│   │   │   ├── reports/                 # Verified reports & MRL records
│   │   │   └── layout.tsx               # Lab navigation shell
│   │   ├── globals.css                  # Design tokens, fonts, and theme variables
│   │   ├── layout.tsx                   # Root HTML & typography layout
│   │   └── page.tsx                     # Landing / entry redirection
│   ├── components/                      # Reusable UI component library
│   │   ├── admin/                       # Admin choropleth + state district maps
│   │   ├── farmer/                      # Farmer-specific widgets & modals
│   │   │   ├── AddAnimalModal.tsx
│   │   │   ├── DispatchDetailModal.tsx
│   │   │   ├── RecordTreatmentModal.tsx
│   │   │   ├── StartDispatchModal.tsx
│   │   │   ├── TreatmentDetailPanel.tsx
│   │   │   ├── WithdrawalRibbon.tsx
│   │   │   └── ...
│   │   ├── vet/                         # Vet-specific widgets & sign flows
│   │   │   ├── sign-flow/               # 4-step Review & Sign ceremony
│   │   │   ├── countersign-flow/        # 2-step Emergency Countersign flow
│   │   │   ├── shared/                  # SignatureCapture & PinInput components
│   │   │   ├── CaseDetailModal.tsx
│   │   │   ├── NewPrescriptionModal.tsx
│   │   │   └── ...
│   │   ├── lab/                         # Lab tables, testing queue & receipt flows
│   │   └── ui/                          # Design system primitives (Badge, Button, Card, Select, Input, ProgressBar)
│   ├── data/
│   │   ├── india-states.json            # Simplified India states GeoJSON
│   │   └── districts/                   # Per-state district GeoJSON (34 files)
│   ├── lib/
│   │   ├── admin/
│   │   │   ├── india-geo.ts             # State names, abbreviations, slugs
│   │   │   ├── state-stats.ts           # Dummy livestock headcounts
│   │   │   └── load-district-geo.ts     # Server loader for district GeoJSON
│   │   ├── seed/                        # Canonical dummy dataset (single source of truth)
│   │   │   ├── types.ts                 # Canonical entity types
│   │   │   ├── ids.ts                   # Recurring id constants
│   │   │   ├── canonical.ts             # Seed rows + `// CONFLICT:` resolutions
│   │   │   ├── store.ts                 # Module-level store & getters
│   │   │   ├── project.ts               # Shared badge / label / count projections
│   │   │   ├── query-keys.ts            # TanStack Query keys for invalidation
│   │   │   └── seed.test.ts             # Uniqueness, joins & adapter smoke tests
│   │   └── api/
│   │       └── dummy/                   # View adapters over the seed store
│   │           ├── auth.ts
│   │           ├── animal-detail.ts
│   │           ├── dispatch.ts
│   │           ├── farm-detail.ts
│   │           ├── farm-insights.ts
│   │           ├── farmer-dashboard.ts
│   │           ├── lab-dashboard.ts
│   │           ├── lab-dispatches.ts
│   │           ├── lab-reports.ts
│   │           ├── lab-results.ts
│   │           ├── lab-testing.ts
│   │           ├── treatments.ts
│   │           ├── vet-case-detail.ts
│   │           ├── vet-dashboard.ts
│   │           ├── vet-patients.ts
│   │           ├── vet-prescriptions.ts
│   │           ├── vet-sign-flow.ts
│   │           └── vets.ts
│   └── providers/                       # React Query & client context providers
├── package.json                         # Dependencies and build scripts
├── tsconfig.json                        # TypeScript configuration
├── vitest.config.mts                    # Vitest config (`npm test`)
└── README.md                            # Project documentation
```

The researcher / admin UI lives only under `src/app/admin` (and `src/components/admin`, `src/lib/admin`, `src/data`). The original Vite/Figma scaffold `Create Dashboard Page/` was removed; it is not used at runtime.

---

## 📡 API Contract & Data Architecture

The complete frontend-backend contract is documented under [`docs/api-contract.md`](docs/api-contract.md). 

### Key Endpoints Summary

| Domain | Method & Route | Description | Gate Behavior |
|---|---|---|---|
| **Auth** | `POST /api/auth/login` | Multi-role authentication (Farmer / Vet / Admin) | Issues Bearer JWT |
| **Farmer** | `GET /api/farmer/dashboard` | Aggregated farm stats, attention items, medicine inventory | Read |
| **Farmer** | `GET /api/farmer/farm` | Species counts, animal roster, recent farm activity | Read |
| **Farmer** | `POST /api/farmer/animals` | Register new animal or poultry flock | Idempotent |
| **Farmer** | `GET /api/farmer/treatments` | Active/historical treatments with live withdrawal state | Read |
| **Farmer** | `POST /api/farmer/treatments` | Log new treatment & trigger withdrawal countdown | Enforces 72h backdate cap |
| **Farmer** | `POST /api/farmer/dispatch/safety-check` | Multi-parameter farm-gate safety gate verification | **Fails closed on violation** |
| **Farmer** | `POST /api/farmer/dispatch/passport` | Issue verifiable QR safety passport | Requires valid safety check |
| **Farmer** | `GET /api/farmer/insights` | 30d/90d Prophet medicine demand & trend forecast | Read |
| **Vet** | `GET /api/vet/dashboard` | Workload queues, emergency alerts, evidence cards | Read |
| **Vet** | `POST /api/vet/prescriptions` | Issue new prescription with AWaRe / CIA tags | Sets status to `SIGN` |
| **Vet** | `POST /api/vet/prescriptions/{id}/sign` | Complete digital signing ceremony with PIN & canvas | Generates digital signature ref |
| **Vet** | `POST /api/vet/emergencies/{id}/countersign`| Countersign emergency field treatment | Linked audit trail |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`

### Installation & Local Run

#### 1. Frontend (Next.js)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ninjabeam20/PashuPramaan-SIH.git
   cd PashuPramaan-SIH
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) (or **3001** if 3000 is already taken). `/` redirects to `/login`.

#### 2. Backend (FastAPI + PostgreSQL)

The application uses **PostgreSQL** and **FastAPI** with **SQLAlchemy**. You will need a local PostgreSQL database running.

1. **Setup Python Virtual Environment**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Database Configuration**:
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and update the `DATABASE_URL` with your local PostgreSQL credentials. (e.g., `postgresql://postgres:password@localhost:5432/pashupramaan`).

3. **Initialize the Database**:
   Push the schema to your PostgreSQL database using Alembic migrations:
   ```bash
   alembic upgrade head
   ```

4. **Seed the Database**:
   Populate the database with the canonical test data (farms, animals, health events, lab samples, etc.):
   ```bash
   PYTHONPATH=. python3 -m app.seed
   ```

5. **Start the FastAPI server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will run on [http://localhost:8000](http://localhost:8000).

### How to access the portals

All three dashboards are live. Pick a role on login, or open the URL directly. Login is dummy — any password works.

| Role on login | Demo User ID | Goes to | What’s there |
|---|---|---|---|
| **Farmer / Animal Owner** | `farmer01` | `/farmer/home` | Home, My Farm, Treatments, Dispatch, Insights (nav at the top) |
| **Veterinarian / Vet Officer** | `vet01` | `/vet/home` | Home, Prescriptions, Patients (sign / countersign under a prescription) |
| **Administrator / Inspector** | `admin01` | `/admin` | National dashboard; click a state for `/admin/states/[slug]` |

Direct URLs (login can be skipped):
- Farmer: [http://localhost:3000/farmer/home](http://localhost:3000/farmer/home)
- Vet: [http://localhost:3000/vet/home](http://localhost:3000/vet/home)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Example state page: [http://localhost:3000/admin/states/maharashtra](http://localhost:3000/admin/states/maharashtra)

Farmer and vet keep their own nav once you are inside that portal. They do not link to `/admin`, and admin does not link back to them — each role is a separate entry.

> **Signing PIN (Vet)**: Demo default PIN is `1234`

---

## 🛠️ Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Next.js development server with hot reloading |
| `npm run build` | Compiles optimized production build |
| `npm run start` | Serves the compiled production build |
| `npm run lint` | Runs ESLint analysis across TypeScript & JSX files |

---

## 🎨 Design System & Theme Tokens

PashuPramaan utilizes an organic, premium visual design system balancing agricultural grounding with clean clinical authority:

```css
:root {
  --color-bg: #f5f1e7;          /* Warm organic cream */
  --color-surface: #ffffff;     /* Crisp white container surface */
  --color-primary: #2d4a22;     /* Forest agricultural green */
  --color-primary-dark: #1f3517;/* Deep foliage green */
  --color-text: #1e2a17;        /* High-contrast charcoal green */
  --color-text-muted: #6b7364;  /* Muted earthy slate */
  --color-border: #e4dfd1;      /* Subtle border tone */
  --color-accent-vet: #de6a38;  /* Terracotta veterinary accent */

  --status-high-bg: #fbdce0;    /* Alert high background */
  --status-high-text: #b0334a;  /* Alert high crimson */
  --status-medium-bg: #fcebc9;  /* Warning amber background */
  --status-medium-text: #92610f;/* Warning amber text */
  --status-good-bg: #e1ebd7;    /* Safe / clear green background */
  --status-good-text: #2d4a22;  /* Safe / clear green text */
}
```

- **Typography**: `Fraunces` (warm, authoritative serif display) + `Inter` (clean, accessible UI body).
- **Responsive Layout**: Dedicated desktop navigation with a fixed mobile-friendly bottom app bar.

---

## ⚖️ Core Safety & Stewardship Principles

1. **Fail-Closed by Design**: If any data is missing, expired, or unverified (e.g., active withdrawal period, missing vet signature for restricted drugs, or MRL assay failure), dispatch is unconditionally blocked.
2. **Honest Provenance**: Passports reflect exact verified state (e.g., `"No assay on file"` rather than falsifying a lab check if only time-based withdrawal was observed).
3. **Antimicrobial Governance**: Critically Important Antimicrobials (CIAs) and WHO Watch/Reserve drugs cannot be silently prescribed; they trigger mandatory justification notices.
4. **Audit Trail Integrity**: All health events, emergency administrations, and signatures maintain immutable timestamps and author references.

---

## 🗺️ Roadmap

- [x] Multi-species Livestock & Poultry Flock Management
- [x] Dynamic Drug Withdrawal Timers & Progress Ribbons
- [x] Multi-gate Dispatch Safety Validation & PashuPramaan Passport QR Generation
- [x] 4-Step Veterinary Review & Signing Ceremony with Canvas & PIN
- [x] 2-Step Emergency Countersign Pipeline
- [x] Prophet Demand & Health Event Trend Visualizations
- [x] Admin / Researcher dashboard (`/admin`) — national AMU heatmap, anomalies, Health × AMU, forecast, workspace
- [x] Per-state district maps (`/admin/states/[slug]`) — dummy livestock headcount
- [x] Backend FastAPI + PostgreSQL Integration (replacing dummy store)
- [ ] ECDSA P-256 Hardware Token / WebAuthn Signature Ceremony
- [ ] Native Hindi & Regional Language Localization (i18n)
- [ ] Offline PWA Mode with Background Sync for rural connectivity
- [ ] Admin / Regulator supply-chain residue compliance (beyond the current researcher UI)

---

<div align="center">
  <sub>Built with ❤️ for sustainable livestock health, veterinary stewardship, and safe food systems.</sub>
</div>
