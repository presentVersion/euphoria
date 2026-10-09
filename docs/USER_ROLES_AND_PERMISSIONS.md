# User Roles, Permissions Matrix & Access Governance

## 1. Actor Architecture & Core Personas

The system defines 7 authenticated healthcare staff roles, 1 administrative persona, and 1 anonymous public/patient role. Clinical safety, data minimization, and separation of duties strictly govern the capabilities of each persona.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HEALTHCARE ROLE HIERARCHY                       │
├────────────────────────────────────────────────────────────────────────┤
│  [HOSPITAL_ADMIN] / [SYSTEM_ADMIN] (Administrative Governance Only)   │
│         │                                                              │
│  [CHARGE_NURSE] / [DEPARTMENT_MANAGER] (Clinical & Queue Oversight)    │
│         │                                  │                           │
│  [TRIAGE_NURSE]                  [TREATING_CLINICIAN]                  │
│  (Acuity, Observations, Vitals)  (Consultations, Calling, Disposition) │
│         │                                                              │
│  [RECEPTIONIST] (Registration, Demographic Intake, Emergency Token)    │
│                                                                        │
│  [PATIENT_PUBLIC] (Sanitized Token Queue Status, Zero Medical Data)   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Persona Profiles

### 2.1 Receptionist / Registration Staff (`RECEPTIONIST`)
- **Scope of Practice**: Front-desk administrative intake, patient lookup, encounter creation, demographic corrections.
- **Key Responsibilities**:
  - Search existing patient master index by MRN, National ID, or Phone.
  - Register new walk-in patients and capture demographic/emergency contacts.
  - Execute **Emergency Bypass** for acute/unconscious arrivals, generating temporary tracking tokens (`TEMP-XXXX`).
  - Flag potential duplicate patient records for supervisor review.
  - Mark incomplete fields as `UNKNOWN` without delaying care.
- **Strict Clinical Boundaries**:
  - **FORBIDDEN** from recording clinical vital signs or assessing medical urgency.
  - **FORBIDDEN** from modifying confirmed triage scores or reordering the queue.

### 2.2 Triage Nurse (`TRIAGE_NURSE`)
- **Scope of Practice**: Clinical observation capture, physiological triage scoring, red-flag escalation, routine reassessments.
- **Key Responsibilities**:
  - Record presenting complaints, symptom duration, and measured vital signs.
  - Review protocol-suggested urgency scores and provide authoritative clinical confirmation.
  - Trigger immediate Emergency Escalation for life threats, alerting the Resuscitation Bay.
  - Perform scheduled clinical reassessments for waiting patients.
  - Allocate triaged patients to destination care areas (Acute, Urgent, Pediatrics, Fast-Track).
- **Strict Clinical Boundaries**:
  - Cannot close an encounter or issue inpatient admission orders.
  - Cannot downgrade a patient's urgency without Charge Nurse authorization.

### 2.3 Doctor / Treating Clinician (`TREATING_CLINICIAN`)
- **Scope of Practice**: Medical consultation, diagnostic review, treatment planning, disposition determination.
- **Key Responsibilities**:
  - View the prioritized queue of their assigned department.
  - Call the next patient into an examination room (`CALLED` state).
  - Conduct consultations and record consultation notes, working diagnoses, and orders.
  - Execute clinical overrides if a patient's condition changes upon examination.
  - Record final encounter disposition: Discharge, Inpatient Admission, External Transfer.
- **Strict Clinical Boundaries**:
  - Cannot alter queue policies or bypass clinical safety reassessment rules.

### 2.4 Charge Nurse / Triage Supervisor (`CHARGE_NURSE`)
- **Scope of Practice**: Operational oversight of department queues, escalation management, override authorization.
- **Key Responsibilities**:
  - Monitor all waiting queues across all emergency care areas.
  - Authorize requested urgency downgrades (dual-signature governance).
  - Review and clear `REASSESSMENT_OVERDUE` alerts and starvation warnings.
  - Resolve duplicate patient merge requests.
  - Rebalance patient loads between care areas during surges.
- **Strict Clinical Boundaries**:
  - Cannot delete audit trails or modify historical clinical records.

### 2.5 Department / Queue Manager (`DEPARTMENT_MANAGER`)
- **Scope of Practice**: Departmental throughput, capacity tracking, staffing allocation, operational reporting.
- **Key Responsibilities**:
  - Configure care area capacities (number of open beds/examination rooms).
  - Assign clinicians to active shifts and consultation suites.
  - Monitor door-to-doctor times, triage compliance, and LWBS rates.
