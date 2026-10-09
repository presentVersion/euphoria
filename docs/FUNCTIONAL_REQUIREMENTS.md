# Functional Requirements Catalog: Smart Patient Queue & Emergency Triage

This catalog specifies all functional requirements for the Smart Patient Queue & Emergency Triage System. Every requirement is assigned a permanent identifier, priority level, rationale, dependency chain, and testable acceptance criteria.

---

## 1. Patient Registration & Identity (`FR-REG`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-REG-001** | Patient Search & Identification | System shall allow registration staff to query existing patient records using National ID, Hospital MRN, Full Name + DOB, or Phone Number. | P0 | Patient Registry | Integration Test | Returns matching records within 200ms; displays masked PII until authorized staff opens record. |
| **FR-REG-002** | Standard Patient Registration | System shall capture patient demographic details: Full Name, Date of Birth / Estimated Age, Administrative Sex, Contact Details, Emergency Contact, and Arrival Method (Walk-in, Ambulance, Wheelchair). | P0 | Registration Workflow | E2E Test | Creates persistent Patient entity with unique UUID; validates mandatory name and age/DOB fields. |
| **FR-REG-003** | Emergency Bypass Registration | System shall provide a 1-click Emergency Bypass action that generates a temporary patient record (`TEMP-EMERG-XXXX`), sets status to `EMERGENCY_UNIDENTIFIED`, and immediately places the patient into Resuscitation Triage. | P0 | Registration Workflow | Clinical Safety Test | Bypasses all demographic form requirements; executes in < 1 second; alerts Resuscitation Bay staff. |
| **FR-REG-004** | Duplicate Detection & Flagging | System shall analyze new patient submissions against existing records based on composite match keys (e.g., phonetic name + birth year). If similarity > 85%, flag as `POTENTIAL_DUPLICATE`. | P1 | Patient Registry | Unit / Integration Test | Prevents automatic merges; prompts registration staff with side-by-side comparison modal requiring supervisor sign-off to merge. |
| **FR-REG-005** | Encounter Creation | System shall generate a distinct Encounter record for every hospital visit, linking the Patient UUID, arrival timestamp, registration staff UUID, initial presenting complaint, and target Department. | P0 | Encounter Management | Integration Test | A single patient can have multiple historical encounters; only one encounter can be in an `ACTIVE` queue status simultaneously. |
| **FR-REG-006** | Chief Complaint Capture | System shall capture the patient's primary presenting complaint as free text and categorized symptom classification (e.g., Cardiovascular, Respiratory, Neurological, Trauma). | P0 | Clinical Observations | Unit Test | Rejects empty chief complaints; supports auto-suggest classification without restricting free-text nuances. |
| **FR-REG-007** | Unknown / Incomplete Field Handling | System shall allow explicit marking of demographic fields as `UNKNOWN`, `UNABLE_TO_PROVIDE`, or `REFUSED` without preventing encounter creation. | P0 | Registration Workflow | E2E Test | Distinguishes between accidental empty input and deliberate `UNKNOWN` selection; logs reason for incomplete data. |
| **FR-REG-008** | Registration Error Correction | System shall allow authorized registration staff to correct administrative mistakes (e.g., misspelled name, wrong birth date) within 2 hours of encounter creation. | P1 | Patient Registry | Audit Test | All modifications record previous value, new value, staff ID, and timestamp in the immutable audit log. |

---

