# Software Module Boundaries & Architectural Decoupling

## 1. Modular Monolith Architecture & Isolation Rules

To prevent code degradation into an untestable "big ball of mud", the backend is organized into **20 discrete software modules**. Each module possesses strict boundaries:
- **Private Internal Logic**: Database queries and helper functions remain strictly internal to the module directory.
- **Exported Public Interface**: Modules communicate with other modules solely via typed public service contracts exported from `index.ts`.
- **Forbidden Dependencies**: Direct cross-database joins across unrelated domain entities and circular dependencies are strictly forbidden.

---

## 2. Module Specifications Catalog

### Module 1: `identity-access`
- **Responsibilities**: Staff authentication, password verification (Argon2id), JWT session issuance, RBAC permission verification, break-glass session granting.
- **Owned Entities**: `StaffUser`, `StaffDepartmentAssignment`.
- **Dependencies**: Database, Crypto.
- **Forbidden**: Must never query clinical observations or calculate queue scores.

### Module 2: `patient-registry`
- **Responsibilities**: Patient master index, search by MRN/phone, duplicate similarity scoring, demographic updates.
- **Owned Entities**: `Patient`.
- **Dependencies**: Database, `audit-compliance`.
- **Forbidden**: Must not create encounters or assign clinical urgency.

### Module 3: `encounter-management`
- **Responsibilities**: Visit lifecycle, status transitions (`WAITING_FOR_TRIAGE` $\rightarrow$ `DISCHARGED`), single-active-encounter enforcement.
- **Owned Entities**: `Encounter`.
- **Dependencies**: `patient-registry`, `identity-access`, Database.
- **Forbidden**: Does not compute queue positions directly.

### Module 4: `registration-workflow`
- **Responsibilities**: Front-desk registration orchestration, emergency bypass coordination, temporary MRN minting.
- **Dependencies**: `patient-registry`, `encounter-management`, `audit-compliance`.
- **Forbidden**: Cannot record physiological vital signs.

### Module 5: `clinical-observations`
- **Responsibilities**: Physiological vitals validation, range checks, pain score capture, consciousness scale recording.
- **Owned Entities**: `VitalSignObservation`.
- **Dependencies**: `encounter-management`, Database.
- **Forbidden**: Does not determine final clinical urgency; outputs raw validated measurements.

### Module 6: `triage-protocol`
- **Responsibilities**: Management and versioning of approved triage rulesets (e.g., ESI v4, MTS), production protocol gating (`SAF-006`).
- **Dependencies**: Database.
- **Forbidden**: Does not evaluate individual patients; maintains protocol definition schemas.

### Module 7: `triage-engine`
- **Responsibilities**: Executes protocol rules against observations, evaluates immediate red flags, computes suggested urgency level.
- **Dependencies**: `triage-protocol`, `clinical-observations`.
- **Forbidden**: Does not commit final urgency without human confirmation; strictly an advisory service.

### Module 8: `clinical-escalation`
- **Responsibilities**: Clinician triage confirmation, clinical overrides, supervisor downgrade dual-signatures, red-flag alert creation.
- **Owned Entities**: `TriageAssessment`, `RedFlagAlert`.
- **Dependencies**: `triage-engine`, `encounter-management`, `audit-compliance`, `realtime-events`.
- **Forbidden**: Cannot bypass supervisor authorization for acuity downgrades.

### Module 9: `reassessment-management`
- **Responsibilities**: Schedules `due_at` deadlines based on acuity, detects overdue breaches, logs secondary observation trends.
- **Owned Entities**: `ReassessmentRecord`.
- **Dependencies**: `clinical-observations`, `clinical-escalation`, `realtime-events`.

### Module 10: `queue-engine`
- **Responsibilities**: Dynamic multi-factor priority score calculation, deterministic tie-breaking, atomic row locking (`SKIP LOCKED`) for patient calls.
- **Owned Entities**: `Queue`, `QueueEntry`.
- **Dependencies**: `encounter-management`, `department-allocation`, Database, `realtime-events`.
- **Forbidden**: Cannot invent clinical triage scores; consumes urgency from `clinical-escalation`.

### Module 11: `department-allocation`
- **Responsibilities**: Care area bed tracking, patient routing rules, cross-department transfer handoffs.
- **Owned Entities**: `Department`, `CareArea`.
- **Dependencies**: Database, `realtime-events`.

### Module 12: `consultation-workflow`
- **Responsibilities**: Consultation lifecycle (`CALLED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`), diagnostic holds, clinical disposition.
- **Owned Entities**: `Consultation`.
- **Dependencies**: `encounter-management`, `queue-engine`, `identity-access`.

### Module 13: `waiting-time-estimation`
- **Responsibilities**: Computes rolling service time forecasts, evaluates confidence bands, returns `ESTIMATE_UNAVAILABLE` fallback on sparse data.
- **Dependencies**: `queue-engine`, `consultation-workflow`.
- **Forbidden**: Output must never alter clinical priority or determine medical safety.

### Module 14: `notifications-alerts`
- **Responsibilities**: In-app alert management, medical audible alarm coordination, external SMS gateway integration.
- **Dependencies**: `realtime-events`, Database.

### Module 15: `realtime-events`
- **Responsibilities**: Server-Sent Events (SSE) connection pool management, channel room scoping, client heartbeat, event serialization.
- **Dependencies**: None (Infrastructure module).

### Module 16: `reporting-analytics`
- **Responsibilities**: Aggregates operational KPIs (door-to-doctor, triage compliance, LWBS rate, bottleneck analysis).
- **Dependencies**: Read-only queries across historical encounters.
- **Forbidden**: Cannot perform write operations to active queues.

### Module 17: `audit-compliance`
- **Responsibilities**: Append-only audit trail insertion, cryptographic SHA-256 state chaining, tamper detection verification.
- **Owned Entities**: `AuditEvent`.
- **Dependencies**: Database, Crypto.
- **Forbidden**: Revokes all `UPDATE` and `DELETE` queries.

### Module 18: `system-configuration`
- **Responsibilities**: Facility settings, operational parameters, rate limit configurations, feature flags.
- **Dependencies**: Database.

### Module 19: `external-integrations`
- **Responsibilities**: FHIR R4 mapping adapters, external SMS gateway clients, EHR sync stubs.
- **Dependencies**: `encounter-management`, `patient-registry`.

### Module 20: `operational-monitoring`
- **Responsibilities**: Liveness (`/health`) and Readiness (`/health/ready`) probes, database connection pool metrics.
- **Dependencies**: Database, Node process.
