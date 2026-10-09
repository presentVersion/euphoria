# Synthetic Demonstration Scenarios (Scenarios A through N)

All patient names, identification numbers, and clinical histories in this document are **100% synthetic and fictitious**. They are designed exclusively for automated testing, developer demonstration, and hackathon evaluation.

---

### Scenario A: Routine Registration & Normal Consultation
- **Profile**: Ramesh Gupta, 42M, twisted ankle, pain score 4.
- **Workflow**:
  1. Receptionist registers patient $\rightarrow$ Encounter created.
  2. Triage Nurse records vitals (HR 78, BP 122/80, SpO2 99%, RR 16).
  3. Protocol suggests Level 4 (Semi-Urgent, single X-ray needed). Nurse confirms Level 4; token `FT-101` generated.
  4. Enters Fast-Track Queue. Doctor calls `FT-101` to Room 2.
  5. X-ray shows minor ligament sprain; Doctor discharges with elastic bandage and prescription. Encounter closed.

---

### Scenario B: Emergency Escalation (Acute Chest Pain)
- **Profile**: Priya Nair, 58F, waiting in Urgent Care with indigestion, develops severe substernal chest pressure radiating to neck, cold sweats.
- **Workflow**:
  1. Patient alerts waiting room triage clerk.
  2. Nurse clicks "Emergency Escalation", measures vitals: HR 128, BP 82/50, SpO2 90%.
  3. System triggers immediate Level 1 Red-Flag Alert (+50,000 priority boost).
  4. Audible alarm sounds in Resuscitation Bay; patient transferred immediately to Trauma Bed 1.

---

### Scenario C: Deterioration While Waiting (Dengue Fever / Sepsis)
- **Profile**: Amit Verma, 29M, triaged as Level 3 (Urgent) for high fever and body ache (reassessment due in 30 mins).
- **Workflow**:
  1. At minute 35, reassessment deadline breaches; status turns `REASSESSMENT_OVERDUE` (+20,000 priority boost).
  2. Triage Nurse calls patient in: secondary vitals show HR spiked to 142, BP dropped to 86/55, severe lethargy.
  3. Nurse updates urgency to Level 2 (Emergent); queue priority updates; patient called by doctor within 3 minutes.

---

### Scenario D: Unidentified Emergency Patient (Pedestrian Hit-and-Run)
- **Profile**: Unknown Male, estimated age 30–35, unconscious, severe head trauma, active bleeding.
- **Workflow**:
  1. Paramedics arrive; Receptionist clicks **"EMERGENCY BYPASS"**.
  2. Zero demographic form fields required; token `TEMP-EMERG-8120` generated.
  3. Encounter status set to `WAITING_FOR_TRIAGE` with Urgency Level 1; Resuscitation Bay alerted in $< 1\text{ second}$.
  4. Patient admitted directly to Resus Bed 2.

---

### Scenario E: Simultaneous Staff Actions (Double-Call Defense)
- **Profile**: Sunita Devi, 64F, Level 2 waiting in Acute Care Bay.
- **Workflow**:
  1. Dr. Rao (Room 1) and Dr. Mehta (Room 3) simultaneously click "Call Next Patient" at 11:04:12.100 AM.
  2. PostgreSQL executes `FOR UPDATE SKIP LOCKED`.
  3. Dr. Rao locks and acquires Sunita Devi.
  4. Dr. Mehta's query automatically skips Sunita Devi and acquires the next patient (Karan Johar, Level 3).
  5. Both clinicians receive distinct patients; zero double-call conflict.

---

### Scenario F: Department Transfer (Sub-Acute to Acute)
- **Profile**: Vikram Malhotra, 51M, initially triaged to Urgent Care for mild asthma.
- **Workflow**:
  1. In exam room, patient develops acute severe bronchospasm unresponsive to nebulizers.
  2. Clinician requests Care Area Transfer to Acute Care Bay (`Q-ACUTE`).
  3. Clinician enters SBAR note. Acute Care Nurse accepts transfer.
  4. Patient queue entry moves from `Q-URGENT` to `Q-ACUTE` with elevated priority.