## 2. Clinical Triage & Urgency Assessment (`FR-TRI`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-TRI-001** | Structured Symptom & History Intake | System shall record symptom onset timestamp, duration, pain score (0–10), allergy history, and relevant medical history (e.g., Diabetes, Hypertension, Pregnancy). | P0 | Clinical Observations | E2E Test | Enforces numerical bounds on pain score (0–10); timestamps symptom onset; flags severe pain (>= 8) for immediate assessment. |
| **FR-TRI-002** | Vital Signs Observation Recording | System shall record physiological vitals: Heart Rate (bpm), Blood Pressure (Systolic/Diastolic mmHg), Respiratory Rate (bpm), SpO2 (%), Temperature (°C/°F), and Consciousness Level (AVPU / GCS 3–15). | P0 | Clinical Observations | Unit Test | Rejects impossible values (e.g., HR > 300, SpO2 > 100%); flags missing vitals explicitly as `NOT_MEASURED`; never defaults to normal values. |
| **FR-TRI-003** | Immediate Red-Flag Evaluation | System shall automatically evaluate observations against protocol red flags (e.g., SpO2 < 90%, Systolic BP < 80, GCS < 9, severe respiratory distress). | P0 | Triage Engine | Clinical Safety Test | Triggers immediate Level 1 / Resuscitation alert across all department screens within 500ms of observation submission. |
| **FR-TRI-004** | Protocol-Driven Suggested Urgency | System shall execute the active hospital-approved triage protocol ruleset (e.g., ESI Level 1–5 or MTS Red/Orange/Yellow/Green/Blue) to calculate a Suggested Urgency Level. | P0 | Triage Engine | Unit Test | Produces deterministic output for identical inputs; displays matched protocol rules and clinical justification to the nurse. |
| **FR-TRI-005** | Clinician Confirmation & Override | System shall require the Triage Nurse to confirm the suggested urgency or provide a Clinical Override. Overrides must include a mandatory clinical rationale. | P0 | Clinical Escalation | E2E Test | Software suggestion never becomes active urgency without authenticated clinician confirmation. |
| **FR-TRI-006** | Urgency Downgrade Governance | If a clinician attempts to downgrade an urgency level suggested by the protocol or prior triage, the system shall require Charge Nurse / Supervisor co-signature. | P1 | Clinical Governance | Security Test | Rejects downgrade submission without supervisor credentials; logs justification and dual-signature audit record. |
| **FR-TRI-007** | Reassessment Due Time Scheduling | System shall automatically compute the next clinical reassessment deadline based on confirmed urgency (Level 2: 15 min; Level 3: 30 min; Level 4: 60 min; Level 5: 120 min; configurable). | P0 | Reassessment Management | Integration Test | Generates `ReassessmentRecord` with `due_at` timestamp; updates queue countdown timer. |
| **FR-TRI-008** | Waiting Patient Reassessment | System shall allow triage staff to record secondary vital signs and clinical changes for waiting patients, re-evaluating urgency and logging trend graphs. | P0 | Reassessment Management | E2E Test | Creates new versioned assessment record; preserves previous assessment history; updates queue priority if acuity changed. |
| **FR-TRI-009** | Reassessment Overdue Escalation | If a waiting patient breaches their reassessment deadline by > 5 minutes, system shall transition state to `REASSESSMENT_OVERDUE`, trigger a visual alert, and elevate queue position. | P0 | Reassessment Management | Integration Test | Visual blinking banner displayed on Charge Nurse board; priority score boosted until reassessment is completed. |
| **FR-TRI-010** | Triage Protocol Versioning | System shall version all triage protocol definitions (e.g., `ESI-v4.2`, `DEMO-PROTOCOL-v1`). Encounters must reference the exact protocol version active during triage. | P1 | Triage Protocol Mgmt | Integration Test | Protocol updates do not retroactively alter prior triage determinations; active protocol changes require medical director approval. |

---

