# Architecture Decision Records (ADR Log)

This document records all architectural decisions (`ADR-001` through `ADR-015`) established during Phase 0 for the Smart Patient Queue & Emergency Triage System.

---

### ADR-001: Architectural Pattern — Modular Monolith over Microservices
- **Status**: Confirmed
- **Context**: The application requires high transactional consistency across patient registration, triage, queue insertion, and consultation transitions. A microservices architecture would introduce distributed transaction overhead, network latency, and eventual consistency risks that could jeopardize patient safety during acute emergency arrivals.
- **Decision**: Adopt a **Modular Monolith** architecture with clean domain boundaries, strict TypeScript interface contracts, and shared database ACID transactions.
- **Consequences**:
  - *Positive*: Zero distributed transaction failures; atomic consistency during patient calling; straightforward local and Docker deployment.
  - *Negative*: Services scale as a single unit (acceptable for hospital department scale).

---

### ADR-002: Technology Stack — TypeScript Across Frontend and Backend
- **Status**: Confirmed
- **Context**: Discrepancies between frontend and backend data representations (e.g., vital sign nullability, urgency enum tiers) introduce safety vulnerabilities.
- **Decision**: Standardize on **TypeScript 5.x** with strict mode enabled across both frontend and backend layers.
- **Consequences**:
  - *Positive*: Shared domain types, Zod schemas, and API contracts; compile-time verification of physiological data structures.
  - *Negative*: Requires TypeScript compilation step.

---

### ADR-003: Database Engine — PostgreSQL 16
- **Status**: Confirmed
- **Context**: The queue engine requires strict relational integrity, check constraints, partial unique indices, and row-level locking to prevent race conditions during patient calls.
- **Decision**: Select **PostgreSQL 16** as the sole authoritative datastore.
- **Consequences**:
  - *Positive*: Native `FOR UPDATE SKIP LOCKED` eliminates double-calling race conditions; JSONB accommodates versioned protocol rule schemas; robust transactional audit triggers.
  - *Negative*: Requires running PostgreSQL instance (handled via Docker or cloud managed DB).

---

### ADR-004: Real-Time Transport — Server-Sent Events (SSE) over WebSockets
- **Status**: Confirmed
- **Context**: Staff terminals require immediate queue updates and alarm pushes. Hospital IT networks frequently employ restrictive firewalls, corporate proxies, and deep-packet inspection that aggressively terminate persistent bidirectional WebSockets.
- **Decision**: Use **Server-Sent Events (SSE)** for unidirectional real-time server-to-client streaming, paired with standard REST API calls for client mutations.
- **Consequences**:
  - *Positive*: Operates cleanly over standard HTTPS (Port 443); native browser `EventSource` with built-in auto-reconnection; zero WebSocket protocol overhead.
  - *Negative*: Client must send mutations over HTTP POST (standard practice).

---

### ADR-005: Clinical Triage Architecture — 3-Layer Separation of Concerns
- **Status**: Confirmed
- **Context**: Medical software must never claim autonomous diagnosis or make unvalidated clinical decisions without licensed human oversight.
- **Decision**: Implement a **3-Layer Triage Architecture**:
  1. *Clinical Protocol*: Hospital-approved rulesets and physiological ranges (e.g., ESI v4).
  2. *Triage Engine*: Deterministic software calculating a suggested urgency score and red flags.
  3. *Clinician Authority*: Authoritative human clinician confirms, modifies, or overrides the score.
- **Consequences**:
  - *Positive*: Eliminates liability of autonomous software misdiagnosis; preserves clinician discretion while providing structured decision support.
  - *Negative*: Requires clinician confirmation step before queue entry.

---

### ADR-006: Queue Ordering Model — Deterministic Multi-Factor Priority Algorithm
- **Status**: Confirmed
- **Context**: Simple First-In, First-Out (FIFO) queuing endangers deteriorating patients, while purely manual sorting risks human bias and waiting room starvation.
- **Decision**: Use a deterministic mathematical priority score:
  $$\text{Priority Score} = (\text{Urgency Weight} \times 10{,}000) + (\text{Red Flag} \times 50{,}000) + (\text{Overdue Reassessment} \times 20{,}000) + \text{Waiting Minutes}$$
  Ties broken strictly by earliest arrival timestamp, then UUID.
- **Consequences**:
  - *Positive*: High-acuity patients jump to the front predictably; deteriorating patients are elevated; reproducible queue order across all queries.
  - *Negative*: Lower-acuity patients wait longer during surge periods (mitigated by starvation alert guards).

---

### ADR-007: Concurrency Control — Row-Level Locking (`SKIP LOCKED`)
- **Status**: Confirmed
- **Context**: When two clinicians simultaneously click "Call Next Patient", optimistic concurrency without locking could result in both doctors calling the same patient to different rooms.
- **Decision**: Execute patient calls within a database transaction using `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1`.
- **Consequences**:
  - *Positive*: Guarantees zero duplicate patient calls; losing clinician immediately acquires the next available patient without blocking.
  - *Negative*: Requires careful transaction timeout tuning ($\le 5\text{ seconds}$).

