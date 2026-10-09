# Project Overview: Smart Patient Queue & Emergency Triage

## 1. Problem Statement & Clinical Context

Hospitals, urgent care clinics, and Emergency Departments (EDs) worldwide operate in high-stress, resource-constrained environments characterized by unpredictable patient arrival spikes, fluctuating clinical acuity, and finite clinical staffing.

In traditional setups:
1. **Subjective or Paper-Based Triage**: Patients are frequently triaged manually using paper slips or isolated spreadsheets, leading to inconsistent urgency grading, delayed recognition of deteriorating patients, and transcription errors.
2. **First-Come, First-Served Queuing Failures**: Non-dynamic queues risk placing a clinically deteriorating patient behind a routine, ambulatory patient who arrived 15 minutes earlier.
3. **Waiting Room Blind Spots**: Once patients enter the waiting area, their physiological status is often unmonitored until their name is called. Patients who "quietly deteriorate" (e.g., developing sepsis, escalating chest pain, or respiratory failure) may suffer adverse events without staff awareness.
4. **Coordination Gaps**: Triage nurses, registration clerks, and treating physicians often work in informational silos, leading to double-calling of patients, confusion over care area assignments (e.g., Resuscitation Bay vs. Fast Track), and delayed handoffs.

The **Smart Patient Queue & Emergency Triage System** is designed to eliminate these failure points by establishing a unified, web-based operational platform that connects patient registration, clinical triage assessment, dynamic queue prioritization, and consultation workflow into a continuous, audited, safety-first loop.

---

## 2. Core Value Proposition & System Objectives

The platform delivers six primary capabilities:

```
[Arrival & Identification]
         │
         ▼
[Emergency Red-Flag Gate] ──(Red Flag Detected)──► [Direct Resuscitation Bypass]
         │                                                      │
   (Normal Flow)                                                │
         │                                                      │
         ▼                                                      ▼
[Structured Clinical Triage] ──────────────────────────► [Clinical Override / Confirmation]
         │                                                      │
         ▼                                                      ▼
[Multi-Factor Queue Prioritization Engine] ◄────────────────────┘
         │
         ├───► [Care Area / Department Routing]
         ├───► [Real-Time Waiting Room Monitoring & Reassessment Alarms]
         └───► [Clinician Consultation Workflow & Final Disposition]
```

1. **Safety-Centric Registration**: Fast patient identification, duplicate prevention, and zero-barrier emergency bypass for unidentified, unconscious, or critically unstable patients.
2. **Standardized Clinical Decision Support**: A deterministic, rule-driven triage engine that calculates a protocol-suggested urgency score without substituting for clinical judgment.
3. **Dynamic Multi-Factor Queue Prioritization**: Moving beyond simple FIFO (First In, First Out) by calculating queue priority based on clinical urgency, red-flag escalation, waiting-room elapsed time, and impending reassessment deadlines.
4. **Proactive Waiting Room Reassessment**: Automated countdown timers and escalation alarms alerting charge nurses when high-acuity patients are due or overdue for secondary clinical checks.
5. **Audited Clinical Governance**: Every urgency change, protocol suggestion override, or priority downgrade requires a mandatory clinical rationale and authenticated clinician signature.
6. **Real-Time Operational Visibility**: Live event streaming updates queue state instantly across registration desks, triage stations, doctor consultation rooms, and supervisor consoles without manual browser refreshes.

---

## 3. End-to-End Clinical Journey

### Step 1: Patient Arrival & Registration
- Patient arrives via walk-in, ambulance, or wheelchair.
- Receptionist performs an immediate lookup via national ID, hospital MRN, or phone number.
- If the patient exhibits acute distress (e.g., severe hemorrhage, cardiac arrest, unresponsiveness), staff triggers **Emergency Bypass**, immediately routing the patient to Resuscitation and generating an emergency token (`TEMP-EMERG-XXXX`).
- Routine arrivals have their demographic and administrative information captured and an active Encounter generated.

### Step 2: Immediate Red-Flag Screening & Clinical Triage
- Triage Nurse captures presenting complaints, reported symptom duration, and measured vital signs (Heart Rate, Blood Pressure, Respiratory Rate, SpO2, Temperature, Glasgow Coma Scale / AVPU).
- The Triage Engine evaluates physiological observations against the active, hospital-approved triage protocol rules.
- Red flags trigger instant visual and auditory alerts across department terminals.
- The software calculates a **Suggested Urgency Level** (Levels 1 through 5). The Triage Nurse confirms or adjusts the score with a mandatory recorded reason, selecting the target Care Area (e.g., Trauma Bay, Pediatric Urgent Care, Adult Acute).

### Step 3: Dynamic Queue Insertion & Monitoring
- The patient enters the active department queue.
- The Queue Engine calculates their position based on Urgency Weight, Emergency Escalation Multipliers, Waiting Time, and Overdue Reassessment status.
- Waiting room monitors display anonymous tokens (e.g., `A-104`), current queue progress, and estimated wait bands.

### Step 4: Continuous Reassessment
- The system enforces protocol-defined reassessment deadlines (e.g., Level 2 every 15 minutes, Level 3 every 30 minutes).
- As deadlines approach, the patient's queue entry displays a yellow warning; once breached, an audible and visual "Reassessment Overdue" alarm fires, temporarily raising the queue priority to ensure timely clinical re-evaluation.

### Step 5: Consultation Calling & Intake
- Available treating clinicians view their department's prioritized worklist.
- The clinician clicks "Call Patient", atomically locking the queue entry and transitioning the status to `CALLED`.
- Upon patient arrival in the examination room, the consultation transitions to `IN_CONSULTATION`.

### Step 6: Encounter Completion & Disposition
- The physician records clinical findings, diagnostic requests, and final disposition:
  - **Discharged**: Encounter closed; discharge summary generated.
  - **Admitted**: Transferred to inpatient ward queue; handoff recorded.
  - **Referred / Transferred**: Outgoing transfer to external hospital or specialized facility.
  - **Left Without Being Seen (LWBS)**: Administrative closure with clinical safety notification.

---

## 4. Key Success Metrics

| Metric | Target | Measurement Baseline |
| :--- | :--- | :--- |
| **Door-to-Triage Time** | < 10 minutes | Time from registration arrival timestamp to initial triage assessment confirmation. |
| **Emergency Red-Flag Time-to-Bay** | < 60 seconds | Time from red-flag trigger to clinical intake in Resuscitation. |
| **Reassessment Compliance** | > 95% | Percentage of high-acuity patients reassessed within protocol time windows. |
| **Left Without Being Seen (LWBS) Rate** | < 2% | Patients departing before doctor consultation. |
| **Queue Race Condition Rate** | 0.00% | Concurrency conflicts (duplicate patient calls) prevented by atomic locking. |
| **Audit Traceability** | 100% | Percentage of urgency changes and overrides with recorded clinician ID, timestamp, and rationale. |
