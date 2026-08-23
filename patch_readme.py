import re

with open("README.md", "r") as f:
    content = f.read()

replacement = """### Installation & Local Run

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
   The backend will run on [http://localhost:8000](http://localhost:8000)."""

# Replace the specific section
content = re.sub(
    r"### Installation & Local Run.*?7\. \*\*Access the application\*\*:\n   Open \[http://localhost:3000\]\(http://localhost:3000\) \(or \*\*3001\*\* if 3000 is already taken\)\. `/` redirects to `/login`\.",
    replacement,
    content,
    flags=re.DOTALL
)

# Replace the Roadmap items
content = content.replace(
    "- [ ] Backend FastAPI + PostgreSQL Integration (replacing dummy store)",
    "- [x] Backend FastAPI + PostgreSQL Integration (replacing dummy store)"
)

with open("README.md", "w") as f:
    f.write(content)
