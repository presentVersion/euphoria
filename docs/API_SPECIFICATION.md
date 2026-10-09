# REST API Specification & Endpoint Catalog

## 1. API Architecture & Standards

- **Base URL**: `/api/v1`
- **Transport**: HTTPS (TLS 1.3), JSON payloads (`application/json`), UTF-8 encoded.
- **Authentication**: HTTP-Only Secure Cookie containing rotating JWT session token.
- **Standard Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Heart rate observation exceeds physiologically plausible bounds.",
    "correlationId": "req-89104-a4f2",
    "details": [
      { "field": "heartRateBpm", "issue": "Value must be between 20 and 300 bpm." }
    ]
  }
}
```

---

## 2. Authentication & Session Endpoints (`/api/v1/auth`)

### 2.1 POST `/api/v1/auth/login`
- **Purpose**: Authenticate staff member and establish secure session.
- **Permission**: Public (Rate-limited: 5 attempts per IP per 15 minutes).
- **Request Body**:
```json
{
  "email": "sarah.nurse@hospital.org",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "e4b1a890-410c-4fa2-bf39-21b8705bc012",
      "employeeId": "NURSE-402",
      "firstName": "Sarah",
      "lastName": "Jenkins",
      "role": "TRIAGE_NURSE",
      "facilityId": "f1a2b3c4-1111-2222-3333-444455556666",
      "assignedDepartmentIds": ["d9e8f7a6-0000-1111-2222-333344445555"]
    }
  }
}
```

### 2.2 POST `/api/v1/auth/break-glass`
- **Purpose**: Request emergency elevated cross-department clinical access.
- **Permission**: Authenticated Clinical Staff (`TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`).
- **Request Body**:
```json
{
  "targetEncounterId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "reasonCategory": "RESUSCITATION_SUPPORT",
  "clinicalJustification": "Patient undergoing CPR in trauma bay; urgent chart review required for blood type and allergy history.",
  "passwordConfirmation": "SecurePassword123!"
}
```
- **Response (200 OK)**: Returns elevated session token valid for 2 hours; persists high-priority security audit event.

---

## 3. Patient Registration Endpoints (`/api/v1/patients`)

### 3.1 GET `/api/v1/patients/search`
- **Purpose**: Search patient master index by identifier.
- **Permission**: `patient:search` (`RECEPTIONIST`, `TRIAGE_NURSE`, `DOCTOR`, `CHARGE_NURSE`).
- **Query Parameters**: `?mrn=...&phone=...&name=...&dob=...`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "p1a2b3c4-9999-8888-7777-666655554444",
      "mrn": "MRN-2026-004921",
      "firstName": "Rahul",
      "lastName": "Sharma",
      "dateOfBirth": "1988-04-12",
      "administrativeSex": "MALE",
      "phoneNumber": "+91 98765 43210"
    }
  ]
}
```

### 3.2 POST `/api/v1/patients/emergency-bypass`
- **Purpose**: 1-click creation of unidentified emergency patient and immediate Resuscitation Bay routing.
- **Permission**: `patient:emergency_bypass` (All staff roles).
- **Request Body**:
```json
{
  "arrivalMethod": "AMBULANCE",
  "initialChiefComplaint": "Unresponsive male, severe head trauma, GCS 4",
  "departmentId": "d9e8f7a6-0000-1111-2222-333344445555"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "patientId": "p-temp-uuid",
    "encounterId": "enc-uuid-1",
    "temporaryToken": "TEMP-EMERG-A4F1",
    "urgencyLevel": 1,
    "careArea": "Resuscitation Bay",
    "status": "WAITING_FOR_TRIAGE"
  }
}
```

---

## 4. Triage & Observation Endpoints (`/api/v1/triage`)

### 4.1 POST `/api/v1/triage/assessments`
- **Purpose**: Submit physiological vitals and evaluate protocol urgency score.
- **Permission**: `triage:record_vitals` (`TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`).
- **Request Body**:
```json
{
  "encounterId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chiefComplaint": "Crushing central chest pain radiating to left arm",
  "symptomOnset": "2026-10-09T04:45:00Z",
  "painScore": 9,
  "vitals": {
    "heartRateBpm": 118,
    "systolicBpMmhg": 85,
    "diastolicBpMmhg": 55,
    "respiratoryRateBpm": 26,
    "spo2Percentage": 91.5,
    "temperatureCelsius": 37.1,
    "consciousnessScale": "ALERT"
  },
  "targetCareAreaId": "ca-acute-uuid"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "assessmentId": "triage-eval-uuid",
    "suggestedUrgencyLevel": 2,
    "matchedProtocolRules": [
      "RULE_HEMODYNAMIC_INSTABILITY: Systolic BP < 90 mmHg",
      "RULE_HIGH_RISK_CHEST_PAIN: Acute ischemic pain radiating to arm"
    ],
    "isRedFlag": false,
    "recommendedReassessmentMinutes": 15
  }
}
```

### 4.2 POST `/api/v1/triage/assessments/{id}/confirm`
- **Purpose**: Clinician authorizes the suggested urgency and commits the encounter to the queue.
- **Permission**: `triage:confirm_urgency` (`TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`).
- **Request Body**:
```json
{
  "confirmedUrgencyLevel": 2,
  "isClinicalOverride": false,
  "overrideReason": null
}
```
- **Response (200 OK)**: Commits to database, assigns token `AC-104`, inserts into `queue_entries`, and broadcasts SSE `TRIAGE_CONFIRMED`.

---

## 5. Queue & Consultation Endpoints (`/api/v1/queues`)

### 5.1 GET `/api/v1/queues/{id}/entries`
- **Purpose**: Fetch active prioritized roster for a care area queue.
- **Permission**: `queue:view_department`.
- **Response (200 OK)**: Returns prioritized array of active entries sorted by `priority_score DESC`.

### 5.2 POST `/api/v1/queues/{id}/call-next`
- **Purpose**: Atomically call next waiting patient to examination room (`FOR UPDATE SKIP LOCKED`).
- **Permission**: `queue:call_patient` (`TREATING_CLINICIAN`, `CHARGE_NURSE`).
- **Request Body**:
```json
{
  "roomNumber": "Consultation Room 3"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "queueEntryId": "qe-uuid-1",
    "tokenNumber": "AC-104",
    "patientName": "Rahul S****",
    "urgencyLevel": 2,
    "roomNumber": "Consultation Room 3",
    "calledAt": "2026-10-09T05:15:00Z"
  }
}
```

### 5.3 POST `/api/v1/consultations/{id}/disposition`
- **Purpose**: Complete consultation and submit medical disposition.
- **Permission**: `consultation:disposition` (`TREATING_CLINICIAN`).
- **Request Body**:
```json
{
  "disposition": "DISCHARGED",
  "workingDiagnosis": "Non-cardiac chest wall muscular spasm",
  "clinicalNotes": "Serial ECGs normal; cardiac enzymes negative. Patient stabilized and discharged with oral analgesics.",
  "dispositionInstructions": "Return immediately if chest pain recurs or shortness of breath develops."
}
```
- **Response (200 OK)**: Closes consultation, transitions queue entry to `COMPLETED`, archives encounter, and frees room.