- **Strict Clinical Boundaries**:
  - **FORBIDDEN** from modifying individual patient clinical urgency scores to manipulate throughput KPIs.

### 2.6 Hospital Administrator (`HOSPITAL_ADMIN`)
- **Scope of Practice**: Enterprise user management, role assignments, department provisioning, compliance audit review.
- **Key Responsibilities**:
  - Create and suspend staff user accounts.
  - Assign roles and departmental affiliations.
  - Review forensic audit logs for regulatory compliance investigations.
- **Strict Clinical Boundaries**:
  - **FORBIDDEN** from creating patient encounters, entering triage scores, or calling patients. Separation of clinical and administrative authority is absolute.

### 2.7 System Administrator (`SYSTEM_ADMIN`)
- **Scope of Practice**: Infrastructure health, database backups, disaster recovery, API gateway configuration.
- **Key Responsibilities**:
  - Monitor system latency, database connection pools, and SSE streaming health.
  - Execute automated database migrations and disaster recovery drills.
  - Manage encryption keys and environment configuration.
- **Strict Clinical Boundaries**:
  - Technical access only; has zero business permission to view unmasked patient clinical records or alter clinical triage rules.

### 2.8 Patient / Public Display (`PATIENT_PUBLIC`)
- **Scope of Practice**: Anonymous public waiting room status tracking.
- **Key Responsibilities**:
  - View sequential tokens (`A-101`) currently being called.
  - View estimated wait bands (e.g., "15–30 mins") for their department.
- **Strict Clinical Boundaries**:
  - Has zero access to patient names, medical conditions, or other patients' queue status.

---

## 3. Comprehensive Permissions Matrix

| Permission Key | Description | `RECEPT` | `TRIAGE` | `DOCTOR` | `CHARGE` | `DEPT_MGR` | `HOSP_ADM` | `SYS_ADM` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `patient:search` | Search existing patient master index | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `patient:create` | Register new patient record | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `patient:emergency_bypass`| Execute 1-click temporary emergency bypass | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `patient:edit_demographics`| Modify patient address, phone, contact | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `patient:merge_duplicates`| Authorize merge of duplicate records | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| `encounter:create` | Open new hospital visit encounter | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `encounter:view_phi` | View unmasked clinical notes and vitals | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `encounter:close` | Finalize and archive completed encounter | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `triage:record_vitals` | Record physiological vital signs | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `triage:confirm_urgency`| Authorize protocol-suggested urgency score | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `triage:escalate_emergency`| Trigger immediate Resuscitation Red-Flag | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `triage:downgrade_urgency`| Lower patient acuity score (requires co-sign)| ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `triage:reassess` | Record secondary vital signs and trend | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `queue:view_department` | View active waiting queue for department | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `queue:view_all` | View consolidated hospital-wide queue | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `queue:call_patient` | Atomically call patient to consultation room| ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `queue:hold_patient` | Place patient on temporary diagnostic hold | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `queue:reassign_area` | Transfer patient to another care area | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `consultation:start` | Mark consultation in progress | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `consultation:record_notes`| Document medical diagnosis and orders | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `consultation:disposition`| Record discharge, admission, or transfer | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `analytics:view_dept` | View operational throughput & wait times | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `audit:view_logs` | Inspect immutable forensic audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `user:manage` | Provision staff accounts and assign roles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `system:configure` | Configure technical params & backups | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `break_glass:invoke` | Execute emergency cross-department access | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 4. Break-Glass Emergency Escalation Procedure

In mass-casualty incidents, acute trauma surges, or IT network partitions where normal department boundaries hinder patient care, clinicians can invoke **Break-Glass Access**:

1. **Trigger Condition**: Clinician attempts to access a patient encounter outside their assigned care area or department.
2. **Interactive Prompt**:
   - System displays a prominent high-contrast modal: *"BREAK-GLASS EMERGENCY ACCESS REQUEST"*.
   - Clinician must select a clinical reason: `RESUSCITATION_SUPPORT`, `SURGE_REALLOCATION`, `CRITICAL_LAB_REVIEW`, or `OTHER_LIFE_THREAT`.
   - Clinician enters free-text justification and re-enters their password.
3. **Automated Enforcement**:
   - Access is granted for a strictly bounded **2-hour session window**.
   - An immediate high-priority audit record (`EVENT_SECURITY_BREAK_GLASS`) is persisted with actor ID, IP address, target encounter, timestamp, and justification.
   - An instant real-time notification is dispatched to the Hospital Security Officer and Charge Nurse console.
4. **Post-Event Review**:
   - Hospital Administrator receives an automated daily report listing all break-glass sessions for mandatory clinical peer review.
