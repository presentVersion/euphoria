# Project Status — Smart Patient Queue & Emergency Triage

**Document Version**: 1.0.0  
**Phase Status**: Phase 0 — Complete (Awaiting Explicit User Authorization to Start Phase 1)  
**System Classification**: Clinical Decision Support & Operational Emergency Triage Flow  
**Target Environment**: Node.js / TypeScript / PostgreSQL 16 / Fastify / Web UI  

---

## 1. Project Objective

Hospitals and Emergency Departments (EDs) handle unpredictable surges of patients presenting with diverse acuity. Relying on arrival time or static queues introduces severe risks of clinical deterioration in waiting rooms.

The objective of the **Smart Patient Queue & Emergency Triage** system is to provide a reliable, auditable, web-based platform that:
1. Facilitates rapid patient registration (including an instant 1-click Emergency Bypass for unconscious or unidentified patients).
2. Supports structured clinical triage assessment (integrating vital signs, red-flag triggers, and ESI-compatible urgency tiers without autonomously replacing clinician judgment).
3. Executes a dynamic, deterministic queue priority engine that prevents waiting-room starvation and enforces life-threat precedence.
4. Provides real-time clinician and charge-nurse monitoring, care-area handoffs, and consultation lifecycle management.
5. Preserves full cryptographic auditability, data privacy (minimization, DPDP compliance readiness), and downtime resilience.

---

## 2. Current Repository State

- **Operating System**: Windows x64 (PowerShell execution shell).
- **Git State**: Git 2.39 configured with `core.longpaths=true`. Clean status.
- **Skills & Tooling**: Installed skills include `frontend`, `frontend-ui-ux`, Emil Kowalski animation/UI skills (`emil-design-eng`, `animate`, `apple-design`, etc.) in `.agents/skills/`.
- **Existing Code Status**: No pre-existing application code or frameworks were found in the workspace root. The workspace has been thoroughly analyzed and prepared from the ground up.
- **Phase 0 Artifacts**: 50 detailed architectural documents in `docs/`, 11 formal Mermaid diagrams in `docs/diagrams/`, an OpenAPI 3.1 contract in `spec/openapi.yaml`, event schemas and example payloads in `spec/`, and project governance files in `project/`.

---

## 3. Confirmed Architecture & Technology Stack

| Tier | Confirmed Selection | Rationale |
| :--- | :--- | :--- |
| **Architecture Pattern** | Modular Monolith | Eliminates distributed transaction failures; enforces strict domain boundary isolation; ideal for sub-second emergency response. |
| **Backend Framework** | Node.js (v20 LTS) + Fastify + TypeScript | High-throughput, low-overhead async I/O; native schema validation via TypeBox/JSON-Schema; enterprise type-safety. |
| **Database** | PostgreSQL 16 | ACID transactions, native UUIDs, partial indexes for active queues, JSONB for extensible observations, row-level locking (`FOR UPDATE SKIP LOCKED`). |
| **Data Access / ORM** | Drizzle ORM | Zero-overhead type-safe SQL queries; explicit transaction handling without hidden query bloat. |
| **Real-Time Streaming** | Server-Sent Events (SSE) + Event Catalog | Unidirectional server-to-client push; HTTP/2 multiplexed; firewall-friendly; simpler recovery than bidirectional WebSockets. |
| **Security & Auth** | Argon2id + JWT in HTTP-Only Strict Cookies | Defense against XSS token exfiltration; brute-force protection; fine-grained RBAC with dual-authorization for downgrades. |
| **Audit Architecture** | Append-only `audit_events` with SHA-256 HMAC Hash-Chaining | Cryptographically verifiable tamper-evidence for all clinical overrides and queue adjustments. |

---

## 4. Completed Blueprint Deliverables Inventory