## 3. Dynamic Queue Engine (`FR-QUE`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-QUE-001** | Multi-Factor Priority Scoring | System shall compute dynamic queue priority score using the formula: Score = (Urgency Weight * 10000) + (Red Flag * 50000) + (Overdue Reassessment * 20000) + Waiting Minutes. | P0 | Queue Engine | Unit Test | Level 1 patients always score higher than Level 2; deteriorating patients jump ahead of stable patients within the same tier. |
| **FR-QUE-002** | Deterministic Tie-Breaking | In the event of identical priority scores within the same urgency tier, queue shall sort strictly by earliest arrival timestamp, with UUID as deterministic secondary tie-breaker. | P0 | Queue Engine | Unit Test | Guarantees stable, reproducible queue ordering across multiple simultaneous read queries. |
| **FR-QUE-003** | Department & Care Area Filtering | System shall maintain distinct sub-queues partitioned by Care Area (Resuscitation Bay, Acute Care, Urgent Care, Pediatrics, Fast-Track). | P0 | Department Allocation | Integration Test | Clinicians only view patients routed to their authorized care areas; supervisor view displays consolidated hospital queue. |
| **FR-QUE-004** | Atomic Patient Calling | System shall provide atomic "Call Patient" action that transitions queue entry from `WAITING` to `CALLED`, assigning calling clinician ID and consultation room. | P0 | Queue Engine | Concurrency Test | Uses database row locking (`FOR UPDATE SKIP LOCKED`); second concurrent call attempt receives `409 Conflict` with clear error message. |
| **FR-QUE-005** | Waiting Room Anti-Starvation | System shall flag lower-urgency patients (Level 4/5) who have waited > 200% of the department's target wait threshold, prompting supervisor review. | P1 | Queue Engine | Integration Test | Generates `STARVATION_WARNING` event; alerts charge nurse to consider Fast-Track reassignment without altering clinical acuity. |
| **FR-QUE-006** | Real-Time Queue Reordering | System shall recalculate queue order and broadcast updated positions via SSE/WebSocket whenever an assessment, escalation, call, or departure occurs. | P0 | Real-Time Delivery | Integration Test | All connected staff clients reflect updated queue order within 500ms of state change. |
| **FR-QUE-007** | Queue Token Generation | System shall generate a clean, anonymous queue token (e.g., `RES-01`, `AC-104`, `FT-205`) for display on public waiting room boards and printed patient slips. | P0 | Queue Engine | Unit Test | Tokens are sequential per department per calendar day; contains no patient names or medical information. |
| **FR-QUE-008** | Patient Temporary Hold / Unavailable | System shall allow staff to place a called patient on `TEMPORARILY_UNAVAILABLE` (e.g., patient in restroom or undergoing diagnostic X-ray) for a configurable time window. | P1 | Queue Engine | E2E Test | Patient is held in side-queue; auto-alerts staff when hold timer expires; does not lose prior queue priority upon return. |

---

## 4. Consultation & Patient Flow (`FR-CON`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-CON-001** | Consultation Start & Room Intake | System shall record when the called patient enters the examination room, transitioning consultation state to `IN_PROGRESS` and timestamping consultation start. | P0 | Consultation Workflow | Integration Test | Door-to-doctor elapsed time is finalized; examination room is marked occupied in the Department Capacity record. |
| **FR-CON-002** | Clinician Handover & Consultation Notes | System shall allow the treating clinician to record initial clinical findings, working diagnosis, and requested orders (Lab/Radiology). | P0 | Consultation Workflow | Integration Test | Saves encounter documentation with clinician signature; accessible only to authorized healthcare staff. |
| **FR-CON-003** | Patient Disposition Recording | System shall require the clinician to select a formal disposition upon completing consultation: `DISCHARGED`, `ADMITTED_INPATIENT`, `TRANSFERRED_EXTERNAL`, `DECEASED`, or `LEFT_WITHOUT_BEING_SEEN`. | P0 | Consultation Workflow | E2E Test | Rejects encounter closure without valid disposition; generates disposition summary timestamped by clinician. |
| **FR-CON-004** | Care Area & Department Transfer | System shall support cross-department transfer (e.g., Urgent Care to Acute Bay) with formal handoff notes and receiving care-area acceptance. | P1 | Department Allocation | E2E Test | Patient appears in receiving queue as `TRANSFER_PENDING`; updates active care area only after receiving nurse confirms handoff. |
| **FR-CON-005** | Left Without Being Seen (LWBS) | If a patient departs prior to consultation, staff can mark the encounter `LEFT_WITHOUT_BEING_SEEN`, removing them from the active queue. | P0 | Consultation Workflow | Audit Test | Captures staff notes, departure time, and triggers automated risk audit if patient was Level 1, 2, or 3. |
| **FR-CON-006** | Encounter Closure & Archive | System shall close the encounter once all disposition steps are completed, archiving the record and freeing all room and staff allocations. | P0 | Encounter Management | Integration Test | Encounter transitions to `CLOSED`; record becomes read-only; queue entry is finalized. |

---

