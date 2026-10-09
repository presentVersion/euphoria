# Clinical Safety & Governance Specification

## 1. Governance Principles & Healthcare Safety Mandate

Software deployed in an Emergency Department directly influences patient survival and clinical outcomes. This document establishes the clinical governance rules, ethical boundaries, and medical safety controls enforced across the Smart Patient Queue & Emergency Triage System.

---

## 2. Regulatory & Institutional Classification

### 2.1 Clinical Decision Support (CDS) vs. Software as a Medical Device (SaMD)
- **Classification Posture**: The system functions strictly as an **Administrative Patient Flow and Clinical Decision Support (CDS)** tool. It is **NOT** an autonomous diagnostic medical device.
- **Statutory Guardrails**:
  1. The software provides recommendations based on established, publicly transparent, hospital-approved clinical triage scales (e.g., ESI, MTS).
  2. The software does not acquire, process, or analyze primary physiological waveforms (e.g., raw ECG signals or telemetry data).
  3. The software requires a licensed healthcare professional to independently review, verify, and confirm all suggested urgency classifications before clinical action is taken.
  4. The software provides full algorithmic transparency, presenting the specific physiological rules and criteria that triggered any suggested urgency score.

---

## 3. Mandatory Safety Guardrails

### 3.1 Prohibition of Algorithmic Normalcy Substitution (`SAF-002`)
In clinical practice, a failure to measure a vital sign often indicates an uncooperative, combative, or acutely deteriorating patient.
- **Enforcement**:
  - The database and API strictly reject any logic that substitutes missing vitals with population averages (e.g., assuming heart rate is 72 bpm if left blank).
  - Missing measurements are explicitly labeled `NOT_MEASURED` on all clinical dashboards.
  - The Triage Engine treats missing required observations as a marker of clinical uncertainty.

### 3.2 Anti-Downgrade Safeguards (`SAF-004`)
Emergency department overcrowding creates institutional pressure to clear queues. Unscrupulous administrative pressure could lead to lowering patient urgency levels to avoid reporting wait-time KPI breaches.
- **Enforcement**:
  - Triage nurses can escalate (raise) urgency unilaterally.
  - De-escalating (downgrading) urgency requires an explicit co-signature and authenticated approval from the **Charge Nurse / Triage Supervisor**.
  - All downgrade events are captured in the forensic audit log with the clinical reason and dual employee IDs.

### 3.3 Clinical Protocol Activation Governance (`SAF-006`)
- Development environments run on synthetic demonstration protocols (`DEMO-PROTOCOL-v1`).
- **Production Startup Check**:
  ```typescript
  if (process.env.NODE_ENV === 'production') {
    const activeProtocol = await getActiveTriageProtocol();
    if (!activeProtocol.isApprovedForProduction) {
      logger.fatal("FATAL: Production environment cannot activate unapproved demonstration triage protocol. Startup aborted.");
      process.exit(1);
    }
  }
  ```
- Activating a new protocol in production requires dual-control approval from the Hospital Medical Director and Chief Nursing Officer.

---

## 4. Downtime & Disaster Recovery Clinical Runbook (`SAF-007`)

When power, network, or server failures occur in an emergency department, physical triage cannot stop.

```
[SYSTEM OUTAGE OCCURS]
          │
          ▼
[Step 1: Immediate Paper-Chart Transition]
  - Staff retrieve pre-printed physical Emergency Triage Cards (Red, Orange, Yellow, Green, Blue).
  - Triage Nurse assigns physical sequential paper tokens (e.g., PAPER-001).
  - Clinical observations and vitals are documented manually on paper cards.
          │
          ▼
[Step 2: Emergency Department Floor Management]
  - Physical whiteboard updated by Charge Nurse.
  - Resuscitation cases moved immediately to trauma bay via verbal handover.
          │
          ▼
[Step 3: Post-Outage Digital Reconciliation]
  - IT team confirms system stability and data integrity.
  - Staff invoke "Outage Reconciliation Mode" on the Registration terminal.
  - Paper records are bulk-transcribed using original paper arrival timestamps.
  - System generates backfilled audit records tagged with `RECONCILED_POST_OUTAGE`.
```
