# Backend Progress Report

This document outlines the current implementation status of the **PashuPramaan FastAPI + PostgreSQL** backend.

## ✅ Completed Milestones

### 1. Database Infrastructure & Schema
- **PostgreSQL Integration:** Successfully replaced the frontend dummy store with a real PostgreSQL database.
- **SQLAlchemy Models:** Full database schema defined in `app/models.py` including `User`, `Farm`, `Animal`, `HealthEvent`, `Prescription`, `Treatment`, `FarmerDispatch`, `MedicineStock`, `LabSample`, and `AdminAnomaly`.
- **Alembic Migrations:** Configured and working. The `alembic upgrade head` successfully initializes the schema.
- **Database Seeding:** A robust seed script (`app/seed.py`) populates the database from a canonical JSON test dataset (`canonical.json`), creating farms, animals, prescriptions, and users.

### 2. Authentication & Roles
- **Multi-role Login:** Working authentication system in `api/auth.py` supporting `FARMER`, `VET`, and `ADMIN` roles.
- **JWT Dependencies:** Implemented `get_current_user` for securing endpoints via Bearer tokens.

### 3. API Routing Structure
- **Modular Routers:** FastAPI routers are properly structured under `app/api/` (`farmer.py`, `vet.py`, `admin.py`, `lab.py`, `auth.py`).
- **Basic DB Queries:** Certain endpoints (like `get_dashboard`, `get_animals`, `get_patients`) are actively querying the PostgreSQL database to return dynamic lists and aggregate counts (e.g., number of animals under treatment).
- **Signing Ceremony (Mocked Logic):** Vet signing and countersigning endpoints (`/prescriptions/{id}/sign`, `/emergencies/{event_id}/countersign`) successfully update the database status to `SIGNED` or `COUNTERSIGNED`.

---

## 🚧 Partially Completed / Hardcoded Areas

While the API contract structure is in place, **most endpoints still return hardcoded mock data** rather than querying the database for all complex fields. 

- **Farmer Portal:**
  - `GET /api/farmer/dispatch`: Returns static dummy data.
  - `POST /api/farmer/dispatch/safety-check`: Hardcoded to return a mock safety check failure.
  - `GET /api/farmer/insights`: Returns static lists and hardcoded Prophet-style charts.
  - `GET /api/farmer/treatments`: Mostly static mock objects (only returning a single Amoxicillin treatment).
- **Vet Portal:**
  - `GET /api/vet/dashboard`: While workload numbers are dynamically pulled from the DB, `insights`, `alerts`, and `recent_outcomes` return static dictionaries.
  - `GET /api/vet/cases/{id}`: Returns partially dynamic data but mocks the `health_event` onset and `treatment_history`.
- **Admin/Researcher Portal:**
  - `admin.py` endpoints (`/overview`, `/analytics`, `/health-amu`, `/forecast`) are entirely hardcoded to return dummy data.

---

## ❌ Pending / To Do

According to the roadmap and codebase analysis, the following backend features are not yet implemented:

1. **Full Database Integration:** Replace all remaining hardcoded dictionaries in `farmer.py`, `vet.py`, `admin.py`, and `lab.py` with dynamic SQLAlchemy queries.
2. **Prophet Integration:** The Time-Series Forecasting Models for predicting medicine demand are currently just returning static mock numbers.
3. **MRL Safety Gate Engine:** The actual logic that validates withdrawal clearance clocks and lab assay MRL values before dispatch is not fully written (it is mocked in the safety-check endpoint).
4. **ECDSA P-256 Signature Verification:** Not yet implemented (listed in the roadmap).
5. **Withdrawal Computations:** The logic to dynamically count down withdrawal periods based on species, drug, and route is not yet functioning at the database level.