---

### ADR-008: Audit Logging — Append-Only Table with Cryptographic Checksums
- **Status**: Confirmed
- **Context**: Healthcare regulations (HIPAA, Indian DPDP, NABH) require immutable forensic trails of all clinical modifications and patient record accesses.
- **Decision**: Implement an **append-only `audit_logs` table** in PostgreSQL. Revoke `UPDATE` and `DELETE` permissions on this table; compute a SHA-256 hash linking each log entry to the previous record (hash chaining).
- **Consequences**:
  - *Positive*: Tamper-evident forensic history; satisfies institutional compliance boards.
  - *Negative*: Audit table grows continuously; requires partitioned storage in long-term production.

---

### ADR-009: Waiting Time Estimation — Rolling Empirical Service Time Bands
- **Status**: Confirmed
- **Context**: Fabricating precise wait times (e.g., "You will be seen in exactly 14 minutes") causes patient distress when emergency surges occur.
- **Decision**: Forecast waiting times using rolling empirical median service times per department with broad confidence bands (e.g., "15–30 mins"). If fewer than 5 completed consultations exist in the current shift, return explicit `ESTIMATE_UNAVAILABLE`.
- **Consequences**:
  - *Positive*: Transparent, realistic expectations; prevents false precision.
  - *Negative*: Does not provide minute-by-minute countdowns.

---

### ADR-010: Registration Workflow — 1-Click Emergency Bypass
- **Status**: Confirmed
- **Context**: Unconscious, severely bleeding, or cardiac arrest patients cannot complete demographic registration questionnaires before receiving care.
- **Decision**: Provide an **Emergency Bypass** button generating a synthetic tracking record (`TEMP-EMERG-XXXX`) with `EMERGENCY_UNIDENTIFIED` status, immediately routing the patient to Resuscitation Bay.
- **Consequences**:
  - *Positive*: Administrative intake never impedes acute medical resuscitation (satisfies `SAF-001`).
  - *Negative*: Requires post-stabilization identity reconciliation.

---

### ADR-011: UI Independence — Visual Design Decoupled from Functional Blueprint
- **Status**: Confirmed
- **Context**: The product team will provide custom UI components from design libraries (React Bits, 21st.dev) in Phase 9. Architectural specifications must not dictate visual styling.
- **Decision**: Specifications define data requirements, API contracts, state transitions, and accessibility invariants without prescribing color palettes, typography, or UI layouts.
- **Consequences**:
  - *Positive*: Custom UI components drop in cleanly without refactoring backend or domain logic.
  - *Negative*: None.

---

### ADR-012: Data Validation — Strict Zod Schema Boundaries
- **Status**: Confirmed
- **Context**: Malformed physiological vitals or malicious payloads could corrupt queue priority or compromise the backend.
- **Decision**: Validate all HTTP request bodies, query parameters, and route parameters with strict **Zod schemas** at the API gateway layer before invoking service logic.
- **Consequences**:
  - *Positive*: Rejects out-of-range physiological measurements (e.g., SpO2 > 100%); strips unwhitelisted fields; prevents SQL injection and prototype pollution.
  - *Negative*: Minor schema maintenance overhead.

---

### ADR-013: Security Model — Break-Glass Emergency Access
- **Status**: Confirmed
- **Context**: Strict departmental access controls can prevent trauma clinicians from accessing critical patient records during mass-casualty disasters.
- **Decision**: Implement a **Break-Glass Access protocol** granting temporary 2-hour elevated access upon entering a verified clinical emergency rationale and password re-authentication.
- **Consequences**:
  - *Positive*: Life safety is maintained during disasters while maintaining 100% forensic auditability.
  - *Negative*: Requires automated post-event administrative audit review.

---

### ADR-014: Clinical Protocol Gating — Production Lockdown of Demonstration Profiles
- **Status**: Confirmed
- **Context**: Development environments utilize simplified triage rules that are not validated by a clinical governance board.
- **Decision**: Add an `is_approved_for_production` boolean to the Triage Protocol entity. The application strictly refuses to start in `NODE_ENV=production` if the active protocol is an unapproved demonstration profile.
- **Consequences**:
  - *Positive*: Guarantees experimental or hackathon scoring logic cannot be accidentally deployed in a live hospital.
  - *Negative*: Requires explicit administrative activation for production rollout.

---

### ADR-015: Client Resilience — Stale-Data Guard and Form Recovery
- **Status**: Confirmed
- **Context**: In clinical environments, network drops can cause clinicians to view an outdated queue or lose half-entered triage observations during tab reloads.
- **Decision**: If real-time SSE heartbeat is lost for $> 5\text{ seconds}$, client UI displays a prominent yellow banner *"Reconnecting — Queue May Be Stale"* and disables patient calling. Active form inputs are saved in encrypted session storage for instant recovery.
- **Consequences**:
  - *Positive*: Prevents doctors from calling patients based on stale queues; protects nurses from re-entering vitals after accidental browser crashes.
  - *Negative*: Minor client-side storage management logic.