## 5. Security, Identity & Access Control (`FR-SEC`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-SEC-001** | Role-Based Access Control (RBAC) | System shall enforce distinct roles: `RECEPTIONIST`, `TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`, `DEPARTMENT_MANAGER`, `HOSPITAL_ADMIN`, and `SYSTEM_ADMIN`. | P0 | Access Control | Security Test | API endpoints verify user role claims; unauthorized requests return `403 Forbidden` with audit log entry. |
| **FR-SEC-002** | Secure Session & Token Management | System shall use HTTP-only, Secure, SameSite=Strict cookies with rotating JWT session tokens expiring after 15 minutes of inactivity. | P0 | Access Control | Security Test | Tokens are invalidated on logout; refresh tokens stored securely with replay detection. |
| **FR-SEC-003** | Break-Glass Emergency Access | System shall allow authorized clinical staff to invoke "Break-Glass" elevated access to view cross-department patient records in severe trauma surges. | P1 | Access Control | Security Test | Requires mandatory rationale input; notifies Hospital Security and Charge Nurse; logs high-priority audit record. |
| **FR-SEC-004** | Immutable Audit Trail Logging | System shall record every read of patient PHI, state change, clinical override, and administrative action in an append-only audit table with cryptographic checksums. | P0 | Audit Logging | Integration Test | Audit records cannot be deleted or updated via API; tamper-detection hash verifies log integrity. |
| **FR-SEC-005** | Input Validation & Injection Defense | System shall strictly sanitize and validate all API payloads using Zod schemas, rejecting unwhitelisted fields and SQL/XSS injection attempts. | P0 | API Gateway | Penetration Test | Fuzz testing with SQLi, XSS, and prototype pollution payloads results in clean 400 validation rejections. |

---

## 6. Real-Time Delivery & Notifications (`FR-RT`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-RT-001** | Server-Sent Events (SSE) Channel | System shall maintain persistent SSE connections for active browser terminals, broadcasting queue reordering and clinical alarm events. | P0 | Real-Time Delivery | Integration Test | Latency from server event publication to client DOM dispatch < 200ms; auto-reconnects with exponential backoff. |
| **FR-RT-002** | Selective Channel Scoping | Real-time events shall be scoped by facility and department so terminals only receive updates relevant to their care area. | P0 | Real-Time Delivery | Security Test | Pediatric terminals do not receive adult acute queue events; public boards receive sanitized token payloads only. |
| **FR-RT-003** | Audible & Visual Critical Alarms | System shall emit distinct visual flashing banners and continuous audio alert pulses for Level 1 Red Flags and Overdue Reassessments until acknowledged. | P0 | Notification Center | E2E Test | Audio conforms to standard medical frequency patterns; requires explicit staff "Acknowledge" click to silence. |
| **FR-RT-004** | Client Connection Health & Stale State | If a client loses SSE connection for > 5 seconds, system shall display a prominent yellow "Reconnecting — Queue May Be Stale" warning and disable action buttons. | P0 | Real-Time Delivery | E2E Test | Prevents clinicians from calling patients against a stale queue snapshot; resynchronizes authoritative state upon reconnect. |

---

## 7. Reporting & Operational Analytics (`FR-REP`)

| ID | Name | Description | Priority | Responsible Subsystem | Verification Method | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-REP-001** | Door-to-Triage & Door-to-Doctor Time | System shall calculate rolling median and 90th percentile wait times from patient arrival to triage start, and arrival to doctor consultation start. | P1 | Operational Analytics | Unit Test | Metrics aggregated hourly and daily; excludes administrative data entry anomalies; respects privacy masking. |
| **FR-REP-002** | Left Without Being Seen (LWBS) Rate | System shall track the proportion of registered patients who depart prior to medical evaluation, broken down by initial triage urgency tier. | P1 | Operational Analytics | Integration Test | Generates monthly trend line; flags safety incidents if high-acuity patients leave without being seen. |
| **FR-REP-003** | Reassessment Protocol Compliance | System shall track the percentage of waiting patients reassessed within their protocol-mandated due time windows. | P1 | Operational Analytics | Integration Test | Generates compliance scorecard for charge nurses; identifies shifts with severe reassessment backlogs. |
| **FR-REP-004** | Department Throughput & Bottleneck Heatmap | System shall compute patient volumes across registration, triage waiting, consultation, and disposition to identify operational bottlenecks. | P2 | Operational Analytics | E2E Test | Visualizes care area congestion; alerts department manager when waiting room capacity exceeds 90%. |
