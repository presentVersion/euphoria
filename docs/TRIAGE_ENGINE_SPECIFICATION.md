# Clinical Triage Decision Support Engine Specification

## 1. Triage Architecture & 3-Layer Separation of Concerns

The triage subsystem is the most safety-critical component of the application. It assists authorized healthcare staff in assessing patient clinical urgency without attempting autonomous medical diagnosis.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   3-LAYER CLINICAL TRIAGE ARCHITECTURE                 │
├────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: CLINICAL PROTOCOL (Policy & Rulesets)                        │
│   - Hospital-Approved Clinical Rulesets (e.g., ESI v4, MTS, CTAS)      │
│   - Configurable Physiological Thresholds & Age-Adjusted Cutoffs       │
│   - Protocol Versioning (e.g., ESI-v4.2, DEMO-PROTOCOL-v1)             │
│   - Production Governance Gate (Blocks unapproved demonstration rules) │
│                                  │                                     │
│                                  ▼                                     │
│ LAYER 2: TRIAGE ENGINE (Software Mechanics)                            │
│   - Input Validation & Physiological Sanity Range Checks               │
│   - Deterministic Red-Flag Detection (Immediate Level 1 Alert)         │
│   - Algorithm Execution -> Produces "Suggested Urgency Level"          │
│   - Reassessment Deadline Calculation                                  │
│                                  │                                     │
│                                  ▼                                     │
│ LAYER 3: CLINICAL DECISION (Human Clinician Authority)                 │
│   - Licensed Triage Nurse Reviews Symptoms, Vitals, and Suggestion     │
│   - Nurse Confirms Acuity OR Enters "Clinical Override" with Reason    │
│   - Supervised Dual-Signature Required for Urgency Downgrades          │
│   - Authoritative Urgency Committed to Queue Engine                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Clinical Protocol Models

### 2.1 The Emergency Severity Index (ESI) 5-Level Structure
The system defaults to an ESI-compatible 5-tier classification model:
- **Level 1 (Resuscitation / Immediate)**: Immediate life-saving intervention required (cardiac arrest, severe respiratory failure, massive hemorrhage, unresponsiveness).
- **Level 2 (Emergent)**: High-risk situation, acute mental status alteration, severe pain/distress, or dangerous vital signs (threat of rapid deterioration).
- **Level 3 (Urgent)**: Clinically stable, requiring two or more diagnostic or therapeutic resources (e.g., IV fluids + abdominal CT).
- **Level 4 (Less Urgent / Semi-Urgent)**: Clinically stable, requiring exactly one diagnostic resource (e.g., simple ankle X-ray, suture).
- **Level 5 (Non-Urgent)**: Clinically stable, requiring no complex resources (e.g., medication refill, simple wound dressing, rash check).

### 2.2 Demonstration Protocol vs. Approved Production Protocol
To ensure clinical safety:
- **Development Profile (`DEMO-PROTOCOL-v1`)**: Simple, transparent rule formula used strictly for local developer testing, QA automation, and hackathon evaluation. Clearly watermarked across the interface as `[UNAPPROVED DEMONSTRATION RULES]`.
- **Production Profile (`ESI-APPROVED-v4`)**: Comprehensive, institutional ruleset verified by the hospital's Clinical Governance Committee.
- **Production Gate**: The application strictly checks `is_approved_for_production === true` upon startup in `NODE_ENV=production`. If an unapproved protocol is active, triage scoring is locked, and an administrative block is raised.

---

## 3. Triage Inputs & Observation Validation

### 3.1 Physiological Observations & Validity Ranges
The API validates that submitted measurements fall within physiologically plausible bounds. Measurements outside these ranges are rejected to prevent data corruption.

| Measurement | Unit | Valid Clinical Range | Extreme Red-Flag Threshold (Adult) | Missing Handling |
| :--- | :--- | :---: | :---: | :--- |
| **Heart Rate** | bpm | 20 – 300 | $\le 40$ or $\ge 140\text{ bpm}$ | Nullable; marked `NOT_MEASURED` |
| **Systolic BP** | mmHg | 40 – 300 | $< 80$ or $\ge 220\text{ mmHg}$ | Nullable; marked `NOT_MEASURED` |
| **Diastolic BP**| mmHg | 20 – 200 | $\ge 120\text{ mmHg}$ | Nullable; marked `NOT_MEASURED` |
| **Respiratory Rate**| bpm | 4 – 80 | $< 8$ or $\ge 32\text{ bpm}$ | Nullable; marked `NOT_MEASURED` |
| **SpO2 Oxygen Sat** | % | 40.0 – 100.0 | $< 90.0\%$ (on room air) | Nullable; marked `NOT_MEASURED` |
| **Temperature** | °C | 25.0 – 45.0 | $< 35.0^\circ\text{C}$ or $\ge 40.0^\circ\text{C}$ | Nullable; marked `NOT_MEASURED` |
| **Consciousness** | Scale | AVPU / GCS 3–15 | `UNRESPONSIVE` or $\text{GCS} \le 8$ | Mandatory field |
| **Pain Score** | Scale | 0 – 10 | $\ge 8$ (Severe Pain) | Nullable; defaults to `NOT_ASSESSED` |

