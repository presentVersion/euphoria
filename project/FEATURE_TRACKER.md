# Feature Tracker — Smart Patient Queue & Emergency Triage

**Status Overview**:
- **Phase 0 (Blueprint & Specification)**: 100% Complete
- **Phases 1–10 (Implementation)**: Specified & Ready for Phased Execution

---

## 1. Functional Requirements Tracker

| Requirement ID | Requirement Name | Priority | Target Phase | Specification Document | Implementation Status |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **FR-REG-001** | Patient Search & Identification | P0 | Phase 2 | [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Specified |
| **FR-REG-002** | Standard Patient Registration | P0 | Phase 2 | [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Specified |
| **FR-REG-003** | 1-Click Emergency Bypass Registration | P0 | Phase 2 | [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Specified |
| **FR-REG-004** | Duplicate Patient Detection & Review | P1 | Phase 2 | [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Specified |
| **FR-REG-005** | Demographic Correction & Encounter Linkage | P1 | Phase 2 | [REGISTRATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REGISTRATION_WORKFLOW.md) | Specified |
| **FR-TRI-001** | Structured Symptom & Complaint Capture | P0 | Phase 3 | [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-TRI-002** | Vital Signs Observation Recording | P0 | Phase 3 | [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-TRI-003** | Clinical Urgency Classification & Confirmation | P0 | Phase 3 | [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-TRI-004** | Life-Threat Red-Flag Screening & Alarm | P0 | Phase 3 | [RED_FLAG_ESCALATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/RED_FLAG_ESCALATION.md) | Specified |
| **FR-TRI-005** | Urgency Downgrade Dual-Authorization | P0 | Phase 3 | [CLINICAL_SAFETY_AND_GOVERNANCE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CLINICAL_SAFETY_AND_GOVERNANCE.md) | Specified |
| **FR-TRI-006** | Scheduled Periodic Reassessment | P1 | Phase 3 | [REASSESSMENT_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REASSESSMENT_WORKFLOW.md) | Specified |
| **FR-QUE-001** | Dynamic Urgency-Weighted Queue Ordering | P0 | Phase 4 | [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-QUE-002** | Atomic Clinician Calling & Double-Call Prevention | P0 | Phase 4 | [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-QUE-003** | Queue State Machine Lifecycle Enforcement | P0 | Phase 4 | [QUEUE_STATE_MACHINE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_STATE_MACHINE.md) | Specified |
| **FR-QUE-004** | Overdue Reassessment Priority Escalation | P1 | Phase 4 | [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-QUE-005** | Waiting Room Starvation Prevention | P1 | Phase 4 | [QUEUE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/QUEUE_ENGINE_SPECIFICATION.md) | Specified |
| **FR-CON-001** | Consultation Lifecycle Management | P0 | Phase 5 | [CONSULTATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CONSULTATION_WORKFLOW.md) | Specified |
| **FR-CON-002** | Diagnostic Hold & Pause Workflow | P1 | Phase 5 | [CONSULTATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CONSULTATION_WORKFLOW.md) | Specified |
| **FR-CON-003** | Final Clinical Disposition & Discharge | P0 | Phase 5 | [CONSULTATION_WORKFLOW.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/CONSULTATION_WORKFLOW.md) | Specified |
| **FR-CON-004** | Inter-Department SBAR Transfer Handshake | P1 | Phase 5 | [DEPARTMENT_ALLOCATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/DEPARTMENT_ALLOCATION.md) | Specified |
| **FR-RT-001** | Real-Time SSE Queue Broadcast | P0 | Phase 6 | [REALTIME_EVENT_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REALTIME_EVENT_SPECIFICATION.md) | Specified |
| **FR-RT-002** | Monotonic Sequence & Reconnect Recovery | P0 | Phase 6 | [REALTIME_EVENT_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REALTIME_EVENT_SPECIFICATION.md) | Specified |
| **FR-RT-003** | Stale Client Detection & Action Guard | P0 | Phase 6 | [REALTIME_EVENT_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/REALTIME_EVENT_SPECIFICATION.md) | Specified |
| **FR-REP-001** | Operational Emergency Department Analytics | P1 | Phase 7 | [ANALYTICS_AND_REPORTING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ANALYTICS_AND_REPORTING.md) | Specified |
| **FR-REP-002** | Empirical Waiting-Time Interval Forecasting | P1 | Phase 7 | [WAITING_TIME_ESTIMATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/WAITING_TIME_ESTIMATION.md) | Specified |
| **FR-SEC-001** | Argon2id Password Hashing & HTTP-Only JWT | P0 | Phase 2 | [AUTHENTICATION_AND_AUTHORIZATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUTHENTICATION_AND_AUTHORIZATION.md) | Specified |
| **FR-SEC-002** | Role-Based Access Control (7 Roles) | P0 | Phase 2 | [USER_ROLES_AND_PERMISSIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/USER_ROLES_AND_PERMISSIONS.md) | Specified |
| **FR-SEC-003** | Append-Only Cryptographic Audit Chaining | P0 | Phase 8 | [AUDIT_LOGGING.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/AUDIT_LOGGING.md) | Specified |

---

## 2. Safety Invariants Tracker

| Invariant ID | Safety Rule Description | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **SAF-001** | Human Clinician Primacy (CDS Advisory Only) | Automated Safety Test (`tests/safety/clinical-invariants.test.ts`) | Specified |
| **SAF-002** | Missing Vitals Invariant (Never Assume Normal) | Validation Engine Unit Test (`tests/unit/vitals-validation.test.ts`) | Specified |
| **SAF-003** | Emergency-First Registration Invariant | Registration Test (`tests/unit/registration.test.ts`) | Specified |
| **SAF-004** | Acuity Downgrade Dual-Authorization | RBAC Guard Test (`tests/safety/downgrade-guard.test.ts`) | Specified |
| **SAF-005** | Fail-Safe Protocol Lockout & Manual Fallback | Rules Engine Test (`tests/unit/rules-engine.test.ts`) | Specified |
| **SAF-006** | Production Protocol Activation Gate | Database Trigger / Startup Check (`tests/safety/protocol-gate.test.ts`) | Specified |
| **SAF-007** | Life-Threat Priority Over Arrival Time | Queue Ordering Unit Test (`tests/unit/queue-priority.test.ts`) | Specified |
| **SAF-008** | Stale-State Clinical Action Lockout | API Middleware Test (`tests/integration/stale-lockout.test.ts`) | Specified |
