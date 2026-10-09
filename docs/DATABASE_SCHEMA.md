# Database Schema Specification (PostgreSQL 16 DDL)

## 1. Schema Architecture & Design Conventions

The database schema is designed for **PostgreSQL 16**.
- **Keys**: All primary keys are `UUID` generated via `gen_random_uuid()`.
- **Timestamps**: All timestamps use `TIMESTAMPTZ` stored in UTC.
- **Constraints**: Relational integrity is strictly enforced via Foreign Keys (`ON DELETE RESTRICT`) to prevent accidental deletion of clinical records.
- **Concurrency**: Partial unique indexes prevent concurrent duplicate encounters and conflicting queue entries.
- **Audit Immutability**: Revocation of `UPDATE` and `DELETE` on the `audit_logs` table guarantees forensic tamper resistance.

---

## 2. PostgreSQL DDL Specification

```sql
-- Enable cryptographic extension for UUID and SHA-256 generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FACILITY & ORGANIZATIONAL TABLES
-- ============================================================================

CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE department_type_enum AS ENUM ('EMERGENCY', 'URGENT_CARE', 'OUTPATIENT', 'PEDIATRIC');

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type department_type_enum NOT NULL DEFAULT 'EMERGENCY',
    max_waiting_capacity INTEGER NOT NULL DEFAULT 100 CHECK (max_waiting_capacity > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_facility_dept_code UNIQUE (facility_id, code)
);

CREATE TABLE care_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bed_count INTEGER NOT NULL DEFAULT 4 CHECK (bed_count >= 0),
    is_resuscitation BOOLEAN NOT NULL DEFAULT FALSE,
    target_acuity_min INTEGER NOT NULL DEFAULT 1 CHECK (target_acuity_min BETWEEN 1 AND 5),
    target_acuity_max INTEGER NOT NULL DEFAULT 5 CHECK (target_acuity_max BETWEEN 1 AND 5),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_care_area_code UNIQUE (department_id, code),
    CONSTRAINT chk_care_area_acuity_order CHECK (target_acuity_min <= target_acuity_max)
);

-- ============================================================================
-- 2. USERS, ROLES & AUTHENTICATION
-- ============================================================================

CREATE TYPE staff_role_enum AS ENUM (
    'RECEPTIONIST',
    'TRIAGE_NURSE',
    'TREATING_CLINICIAN',
    'CHARGE_NURSE',
    'DEPARTMENT_MANAGER',
    'HOSPITAL_ADMIN',
    'SYSTEM_ADMIN'
);

CREATE TABLE staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role staff_role_enum NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_department_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_user_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_staff_dept UNIQUE (staff_user_id, department_id)
);

-- ============================================================================
-- 3. PATIENTS & ENCOUNTERS
-- ============================================================================

CREATE TYPE admin_sex_enum AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    estimated_age_years INTEGER CHECK (estimated_age_years BETWEEN 0 AND 130),
    administrative_sex admin_sex_enum NOT NULL DEFAULT 'UNKNOWN',
    phone_number VARCHAR(30),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    is_unidentified BOOLEAN NOT NULL DEFAULT FALSE,
    temporary_identifier VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_search ON patients (last_name, first_name, date_of_birth);
CREATE INDEX idx_patients_phone ON patients (phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_patients_mrn ON patients (mrn);

CREATE TYPE arrival_method_enum AS ENUM ('WALK_IN', 'AMBULANCE', 'WHEELCHAIR', 'PUBLIC_TRANSPORT', 'OTHER');

CREATE TYPE encounter_status_enum AS ENUM (
    'REGISTRATION_INCOMPLETE',
    'WAITING_FOR_TRIAGE',
    'TRIAGED_WAITING',
    'IN_CONSULTATION',
    'DISCHARGED',
    'ADMITTED',
    'TRANSFERRED',
    'LEFT_WITHOUT_BEING_SEEN',
    'DECEASED'
);

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    registered_by_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
    arrival_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    arrival_method arrival_method_enum NOT NULL DEFAULT 'WALK_IN',
    initial_chief_complaint TEXT NOT NULL,
    status encounter_status_enum NOT NULL DEFAULT 'WAITING_FOR_TRIAGE',
    confirmed_urgency_level INTEGER CHECK (confirmed_urgency_level BETWEEN 1 AND 5),
    is_emergency_bypass BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INVARIANT: Only 1 active encounter per patient at any given time
CREATE UNIQUE INDEX idx_patient_single_active_encounter 
ON encounters (patient_id) 
WHERE status NOT IN ('DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED');

CREATE INDEX idx_encounters_status_dept ON encounters (department_id, status);

-- ============================================================================
-- 4. CLINICAL TRIAGE, OBSERVATIONS & RED FLAGS
-- ============================================================================

CREATE TYPE consciousness_scale_enum AS ENUM ('ALERT', 'VERBAL', 'PAIN', 'UNRESPONSIVE', 'GCS');
CREATE TYPE measurement_phase_enum AS ENUM ('INITIAL_TRIAGE', 'ROUTINE_REASSESSMENT', 'ACUTE_DETERIORATION');

CREATE TABLE vital_sign_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    recorded_by_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
    heart_rate_bpm INTEGER CHECK (heart_rate_bpm BETWEEN 20 AND 300),
    systolic_bp_mmhg INTEGER CHECK (systolic_bp_mmhg BETWEEN 40 AND 300),
    diastolic_bp_mmhg INTEGER CHECK (diastolic_bp_mmhg BETWEEN 20 AND 200),
    respiratory_rate_bpm INTEGER CHECK (respiratory_rate_bpm BETWEEN 4 AND 80),
    spo2_percentage NUMERIC(4,1) CHECK (spo2_percentage BETWEEN 40.0 AND 100.0),
    temperature_celsius NUMERIC(4,1) CHECK (temperature_celsius BETWEEN 25.0 AND 45.0),
    consciousness_scale consciousness_scale_enum NOT NULL DEFAULT 'ALERT',
    gcs_score INTEGER CHECK (gcs_score BETWEEN 3 AND 15),
    pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    is_red_flag BOOLEAN NOT NULL DEFAULT FALSE,
    measurement_phase measurement_phase_enum NOT NULL DEFAULT 'INITIAL_TRIAGE',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vitals_encounter_time ON vital_sign_observations (encounter_id, recorded_at DESC);

CREATE TABLE triage_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    assessed_by_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
    vital_sign_id UUID REFERENCES vital_sign_observations(id) ON DELETE RESTRICT,
    supervisor_id UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
    protocol_code VARCHAR(50) NOT NULL DEFAULT 'DEMO-PROTOCOL-v1',
    suggested_urgency_level INTEGER NOT NULL CHECK (suggested_urgency_level BETWEEN 1 AND 5),
    confirmed_urgency_level INTEGER NOT NULL CHECK (confirmed_urgency_level BETWEEN 1 AND 5),
    is_clinical_override BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason TEXT,
    is_downgrade BOOLEAN NOT NULL DEFAULT FALSE,
    downgrade_justification TEXT,
    target_care_area_id UUID NOT NULL REFERENCES care_areas(id) ON DELETE RESTRICT,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_override_requires_reason CHECK (NOT is_clinical_override OR override_reason IS NOT NULL),
    CONSTRAINT chk_downgrade_requires_supervisor CHECK (NOT is_downgrade OR (supervisor_id IS NOT NULL AND downgrade_justification IS NOT NULL))
);

CREATE INDEX idx_triage_encounter_assessed ON triage_assessments (encounter_id, assessed_at DESC);

CREATE TYPE red_flag_status_enum AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED');

CREATE TABLE red_flag_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    triggered_by_id UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
    acknowledged_by_id UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
    alert_type VARCHAR(100) NOT NULL,
    trigger_reason TEXT NOT NULL,
    status red_flag_status_enum NOT NULL DEFAULT 'ACTIVE',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMPTZ
);

CREATE INDEX idx_active_red_flags ON red_flag_alerts (status) WHERE status = 'ACTIVE';

CREATE TYPE reassessment_status_enum AS ENUM ('PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED_DUE_TO_CONSULTATION');

CREATE TABLE reassessment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    prior_assessment_id UUID NOT NULL REFERENCES triage_assessments(id) ON DELETE RESTRICT,
    scheduled_due_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status reassessment_status_enum NOT NULL DEFAULT 'PENDING',
    is_deterioration_noted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pending_reassessments ON reassessment_records (status, scheduled_due_at) 
WHERE status IN ('PENDING', 'OVERDUE');

-- ============================================================================
-- 5. QUEUES & QUEUE ENTRIES
-- ============================================================================

CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_area_id UUID NOT NULL REFERENCES care_areas(id) ON DELETE RESTRICT,
    queue_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE queue_entry_status_enum AS ENUM (
    'WAITING',
    'REASSESSMENT_OVERDUE',
    'CALLED',
    'IN_CONSULTATION',
    'ON_HOLD',
    'COMPLETED',
    'LEFT_WITHOUT_BEING_SEEN',
    'REASSIGNED'
);

CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE RESTRICT,
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    token_number VARCHAR(20) NOT NULL,
    priority_score NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
    urgency_level INTEGER NOT NULL CHECK (urgency_level BETWEEN 1 AND 5),
    status queue_entry_status_enum NOT NULL DEFAULT 'WAITING',
    entered_queue_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    called_at TIMESTAMPTZ,
    called_by_id UUID REFERENCES staff_users(id) ON DELETE RESTRICT,
    consultation_room VARCHAR(50),
    row_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INVARIANT: Only 1 active queue entry per encounter
CREATE UNIQUE INDEX idx_single_active_queue_entry 
ON queue_entries (encounter_id) 
WHERE status IN ('WAITING', 'REASSESSMENT_OVERDUE', 'CALLED', 'IN_CONSULTATION', 'ON_HOLD');

-- Index for high-performance priority sorting
CREATE INDEX idx_queue_active_priority 
ON queue_entries (queue_id, priority_score DESC, entered_queue_at ASC) 
WHERE status IN ('WAITING', 'REASSESSMENT_OVERDUE');

-- ============================================================================
-- 6. CONSULTATIONS & ENCOUNTER DISPOSITIONS
-- ============================================================================

CREATE TYPE consultation_status_enum AS ENUM ('CALLED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE disposition_type_enum AS ENUM ('DISCHARGED', 'ADMITTED_INPATIENT', 'TRANSFERRED_EXTERNAL', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED');

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE RESTRICT,
    clinician_id UUID NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
    care_area_id UUID NOT NULL REFERENCES care_areas(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL,
    status consultation_status_enum NOT NULL DEFAULT 'CALLED',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    clinical_notes TEXT,
    working_diagnosis VARCHAR(255),
    disposition disposition_type_enum,
    disposition_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_encounter ON consultations (encounter_id);
CREATE INDEX idx_consultations_clinician ON consultations (clinician_id, started_at DESC);

-- ============================================================================
-- 7. FORENSIC AUDIT LOGS (APPEND-ONLY)
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_role staff_role_enum,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    justification TEXT,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    previous_log_hash VARCHAR(64),
    current_log_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_time ON audit_logs (created_at DESC);

-- REVOKE UPDATE AND DELETE PERMISSIONS ON AUDIT LOG TABLE
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM PUBLIC;
```