### 3.2 Handling Missing or Failed Observations (`SAF-002`)
- **Strict Invariant**: The system **NEVER** silently substitutes a missing vital sign with a normal default (e.g., omitting SpO2 must never assume 98%).
- A missing vital sign is stored as `NULL` in the database.
- If a critical vital sign is missing during triage, the Triage Engine flags `HIGH_DATA_UNCERTAINTY`, preventing the system from calculating a low-urgency score (Level 4 or 5) without an explicit nurse override confirmation.

---

## 4. Deterministic Triage Scoring Algorithm

The Triage Engine evaluates incoming observations through sequential decision gates:

```
[Incoming Patient Observations]
              │
              ▼
    [GATE 1: Immediate Life Threat / Red Flag?]
    - Consciousness = UNRESPONSIVE / GCS <= 8
    - SpO2 < 88% OR Respiratory Rate < 8 OR > 35
    - Severe Hypoperfusion (Systolic BP < 75)
    - Chief Complaint matches Resuscitation Keywords
              │
             YES ──────────────────────────────────► SUGGESTED URGENCY: LEVEL 1 (RESUSCITATION)
              │                                      - Broadcast Audible & Visual Red-Flag Alarm
             NO                                      - Route immediately to Trauma / Resus Bay
              ▼
    [GATE 2: High Risk / Severe Pain / Vital Sign Extremes?]
    - Severe Chest Pain radiating to jaw/arm
    - Acute Neurological Deficit (Stroke Window)
    - Severe Stridor / Wheeze
    - Pain Score >= 8 with Acute Abdomen
    - Systolic BP < 90 OR Heart Rate > 130
              │
             YES ──────────────────────────────────► SUGGESTED URGENCY: LEVEL 2 (EMERGENT)
              │                                      - Schedule Reassessment: 15 minutes
             NO                                      - Route to Acute Care Bay
              ▼
    [GATE 3: Resource Requirements Estimation?]
    - Anticipated Resources >= 2 (e.g., Labs + Imaging + IV Fluids)
              │
             YES ──────────────────────────────────► SUGGESTED URGENCY: LEVEL 3 (URGENT)
              │                                      - Schedule Reassessment: 30 minutes
             NO                                      - Route to Urgent Care Waiting
              ▼
    [GATE 4: Low Resource Requirements?]
    - Anticipated Resources = 1 (e.g., Single X-ray) ──► SUGGESTED URGENCY: LEVEL 4 (LESS URGENT)
    - Anticipated Resources = 0 (e.g., Prescription)  ──► SUGGESTED URGENCY: LEVEL 5 (NON-URGENT)
                                                         - Route to Fast-Track / Ambulatory Clinic
```

---

## 5. Clinician Confirmation, Overrides & Downgrades

### 5.1 Confirmation Workflow
1. The Triage Nurse views:
   - Patient Chief Complaint and Reported Symptoms.
   - Recorded Vital Signs (with physiological risk badges).
   - Matched Protocol Rules and **Suggested Urgency Level**.
2. If the nurse agrees:
   - Nurse clicks **"Confirm Urgency"**.
   - The urgency is committed to `Encounter.confirmed_urgency_level`.
   - The patient enters the prioritized queue immediately.

### 5.2 Clinical Upgrades (Escalations)
- A nurse can upgrade patient urgency (e.g., software suggests Level 3, nurse assigns Level 2 based on patient appearance/sweating) at any time with a recorded clinical note.
- Upgrades are encouraged to maintain clinical safety and require no secondary sign-off.

### 5.3 Clinical Downgrades (`SAF-004`)
- If a nurse or doctor attempts to lower acuity (e.g., software suggests Level 2 based on vitals, but clinician determines patient has chronic baseline vitals and wants Level 4):
  - System requires **Charge Nurse / Supervisor Co-Signature**.
  - System prompts for Supervisor Username, Password, and mandatory `downgrade_justification` text.
  - Rejection: Without valid supervisor authentication, the downgrade request is rejected with `403 Forbidden: Supervisor Authorization Required`.
  - Full audit record persisted with both clinicians' IDs.

---

## 6. Waiting Room Reassessment Protocol

1. **Scheduling**: Upon triage confirmation, the system creates a `ReassessmentRecord` with `scheduled_due_at`:
   - Level 1: Continuous monitoring in Resuscitation Bay.
   - Level 2: 15 minutes.
   - Level 3: 30 minutes.
   - Level 4: 60 minutes.
   - Level 5: 120 minutes.
2. **Alert States**:
   - $\text{Due Time} - 5\text{ mins}$: Queue entry shows yellow "Reassessment Due" warning badge.
   - $\text{Due Time} + 5\text{ mins}$: Queue entry turns red, status transitions to `REASSESSMENT_OVERDUE`, audible chime sounds on Charge Nurse console, and priority score receives $+20{,}000$ boost.
3. **Execution**: Triage nurse brings patient into triage bay, logs secondary vitals, reviews pain score, and submits reassessment. If the patient has deteriorated, urgency is reclassified, and queue order immediately updates.

---

## 7. Clinical Decision Support Boundaries & Limitations

The Triage Engine is bounded by strict clinical guardrails:
1. **Never Autonomously Diagnoses**: It outputs an urgency priority ranking, not a medical condition.
2. **Never Fabricates Data**: Missing observations remain visibly unmeasured.
3. **Never Guarantees Safety**: Low urgency (Level 5) does not mean a patient cannot deteriorate; the system enforces ongoing observation and reassessment.
4. **Never Replaces Staff Judgment**: A human clinician's judgment always supersedes an algorithmic score.
