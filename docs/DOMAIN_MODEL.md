# Domain Model Specification: Smart Patient Queue & Emergency Triage

## 1. Domain Model Overview & Bounded Contexts

The domain model is structured around four primary Bounded Contexts using Domain-Driven Design (DDD):
1. **Patient & Identity Context**: Patient Master Index, Identifiers, Demographic Records, Duplicate Match Records.
2. **Clinical Encounter & Triage Context**: Visits, Presenting Complaints, Physiological Observations, Triage Assessments, Protocol Rulesets, Reassessments.
3. **Queue & Care Area Context**: Departments, Sub-Queues, Dynamic Queue Entries, Prioritization Scores, Queue Assignments.
4. **Consultation & Patient Flow Context**: Consultations, Examination Rooms, Care Area Transfers, Clinical Dispositions.
5. **Security & Governance Context**: Staff Accounts, Roles, Permissions, Sessions, Break-Glass Access Records, Forensic Audit Logs.

---

## 2. Core Domain Entities & Attributes

### 2.1 Facility & Departmental Entities

#### Entity: `Facility`
- **Purpose**: Represents the hospital or clinical care center.
- **Primary Key**: `id` (UUIDv4)
- **Attributes**:
  - `name`: String (Required, e.g., "Metro General Emergency Hospital")
  - `code`: String (Unique, e.g., "MGH-01")
  - `timezone`: String (e.g., "Asia/Kolkata")
  - `is_active`: Boolean (Default: true)
  - `created_at`, `updated_at`: Timestamps

#### Entity: `Department`
- **Purpose**: Represents a distinct clinical division (e.g., Emergency Department, Urgent Care, Pediatrics).
- **Primary Key**: `id` (UUIDv4)
- **Foreign Key**: `facility_id` -> `Facility.id`
- **Attributes**:
  - `name`: String (Required, e.g., "Emergency Department")
  - `code`: String (Unique, e.g., "ED")
  - `type`: Enum (`EMERGENCY`, `URGENT_CARE`, `OUTPATIENT`, `PEDIATRIC`)
  - `max_waiting_capacity`: Integer (Default: 100)
  - `is_active`: Boolean (Default: true)

#### Entity: `CareArea`
- **Purpose**: Represents specific operational zones within a department (e.g., Resuscitation Bay, Acute Care, Minors, Fast-Track).
- **Primary Key**: `id` (UUIDv4)
- **Foreign Key**: `department_id` -> `Department.id`
- **Attributes**:
  - `name`: String (Required, e.g., "Resuscitation Bay (Trauma)")
  - `code`: String (Unique, e.g., "RESUS")
  - `bed_count`: Integer (Default: 4)
  - `is_resuscitation`: Boolean (Default: false)
  - `target_acuity_min`: Integer (1 = highest urgency)
  - `target_acuity_max`: Integer (5 = lowest urgency)

---

### 2.2 Identity & Registration Entities

#### Entity: `Patient`
- **Purpose**: Master index entity for a patient identity across all hospital visits.
- **Primary Key**: `id` (UUIDv4)
- **Attributes**:
  - `mrn`: String (Unique, Medical Record Number, e.g., "MRN-2026-004921")
  - `first_name`: String (Nullable for emergency bypass)
  - `last_name`: String (Nullable for emergency bypass)
  - `date_of_birth`: Date (Nullable if age estimated)
  - `estimated_age_years`: Integer (Nullable)
  - `administrative_sex`: Enum (`MALE`, `FEMALE`, `OTHER`, `UNKNOWN`)
  - `phone_number`: String (Nullable, encrypted at rest)
  - `emergency_contact_name`: String (Nullable)
  - `emergency_contact_phone`: String (Nullable)
  - `is_unidentified`: Boolean (Default: false, true for emergency bypass)
  - `temporary_identifier`: String (Nullable, e.g., "TEMP-EMERG-8102")
  - `created_at`, `updated_at`: Timestamps

#### Entity: `Encounter`
- **Purpose**: Represents a specific hospital visit from arrival to final discharge/admission.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `patient_id` -> `Patient.id`
  - `department_id` -> `Department.id`
  - `registered_by_id` -> `StaffUser.id`
- **Attributes**:
  - `encounter_number`: String (Unique, e.g., "ENC-20261009-0012")
  - `arrival_time`: Timestamp (Required, immutable)
  - `arrival_method`: Enum (`WALK_IN`, `AMBULANCE`, `WHEELCHAIR`, `PUBLIC_TRANSPORT`, `OTHER`)
  - `initial_chief_complaint`: String (Required)
  - `status`: Enum (`REGISTRATION_INCOMPLETE`, `WAITING_FOR_TRIAGE`, `TRIAGED_WAITING`, `IN_CONSULTATION`, `DISCHARGED`, `ADMITTED`, `TRANSFERRED`, `LEFT_WITHOUT_BEING_SEEN`, `DECEASED`)
  - `confirmed_urgency_level`: Integer (1 to 5, Nullable until triaged)
  - `is_emergency_bypass`: Boolean (Default: false)
  - `closed_at`: Timestamp (Nullable)
  - `created_at`, `updated_at`: Timestamps

