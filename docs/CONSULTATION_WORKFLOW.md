# Consultation Workflow & Clinical Encounter Lifecycle

## 1. Overview & Consultation Architecture

The Consultation Workflow coordinates the direct interaction between treating clinicians and patients, tracking the clinical encounter from the moment a patient is called from the waiting queue through medical examination to final disposition.

```
[Prioritized Queue Entry: WAITING]
                 │
                 │ 1. Doctor clicks "Call Next Patient"
                 ▼
[Queue Entry: CALLED] ──► [Room Assignment: Exam Room 3]
  - Broadcast room audio/visual announcement
  - Patient moves from waiting area to room
                 │
                 │ 2. Patient enters room; Doctor clicks "Start Consultation"
                 ▼
[Consultation Status: IN_PROGRESS]
  - Door-to-Doctor elapsed time finalized
  - Record Clinical Notes & Working Diagnosis
  - Order Diagnostic Tests (Labs / Radiology)
                 │
         ┌───────┴───────┐
         │ (Diagnostic)  │ (Examination Finished)
         ▼               ▼
    [ON_HOLD]      [Record Clinical Disposition]
    - Held in lab   - DISCHARGED (with instructions)
    - Resumes Q     - ADMITTED_INPATIENT (ward allocation)
                    - TRANSFERRED_EXTERNAL (ambulance handoff)
                    - LEFT_WITHOUT_BEING_SEEN
                    - DECEASED
                         │
                         ▼
             [Finalize & Close Encounter]
```

---

## 2. Calling & Intake Workflow

1. **Clinician Queue View**:
   - Treating Clinician logs into the Doctor Console and selects their assigned care area (e.g., "ED Acute Care Bay").
   - The interface displays the active queue sorted strictly by `priority_score DESC`.
2. **Atomic Call Execution**:
   - Clinician clicks **"Call Next Patient"** or selects an eligible patient token.
   - The backend executes `SELECT ... FOR UPDATE SKIP LOCKED`, locking the queue entry and updating status to `CALLED`.
   - Clinician specifies the consultation examination room (e.g., "Consultation Room 4").
3. **Announcement & Public Display**:
   - The SSE event `PATIENT_CALLED { token: 'A-104', room: 'Consultation Room 4' }` is broadcast.
   - Public waiting room displays flash: *"TOKEN A-104 PROCEED TO CONSULTATION ROOM 4"*.
   - If audio announcement is enabled, a text-to-speech chime announces the token and room.
4. **Consultation Start**:
   - Once the patient enters the room, the clinician clicks **"Begin Consultation"**.
   - Consultation status updates to `IN_PROGRESS`, and `consultations.started_at` is set.
   - The door-to-doctor interval ($\text{started\_at} - \text{encounter.arrival\_time}$) is finalized for reporting.

---

## 3. In-Consultation Documentation & Temporary Holds

### 3.1 Clinical Documentation Scope
During consultation, the clinician documents the following essential clinical parameters:
- **History of Present Illness (HPI)**: Concise clinical narrative.
- **Physical Examination Findings**: Relevant positive/negative findings.
- **Working / Primary Diagnosis**: Text or ICD-10 code string.
- **Immediate Orders**: Laboratory blood draws, plain X-rays, CT/MRI, bedside ultrasounds, or IV medication administrations.

### 3.2 Diagnostic Holds (`ON_HOLD`)
When a patient requires extensive investigations (e.g., 45-minute CT scan or awaiting troponin lab results):
- Clinician clicks **"Place on Diagnostic Hold"**.
- Consultation transitions to `PAUSED`; queue entry transitions to `ON_HOLD`.
- The examination room is freed for another patient.
- When results return, the clinician clicks **"Resume from Hold"**, returning the patient to the top of the queue for review of results.

---

## 4. Encounter Disposition & Closure

Every emergency encounter must conclude with an authenticated clinical disposition before the encounter can be closed.

| Disposition Code | Clinical Meaning | Mandatory Fields Required | Downstream Action |
| :--- | :--- | :--- | :--- |
| **`DISCHARGED`** | Patient medically stabilized; safe to return home. | Discharge summary notes, follow-up instructions, red-flag return warnings. | Encounter status $\rightarrow$ `DISCHARGED`; queue entry archived; room released. |
| **`ADMITTED_INPATIENT`** | Patient requires inpatient hospital admission. | Admitting department (e.g., Cardiology, ICU, Ortho), bed request priority, admitting doctor. | Transferred to Inpatient Bed Management; handoff record created. |
| **`TRANSFERRED_EXTERNAL`**| Patient transferred to another tertiary medical center. | Destination hospital name, transport mode (Ambulance/Air), transferring clinician sign-off. | Transfer summary generated; encounter status $\rightarrow$ `TRANSFERRED`. |
| **`LEFT_WITHOUT_BEING_SEEN`**| Patient walked out before consultation completed. | Departure time, clinical risk note, staff attempts to contact patient. | Encounter status $\rightarrow$ `LEFT_WITHOUT_BEING_SEEN`; risk review logged. |
| **`DECEASED`** | Patient expired during resuscitation/consultation. | Time of death, certifying physician ID, clinical resuscitation summary. | Encounter status $\rightarrow$ `DECEASED`; legal audit lock placed on record. |

---

## 5. Closure Invariants & Final Archival

- **Read-Only Lock**: Once `encounter.status` is set to any closed state (`DISCHARGED`, `ADMITTED`, `TRANSFERRED`, `LWBS`, `DECEASED`), the encounter record and its associated triage assessments become **immutable**.
- Subsequent corrections require a formal addendum signed by the Medical Director.
- All associated active queue entries and room allocations are deleted from active queues and preserved in historical reporting tables.
