# Risk Register & Open Questions Specification

## 1. Comprehensive Risk Register

The following register identifies operational, clinical, security, and technical risks associated with the Smart Patient Queue & Emergency Triage System.

| ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Detection Method | Owner | Blocks Production? |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **RSK-001** | Missing Institutional Clinical Protocol Approval | High | Critical | Gate production startup (`SAF-006`); clearly watermark development demo profile. | Startup environment check. | Medical Director | **YES** |
| **RSK-002** | Unmonitored Waiting Room Patient Deterioration | High | Critical | Enforce scheduled reassessment countdowns; inject $+20{,}000$ priority penalty and alarms upon breach. | Reassessment overdue monitor. | Charge Nurse | **YES** |
| **RSK-003** | Double-Call Race Condition (Two Doctors Call Same Patient) | Moderate | High | Atomic database row locking via `FOR UPDATE SKIP LOCKED`. | Automated concurrency test (`TC-CON-01`). | Lead Architect | **YES** |
| **RSK-004** | Administrative Pressure to Downgrade Acuity for KPIs | Moderate | Critical | Enforce Charge Nurse dual-signature for downgrades (`SAF-004`); log forensic audit. | Audit log anomaly scanner. | Chief Nursing Officer | **YES** |
| **RSK-005** | Silent Treatment of Missing Vitals as Normal | High | Critical | Enforce nullable database columns (`SAF-002`); flag high data uncertainty. | Unit tests; schema constraint. | Backend Lead | **YES** |
| **RSK-006** | False Reassurance from Low Urgency Score | Moderate | High | Require clinician confirmation; explicit disclaimers that Level 5 is not an immunity from deterioration. | Triage workflow validation. | Triage Lead | **YES** |
| **RSK-007** | Duplicate Patient Registrations Causing Fragmented History | High | Moderate | Composite duplicate detection algorithm (Soundex + DOB); side-by-side staff prompt. | Duplicate detection test. | Registration Lead | No |
| **RSK-008** | Stale Client Data Overwriting Fresh Clinical Decision | Moderate | High | SSE disconnect detection ($>5\text{s}$) locks action buttons; row-version optimistic check on mutations. | Network partition test. | Frontend Lead | **YES** |
| **RSK-009** | Misleading Waiting Time Precision | High | Moderate | Output broad confidence bands (e.g., 15–30m); fallback to `ESTIMATE_UNAVAILABLE` on sparse data. | Wait-time estimation test. | Product Manager | No |
| **RSK-010** | Leakage of Patient PHI to Public Waiting Room TV Displays | Moderate | Critical | Dedicated public SSE endpoint transmitting only sanitized anonymous tokens (`AC-104`). | Automated API payload scanner. | Security Lead | **YES** |
| **RSK-011** | Hospital Network Partition or Total Power Outage | Low | Critical | Emergency physical paper-chart triage runbook (`SAF-007`); post-outage reconciliation tool. | Disaster recovery drill. | DevOps Lead | **YES** |
| **RSK-012** | Audit Ledger Tampering by Malicious Database Administrator | Low | Critical | Cryptographic SHA-256 hash chaining; revoke `UPDATE`/`DELETE` permissions on audit table. | Cryptographic chain validator. | Security Lead | **YES** |
| **RSK-013** | External SMS Gateway Outage Halting Triage Operations | High | Low | Isolate external communication behind asynchronous non-blocking adapter; core queue unaffected. | Mock gateway failure test. | Integration Lead | No |
| **RSK-014** | Waiting Room Starvation of Low-Acuity Patients | High | Moderate | Anti-starvation multiplier accelerating priority score after $200\%$ target wait; charge nurse alert. | Queue aging monitor. | Department Manager | No |
| **RSK-015** | Accidental Deployment of Synthetic Test Patients to Production | Low | High | Seed scripts check `NODE_ENV === 'production'` and abort if synthetic patient records detected. | CI/CD deployment check. | DevOps Lead | **YES** |
| **RSK-016** | Cross-Department Access Block During Disaster Surge | Low | High | Break-glass emergency elevated access workflow with 2-hour timeout and mandatory justification. | Break-glass test suite. | Security Lead | No |
| **RSK-017** | Flawed Care Area Transfer Leading to Lost Patient Handoff | Moderate | High | Transfer requires receiving care area nurse to click "Accept Transfer" before queue entry moves. | E2E transfer test. | Nursing Lead | **YES** |
| **RSK-018** | Browser Audio Autoplay Block Silencing Critical Alarms | Moderate | High | User interaction gate on login modal acquiring browser audio permission. | Browser audio check. | QA Lead | **YES** |
| **RSK-019** | Brute Force Password Guessing on Staff Workstations | Moderate | Moderate | Argon2id hashing; account lock after 5 failed attempts for 15 minutes. | Security penetration test. | Security Lead | **YES** |
| **RSK-020** | Regulatory Non-Compliance with Indian DPDP Act 2023 | Low | High | Enforce emergency deemed consent exception; data minimization; column-level encryption. | Legal review. | Compliance Officer | **YES** |
| **RSK-021** | UI Performance Lag During Mass Surge Influx | Moderate | Moderate | Paginated sub-queues; virtualized list rendering; p95 query latency $< 100\text{ ms}$. | k6 load test (500 patients). | Frontend Lead | No |

---

## 2. Open Stakeholder Decisions & Technical Questions

The following questions represent institutional and clinical decisions requiring stakeholder resolution prior to enterprise hospital commissioning. They do **NOT** block the Phase 0 blueprint or local prototype development:

1. **Approved Clinical Protocol**: Which triage ruleset (e.g., ESI v4, Manchester Triage System, or custom hospital protocol) will be formally approved by the hospital clinical governance committee?
   - *Current Blueprint Assumption*: Defaults to ESI-compatible 5-tier classification; uses `DEMO-PROTOCOL-v1` for development.
2. **Reassessment Interval Policy**: Does the hospital mandate 15m, 30m, 60m, or different intervals for Level 2 and Level 3 patients?
   - *Current Blueprint Assumption*: Configurable defaults (L1: Continuous, L2: 15m, L3: 30m, L4: 60m, L5: 120m).
3. **Supervisor Downgrade Approval Role**: Which specific roles are legally empowered to authorize urgency downgrades? Charge Nurse only, or any Senior Attending Physician?
   - *Current Blueprint Assumption*: `CHARGE_NURSE` role.
4. **Public Display Token Format**: Does the hospital prefer department-prefixed tokens (e.g., `RES-01`, `AC-104`, `FT-201`) or a unified hospital-wide numerical sequence (`101`, `102`)?
   - *Current Blueprint Assumption*: Department-prefixed tokens (`AC-104`).
5. **Break-Glass Notification Target**: Should break-glass alerts dispatch to Hospital Security, the Chief Medical Officer, or the Department Head?
   - *Current Blueprint Assumption*: Logged to audit ledger and pushed via SSE to Charge Nurse console.
