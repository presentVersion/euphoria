# State Transition Models & Lifecycle Specifications

## 1. Multi-Entity State Architecture

To prevent architectural collapse where multiple operational conditions are forced into a single status field, the system maintains **separate, decoupled state models** across its core entities:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ ENCOUNTER STATE │      │  TRIAGE STATE   │      │   QUEUE STATE   │
│ - WAITING_TRIAGE│      │ - SUGGESTED     │      │ - WAITING       │
│ - TRIAGED       │      │ - CONFIRMED     │      │ - CALLED        │
│ - IN_CONSULT    │      │ - OVERRIDDEN    │      │ - ON_HOLD       │
│ - DISCHARGED    │      │ - REASSESSED    │      │ - COMPLETED     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                       ┌────────────────────┐
                       │ CONSULTATION STATE │
                       │ - CALLED           │
                       │ - IN_PROGRESS      │
                       │ - PAUSED           │
                       │ - COMPLETED        │
                       └────────────────────┘
```

---

## 2. Formal State Transition Matrices

### 2.1 Encounter Lifecycle Matrix
| Initial State | Event Trigger | Guard Condition / Permission | Next State | Side Effects & DB Changes |
| :--- | :--- | :--- | :--- | :--- |
| `NULL` | `REGISTER_SUBMIT` | Valid demographic data | `WAITING_FOR_TRIAGE` | Inserts `encounters` row; emits SSE `PATIENT_REGISTERED`. |
| `NULL` | `EMERGENCY_BYPASS` | 1-Click Panic Intake | `WAITING_FOR_TRIAGE` | Sets `is_emergency_bypass = true`, urgency Level 1, alerts Resus Bay. |
| `WAITING_FOR_TRIAGE` | `TRIAGE_CONFIRM` | Triage nurse confirms urgency | `TRIAGED_WAITING` | Updates `confirmed_urgency_level`; inserts `queue_entries`. |
| `TRIAGED_WAITING` | `DOCTOR_CALLS` | Doctor clicks Call Next | `IN_CONSULTATION` | Row locked via `SKIP LOCKED`; updates `consultations.started_at`. |
| `IN_CONSULTATION` | `DISPOSITION_DISCHARGE`| Clinician discharges patient | `DISCHARGED` | Sets `closed_at = NOW()`; encounter locked read-only; frees room. |
| `IN_CONSULTATION` | `DISPOSITION_ADMIT` | Inpatient admission ordered | `ADMITTED` | Emits `PATIENT_ADMITTED`; triggers inpatient bed handoff. |
| `IN_CONSULTATION` | `DISPOSITION_TRANSFER` | Tertiary transfer ordered | `TRANSFERRED` | Generates external ambulance transport transfer summary. |
| `ANY_ACTIVE` | `PATIENT_DEPARTS` | Staff marks patient walkout | `LEFT_WITHOUT_BEING_SEEN` | Sets `closed_at = NOW()`; triggers risk review if acuity $\le 3$. |

---

### 2.2 Triage Assessment Lifecycle Matrix
| Initial State | Event Trigger | Guard Condition / Permission | Next State | Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `NULL` | `SUBMIT_OBSERVATIONS`| Physiological vitals validated | `SUGGESTED` | Triage engine computes score; checks red flags. |
| `SUGGESTED` | `NURSE_CONFIRMS` | Nurse agrees with suggestion | `CONFIRMED` | Commits urgency to encounter; calculates `reassessment.due_at`. |
| `SUGGESTED` | `NURSE_OVERRIDES` | Clinical override with rationale | `OVERRIDDEN` | Logs override reason in audit trail; sets confirmed urgency. |
| `CONFIRMED` | `SUPERVISOR_DOWNGRADE`| Supervisor co-signature valid | `DOWNGRADED` | Requires dual employee authentication; logs downgrade justification. |
| `CONFIRMED` | `SECONDARY_CHECK` | Reassessment vitals submitted | `REASSESSED` | Versioned assessment created; updates queue priority if acuity changed. |

---

### 2.3 Queue Entry Lifecycle Matrix
| Initial State | Event Trigger | Guard Condition | Next State | Concurrency Control |
| :--- | :--- | :--- | :--- | :--- |
| `NULL` | `ENCOUNTER_TRIAGED` | Active care area queue active | `WAITING` | Insert into `queue_entries` with priority score. |
| `WAITING` | `BREACH_DEADLINE` | Current time $> \text{due\_at} + 5\text{m}$ | `REASSESSMENT_OVERDUE` | Priority score receives $+20{,}000$ boost; audible chime sounds. |
| `REASSESSMENT_OVERDUE` | `REASSESSMENT_DONE` | Secondary assessment submitted | `WAITING` | Priority score recalculates; status normalizes to `WAITING`. |
| `WAITING` | `DOCTOR_CALL_NEXT` | Exam room is vacant | `CALLED` | `SELECT ... FOR UPDATE SKIP LOCKED` prevents race conditions. |
| `CALLED` | `PATIENT_IN_ROOM` | Patient arrives in exam room | `IN_CONSULTATION` | Removed from waiting count; room marked occupied. |
| `IN_CONSULTATION` | `DIAGNOSTIC_HOLD` | Clinician orders imaging/labs | `ON_HOLD` | Frees room; patient retains priority position upon return. |
| `ON_HOLD` | `HOLD_RELEASED` | Imaging/lab results returned | `WAITING` | Patient returns to active waiting roster at top priority. |
| `IN_CONSULTATION` | `DISPOSITION_SUBMIT` | Final disposition recorded | `COMPLETED` | Queue entry archived; exam room freed. |
| `WAITING` | `CARE_AREA_TRANSFER` | Receiving area accepts | `REASSIGNED` | Current queue entry archived; new entry created in target queue. |

---

### 2.4 Staff Session Lifecycle Matrix
| Initial State | Event Trigger | Guard Condition | Next State | Security Action |
| :--- | :--- | :--- | :--- | :--- |
| `UNAUTHENTICATED` | `LOGIN_ATTEMPT` | Valid email & Argon2id hash | `AUTHENTICATED` | Sets HTTP-only JWT cookie; resets failed login counter. |
| `UNAUTHENTICATED` | `BAD_PASSWORD` | Failed password verification | `UNAUTHENTICATED` | Increments `failed_login_attempts`; locks for 15m if attempts $\ge 5$. |
| `AUTHENTICATED` | `INACTIVITY_TIMEOUT`| Idle time $> 10\text{ minutes}$ | `LOCKED` | Screen blanks; requires password to unlock active session. |
| `AUTHENTICATED` | `TOKEN_REFRESH` | Access token near 15m expiry | `AUTHENTICATED` | Issues rotated access token using valid refresh token family. |
| `AUTHENTICATED` | `LOGOUT` | Staff clicks Logout | `UNAUTHENTICATED` | Clears cookie; invalidates refresh token in database. |
| `AUTHENTICATED` | `BREAK_GLASS` | Emergency justification + auth | `ELEVATED_SESSION` | Grants 2-hour cross-department access; logs security event. |
