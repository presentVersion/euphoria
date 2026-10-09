# Project Scope: Smart Patient Queue & Emergency Triage

## 1. Scope Definition & Operating Boundaries

This document formalizes the functional and architectural boundaries of the **Smart Patient Queue & Emergency Triage** system. To maintain high architectural fidelity without runaway complexity during prototype and hackathon delivery, explicit distinctions are established between **Core MVP (Hackathon)**, **Production Expansion**, and **Strictly Out-of-Scope** features.

---

## 2. In-Scope: Core MVP / Hackathon Release (Phase 1–10)

The core release implements a fully functioning, reliable, multi-station web application addressing all mandatory problem statement criteria:

### 2.1 Patient Registration & Identity Management
- Search existing patient database by Medical Record Number (MRN), National ID, or Phone Number.
- Standard registration flow: Name, age/DOB, administrative sex, emergency contact, arrival method.
- **Emergency Bypass**: Rapid 1-click registration for unidentified or unconscious patients using synthetic temporary identifiers (`TEMP-XXXX`).
- Duplicate detection engine flagging matching names + birthdates for administrative review.
- Encounter creation capturing arrival time, registration staff ID, and care department.

### 2.2 Clinical Triage Decision Support
- Structured observation capture: Presenting complaint, symptom onset/duration, pain score (0–10).
- Vital signs recording: Heart Rate, Blood Pressure (Systolic/Diastolic), Respiratory Rate, SpO2, Temperature, Glasgow Coma Scale (GCS) or AVPU score.
- **3-Layer Triage Architecture**:
  - Layer 1: Hospital-Approved Protocol Rules (e.g., 5-level Emergency Severity Index / Manchester Triage System rulesets).
  - Layer 2: Deterministic Triage Engine calculating a suggested urgency score and identifying red flags.
  - Layer 3: Authoritative Clinician Decision where licensed staff confirms, modifies, or overrides the score.
- Immediate Red-Flag detection for life threats (e.g., unresponsiveness, severe hypoxia, hypertensive crisis).
- Reassessment tracking with automated due/overdue countdown clocks.

### 2.3 Dynamic Queue Engine
- Real-time prioritized queue calculation using multi-factor deterministic scoring:
  $$\text{Priority Score} = (\text{Urgency Weight} \times 10{,}000) + (\text{Red Flag Flag} \times 50{,}000) + (\text{Overdue Reassessment Flag} \times 20{,}000) + \text{Waiting Minutes}$$
- Stable deterministic tie-breaking via arrival timestamp and encounter ID.
- Department-specific filtering (Emergency, Pediatric, Adult Acute, Fast-Track).
- Atomic concurrency protection preventing two clinicians from simultaneously calling the same patient (`FOR UPDATE SKIP LOCKED`).
- Queue status lifecycle: `WAITING_FOR_TRIAGE`, `TRIAGED_WAITING`, `REASSESSMENT_OVERDUE`, `CALLED`, `IN_CONSULTATION`, `COMPLETED`, `LEFT_WITHOUT_BEING_SEEN`.

### 2.4 Staff Consultation & Patient Flow Management
- Physician worklist displaying prioritized queue with visible acuity badges and wait times.
- Consultation management: Call Patient, Start Consultation, Pause/Resume, and Complete.
- Encounter disposition recording: Discharge with instructions, Inpatient Admission, External Transfer, Left Without Being Seen.
- Cross-department patient transfers with formal sending/receiving handoff records.

### 2.5 Real-Time Communication & Observability
- Server-Sent Events (SSE) or WebSocket push notifications for instantaneous queue reordering and escalation alerts across connected browser terminals.
- In-application notification center for clinical alerts (red flags, overdue reassessments).
- Full immutable audit logging for all patient registrations, triage assessments, clinical overrides, and queue transitions.

---

## 3. Recommended Production Extensions (Post-MVP)

These features represent high-value operational enhancements designed for enterprise deployment following successful core workflow stabilization:

1. **Predictive Waiting Time Machine Learning**: Dynamic arrival curve forecasting based on historical time-of-day, day-of-week, weather, and acute trauma surge data.
2. **Patient-Facing Mobile Queue Tracking**: Token-based, zero-login patient portal allowing patients to track their anonymous queue position and estimated arrival band from their smartphone without viewing others' data.
3. **SMS / WhatsApp Gateway Integration**: Automated notifications when a patient's turn is within 2 positions.
4. **HL7 v2.x & FHIR R4 Integration**: Bidirectional synchronization with hospital enterprise EHR systems (Epic, Cerner, OpenMRS).
5. **Hardware Kiosk Integration**: Self-service registration kiosks and electronic door displays for consultation suites.

---

## 4. Strictly Out-of-Scope (Not Permitted)

To prevent clinical liabilities, regulatory violations, and scope creep, the following capabilities are explicitly forbidden from the system design:

| Excluded Capability | Rationale for Exclusion |
| :--- | :--- |
| **Autonomous AI Clinical Diagnosis** | The system is an operational triage workflow tool, not a diagnostic medical device (SaMD). The software must never propose differential medical diagnoses or prescribe medications. |
| **Autonomous Urgency Downgrades** | The software engine must never automatically lower a patient's urgency level without an explicit, authenticated clinical assessment and override signature from authorized staff. |
| **Full Electronic Health Record (EHR)** | Complete inpatient clinical documentation, pharmacy order entry, nursing kardex, and billing systems are external responsibilities. |
| **Direct Payment & Billing Processing** | Financial transactions during acute emergency intake violate medical emergency triage ethics and distort priority ordering. |
| **Unauthenticated Public Queue Displays** | Public displays must never display full patient names, clinical complaints, or medical notes. Only sanitized tokens (`A-101`) may be broadcast. |

---

## 5. Scope Transition Gate Criteria (Hackathon to Production)

```
[Phase 0: Blueprint & Specification] ──► APPROVED
         │
         ▼
[Phases 1-8: Core Architecture & Engine] ──► FUNCTIONAL
         │
         ▼
[Phase 9: Custom UI Integration (React Bits/21st.dev)] ──► DELIVERED
         │
         ▼
[Phase 10: Validation & Acceptance Testing] ──► COMPLETE (Mock / Synthetic Data)
         │
         ├──────────────────────────────────────────────┐
         ▼                                              ▼
[Hackathon Demonstration Baseline]         [Production Enterprise Gate]
- Synthetic patient scenarios              - Formal Clinical Protocol Approval by IRB/CMSO
- In-memory / local relational DB          - Indian DPDP / HIPAA Compliance Review
- Simulated real-time cluster              - Hardware HA / Disaster Recovery Drill
                                           - Penetration Testing & Vulnerability Sign-off
```
