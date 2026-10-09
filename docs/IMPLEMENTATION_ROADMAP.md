# Phased Implementation Roadmap (Phases 0 through 10)

## 1. Roadmap Strategy & Dependency Graph

Implementation is partitioned into 11 strictly sequenced phases. Work must proceed sequentially through the dependency graph; no phase may begin until its predecessor satisfies its formal Exit Conditions.

```
[Phase 0: Blueprint & Specification] ◄── [CURRENT ACTIVE PHASE]
         │
         ▼
[Phase 1: Project Foundation & Database]
         │
         ▼
[Phase 2: Identity & Patient Registration]
         │
         ▼
[Phase 3: Clinical Triage & Decision Support]
         │
         ▼
[Phase 4: Dynamic Queue Engine]
         │
         ▼
[Phase 5: Consultation & Encounter Flow]
         │
         ├───► [Phase 6: Real-Time SSE Updates & Alarms]
         ├───► [Phase 7: Operational Intelligence & Wait Times]
         │
         ▼
[Phase 8: Security & Reliability Hardening]
         │
         ▼
[Phase 9: Custom UI Integration (React Bits / 21st.dev)]
         │
         ▼
[Phase 10: End-to-End Validation & Demonstration]
```

---

## 2. Phase-by-Phase Execution Plans

### Phase 0: Blueprint & Technical Decisions (Current Phase)
- **Status**: Completed in this session.
- **Deliverables**: Comprehensive architecture blueprint, domain models, database DDL, API specs, clinical safety rules, queue algorithms, and project status documentation.
- **Exit Condition**: Formal sign-off on blueprint specifications.

---

### Phase 1: Project Foundation & Database Infrastructure
- **Prerequisites**: Phase 0 sign-off.
- **Core Tasks**:
  1. Initialize repository with TypeScript, package manifests, and ESLint/Prettier.
  2. Configure PostgreSQL 16 connection via Drizzle ORM / Prisma.
  3. Apply database migration `0001_initial_schema.sql` (Tables, Foreign Keys, Partial Unique Indexes).
  4. Implement base API server with Fastify/Express, Pino logging, and error handling middleware.
- **Deliverables**: Verified database connectivity, schema migrations, and health check endpoints (`/api/v1/health`).
- **Automated Tests**: Database connection test, migration up/down test.

---

### Phase 2: Identity, Authentication & Patient Registration
- **Prerequisites**: Phase 1 complete.
- **Core Tasks**:
  1. Implement staff authentication with Argon2id and JWT cookies (`/api/v1/auth/login`).
  2. Implement patient search and duplicate detection similarity scoring.
  3. Implement standard patient registration and encounter creation (`/api/v1/patients`).
  4. Implement **1-Click Emergency Bypass** protocol (`/api/v1/patients/emergency-bypass`).
- **Deliverables**: Working authentication, patient master index, emergency bypass token generator.
- **Automated Tests**: Login rate-limiting tests, duplicate detection unit tests, emergency bypass safety test (`SAF-001`).

---

### Phase 3: Clinical Triage & Decision Support Engine
- **Prerequisites**: Phase 2 complete.
- **Core Tasks**:
  1. Implement vital sign observation validation with physiological range checks.
  2. Implement protocol rule evaluator calculating suggested urgency levels (ESI 1–5).
  3. Implement immediate Red-Flag detection for life threats.
  4. Implement nurse confirmation and clinical override workflows.
  5. Implement supervised dual-signature urgency downgrade validation (`SAF-004`).
- **Deliverables**: Fully functional 3-layer triage engine, red-flag alert generator, and protocol versioning.
- **Automated Tests**: Physiological boundary tests, protocol rule evaluation tests, downgrade rejection security test.

---

### Phase 4: Dynamic Queue Prioritization Engine
- **Prerequisites**: Phase 3 complete.
- **Core Tasks**:
  1. Implement multi-factor priority score calculator (`PriorityScore = Urgency + RedFlag + Overdue + Wait`).
  2. Implement atomic patient calling using PostgreSQL `FOR UPDATE SKIP LOCKED`.
  3. Implement care area queue partitioning (Resus, Acute, Urgent, Pediatrics, Fast-Track).
  4. Implement scheduled reassessment due-time tracking and overdue alert flags.
  5. Implement waiting room anti-starvation multiplier.
- **Deliverables**: Dynamic queue priority calculator, race-condition defense, and queue entry state machine.
- **Automated Tests**: Priority ranking unit tests, concurrency double-call tests (`TC-CON-01`).