---

### 2.3 Clinical Triage & Observation Entities

#### Entity: `VitalSignObservation`
- **Purpose**: Physiological measurements captured during triage or subsequent reassessments.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `encounter_id` -> `Encounter.id`
  - `recorded_by_id` -> `StaffUser.id`
- **Attributes**:
  - `heart_rate_bpm`: Integer (Nullable, range: 20–300)
  - `systolic_bp_mmhg`: Integer (Nullable, range: 40–300)
  - `diastolic_bp_mmhg`: Integer (Nullable, range: 20–200)
  - `respiratory_rate_bpm`: Integer (Nullable, range: 4–80)
  - `spo2_percentage`: Decimal(4,1) (Nullable, range: 40.0–100.0)
  - `temperature_celsius`: Decimal(4,1) (Nullable, range: 25.0–45.0)
  - `consciousness_scale`: Enum (`ALERT`, `VERBAL`, `PAIN`, `UNRESPONSIVE`, `GCS`)
  - `gcs_score`: Integer (Nullable, range: 3–15)
  - `pain_score`: Integer (Nullable, range: 0–10)
  - `is_red_flag`: Boolean (Default: false)
  - `measurement_phase`: Enum (`INITIAL_TRIAGE`, `ROUTINE_REASSESSMENT`, `ACUTE_DETERIORATION`)
  - `recorded_at`: Timestamp (Required)

#### Entity: `TriageAssessment`
- **Purpose**: Authoritative clinical assessment assigning an urgency level to an encounter.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `encounter_id` -> `Encounter.id`
  - `assessed_by_id` -> `StaffUser.id`
  - `vital_sign_id` -> `VitalSignObservation.id`
  - `supervisor_id` -> `StaffUser.id` (Nullable, required for downgrades)
- **Attributes**:
  - `protocol_code`: String (e.g., "ESI-v4.2")
  - `suggested_urgency_level`: Integer (1 to 5, computed by software)
  - `confirmed_urgency_level`: Integer (1 to 5, authorized by nurse)
  - `is_clinical_override`: Boolean (Default: false)
  - `override_reason`: String (Nullable, mandatory if override is true)
  - `is_downgrade`: Boolean (Default: false)
  - `downgrade_justification`: String (Nullable)
  - `target_care_area_id`: UUID -> `CareArea.id`
  - `assessed_at`: Timestamp (Required)

#### Entity: `RedFlagAlert`
- **Purpose**: Record of critical life threats detected by the system or triggered manually by staff.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `encounter_id` -> `Encounter.id`
  - `triggered_by_id` -> `StaffUser.id` (Nullable if automated)
  - `acknowledged_by_id` -> `StaffUser.id` (Nullable until acknowledged)
- **Attributes**:
  - `alert_type`: Enum (`PHYSIOLOGICAL_CRISIS`, `UNRESPONSIVE_PATIENT`, `SEVERE_HYPOXIA`, `MANUAL_PANIC_BUTTON`, `CARDIAC_ARREST`)
  - `trigger_reason`: String (Required)
  - `status`: Enum (`ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`)
  - `triggered_at`: Timestamp (Required)
  - `acknowledged_at`: Timestamp (Nullable)

#### Entity: `ReassessmentRecord`
- **Purpose**: Tracks scheduled reassessment deadlines and compliance for waiting patients.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `encounter_id` -> `Encounter.id`
  - `prior_assessment_id` -> `TriageAssessment.id`
- **Attributes**:
  - `scheduled_due_at`: Timestamp (Required)
  - `completed_at`: Timestamp (Nullable)
  - `status`: Enum (`PENDING`, `OVERDUE`, `COMPLETED`, `CANCELLED_DUE_TO_CONSULTATION`)
  - `is_deterioration_noted`: Boolean (Default: false)

---

### 2.4 Queue & Consultation Entities

#### Entity: `Queue`
- **Purpose**: Represents an active waiting queue for a specific Department or Care Area.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Key**: `care_area_id` -> `CareArea.id`
- **Attributes**:
  - `name`: String (Required, e.g., "Acute Care Waiting Queue")
  - `queue_code`: String (Unique, e.g., "Q-ACUTE")
  - `is_active`: Boolean (Default: true)

#### Entity: `QueueEntry`
- **Purpose**: Represents an active patient waiting in a specific queue.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `queue_id` -> `Queue.id`
  - `encounter_id` -> `Encounter.id`
  - `called_by_id` -> `StaffUser.id` (Nullable)