### 4.1 Master Documentation (`docs/`)
- [README.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/README.md) — Master index and operational navigation
- [PROJECT_OVERVIEW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PROJECT_OVERVIEW.md) — Problem statement, clinical risks, ED operational reality
- [PROJECT_SCOPE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PROJECT_SCOPE.md) — In-scope vs. out-of-scope boundaries (Hackathon vs. Enterprise)
- [REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REQUIREMENTS.md) — Core requirements baseline
- [FUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_REQUIREMENTS.md) — Complete FR register (`FR-REG`, `FR-TRI`, `FR-QUE`, `FR-CON`, `FR-SEC`, `FR-RT`, `FR-REP`)
- [NONFUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/NONFUNCTIONAL_REQUIREMENTS.md) — NFR register (`NFR-PERF`, `NFR-REL`, `NFR-SEC`, `NFR-ACC`, `SAF-001` to `SAF-008`)
- [USER_ROLES_AND_PERMISSIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/USER_ROLES_AND_PERMISSIONS.md) — 7 user roles, permission matrix, break-glass protocol
- [SYSTEM_ARCHITECTURE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYSTEM_ARCHITECTURE.md) — C4 context, container, component models
- [ARCHITECTURE_DECISIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ARCHITECTURE_DECISIONS.md) — ADR-001 through ADR-015
- [DOMAIN_MODEL.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DOMAIN_MODEL.md) — Complete domain entities, value objects, lifecycle states
- [DATABASE_SCHEMA.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DATABASE_SCHEMA.md) — Complete PostgreSQL 16 DDL, constraints, indexes
- [DATABASE_MIGRATION_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DATABASE_MIGRATION_STRATEGY.md) — Expand/contract migrations, seed profiles
- [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) — Standard vs. Emergency-Bypass registration
- [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md) — 3-layer architecture, ESI classification, validation
- [CLINICAL_SAFETY_AND_GOVERNANCE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CLINICAL_SAFETY_AND_GOVERNANCE.md) — CDS safety bounds, clinical review, fail-safe procedures
- [RED_FLAG_ESCALATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/RED_FLAG_ESCALATION.md) — Critical alert triggers, audio/visual annunciators, ack workflow
- [REASSESSMENT_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REASSESSMENT_WORKFLOW.md) — Periodic reassessment intervals, overdue priority boosting
- [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) — Deterministic score formula, concurrency controls
- [QUEUE_STATE_MACHINE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_STATE_MACHINE.md) — Formal queue state transitions
- [CONSULTATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CONSULTATION_WORKFLOW.md) — Doctor call, exam room assignment, hold, disposition
- [DEPARTMENT_ALLOCATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEPARTMENT_ALLOCATION.md) — Care area routing (Resus, Acute, Urgent, Fast-Track, Peds)
- [WAITING_TIME_ESTIMATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/WAITING_TIME_ESTIMATION.md) — Empirical rolling service time, confidence bands
- [REALTIME_EVENT_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REALTIME_EVENT_SPECIFICATION.md) — SSE catalog, reconnect handshake, stale-data lockout
- [NOTIFICATION_AND_ALERTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/NOTIFICATION_AND_ALERTS.md) — Alert tiers, audible signals, in-app notification center
- [API_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/API_SPECIFICATION.md) — Endpoint registry, request/response models, error schema
- [AUTHENTICATION_AND_AUTHORIZATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUTHENTICATION_AND_AUTHORIZATION.md) — Argon2id, JWT, RBAC guards
- [SECURITY_THREAT_MODEL.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SECURITY_THREAT_MODEL.md) — STRIDE threat analysis and countermeasure matrix
- [PRIVACY_AND_DATA_GOVERNANCE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PRIVACY_AND_DATA_GOVERNANCE.md) — Data minimization, Indian DPDP Act readiness, encryption
- [AUDIT_LOGGING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUDIT_LOGGING.md) — Immutable audit trail, SHA-256 HMAC verification
- [ANALYTICS_AND_REPORTING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ANALYTICS_AND_REPORTING.md) — Operational ED metrics (door-to-doctor, LWBS, compliance)
- [FAILURE_HANDLING_AND_RECOVERY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FAILURE_HANDLING_AND_RECOVERY.md) — Degraded mode, paper reconciliation runbook
- [PERFORMANCE_AND_SCALABILITY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PERFORMANCE_AND_SCALABILITY.md) — Latency budgets, database indexing, query optimization
- [TESTING_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TESTING_STRATEGY.md) — Unit, integration, E2E, clinical safety, concurrency testing
- [ACCEPTANCE_TESTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ACCEPTANCE_TESTS.md) — Concrete acceptance test scenarios
- [SYNTHETIC_DEMO_SCENARIOS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYNTHETIC_DEMO_SCENARIOS.md) — Scenarios A through N with synthetic clinical data
- [DEVELOPMENT_SETUP.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEVELOPMENT_SETUP.md) — Node/Docker/DB setup guide and developer CLI
- [ENVIRONMENT_CONFIGURATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ENVIRONMENT_CONFIGURATION.md) — Environment variables dictionary
- [DEPLOYMENT_AND_OPERATIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEPLOYMENT_AND_OPERATIONS.md) — Docker containerization, health probes, zero-downtime
- [BACKUP_AND_DISASTER_RECOVERY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/BACKUP_AND_DISASTER_RECOVERY.md) — RPO 1 min, RTO 15 min, continuous WAL archiving
- [ACCESSIBILITY_AND_INTERNATIONALIZATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ACCESSIBILITY_AND_INTERNATIONALIZATION.md) — WCAG 2.1 AA dual-coding, i18n
- [INTEGRATION_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/INTEGRATION_STRATEGY.md) — HL7 FHIR R4 mapping adapters, external SMS gateway stubs
- [MODULE_BOUNDARIES.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/MODULE_BOUNDARIES.md) — 20 discrete software module boundaries
- [FUNCTIONAL_PAGE_CONTRACTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_PAGE_CONTRACTS.md) — Functional contracts for all 10 frontend screens
- [BUSINESS_RULES.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/BUSINESS_RULES.md) — Centralized business rules catalog (`BR-001` through `BR-050`)
- [STATE_TRANSITIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/STATE_TRANSITIONS.md) — State transition matrix across all 6 core entities
- [IMPLEMENTATION_ROADMAP.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/IMPLEMENTATION_ROADMAP.md) — Phased delivery plan (Phases 0 through 10)
- [DEFINITION_OF_DONE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEFINITION_OF_DONE.md) — 6-pillar DoD, prototype vs. clinical production gates
- [RISKS_AND_OPEN_QUESTIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/RISKS_AND_OPEN_QUESTIONS.md) — Risk register (`RSK-001` to `RSK-021`), stakeholder questions
- [TRACEABILITY_MATRIX.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRACEABILITY_MATRIX.md) — Bidirectional requirements traceability matrix
- [GLOSSARY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/GLOSSARY.md) — Domain definitions and clinical acronyms

