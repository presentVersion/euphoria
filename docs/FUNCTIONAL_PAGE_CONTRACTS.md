# Functional Page & Screen Contracts

## 1. Scope & Design-Independence Contract

This document specifies the **functional behavior, data dependencies, permissions, and state requirements** for each application screen.
In accordance with prompt instructions:
- **NO visual layouts, color themes, or design choices are prescribed here**.
- These functional contracts serve as stable data hooks designed to integrate seamlessly with the custom UI components (from React Bits, 21st.dev, etc.) supplied by the user in Phase 9.

---

## 2. Page & Screen Contracts Catalog

### Screen 1: Staff Authentication (`/login`)
- **Purpose**: Authenticate clinical and administrative staff.
- **Authorized Roles**: Public / Unauthenticated.
- **Required Inputs**: `email` (string), `password` (string).
- **Available Operations**: Submit Login, Password Reset Request.
- **API Dependencies**: `POST /api/v1/auth/login`.
- **States Handled**: Idle, Submitting, Authentication Error (e.g., invalid credentials), Account Locked (5 failed attempts).

---

### Screen 2: Patient Search & Master Index (`/patients/search`)
- **Purpose**: Fast retrieval of existing hospital records prior to intake.
- **Authorized Roles**: `RECEPTIONIST`, `TRIAGE_NURSE`, `DOCTOR`, `CHARGE_NURSE`.
- **Required Inputs**: Search query string (MRN, National ID, Phone, or Name + DOB).
- **Available Operations**: Execute Search, Select Patient to Open Encounter, Trigger New Registration.
- **API Dependencies**: `GET /api/v1/patients/search`.
- **States Handled**: Initial Blank, Searching/Loading, Results List, Zero Matches Found (prompts "Register as New Patient").

---

### Screen 3: Patient Registration Desk (`/registration`)
- **Purpose**: Capture demographics and open visit encounter.
- **Authorized Roles**: `RECEPTIONIST`, `CHARGE_NURSE`.
- **Required Inputs**: First Name, Last Name, DOB or Estimated Age, Sex, Phone, Arrival Method, Chief Complaint.
- **Available Operations**: Submit Registration, Trigger 1-Click **Emergency Bypass**, Resolve Duplicate Record.
- **API Dependencies**: `POST /api/v1/patients`, `POST /api/v1/encounters`, `POST /api/v1/patients/emergency-bypass`.
- **States Handled**: Empty Form, Validating, Duplicate Match Modal, Submission Success (redirects or clears form).

---

### Screen 4: Clinical Triage Worklist (`/triage/worklist`)
- **Purpose**: Triage Nurse view of registered patients awaiting clinical acuity evaluation.
- **Authorized Roles**: `TRIAGE_NURSE`, `CHARGE_NURSE`.
- **Data Displayed**: Waiting patients ordered by arrival time; elapsed wait minutes; initial chief complaint; arrival method badge.
- **Available Operations**: Call Patient to Triage Bay, Open Triage Assessment Form.
- **API Dependencies**: `GET /api/v1/encounters?status=WAITING_FOR_TRIAGE`.
- **Real-Time Events**: Refreshes automatically on `PATIENT_REGISTERED` and `EMERGENCY_BYPASS_INVOKED`.

---

### Screen 5: Patient Triage Assessment Console (`/triage/assess/{encounterId}`)
- **Purpose**: Record vital signs, review protocol recommendation, confirm or override urgency.
- **Authorized Roles**: `TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`.
- **Required Inputs**: Vitals (HR, BP, RR, SpO2, Temp, GCS/AVPU), Pain Score, Symptom Onset, Target Care Area.
- **Available Operations**: Calculate Suggestion, Confirm Urgency, Clinical Override, Emergency Red-Flag Trigger.
- **API Dependencies**: `POST /api/v1/triage/assessments`, `POST /api/v1/triage/assessments/{id}/confirm`.
- **States Handled**: Data Entry, Range Validation Warning, Red-Flag Modal Alert, Supervisor Co-Signature Modal (if downgrade).

---

### Screen 6: Dynamic Department Queue Board (`/queue`)
- **Purpose**: Primary clinical worklist displaying real-time prioritized patient queue for a department.
- **Authorized Roles**: `TREATING_CLINICIAN`, `TRIAGE_NURSE`, `CHARGE_NURSE`, `DEPARTMENT_MANAGER`.
- **Data Displayed**: Prioritized queue cards displaying anonymous token, confirmed urgency badge, elapsed wait time, reassessment countdown timer, care area, and red-flag warning banners.
- **Available Operations**: Filter by Care Area, Call Next Patient, Place on Hold, Initiate Transfer.
- **API Dependencies**: `GET /api/v1/queues/{id}/entries`, `POST /api/v1/queues/{id}/call-next`.
- **Real-Time Events**: Live reordering via SSE on `QUEUE_REORDERED`, `PATIENT_CALLED`, `REASSESSMENT_OVERDUE`.
- **Resilience State**: Displays persistent yellow "Reconnecting — Data May Be Stale" banner if SSE drops $> 5\text{s}$.

---

### Screen 7: Doctor Consultation Station (`/consultation/{consultationId}`)
- **Purpose**: Treating clinician examination suite for conducting consultations and recording dispositions.
- **Authorized Roles**: `TREATING_CLINICIAN`, `CHARGE_NURSE`.
- **Data Displayed**: Patient demographic summary, initial triage vitals, reassessment history, door-to-doctor elapsed timer.
- **Required Inputs**: Clinical Notes, Working Diagnosis, Final Disposition (Discharged, Admitted, Transferred, LWBS).
- **Available Operations**: Start Consultation, Place on Diagnostic Hold, Resume Consultation, Finalize Disposition.
- **API Dependencies**: `POST /api/v1/consultations/{id}/disposition`.

---

### Screen 8: Reassessment Management Roster (`/triage/reassessment`)
- **Purpose**: Charge Nurse and Triage view tracking waiting patients due or overdue for secondary checks.
- **Authorized Roles**: `TRIAGE_NURSE`, `CHARGE_NURSE`.
- **Data Displayed**: Patients grouped by reassessment status (Due within 10m, Overdue, Completed), minutes overdue countdown.
- **Available Operations**: Call Patient for Reassessment, Log Secondary Vitals, Reclassify Urgency.
- **API Dependencies**: `GET /api/v1/triage/reassessments/pending`.

---

### Screen 9: Public Waiting Room Display (`/public/display/{deptId}`)
- **Purpose**: Anonymous public-facing display for hospital waiting room TV monitors.
- **Authorized Roles**: Public / Anonymous.
- **Data Displayed**: Tokens currently called with assigned room numbers (e.g., `AC-104 -> Room 3`), estimated wait time bands for the department.
- **Privacy Enforcement**: Strips 100% of patient names, medical complaints, and diagnosis data.
- **API Dependencies**: `GET /api/v1/realtime/public-stream?dept_id=...`.

---

### Screen 10: Operational Analytics & Audit Ledger (`/admin/analytics` & `/admin/audit`)
- **Purpose**: Department management metrics and forensic compliance review.
- **Authorized Roles**: `DEPARTMENT_MANAGER`, `HOSPITAL_ADMIN`.
- **Data Displayed**: Door-to-doctor medians, LWBS trend line, triage compliance percentage, immutable forensic audit table with SHA-256 chain verification.
- **API Dependencies**: `GET /api/v1/analytics/throughput`, `GET /api/v1/audit/logs`.