- **Attributes**:
  - `token_number`: String (Required, e.g., "A-104")
  - `priority_score`: Decimal(12,4) (Dynamically computed priority)
  - `urgency_level`: Integer (1 to 5)
  - `status`: Enum (`WAITING`, `REASSESSMENT_OVERDUE`, `CALLED`, `IN_CONSULTATION`, `ON_HOLD`, `COMPLETED`, `LEFT_WITHOUT_BEING_SEEN`, `REASSIGNED`)
  - `entered_queue_at`: Timestamp (Required)
  - `called_at`: Timestamp (Nullable)
  - `consultation_room`: String (Nullable)
  - `row_version`: Integer (Default: 1, used for optimistic concurrency)

#### Entity: `Consultation`
- **Purpose**: Clinical encounter examination between treating clinician and patient.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Keys**:
  - `encounter_id` -> `Encounter.id`
  - `clinician_id` -> `StaffUser.id`
  - `care_area_id` -> `CareArea.id`
- **Attributes**:
  - `room_number`: String (Required, e.g., "Exam Room 3")
  - `started_at`: Timestamp (Required)
  - `completed_at`: Timestamp (Nullable)
  - `clinical_notes`: Text (Encrypted at rest)
  - `working_diagnosis`: String (Nullable)
  - `disposition`: Enum (`DISCHARGED`, `ADMITTED_INPATIENT`, `TRANSFERRED_EXTERNAL`, `LEFT_WITHOUT_BEING_SEEN`, `DECEASED`)
  - `disposition_instructions`: Text (Nullable)
  - `status`: Enum (`CALLED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `CANCELLED`)

---

### 2.5 Security & Audit Entities

#### Entity: `StaffUser`
- **Purpose**: Authenticated clinical and administrative personnel.
- **Primary Key**: `id` (UUIDv4)
- **Foreign Key**: `facility_id` -> `Facility.id`
- **Attributes**:
  - `employee_id`: String (Unique, e.g., "EMP-8021")
  - `email`: String (Unique)
  - `password_hash`: String (Argon2id hash)
  - `first_name`, `last_name`: String
  - `role`: Enum (`RECEPTIONIST`, `TRIAGE_NURSE`, `TREATING_CLINICIAN`, `CHARGE_NURSE`, `DEPARTMENT_MANAGER`, `HOSPITAL_ADMIN`, `SYSTEM_ADMIN`)
  - `is_active`: Boolean (Default: true)
  - `failed_login_attempts`: Integer (Default: 0)
  - `locked_until`: Timestamp (Nullable)

#### Entity: `AuditEvent`
- **Purpose**: Immutable, tamper-evident forensic trail of all system mutations and clinical decisions.
- **Primary Key**: `id` (UUIDv4)
- **Attributes**:
  - `actor_id`: UUID (StaffUser ID, or 'SYSTEM')
  - `action`: String (e.g., `ENCOUNTER_CREATED`, `URGENCY_CONFIRMED`, `OVERRIDE_RECORDED`, `PATIENT_CALLED`, `BREAK_GLASS_INVOKED`)
  - `entity_type`: String (e.g., "Encounter", "TriageAssessment", "QueueEntry")
  - `entity_id`: UUID
  - `previous_state`: JSONB (Nullable)
  - `new_state`: JSONB (Nullable)
  - `justification`: String (Nullable, mandatory for clinical overrides and downgrades)
  - `ip_address`: String
  - `previous_log_hash`: String (Cryptographic SHA-256 chain)
  - `current_log_hash`: String (SHA-256 of payload + previous_log_hash)
  - `created_at`: Timestamp (Required, immutable)

---

## 3. Domain Invariants & Business Constraints

1. **One Active Encounter Invariant**: A patient may have multiple historical encounters, but can never have more than one `ACTIVE` (non-closed) encounter in the hospital at the same time:
   `UNIQUE INDEX idx_patient_single_active_encounter ON encounters (patient_id) WHERE status NOT IN ('DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED');`
2. **One Active Queue Entry Invariant**: An encounter can only have one active entry in any waiting queue at any given moment:
   `UNIQUE INDEX idx_encounter_single_active_queue ON queue_entries (encounter_id) WHERE status IN ('WAITING', 'REASSESSMENT_OVERDUE', 'CALLED', 'IN_CONSULTATION', 'ON_HOLD');`
3. **Emergency Bypass Integrity**: When `is_emergency_bypass = true`, `confirmed_urgency_level` is set to 1 (Resuscitation) by default, and `CareArea` must be flagged as `is_resuscitation = true`.
4. **Zero Silent Downgrade**: If `new_urgency > old_urgency` (lower clinical priority), `supervisor_id` and `downgrade_justification` must be strictly non-null.
