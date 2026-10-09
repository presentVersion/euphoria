# Patient Registration & Identity Workflow Specification

## 1. Overview & Workflow Objectives

The Registration Workflow bridges patient arrival and clinical intake. It establishes patient identity, flags potential duplicate records, creates the visit Encounter, and routes the patient to clinical triage.

Crucially, the workflow incorporates an **Emergency Bypass protocol** to ensure administrative procedures never delay life-saving medical resuscitation.

```
                  [Patient Arrives at Hospital]
                                │
          ┌─────────────────────┴─────────────────────┐
          │                                           │
  [Acute / Critical Life Threat?]              [Stable Patient]
          │                                           │
         YES                                         NO
          │                                           │
          ▼                                           ▼
[EMERGENCY BYPASS]                         [Patient Identity Lookup]
  - 1-Click Action                           - Search by MRN / Phone / Name
  - Generate TEMP-EMERG-XXXX                 - Review Potential Duplicates
  - Route Instantly to Resuscitation Bay      │
  - Status: EMERGENCY_UNIDENTIFIED            ├──► [Existing Patient Found] ──► Select Existing
  - Post-Stabilization Reconciliation         └──► [New Patient] ──────────────► Input Demographics
                                                                                      │
                                                                                      ▼
                                                                        [Create Visit Encounter]
                                                                          - Record Arrival Time & Method
                                                                          - Capture Chief Complaint
                                                                          - Status: WAITING_FOR_TRIAGE
                                                                          │
                                                                          ▼
                                                                [Insert into Triage Worklist]
```

---

## 2. Patient Identification & Duplicate Resolution

### 2.1 Identity Lookup Protocol
1. Staff enters search criteria in the Registration terminal:
   - Hospital MRN (e.g., `MRN-2026-004921`) — Exact match.
   - National Identity / Aadhaar / Social ID — Exact match.
   - Phone Number — Exact match.
   - Name + Date of Birth — Fuzzy match.
2. System queries the `patients` index with a p95 latency target of $< 200\text{ ms}$.

### 2.2 Duplicate Detection Algorithm
When staff submits a registration for a "New Patient", the system executes a real-time similarity check against the existing database using composite match keys:
- **Rule 1 (Definite Match)**: Same National ID or Phone Number + Same Birth Year.
- **Rule 2 (Probable Match)**: Phonetic match on First & Last Name (Metaphone/Soundex) + Exact Birth Date.
- **Rule 3 (Possible Match)**: Exact Name + Estimated Age within $\pm 2$ years.

**Handling Behavior**:
- If a Probable Match is detected, registration halts and displays a side-by-side comparison modal displaying:
  - Existing Record vs. New Submission.
  - Prior visit history dates and last recorded contact numbers.
- Staff choices:
  1. *Select Existing Record*: Links encounter to existing `Patient.id`.
  2. *Confirm Separate Individual*: Creates new `Patient.id`; logs explicit justification.
  3. *Request Supervisor Merge*: Flags encounter for Charge Nurse reconciliation.
- **Strict Rule**: Automated record merging based solely on matching names is **strictly forbidden**.

---

## 3. Emergency Bypass Protocol (Unidentified Patients)

When an unconscious, critically injured, or uncommunicative patient arrives via ambulance or walk-in:
1. Receptionist or Triage Nurse clicks **"EMERGENCY BYPASS"**.
2. System immediately generates:
   - Synthetic MRN: `MRN-TEMP-[YYYYMMDD]-[4-digit-hex]` (e.g., `MRN-TEMP-20261009-A4F1`).
   - Patient record with `is_unidentified = true` and `temporary_identifier = 'TEMP-EMERG-A4F1'`.
   - Encounter record with `is_emergency_bypass = true`, `confirmed_urgency_level = 1`, and `status = 'WAITING_FOR_TRIAGE'`.
3. System immediately prints a temporary wristband barcode and broadcasts an audible/visual Level 1 alert to the Resuscitation Bay.
4. **Post-Resuscitation Reconciliation**: Once the patient is stabilized and relatives or identity documents become available:
   - Authorized Charge Nurse uses the **Reconcile Emergency Record** tool to link the temporary encounter to a verified patient profile or create the official permanent profile.
   - The temporary identifier is permanently archived in the encounter audit trail for cross-referencing.

---

## 4. Registration Data Specification

### 4.1 Minimum Fields for Routine Registration
| Field | Type | Mandatory? | Validation Rule |
| :--- | :--- | :---: | :--- |
| First Name | String | Yes | 1–100 characters; alphabetic and standard punctuation. |
| Last Name | String | Yes | 1–100 characters; alphabetic and standard punctuation. |
| Date of Birth | Date | Conditional | Valid past date $\le$ today. If unknown, Estimated Age is required. |
| Estimated Age | Integer | Conditional | 0–130 years. Mandatory if Date of Birth is unknown. |
| Administrative Sex | Enum | Yes | `MALE`, `FEMALE`, `OTHER`, `UNKNOWN`. |
| Phone Number | String | No | Valid E.164 phone format if provided. |
| Emergency Contact Name | String | No | 1–150 characters. |
| Emergency Contact Phone| String | No | Valid phone format if provided. |
| Arrival Method | Enum | Yes | `WALK_IN`, `AMBULANCE`, `WHEELCHAIR`, `PUBLIC_TRANSPORT`, `OTHER`. |
| Initial Chief Complaint| Text | Yes | Minimum 5 characters; describe presenting problem. |

### 4.2 Handling Incomplete or Refused Data
If a conscious patient cannot or refuses to provide certain demographic details (e.g., no permanent address, refuses emergency contact):
- Staff selects `UNKNOWN` or `REFUSED` on the form.
- The system accepts the entry and creates the encounter.
- Administrative missing data must **never delay or block medical triage**.

---

## 5. Registration State Machine

```
                   ┌─────────────────────────────┐
                   │    REGISTRATION_STARTED     │
                   └──────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
  [Emergency Bypass]     [Validation Error]       [Submit Standard]
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐     ┌──────────────────┐
│  EMERGENCY_BYPASS│    │   REG_INCOMPLETE │     │  DUPLICATE_CHECK │
│  (Resus Alert)   │    │  (Staff Prompt)  │     └─────────┬────────┘
└────────┬─────────┘    └──────────────────┘               │
         │                                       ┌─────────┴─────────┐
         │                                       │                   │
         │                               [Duplicate Found]    [No Duplicate]
         │                                       │                   │
         │                                       ▼                   ▼
         │                              ┌──────────────────┐ ┌───────────────┐
         │                              │  DUPLICATE_HOLD  │ │ REG_COMPLETED │
         │                              └────────┬─────────┘ └───────┬───────┘
         │                                       │                   │
         │                               [Merge Authorized]          │
         │                                       │                   │
         ▼                                       ▼                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    ENCOUNTER_CREATED (WAITING_FOR_TRIAGE)                  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Registration Acceptance Criteria

1. **New Patient Registration**: Submitting valid name, DOB, and chief complaint creates a `Patient` and `Encounter` in $< 300\text{ ms}$; appears on Triage Worklist instantly.
2. **Emergency Bypass Speed**: Clicking Emergency Bypass generates token and alert in $< 1\text{ second}$ with zero mandatory field blocks.
3. **Duplicate Prevention**: Submitting a name and birth date matching an existing record stops submission and displays side-by-side reconciliation modal.
4. **Active Encounter Constraint**: Attempting to register an active patient who is already in the waiting room returns `409 Conflict: Active Encounter Exists`.
5. **Audit Record**: Every registration event logs staff ID, arrival timestamp, and source IP in `audit_logs`.
