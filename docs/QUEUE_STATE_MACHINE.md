# Queue State Machine & Lifecycle Specification

## 1. Queue Entry State Machine

The `QueueEntry` entity models the physical and operational status of a patient within a specific department queue.

```
                           ┌───────────────────────────┐
                           │    WAITING_FOR_TRIAGE     │
                           └─────────────┬─────────────┘
                                         │
                                [Triage Confirmed]
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │        WAITING        │◄───────────────────┐
                             └───────────┬───────────┘                    │
                                         │                                │
                 ┌───────────────────────┼───────────────────────┐        │
                 │                       │                       │        │
       [Reassessment Overdue]     [Patient Called]          [Patient Leaves] [Hold Released]
                 │                       │                       │        │
                 ▼                       ▼                       ▼        │
    ┌─────────────────────────┐  ┌───────────────┐      ┌─────────────┐   │
    │  REASSESSMENT_OVERDUE   │  │    CALLED     │      │    LWBS     │   │
    └────────────┬────────────┘  └───────┬───────┘      └─────────────┘   │
                 │                       │                                │
        [Reassessed / Vitals]    [Patient Arrives in Room]                │
                 │                       │                                │
                 └───────────────────────┼────────────────────────┐       │
                                         ▼                        │       │
                              ┌─────────────────────┐             │       │
                              │   IN_CONSULTATION   │             │       │
                              └──────────┬──────────┘             │       │
                                         │                        │       │
                 ┌───────────────────────┼────────────────────────┘       │
                 │                       │                                │
       [Diagnostic / Lab Hold]  [Consultation Complete]                   │
                 │                       │                                │
                 ▼                       ▼                                │
          ┌─────────────┐         ┌─────────────┐                         │
          │   ON_HOLD   │         │  COMPLETED  │                         │
          └──────┬──────┘         └─────────────┘                         │
                 │                                                        │
                 └────────────────────────────────────────────────────────┘
```

---

## 2. Queue State Descriptions

| State Code | Meaning | User Visible Action | System Side Effect |
| :--- | :--- | :--- | :--- |
| `WAITING_FOR_TRIAGE` | Registered at front desk; awaiting initial clinical vitals. | Triage Nurse calls patient to triage bay. | Excluded from Doctor consultation queue; visible on Triage Worklist. |
| `WAITING` | Triaged and placed in active waiting queue. | Doctor can click "Call Next Patient". | Position dynamically recalculated every 60s or on trigger events. |
| `REASSESSMENT_OVERDUE` | Reassessment deadline breached by $> 5\text{ minutes}$. | Triage Nurse brings patient in for secondary vitals. | Injects $+20{,}000$ priority score penalty; sounds audible chime on Charge Nurse terminal. |
| `CALLED` | Doctor has called patient; patient walking to exam room. | Patient hears room announcement; token flashes on public board. | Queue entry locked; consultation record initiated in `CALLED` status. |
| `IN_CONSULTATION` | Patient is inside examination room undergoing consultation. | Doctor records notes, working diagnosis, and disposition. | Removed from waiting queue count; exam room marked occupied. |
| `ON_HOLD` | Patient paused (e.g., undergoing CT scan or waiting lab result). | Doctor can resume patient back into active queue. | Retains priority rank; temporary hold timer active. |
| `COMPLETED` | Consultation finished and disposition recorded. | None (Encounter moves to discharge or ward admission). | Queue entry archived; exam room freed. |
| `LEFT_WITHOUT_BEING_SEEN` | Patient departed hospital before consultation. | Staff records LWBS departure reason. | Queue entry archived; triggers clinical risk audit if high acuity. |
| `REASSIGNED` | Patient transferred to another care area or department. | Patient moves to target department queue. | Current queue entry marked `REASSIGNED`; new queue entry created in target queue. |

---

## 3. Transition Matrix & Permitted Operations

| Current State | Target State | Triggering Event | Authorized Roles | Preconditions & Invariants |
| :--- | :--- | :--- | :--- | :--- |
| `WAITING_FOR_TRIAGE` | `WAITING` | `TRIAGE_CONFIRMED` | `TRIAGE_NURSE`, `CHARGE_NURSE` | Vital signs recorded or emergency bypass confirmed. |
| `WAITING` | `REASSESSMENT_OVERDUE` | `BREACH_DEADLINE` | `SYSTEM` (Automated) | Current time $> \text{scheduled\_due\_at} + 5\text{ mins}$. |
| `WAITING` | `CALLED` | `CALL_PATIENT` | `TREATING_CLINICIAN`, `CHARGE_NURSE` | Exam room is vacant; locked via `SKIP LOCKED`. |
| `REASSESSMENT_OVERDUE` | `WAITING` | `REASSESSMENT_SUBMITTED` | `TRIAGE_NURSE`, `CHARGE_NURSE` | Secondary observations captured; next due time scheduled. |
| `CALLED` | `IN_CONSULTATION` | `CONSULTATION_STARTED` | `TREATING_CLINICIAN` | Patient arrival confirmed in room. |
| `CALLED` | `WAITING` | `CALL_TIMEOUT_NO_SHOW` | `TREATING_CLINICIAN`, `CHARGE_NURSE` | Patient did not report within 5 minutes of calling. |
| `IN_CONSULTATION` | `ON_HOLD` | `DIAGNOSTIC_HOLD` | `TREATING_CLINICIAN` | Patient sent for ultrasound, CT, or lab draws. |
| `ON_HOLD` | `WAITING` | `RESUME_FROM_HOLD` | `TREATING_CLINICIAN`, `CHARGE_NURSE` | Patient returned from diagnostic investigation. |
| `IN_CONSULTATION` | `COMPLETED` | `DISPOSITION_SUBMITTED` | `TREATING_CLINICIAN` | Final disposition (Discharge, Admit, Transfer) recorded. |
| `ANY_ACTIVE` | `LWBS` | `PATIENT_DEPARTED` | `RECEPTIONIST`, `TRIAGE_NURSE`, `CHARGE_NURSE` | Staff verifies patient left waiting area. |
| `ANY_ACTIVE` | `REASSIGNED` | `CARE_AREA_TRANSFER` | `CHARGE_NURSE`, `DEPARTMENT_MANAGER` | Receiving department care area confirmed. |

---

## 4. Forbidden State Transitions

The database and API strictly reject the following transitions to prevent workflow corruption:
- `COMPLETED` $\rightarrow$ `WAITING` (Completed encounters cannot re-enter the queue without a new encounter).
- `IN_CONSULTATION` $\rightarrow$ `CALLED` (A patient being examined cannot be called again).
- `WAITING_FOR_TRIAGE` $\rightarrow$ `IN_CONSULTATION` (Patients must undergo triage before doctor examination, unless Emergency Bypass is flagged).
- `LWBS` $\rightarrow$ `IN_CONSULTATION` (Departed patients cannot be examined without re-registration).