---

### Scenario G: Real-Time Network Disconnection & Recovery
- **Profile**: Dr. Patel's tablet loses Wi-Fi connection in basement triage area for 12 seconds.
- **Workflow**:
  1. Tablet detects SSE drop; after 5 seconds, displays yellow warning: *"RECONNECTING — QUEUE DATA MAY BE STALE"*.
  2. Call Patient button is disabled.
  3. Wi-Fi reconnects; tablet fetches `/api/v1/queues/{id}/snapshot`.
  4. Roster updates with authoritative server state; warning banner clears.

---

### Scenario H: Auxiliary Notification Gateway Failure
- **Profile**: Neha Kapoor, 24F, ambulatory waiting patient.
- **Workflow**:
  1. Doctor calls patient; system attempts to send optional SMS alert.
  2. External SMS provider returns `500 Gateway Timeout`.
  3. System catches error, records `NOTIFICATION_DELIVERY_FAILED` in operational log.
  4. Internal hospital audio chime and public waiting board display flash normally; core clinical care proceeds without delay.

---

### Scenario I: Unauthorized Urgency Downgrade Attempt
- **Profile**: Deepak Joshi, 35M, triaged as Level 2 (High Acuity).
- **Workflow**:
  1. Registration clerk attempts to change urgency to Level 4 to improve department wait-time metrics.
  2. API validates user role (`RECEPTIONIST`) against permission `triage:downgrade_urgency`.
  3. API rejects with `403 Forbidden: Supervisor Dual-Signature Required`.
  4. Security audit logs unauthorized downgrade attempt.

---

### Scenario J: Unapproved Clinical Protocol Rejection
- **Profile**: Hospital Admin testing experimental scoring formula.
- **Workflow**:
  1. Admin uploads `EXPERIMENTAL-AI-TRIAGE-v0.1` and attempts to activate for production.
  2. System checks `is_approved_for_production`.
  3. In `NODE_ENV=production`, server rejects activation: `400 Bad Request: Unapproved Triage Protocol Cannot Be Activated in Production`.
  4. Existing approved protocol (`ESI-v4`) remains active.

---

### Scenario K: Duplicate Patient Detection & Reconciliation
- **Profile**: Anita Roy, 45F, arriving for second visit.
- **Workflow**:
  1. Receptionist starts new registration for "Anita Roy", DOB 15-Aug-1981.
  2. Duplicate engine matches existing record `MRN-2024-001928` with 94% confidence.
  3. Side-by-side comparison modal displays prior visit history and phone number.
  4. Receptionist confirms identity and links new visit to existing `Patient.id`.

---

### Scenario L: Patient Leaves Without Being Seen (LWBS)
- **Profile**: Manoj Kumar, 38M, Level 4 (mild rash), waits 90 minutes.
- **Workflow**:
  1. Doctor calls token `FT-112`; patient does not report after 3 calls.
  2. Triage nurse verifies waiting room; patient has departed.
  3. Staff records disposition `LEFT_WITHOUT_BEING_SEEN` with departure notes.
  4. Queue entry archived; encounter closed.

---

### Scenario M: Waiting-Time Estimate Sparse Data Fallback
- **Profile**: 06:15 AM shift start in newly opened Pediatric Emergency clinic.
- **Workflow**:
  1. Only 2 patients have been seen since shift start ($< 5\text{ completed consultations}$).
  2. API `/wait-estimate` checks sample size threshold.
  3. System returns `status: "ESTIMATE_UNAVAILABLE"` with friendly explanation.
  4. Prevents misleading or fabricated wait-time predictions.

---

### Scenario N: Database Crash Recovery & Audit Ledger Verification
- **Profile**: Unplanned server power interruption during busy evening shift.
- **Workflow**:
  1. PostgreSQL container restarts; write-ahead log (WAL) replays cleanly.
  2. Application boots and runs cryptographic audit ledger check.
  3. Verification confirms unbroken SHA-256 state chain.
  4. Active queue state, triage assessments, and called patients recover without data loss.
