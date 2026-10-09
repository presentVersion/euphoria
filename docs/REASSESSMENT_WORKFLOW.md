# Clinical Reassessment Workflow & Deterioration Monitoring

## 1. Objective & Clinical Rationale

Patients waiting in hospital emergency waiting rooms are physiologically dynamic. A patient triaged as Level 3 (Urgent) for abdominal pain may rapidly deteriorate into septic shock, or an elderly patient with respiratory symptoms may decompensate into acute hypoxia.

The Reassessment Workflow prevents "silent waiting room deterioration" by enforcing structured, periodic clinical evaluations with automated operational alarms.

```
                    [Initial Triage Confirmed]
                               │
                               ▼
            [Schedule Reassessment Deadline (due_at)]
            - Level 2: 15 minutes
            - Level 3: 30 minutes
            - Level 4: 60 minutes
            - Level 5: 120 minutes
                               │
                               ▼
                     [Continuous Monitoring]
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[T - 5 Mins: WARNING]                         [T + 5 Mins: OVERDUE ALARM]
- Yellow badge on queue card                  - Status transitions to REASSESSMENT_OVERDUE
- Waiting room time elapsed                   - Audible chime on Charge Nurse console
       │                                      - Queue Priority Score receives +20,000 boost
       │                                               │
       └───────────────────────┬───────────────────────┘
                               │
                               ▼
               [Triage Nurse Brings Patient In]
                 - Measure Secondary Vital Signs
                 - Re-evaluate Pain Score & Symptoms
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       [Patient Stable]              [Patient Deteriorating]
       - Confirm Urgency Level       - Escalation: e.g., Level 3 -> Level 2
       - Schedule Next Reassessment  - Immediate Care Area Transfer
       - Update Priority Score       - Alert Treating Clinician
```

---

## 2. Protocol Reassessment Intervals & Due-Time Calculation

When a patient's triage assessment is confirmed, the system calculates `scheduled_due_at = assessed_at + IntervalMinutes(urgency_level)`:

| Urgency Level | Clinical Description | Reassessment Interval | Target Care Area |
| :---: | :--- | :---: | :--- |
| **Level 1** | Resuscitation / Immediate | Continuous Monitoring | Resuscitation Bay |
| **Level 2** | Emergent / High Risk | **15 minutes** | Acute Care Bay |
| **Level 3** | Urgent | **30 minutes** | Urgent Care Waiting |
| **Level 4** | Less Urgent | **60 minutes** | Ambulatory Waiting |
| **Level 5** | Non-Urgent | **120 minutes** | Fast-Track / General Waiting |

*Note: Intervals are configurable in the department queue policy by authorized clinical administrators.*

---

## 3. Deterioration Detection & Trend Analysis

During reassessment, the nurse inputs a second set of observations into the Reassessment form:
1. **Trend Comparison**:
   - The interface displays the previous triage measurements alongside current readings with directional trend arrows ($\uparrow, \downarrow, \rightarrow$).
   - Flags physiological decline:
     - Heart rate increase $> 25\text{ bpm}$ or drop $> 30\text{ bpm}$.
     - SpO2 drop $\ge 3\%$ below baseline.
     - Systolic BP drop $\ge 20\text{ mmHg}$.
     - Worsening consciousness (e.g., Alert $\rightarrow$ Verbal).
2. **Clinical Reclassification**:
   - If deterioration is observed, the nurse updates `confirmed_urgency_level`.
   - The system immediately recalculates the queue priority score, causing the patient to leapfrog ahead of less acute patients.
   - The prior assessment record remains immutable; a new versioned `TriageAssessment` record is inserted with `measurement_phase = 'ACUTE_DETERIORATION'`.

---

## 4. Reassessment Operational Metrics & Missed Compliance

The system continuously tracks reassessment compliance for operational review:
- **Compliance Metric**: Percentage of reassessments completed within $\pm 10\text{ minutes}$ of the scheduled deadline.
- **Missed Reassessment Incident**: Any breach $> 30\text{ minutes}$ past the deadline automatically files a `REASSESSMENT_BREACH_INCIDENT` in the audit log, requiring the Charge Nurse to document the operational cause (e.g., "Severe trauma surge occupied all triage staff").