---

### Phase 5: Consultation Workflow & Patient Disposition
- **Prerequisites**: Phase 4 complete.
- **Core Tasks**:
  1. Implement clinician consultation state machine (`CALLED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).
  2. Implement consultation clinical documentation (notes, working diagnosis).
  3. Implement diagnostic hold (`ON_HOLD`) and resume workflow.
  4. Implement final clinical disposition recording (Discharge, Inpatient Admission, External Transfer, LWBS).
  5. Implement cross-department SBAR transfer handoff workflow.
- **Deliverables**: Doctor consultation portal endpoints, disposition validator, and encounter closure.
- **Automated Tests**: Consultation lifecycle tests, mandatory disposition validation tests.

---

### Phase 6: Real-Time Event Streaming & Audio Alarms
- **Prerequisites**: Phase 4 & 5 complete.
- **Core Tasks**:
  1. Implement Server-Sent Events (SSE) broadcaster hub (`/api/v1/realtime/stream`).
  2. Implement channel room filtering by department and care area.
  3. Implement public waiting room sanitized stream (`/api/v1/realtime/public-stream`).
  4. Implement client heartbeat, connection loss detection, and stale-data guard.
  5. Implement IEC 60601-1-8 medical audio alarm patterns for critical red flags.
- **Deliverables**: Sub-200ms real-time queue updates, live alarms, and public display feed.
- **Automated Tests**: SSE latency benchmark tests, client reconnect state recovery tests.

---

### Phase 7: Operational Intelligence & Wait Time Forecasting
- **Prerequisites**: Phase 5 complete.
- **Core Tasks**:
  1. Implement rolling empirical wait-time estimation algorithm.
  2. Implement confidence band discretization and sparse-data fallback (`ESTIMATE_UNAVAILABLE`).
  3. Implement operational KPI calculators (door-to-doctor, door-to-triage, LWBS rates).
  4. Implement care area bottleneck detection heatmap logic.
- **Deliverables**: Wait-time estimation API, operational metrics dashboard.
- **Automated Tests**: Wait-time forecasting unit tests, sparse data fallback assertions.

---

### Phase 8: Security, Reliability & Compliance Hardening
- **Prerequisites**: Phases 1–7 complete.
- **Core Tasks**:
  1. Implement append-only immutable audit logging with cryptographic SHA-256 hash chaining.
  2. Implement break-glass elevated access workflow with automated 2-hour expiry.
  3. Implement automated tamper-detection audit ledger verification routine.
  4. Execute penetration testing against BOLA, IDOR, SQL injection, and XSS attack vectors.
  5. Configure automated WAL continuous database archiving and test recovery drill.
- **Deliverables**: Security-hardened backend, cryptographic audit ledger, and disaster recovery runbook.
- **Automated Tests**: Security fuzz tests, audit hash chain verification tests (`SAF-008`).

---

### Phase 9: Custom UI Integration (User-Supplied Components)
- **Prerequisites**: Phase 8 backend stabilization.
- **Core Tasks**:
  1. Receive and integrate custom UI components and design assets provided by the user (from React Bits, 21st.dev, etc.).
  2. Wire components into the Functional Page Contracts (`/registration`, `/triage`, `/queue`, `/consultation`, `/admin`).
  3. Connect reactive client state hooks to REST endpoints and real-time SSE streams.
  4. Implement loading skeletons, empty states, validation error banners, and the stale-data reconnecting banner.
  5. Verify WCAG 2.1 AA accessibility (dual-encoding urgency badges, screen reader announcements, keyboard navigation).
- **Deliverables**: Multi-station web application with user's customized design and components.
- **Automated Tests**: Playwright multi-screen visual QA and accessibility tests (`axe-core`).

---

### Phase 10: Final Validation, Demonstration & Acceptance Sign-off
- **Prerequisites**: Phase 9 UI integration complete.
- **Core Tasks**:
  1. Execute synthetic demonstration scenarios (Scenarios A through N).
  2. Run comprehensive end-to-end acceptance tests (`TC-REG-01`, `TC-TRI-01`, `TC-CON-01`).
  3. Verify audit log completeness across all simulated clinical encounters.
  4. Compile final validation report and demonstration checklist.
- **Deliverables**: Fully functioning, validated, and demonstration-ready web application.
- **Exit Condition**: Final acceptance and project sign-off.
