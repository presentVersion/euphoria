# Bidirectional Requirements Traceability Matrix (RTM)

This matrix maps every core pillar of the original Problem Statement to its corresponding Functional Requirements, Clinical Safety Invariants, Domain Entities, API Endpoints, Responsible Modules, Acceptance Tests, and Scheduled Implementation Phases.

---

## 1. Master Traceability Matrix

| Problem Statement Pillar | Requirement ID | Safety / NFR ID | Domain Entity | API Endpoint | Responsible Module | Verification Test | Phase |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Pillar 1: Patient Registration & Symptoms** | `FR-REG-001` (Search) | `NFR-PERF-002` | `Patient` | `GET /patients/search` | `patient-registry` | `TC-REG-01` | Phase 2 |
| | `FR-REG-002` (Demographics) | `NFR-SEC-001` | `Patient` | `POST /patients` | `registration-workflow` | `TC-REG-01` | Phase 2 |
| | `FR-REG-003` (Emergency Bypass) | `SAF-001` | `Patient`, `Encounter` | `POST /patients/emergency-bypass` | `registration-workflow` | `TC-REG-02` | Phase 2 |
| | `FR-REG-004` (Duplicate Check) | `NFR-REL-005` | `Patient` | `POST /patients` | `patient-registry` | Unit Test | Phase 2 |
| | `FR-REG-005` (Encounter Creation)| `NFR-REL-005` | `Encounter` | `POST /encounters` | `encounter-management` | `TC-REG-01` | Phase 2 |
| | `FR-REG-006` (Chief Complaint) | `SAF-002` | `Encounter` | `POST /encounters` | `clinical-observations`| Unit Test | Phase 2 |
| **Pillar 2: Urgency Determination & Triage** | `FR-TRI-001` (Symptom Intake) | `SAF-002` | `VitalSignObservation` | `POST /triage/assessments` | `clinical-observations`| `TC-TRI-01` | Phase 3 |
| | `FR-TRI-002` (Vital Signs) | `SAF-002` | `VitalSignObservation` | `POST /triage/assessments` | `clinical-observations`| `TC-TRI-01` | Phase 3 |
| | `FR-TRI-003` (Red Flags) | `SAF-001` | `RedFlagAlert` | `POST /triage/assessments` | `triage-engine` | `TC-TRI-01` | Phase 3 |
| | `FR-TRI-004` (Protocol Engine) | `SAF-006` | `TriageAssessment` | `POST /triage/assessments` | `triage-engine` | `TC-TRI-01` | Phase 3 |
| | `FR-TRI-005` (Clinician Confirm) | `SAF-003` | `TriageAssessment` | `POST /triage/assessments/{id}/confirm`| `clinical-escalation`| `TC-TRI-01` | Phase 3 |
| | `FR-TRI-006` (Downgrade Guard) | `SAF-004` | `TriageAssessment` | `POST /triage/assessments/{id}/confirm`| `clinical-escalation`| `TC-TRI-02` | Phase 3 |
| | `FR-TRI-007` (Reassessment Due)| `SAF-005` | `ReassessmentRecord`| `POST /triage/assessments/{id}/confirm`| `reassessment-management`| Unit Test | Phase 3 |
| | `FR-TRI-008` (Reassess Waiting)| `SAF-005` | `ReassessmentRecord`| `POST /triage/reassessments` | `reassessment-management`| E2E Test | Phase 3 |
| | `FR-TRI-009` (Overdue Escalation)| `SAF-005` | `ReassessmentRecord`| `GET /queues/{id}/entries` | `queue-engine` | Integration Test| Phase 4 |
| **Pillar 3: Dynamic Prioritization Queue** | `FR-QUE-001` (Multi-Factor Score)| `NFR-PERF-001` | `QueueEntry` | `GET /queues/{id}/entries` | `queue-engine` | `TC-QUE-01` | Phase 4 |
| | `FR-QUE-002` (Tie-Breaking) | `NFR-REL-005` | `QueueEntry` | `GET /queues/{id}/entries` | `queue-engine` | `TC-QUE-01` | Phase 4 |
| | `FR-QUE-003` (Care Area Filter)| `NFR-SEC-003` | `CareArea`, `Queue`| `GET /queues/{id}/entries` | `department-allocation`| Integration Test| Phase 4 |
| | `FR-QUE-004` (Atomic Calling) | `NFR-REL-005` | `QueueEntry` | `POST /queues/{id}/call-next` | `queue-engine` | `TC-CON-01` | Phase 4 |
| | `FR-QUE-005` (Anti-Starvation)| `NFR-PERF-001` | `QueueEntry` | `GET /queues/{id}/entries` | `queue-engine` | Integration Test| Phase 4 |
| | `FR-QUE-006` (Real-Time Reorder)| `FR-RT-001` | `QueueEntry` | `GET /realtime/stream` | `realtime-events` | E2E Test | Phase 6 |
| | `FR-QUE-007` (Anonymous Token)| `NFR-SEC-006` | `QueueEntry` | `GET /realtime/public-stream` | `queue-engine` | Payload Test | Phase 4 |
| **Pillar 4: Healthcare Staff Interface** | `FR-CON-001` (Consultation Start)| `NFR-PERF-004` | `Consultation` | `POST /consultations/{id}/start`| `consultation-workflow`| E2E Test | Phase 5 |
| | `FR-CON-002` (Clinical Notes) | `NFR-SEC-002` | `Consultation` | `POST /consultations/{id}/notes`| `consultation-workflow`| Integration Test| Phase 5 |
| | `FR-CON-003` (Disposition) | `NFR-REL-005` | `Consultation` | `POST /consultations/{id}/disposition`| `consultation-workflow`| E2E Test | Phase 5 |
| | `FR-CON-004` (Care Area Transfer)| `NFR-REL-005` | `Encounter` | `POST /encounters/{id}/transfer`| `department-allocation`| E2E Test | Phase 5 |
| | `FR-CON-005` (LWBS Departure) | `SAF-008` | `Encounter` | `POST /encounters/{id}/status` | `encounter-management` | Audit Test | Phase 5 |
| **System Governance & Security** | `FR-SEC-001` (RBAC) | `NFR-SEC-003` | `StaffUser` | All Endpoints | `identity-access` | Security Fuzz | Phase 2 |
| | `FR-SEC-003` (Break-Glass) | `SAF-008` | `StaffUser` | `POST /auth/break-glass` | `identity-access` | Security Test | Phase 8 |
| | `FR-SEC-004` (Audit Trail) | `SAF-008` | `AuditEvent` | All Mutations | `audit-compliance` | Hash Chain Test| Phase 8 |
| | `FR-RT-004` (Stale-State Guard)| `NFR-REL-006` | `QueueEntry` | `GET /realtime/stream` | `realtime-events` | Network Test | Phase 6 |
| | `FR-REP-001` (Wait-Time Metrics)| `NFR-PERF-004` | `Encounter` | `GET /analytics/throughput` | `reporting-analytics` | Unit Test | Phase 7 |
