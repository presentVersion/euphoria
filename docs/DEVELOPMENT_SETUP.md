# Development Environment Setup & Developer Runbook

## 1. Prerequisites & System Requirements

To develop, test, and run the Smart Patient Queue & Emergency Triage system locally, ensure the following tools are installed:

- **Operating System**: Windows 10/11, macOS (Apple Silicon or Intel), or Linux (Ubuntu 22.04+).
- **Node.js**: `v20.x LTS` or higher.
- **Package Manager**: `npm` (v10+), `pnpm` (v9+), or `bun`.
- **Database**: **PostgreSQL 16** (recommended via Docker, or local native installation).
- **Git**: v2.35+ with long paths enabled on Windows: `git config --global core.longpaths true`.

---

## 2. Local Setup Step-by-Step

### Step 1: Clone & Install Dependencies
```bash
# Navigate to project workspace
cd /path/to/tou

# Install dependencies (Phase 1+)
npm install
```

### Step 2: Configure Environment Variables
```bash
# Copy example environment configuration
cp .env.example .env
```
*Edit `.env` to verify database connection parameters (`DATABASE_URL`).*

### Step 3: Start Local PostgreSQL (via Docker)
If you do not have a local PostgreSQL 16 service running, start one using Docker:
```bash
docker run --name triage-postgres \
  -e POSTGRES_USER=triage_admin \
  -e POSTGRES_PASSWORD=triage_secure_dev_pass \
  -e POSTGRES_DB=triage_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Step 4: Run Database Migrations & Seeds
```bash
# Run schema migrations
npm run db:migrate

# Seed synthetic demonstration data (Facilities, Users, Scenarios A-N)
npm run db:seed:dev
```

### Step 5: Start Development Server
```bash
# Starts backend API server and frontend client concurrently
npm run dev
```
- Web Application: `http://localhost:3000`
- API Health Check: `http://localhost:3000/api/v1/health`
- Real-Time SSE Stream: `http://localhost:3000/api/v1/realtime/stream`

---

## 3. Standard Developer Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts local development server with hot module reloading (HMR). |
| `npm run build` | Compiles production assets and runs TypeScript type checking (`tsc --noEmit`). |
| `npm test` | Runs unit and safety invariant tests via Vitest. |
| `npm run test:e2e` | Runs Playwright multi-station end-to-end browser workflows. |
| `npm run test:concurrency` | Runs automated k6/Vitest race-condition tests for double-call prevention. |
| `npm run db:migrate` | Applies pending SQL migrations to active database. |
| `npm run db:seed:dev` | Inserts synthetic facilities, accounts, and demo scenarios. |
| `npm run lint` | Runs ESLint and Prettier code quality checks. |

---

## 4. Default Synthetic Test Accounts (`db:seed:dev`)

All test accounts share the default development password: `DevStaffPassword123!`

| Persona / Role | Email | Employee ID | Assigned Area |
| :--- | :--- | :--- | :--- |
| **Receptionist** | `reception.clerk@hospital.org` | `EMP-REC-101` | Front Registration Desk |
| **Triage Nurse** | `sarah.nurse@hospital.org` | `EMP-TRI-201` | Emergency Triage Bay 1 |
| **Treating Clinician** | `dr.reynolds@hospital.org` | `EMP-DOC-301` | Acute Care Bay (Room 2) |
| **Charge Nurse** | `charge.supervisor@hospital.org` | `EMP-CHG-401` | ED Central Supervision Console |
| **Department Manager** | `dept.manager@hospital.org` | `EMP-MGR-501` | Emergency Admin Suite |
| **Hospital Admin** | `admin@hospital.org` | `EMP-ADM-001` | Enterprise Governance |
