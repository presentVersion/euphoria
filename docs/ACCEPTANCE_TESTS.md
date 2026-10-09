# Formal Acceptance Tests & Verification Matrix

## 1. Acceptance Testing Standards

Every feature in the system is verified against structured acceptance criteria. Tests must pass in an automated CI/CD pipeline prior to any phase release.

---

## 2. Test Cases Specification

### TC-REG-01: Standard Patient Registration & Encounter Creation
- **Target Requirement**: `FR-REG-001`, `FR-REG-002`, `FR-REG-005`
- **Preconditions**: Receptionist user is authenticated; department `ED` is active.
- **Execution Steps**:
  1. POST `/api/v1/patients` with valid first name, last name, DOB, phone, and emergency contact.
  2. POST `/api/v1/encounters` with patient ID, arrival method `WALK_IN`, and chief complaint `"Moderate ankle swelling after twisting on stairs"`.
- **Expected Results**:
  - `Patient` record created with unique MRN; `Encounter` record created with status `WAITING_FOR_TRIAGE`.
  - HTTP `201 Created` returned within $250\text{ ms}$.
  - Patient appears on Triage Nurse worklist within $500\text{ ms}$ via SSE.

---

### TC-REG-02: Emergency Bypass Unidentified Patient Intake
- **Target Requirement**: `FR-REG-003`, `SAF-001`
- **Preconditions**: Any authenticated healthcare staff member.
- **Execution Steps**:
  1. POST `/api/v1/patients/emergency-bypass` with arrival method `AMBULANCE`, chief complaint `"Unresponsive trauma victim"`, and department `ED`.
- **Expected Results**:
  - `Patient` record created with `is_unidentified = true` and temporary token `TEMP-EMERG-XXXX`.
  - Urgency level automatically set to Level 1 (Resuscitation).
  - Immediate red-flag audible and visual alarm dispatched across all Resuscitation Bay terminals.

---

### TC-TRI-01: Deterministic Triage Rule Evaluation
- **Target Requirement**: `FR-TRI-003`, `FR-TRI-004`
- **Preconditions**: Active encounter in `WAITING_FOR_TRIAGE` status.
- **Execution Steps**:
  1. POST `/api/v1/triage/assessments` with Heart Rate $125\text{ bpm}$, Systolic BP $82\text{ mmHg}$, SpO2 $92\%$, Pain Score $9$, Chief Complaint `"Acute crushing substernal chest pain"`.
- **Expected Results**:
  - Returns `suggestedUrgencyLevel: 2` (Emergent).
  - Returns `matchedProtocolRules` containing `"RULE_HEMODYNAMIC_INSTABILITY"` and `"RULE_HIGH_RISK_CHEST_PAIN"`.
  - Recommended reassessment interval set to $15\text{ minutes}$.

---

### TC-TRI-02: Urgency Downgrade Rejection Without Supervisor
- **Target Requirement**: `FR-TRI-006`, `SAF-004`
- **Preconditions**: Triage assessment suggested Urgency Level 2.
- **Execution Steps**:
  1. Triage Nurse attempts to confirm urgency as Level 4 without supervisor token:
     POST `/api/v1/triage/assessments/{id}/confirm` `{ "confirmedUrgencyLevel": 4 }`.
- **Expected Results**:
  - API returns `403 Forbidden: Clinical Urgency Downgrade Requires Supervisor Authorization`.
  - Existing suggested urgency Level 2 remains intact.
  - Security audit record created logging unauthorized downgrade attempt.

---

### TC-QUE-01: Multi-Factor Priority Calculation
- **Target Requirement**: `FR-QUE-001`, `FR-QUE-002`
- **Preconditions**: Two patients in active queue:
  - Patient A (Level 3, waiting 45 minutes, priority score $= 25{,}000 + 45 = 25{,}045$).
  - Patient B arrives (Level 2, waiting 2 minutes, priority score $= 50{,}000 + 2 = 50{,}002$).
- **Execution Steps**:
  1. GET `/api/v1/queues/{id}/entries`.
- **Expected Results**:
  - Patient B ranks position #1; Patient A ranks position #2.
  - Acuity tier dominates waiting time; Patient B is called first.

---

### TC-CON-01: Race-Condition Defense During Simultaneous Patient Calling
- **Target Requirement**: `FR-CON-001`, `FR-QUE-004`, `SAF-005`
- **Preconditions**: One patient `A-104` in `WAITING` status.
- **Execution Steps**:
  1. Send 2 concurrent asynchronous HTTP POST requests to `/api/v1/queues/{id}/call-next`:
     - Request 1 from Doctor 1 (Room 1).
     - Request 2 from Doctor 2 (Room 2).
- **Expected Results**:
  - Request 1 returns HTTP `200 OK` with Patient `A-104` assigned to Room 1.
  - Request 2 returns HTTP `404 Not Found` (Queue Empty) or acquires the subsequent patient without conflict.
  - Exactly one consultation record created for Patient `A-104`.
  - Zero double-calls.
