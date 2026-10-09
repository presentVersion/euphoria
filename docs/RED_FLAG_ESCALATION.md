# Red-Flag Emergency Escalation Protocol

## 1. Protocol Purpose & Critical Trigger Gates

The Red-Flag Emergency Escalation mechanism ensures that acute, life-threatening clinical conditions immediately break through administrative queues, dispatching high-priority audible and visual alerts across all clinical terminals.

```
                      [Trigger: Automated Rule Evaluation OR Manual Panic Button]
                                                    │
                                                    ▼
                                  [Persist RedFlagAlert in Database]
                                                    │
                                                    ▼
                                  [SSE Real-Time Broadcast to Terminals]
                                                    │
                        ┌───────────────────────────┴───────────────────────────┐
                        ▼                                                       ▼
            [Visual Flashing Banner]                                [Medical Auditory Pulse]
            - High-contrast alert header                            - Standard IEC 60601-1-8 acoustic pulse
            - Red flashing border around patient token              - Sounds continuously until acknowledged
                        │                                                       │
                        └───────────────────────────┬───────────────────────────┘
                                                    │
                                                    ▼
                                    [Mandatory Clinician Acknowledgement]
                                      - Clinician clicks "ACKNOWLEDGE ALERT"
                                      - Records acknowledging staff ID & timestamp
                                      - Alert sound silences; banner remains pinned
                                                    │
                                                    ▼
                                    [Direct Transfer to Resuscitation Bay]
```

---

## 2. Automated Trigger Criteria (Adult Thresholds)

An automated red flag is generated instantly if any of the following physiological or symptom criteria are met:

| Category | Clinical Criteria | Physiological Trigger Threshold |
| :--- | :--- | :--- |
| **Airway / Breathing** | Severe Hypoxia | $\text{SpO}_2 < 88\%$ on room air |
| | Respiratory Arrest / Severe Bradypnea | $\text{Respiratory Rate} < 8\text{ breaths/min}$ |
| | Severe Tachypneic Distress | $\text{Respiratory Rate} \ge 35\text{ breaths/min}$ |
| | Stridor / Obstructed Airway | Keyword flag `STRIDOR` or `FOREIGN_BODY_AIRWAY` |
| **Circulation** | Extreme Hypotension / Shock | $\text{Systolic BP} < 75\text{ mmHg}$ |
| | Severe Hypertensive Crisis | $\text{Systolic BP} \ge 220\text{ mmHg}$ AND Symptoms |
| | Extreme Tachycardia / Bradycardia | $\text{Heart Rate} < 35\text{ bpm}$ or $> 150\text{ bpm}$ |
| **Neurological** | Unresponsiveness / Coma | Consciousness = `UNRESPONSIVE` or $\text{GCS} \le 8$ |
| | Acute Stroke Presentation | Acute facial droop, hemiparesis, dysphasia $< 4.5\text{ hrs}$ |
| **Symptom Flags** | Massive Hemorrhage | Active, uncontrolled arterial bleeding |
| | Cardiac Arrest | No palpable pulse; CPR underway |

---

## 3. Manual Staff Escalation (Panic Action)

Any authorized healthcare staff member (Receptionist, Triage Nurse, or Doctor) can trigger a manual Emergency Escalation at any time:
1. Staff clicks the persistent red **"EMERGENCY ESCALATION"** button located in the top navigation bar.
2. Staff selects the patient token or enters a brief identifier (e.g., "Waiting room chair 12 - collapsed").
3. System immediately:
   - Sets patient urgency to Level 1 (Resuscitation).
   - Generates a `RedFlagAlert` record with `alert_type = 'MANUAL_PANIC_BUTTON'`.
   - Injects a $+50{,}000$ priority score boost, placing the patient at the absolute top of the queue.
   - Dispatches SSE emergency broadcast to the Resuscitation Bay and Charge Nurse consoles.

---

## 4. Multi-Terminal Alarm & Acknowledgement Workflow

### 4.1 Alarm Presentation
- **Visual**: A full-width, high-contrast banner flashes across all terminals in the department:
  *"CRITICAL LIFE-THREAT ALERT: TOKEN [RES-01] — UNRESPONSIVE PATIENT IN TRIAGE BAY 2"*.
- **Audible**: Audio tone pattern conforming to IEC 60601-1-8 medical alarm standards (three short pulses, brief pause, two short pulses) repeats every 10 seconds.

### 4.2 Acknowledgement Requirements
- The alarm sound cannot be silenced without an authenticated staff action.
- Any clinician in the target care area clicks **"ACKNOWLEDGE ALERT"**.
- System records:
  - `acknowledged_by_id` -> Clinician UUID.
  - `acknowledged_at` -> Timestamp (UTC).
- Audio silences immediately; visual banner turns solid red and remains pinned until the patient is admitted to a bed or the clinical crisis is resolved.
- **Fail-Safe**: If an alert remains unacknowledged after 60 seconds, an escalation push is dispatched to the Hospital Supervisor's mobile console and department overhead paging.