### 4.2 Diagrams (`docs/diagrams/`)
- `system-context.mmd` — C4 Level 1 System Context Diagram
- `container-architecture.mmd` — C4 Level 2 Container Architecture Diagram
- `domain-relationships.mmd` — Entity Relationship and Domain Model Diagram
- `patient-registration.mmd` — Standard & Emergency-First Registration Flow
- `triage-lifecycle.mmd` — Triage Assessment & Red-Flag Escalation Flow
- `queue-lifecycle.mmd` — Queue Lifecycle & Priority Calculation Flow
- `consultation-lifecycle.mmd` — Consultation & Clinical Disposition State Machine
- `department-transfer.mmd` — Inter-Department Transfer & Handoff Sequence
- `emergency-escalation.mmd` — Life-Threat Escalation & Annunciation Flow
- `real-time-event-flow.mmd` — SSE Broadcast & Reconnection Recovery Flow
- `failure-recovery.mmd` — Database & Network Outage Degraded Mode Sequence

### 4.3 Schemas & Specifications (`spec/` & Root)
- `.env.example` — Secure environment variables configuration template
- `spec/openapi.yaml` — Formal OpenAPI 3.1 REST API specification
- `spec/event-schemas/queue-reordered.json` — SSE schema for dynamic queue changes
- `spec/event-schemas/red-flag-alert.json` — SSE schema for life-threat red-flag alerts
- `spec/event-schemas/patient-called.json` — SSE schema for clinician call events
- `spec/example-payloads/triage-assessment.json` — Synthetic clinical triage payload
- `spec/example-payloads/consultation-disposition.json` — Synthetic clinical consultation completion payload

---

## 5. Key Architectural Decisions Summary

1. **Modular Monolith over Microservices (ADR-001)**: All domain services reside in a unified codebase with clean module boundaries, running in a single Node.js process with zero network partition risks during critical triage workflows.
2. **Deterministic Queue Priority Formula (ADR-003)**: Queue ordering is governed strictly by urgency tier weight, overdue reassessment penalty, and waiting time factor—not raw arrival order.
3. **Pessimistic Row-Locking for Clinician Calling (ADR-004)**: Double-call race conditions are prevented using `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1`.
4. **Three-Layer Clinical Triage Architecture (ADR-005)**: Decouples hospital clinical protocol rules from engine software mechanics and human clinical judgment (`SAF-001` to `SAF-006`).
5. **Server-Sent Events for Real-Time Streaming (ADR-006)**: Lightweight HTTP streaming with native browser auto-reconnect and monotonic event sequencing.
6. **Append-Only Cryptographic Audit Log (ADR-007)**: SHA-256 HMAC hash chaining prevents retroactive tampering with clinical override records.

---

## 6. Critical Governance & Safety Invariants

- **`SAF-001` Human Clinician Primacy**: Software suggestions are advisory only. A certified nurse or doctor must confirm all triage categories.
- **`SAF-002` Missing Vitals Invariant**: The system strictly forbids imputing missing vital signs with "normal" defaults.
- **`SAF-003` Emergency First Invariant**: An emergency patient can be registered in 1 click with a temporary ID (`TEMP-YYYYMMDD-XXXX`) without demographic blockers.
- **`SAF-004` Downgrade Dual-Authorization**: Lowering a patient's acuity tier requires mandatory clinical rationale and Charge Nurse supervisor co-signature.
- **`SAF-005` Fail-Safe Protocol Lockout**: If the rules engine fails, the system safely falls back to direct manual clinician assessment and logs an operational incident.
- **`SAF-006` Production Protocol Governance**: Development demonstration profiles cannot be activated in production without explicit clinical committee signoff.

---

## 7. Current Blockers Before Production Clinical Use

The following items are acceptable for the development prototype but block clinical live deployment:
1. **Institutional Clinical Triage Protocol Selection**: Formal adoption of an accredited triage standard (e.g., ESI v4, MTS, or CTAS) signed off by the hospital Medical Director.
2. **Indian DPDP Act & NABH Compliance Certification**: Completion of formal institutional data protection impact assessment (DPIA) and security penetration testing.
3. **High-Availability Infrastructure**: Multi-AZ PostgreSQL deployment with automated failover and certified off-site backup pipelines.
4. **Hardware Annunciator Integration**: Integration of physical PA audible horns or corridor displays with ED station SSE listeners.

---

## 8. Current Implementation Phase & Next Steps

- **Current Phase**: **Phase 0 (Complete)**.
- **Action Required**: The blueprint is 100% complete and self-contained. **Do not begin Phase 1** until the user explicitly reviews this specification and provides authorization to start Phase 1 (Project Foundation & Core Scaffold).
