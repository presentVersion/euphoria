# Smart Patient Queue & Emergency Triage — Architecture Blueprint & Specification Index

## 1. Executive Summary

This repository contains the complete, implementation-ready architectural blueprint, domain models, clinical safety rules, queue algorithms, API specifications, and operational protocols for the **Smart Patient Queue & Emergency Triage Management System**.

The primary purpose of this system is to assist hospital emergency departments (ED) and outpatient triage facilities in assessing patient urgency objectively, eliminating queue bottlenecks, preventing clinical deterioration in waiting rooms, and coordinating clinical encounters from arrival to discharge or admission.

> **CRITICAL DIRECTIVE**: This repository is currently in **Phase 0 (Blueprint & Specification)**. Implementation of frontend UI, backend business logic, and database migrations is strictly gated behind formal blueprint review. Future implementation phases must preserve this specification and integrate custom UI components provided by the product team without inventing arbitrary design systems or unvalidated medical triage algorithms.

---

## 2. Blueprint Master Index

| Document | Purpose & Key Topics |
| :--- | :--- |
| [PROJECT_OVERVIEW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PROJECT_OVERVIEW.md) | Mission, clinical context, operational pain points, and core value proposition. |
| [PROJECT_SCOPE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PROJECT_SCOPE.md) | Strict boundary definitions: in-scope vs. out-of-scope, hackathon MVP vs. clinical enterprise rollout. |
| [REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REQUIREMENTS.md) | Unified requirements baseline, operational drivers, and stakeholder needs. |
| [FUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_REQUIREMENTS.md) | Exhaustive catalog of functional requirements (`FR-REG`, `FR-TRI`, `FR-QUE`, `FR-CON`, `FR-SEC`, `FR-RT`, `FR-REP`). |
| [NONFUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/NONFUNCTIONAL_REQUIREMENTS.md) | Performance, safety, reliability, accessibility, and resilience targets (`NFR-PERF`, `NFR-REL`, `SAF-001`). |
| [USER_ROLES_AND_PERMISSIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/USER_ROLES_AND_PERMISSIONS.md) | Detailed persona profiles, access boundaries, permission matrix, and break-glass mechanisms. |
| [SYSTEM_ARCHITECTURE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYSTEM_ARCHITECTURE.md) | C4 architectural diagrams, container breakdown, component interactions, and data boundaries. |
| [ARCHITECTURE_DECISIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ARCHITECTURE_DECISIONS.md) | Architecture Decision Records (`ADR-001` through `ADR-015`) documenting technology, security, and queue models. |
| [DOMAIN_MODEL.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DOMAIN_MODEL.md) | Rigorous domain entity definitions, relationships, value objects, lifecycle states, and domain invariants. |
| [DATABASE_SCHEMA.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DATABASE_SCHEMA.md) | Relational SQL schema DDL, table structures, foreign keys, unique constraints, indices, and triggers. |
| [DATABASE_MIGRATION_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DATABASE_MIGRATION_STRATEGY.md) | Schema versioning, rollback runbooks, synthetic seed fixtures, and zero-downtime migration guidelines. |
| [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Patient identification, duplicate detection, emergency bypass, unknown patient handling, and state machines. |
| [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md) | 3-layer triage architecture, physiological observation validation, demo rules vs. approved protocols. |
| [CLINICAL_SAFETY_AND_GOVERNANCE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CLINICAL_SAFETY_AND_GOVERNANCE.md) | Non-autonomous clinical limits, missing data handling, downgrade guardrails, and clinical governance. |
| [RED_FLAG_ESCALATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/RED_FLAG_ESCALATION.md) | Automated and manual emergency escalation, audible/visual alarms, acknowledgement tracking, and safety bypass. |
| [REASSESSMENT_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REASSESSMENT_WORKFLOW.md) | Dynamic reassessment intervals, deterioration detection, overdue alarms, and longitudinal observation tracking. |
| [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) | Deterministic multi-factor priority algorithm, tie-breaking rules, concurrency management, starvation guards. |
| [QUEUE_STATE_MACHINE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_STATE_MACHINE.md) | Queue entry lifecycle, atomic transitions, concurrency locking (`SKIP LOCKED`), and recovery states. |
| [CONSULTATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CONSULTATION_WORKFLOW.md) | Clinician call workflow, examination rooms, encounter dispositions, referral, admission, and discharge. |
| [DEPARTMENT_ALLOCATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEPARTMENT_ALLOCATION.md) | Care area routing (Resus, Majors, Minors, Pediatrics, Fast-Track), cross-department handoffs, capacity limits. |
| [WAITING_TIME_ESTIMATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/WAITING_TIME_ESTIMATION.md) | Queue forecasting algorithm, rolling service times, confidence intervals, and graceful fallback to unavailable. |
| [REALTIME_EVENT_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REALTIME_EVENT_SPECIFICATION.md) | SSE and WebSocket event catalog, payload schemas, deduplication, client reconnection, and stale-data flags. |
| [NOTIFICATION_AND_ALERTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/NOTIFICATION_AND_ALERTS.md) | Internal audio/visual clinical alarms, in-app notification center, delivery retry, and failure logging. |
| [API_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/API_SPECIFICATION.md) | Complete REST API endpoint reference, query params, request/response JSON schemas, and error structures. |
| [AUTHENTICATION_AND_AUTHORIZATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUTHENTICATION_AND_AUTHORIZATION.md) | Session security, password hashing, JWT/Cookie transport, RBAC enforcement, and break-glass procedures. |
| [SECURITY_THREAT_MODEL.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SECURITY_THREAT_MODEL.md) | STRIDE threat model, BOLA/IDOR prevention, SQL injection defense, CORS, secrets hygiene, and attack trees. |
| [PRIVACY_AND_DATA_GOVERNANCE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PRIVACY_AND_DATA_GOVERNANCE.md) | Data minimization, PHI boundary controls, Indian DPDP compliance posture, and retention policies. |
| [AUDIT_LOGGING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUDIT_LOGGING.md) | Immutable audit trails, append-only logs, cryptographic checksums, before/after diffs, and query APIs. |
| [ANALYTICS_AND_REPORTING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ANALYTICS_AND_REPORTING.md) | Operational metrics (door-to-doctor, triage time, LWBS, bottleneck tracking), formulas, and privacy shields. |
| [FAILURE_HANDLING_AND_RECOVERY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FAILURE_HANDLING_AND_RECOVERY.md) | Partial system failures, database outages, stale client states, network partitions, and paper-chart reconciliation. |
| [PERFORMANCE_AND_SCALABILITY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/PERFORMANCE_AND_SCALABILITY.md) | Latency budgets (<100ms queue fetches), indexing strategies, connection pooling, and stress thresholds. |
| [TESTING_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TESTING_STRATEGY.md) | Unit, integration, E2E, clinical safety, concurrency race condition, and penetration testing regimens. |
| [ACCEPTANCE_TESTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ACCEPTANCE_TESTS.md) | Formal acceptance test cases with preconditions, test steps, expected API outputs, and failure criteria. |
| [SYNTHETIC_DEMO_SCENARIOS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYNTHETIC_DEMO_SCENARIOS.md) | 14 end-to-end clinical simulation scripts (Scenarios A through N) with synthetic medical datasets. |
| [DEVELOPMENT_SETUP.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEVELOPMENT_SETUP.md) | Local developer environment setup, prerequisite commands, database seeding, and testing workflows. |
| [ENVIRONMENT_CONFIGURATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ENVIRONMENT_CONFIGURATION.md) | Environment variable catalog (`.env.example`), secrets rotation, and deployment profiles. |
| [DEPLOYMENT_AND_OPERATIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEPLOYMENT_AND_OPERATIONS.md) | Docker containerization, health probes, zero-downtime deployment, and operational runbooks. |
| [BACKUP_AND_DISASTER_RECOVERY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/BACKUP_AND_DISASTER_RECOVERY.md) | Automated WAL archiving, RPO (1 min) / RTO (15 min) targets, disaster restoration drill procedures. |
| [ACCESSIBILITY_AND_INTERNATIONALIZATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ACCESSIBILITY_AND_INTERNATIONALIZATION.md) | WCAG 2.1 AA keyboard/screen reader compliance, dual-encoding urgency indicators (not color alone), i18n hooks. |
| [INTEGRATION_STRATEGY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/INTEGRATION_STRATEGY.md) | External EMR/HIS integration boundaries, FHIR R4 mapping stubs, and SMS/Email gateway abstractions. |
| [MODULE_BOUNDARIES.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/MODULE_BOUNDARIES.md) | 20 internal software module boundaries, public interfaces, forbidden cross-imports, and isolation contracts. |
| [FUNCTIONAL_PAGE_CONTRACTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_PAGE_CONTRACTS.md) | UI-agnostic page interaction contracts: required inputs, query parameters, permissions, state handlers. |
| [BUSINESS_RULES.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/BUSINESS_RULES.md) | Complete enterprise business rule registry (`BR-001` through `BR-050`) with conflict resolution rules. |
| [STATE_TRANSITIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/STATE_TRANSITIONS.md) | Formal state transition matrices across registration, encounter, triage, queue, and consultation. |
| [IMPLEMENTATION_ROADMAP.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/IMPLEMENTATION_ROADMAP.md) | Phased implementation schedule (Phases 0 through 10), deliverables, exit criteria, and parallel tracks. |
| [DEFINITION_OF_DONE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEFINITION_OF_DONE.md) | Strict multi-dimensional Definition of Done: code quality, safety checks, audit trail, automated tests. |
| [RISKS_AND_OPEN_QUESTIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/RISKS_AND_OPEN_QUESTIONS.md) | Risk register with likelihood/impact ratings, mitigation strategies, and open stakeholder decisions. |
| [TRACEABILITY_MATRIX.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRACEABILITY_MATRIX.md) | Full bidirectional traceability matrix: Problem Statement -> FR -> Entity -> API -> Test -> Phase. |
| [GLOSSARY.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/GLOSSARY.md) | Standardized healthcare, triage, and queue engineering terminology definitions. |

---

## 3. Core Architectural Tenets

1. **Patient Safety Above Operational Throughput**: An administrative queue must never delay clinical resuscitation. Immediate red flags bypass ordinary registration queues instantly.
2. **Clinical Decision Support, Not Autonomous Diagnosis**: Software computes suggested urgency based on validated rules; an authorized, licensed clinician confirms, modifies, or overrides with auditable justification.
3. **Deterministic Queue Ordering**: The active waiting queue is dynamically ordered by a multi-factor priority algorithm that guarantees predictable prioritization while actively guarding against waiting-room starvation.
4. **UI Agnostic Functional Specifications**: The architectural specifications define data structures, state machines, API payloads, and security boundaries. The visual layer will be provided by user-selected components (from React Bits, 21st.dev, etc.) in Phase 9 without altering backend contracts.
5. **Fail-Closed Security & Auditability**: Every access, urgency modification, clinical override, and encounter transition is captured in an immutable, append-only audit trail.

---

## 4. Current Repository State

- **Branch / Status**: Clean initial workspace; Phase 0 Blueprint generated.
- **Installed Agent Skills**: `.agents/skills` initialized with 16 skills including frontend and UI/UX design libraries.
- **Next Permitted Step**: Review Phase 0 Blueprint; proceed to Phase 1 upon formal user approval.
