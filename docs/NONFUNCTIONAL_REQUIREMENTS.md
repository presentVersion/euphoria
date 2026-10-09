# Non-Functional Requirements & Clinical Safety Invariants

This catalog specifies all non-functional requirements (NFRs) and clinical safety invariants (`SAF`) governing the Smart Patient Queue & Emergency Triage System. All criteria are objectively measurable and verifiable.

---

## 1. Performance & Latency Requirements (`NFR-PERF`)

| ID | Parameter | Target Metric | Measurement Conditions | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-PERF-001** | Queue Reorder Latency | $\le 100\text{ ms}$ (p95) | Tested with 500 concurrent waiting patients in database. | Staff must see immediate queue response upon triage confirmation or patient calling. |
| **NFR-PERF-002** | Patient Search Latency | $\le 200\text{ ms}$ (p95) | Query against 100,000 synthetic patient records by MRN/Phone. | Registration desk cannot tolerate lag during ambulance triage intake. |
| **NFR-PERF-003** | Red-Flag Alert Broadcast | $\le 300\text{ ms}$ (p99) | From observation commit to SSE dispatch on all browser clients. | Critical life-threat alerts must reach clinicians instantaneously. |
| **NFR-PERF-004** | API Response Overhead | $\le 150\text{ ms}$ (p95) | Standard REST endpoints under 50 req/sec load. | Smooth frontend client interactions and rapid screen transitions. |
| **NFR-PERF-005** | Real-Time Reconnect Resync | $\le 1.0\text{ s}$ (p95) | Client network drop of 10s followed by authoritative state resync. | Ensures waiting staff regain accurate queue view immediately after Wi-Fi blips. |
| **NFR-PERF-006** | Database Transaction Overhead | $\le 50\text{ ms}$ (p95) | Concurrent row locking (`SKIP LOCKED`) during patient calls. | Prevents thread pool exhaustion during peak surge admissions. |

---

## 2. Reliability & Availability Requirements (`NFR-REL`)

| ID | Parameter | Target Metric | Measurement Conditions | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-REL-001** | System Availability | 99.9% Uptime | Measured 24/7/365 excluding planned maintenance windows. | Emergency departments never close; system outages directly impact clinical safety. |
| **NFR-REL-002** | Recovery Point Objective (RPO) | $\le 1\text{ minute}$ | Automated Write-Ahead Log (WAL) archiving to disaster replica. | Zero tolerance for lost triage assessments or patient queue positions. |
| **NFR-REL-003** | Recovery Time Objective (RTO) | $\le 15\text{ minutes}$ | Automated container failover and database replica promotion. | Critical hospital operations require rapid automated service restoration. |
| **NFR-REL-004** | Graceful Degradation | Read-Only Fallback | Database master failure triggers immediate read-replica queue display. | Staff can view current waiting room roster even during write-outage maintenance. |
| **NFR-REL-005** | Concurrency Conflict Rate | 0.00% Double-Calls | 100 simulated simultaneous clinician call attempts for same patient. | Atomic row locking guarantees exactly one clinician succeeds. |
| **NFR-REL-006** | Browser Session Resilience | Zero State Loss | Client unloads/reloads during form entry (Triage / Registration). | Form inputs cached in secure ephemeral memory to survive accidental tab closes. |

---

## 3. Security, Privacy & Integrity Requirements (`NFR-SEC`)

| ID | Parameter | Target Metric | Measurement Conditions | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-SEC-001** | Data Encryption in Transit | TLS 1.3 Mandatory | Modern cipher suites only; HSTS enabled with 1-year preload. | Prevents man-in-the-middle interception of protected health information (PHI). |
| **NFR-SEC-002** | Data Encryption at Rest | AES-256 | Database volumes, backup archives, and audit storage encrypted. | Protects patient identity and clinical records against physical drive theft. |
| **NFR-SEC-003** | Broken Object Authorization (BOLA) | 100% Defense | Automated penetration tests attempting cross-encounter modifications. | Clinicians can only modify encounters in departments they are authorized to manage. |
| **NFR-SEC-004** | Password Hashing Standard | Argon2id | Memory cost 64MB, time cost 3, parallelism 4. | Resistant to GPU-accelerated brute force attacks. |
| **NFR-SEC-005** | Audit Trail Immutability | Append-Only Enforcement | Database user permissions revoke `UPDATE` and `DELETE` on audit tables. | Ensures forensic tamper-resistance for clinical incident investigations. |
| **NFR-SEC-006** | Public Display Sanitization | Zero PHI Leakage | Public waiting room display API inspected for PII/PHI. | Waiting room monitors display only sequential tokens (`A-101`), never patient names. |

---

## 4. Accessibility & Human Factors Requirements (`NFR-ACC`)

| ID | Parameter | Target Metric | Measurement Conditions | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-ACC-001** | Dual-Encoding Urgency Badges | 100% Non-Color Alone | Every urgency indicator pairs color with explicit text and numerical tier. | Clinicians and staff with color vision deficiency must instantly recognize Level 1 vs Level 5. |
| **NFR-ACC-002** | Keyboard Navigation | 100% Operability | Full patient registration, triage scoring, and patient calling via keyboard. | High-speed keyboard data entry by triage nurses during mass-casualty surges. |
| **NFR-ACC-003** | WCAG 2.1 AA Compliance | 100% Pass | Contrast ratios $\ge 4.5:1$ for normal text, $\ge 3:1$ for large headings and UI icons. | Readable in diverse hospital lighting (harsh fluorescent lights, dark trauma bays). |
| **NFR-ACC-004** | Screen Reader Announcements | ARIA Live Regions | New red-flag alerts and patient call events announce via `aria-live="assertive"`. | Ensures visually impaired healthcare staff receive critical operational updates. |

---

## 5. Clinical Safety Invariants (`SAF`) — NON-NEGOTIABLE

These safety rules take legal, operational, and architectural precedence over all performance, administrative, and interface considerations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CLINICAL SAFETY HIERARCHY OF LAWS                    │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [SAF-001] Emergency Bypass takes precedence over administrative data│
│ 2. [SAF-002] Missing physiological data is never treated as normal     │
│ 3. [SAF-003] Software suggests; authorized clinicians confirm/override │
│ 4. [SAF-004] Urgency downgrades require supervisor dual-authorization   │
│ 5. [SAF-005] Starvation safeguards trigger clinical reassessments      │
│ 6. [SAF-006] Experimental triage engines remain disabled in production │
│ 7. [SAF-007] System outages activate paper-chart reconciliation runbook│
│ 8. [SAF-008] Audit logs capture all clinical decisions without failure │
└────────────────────────────────────────────────────────────────────────┘
```

| ID | Safety Invariant | Architectural Enforcement Mechanism | Violation Consequence |
| :--- | :--- | :--- | :--- |
| **SAF-001** | **Emergency Bypass Primacy**: Administrative data entry must never delay medical resuscitation. | 1-click Emergency Bypass creates `TEMP-EMERG-XXXX` encounter, immediately notifying trauma bay without requiring name, ID, or payment. | Registration forms cannot block encounter submission if flagged as `EMERGENCY_BYPASS`. |
| **SAF-002** | **No Inferred Physiological Normalcy**: Missing vital signs must never be default-populated with "normal" physiological ranges. | Database enforces nullable vital sign columns; schema strictly differentiates between `0` (e.g., pulse arrest) and `NULL` (not measured). | Triage engine treats missing required vitals as high-uncertainty risk, prompting staff confirmation. |
| **SAF-003** | **Clinical Authority Gate**: Algorithmic triage suggestions must never autonomously commit clinical urgency. | Database schema stores `suggested_urgency_level` and `confirmed_urgency_level` in separate fields. An encounter cannot enter the prioritized queue without clinician confirmation. | Prevents unvalidated machine learning or algorithmic scoring from operating as an unapproved medical device. |
| **SAF-004** | **Supervised Urgency Downgrade**: Lowering patient urgency (e.g., Level 2 to Level 3) requires supervisor dual-authorization. | API enforces role check for `CHARGE_NURSE` or `SUPERVISOR` when `new_urgency > previous_urgency` (lower priority); requires recorded clinical justification. | Prevents staff from artificially downgrading clinical acuity to mask queue wait-time KPI breaches. |
| **SAF-005** | **Deterioration Reassessment Guard**: Waiting patients must be reassessed at protocol intervals; overdue status triggers priority boost. | Queue calculation engine injects $+20{,}000$ priority score penalty for patients with breached reassessment deadlines, raising them to the top of their tier. | Prevents patients from dying of unmonitored physiological deterioration in crowded waiting rooms. |
| **SAF-006** | **Unapproved Protocol Lockdown**: Demonstration or experimental triage rulesets must never be active in production environments. | Protocol entity contains `is_approved_for_production` boolean. Application rejects production startup if active protocol is unapproved. | Eliminates legal and clinical liability from unvalidated hackathon demonstration formulas. |
| **SAF-007** | **Paper-Chart Reconciliation Runbook**: Technical outages must not halt physical emergency triage. | System provides offline printable triage tokens and a dedicated bulk-reconciliation API endpoint to backfill manual paper triage records upon recovery. | Hospital continues triage during full power/network failure; digital audit trail restored post-recovery. |
| **SAF-008** | **Fail-Closed Audit Trail**: If the audit logger fails to persist a clinical decision event, the transaction must abort. | Database triggers encapsulate clinical state mutations within the same atomic transaction as the audit record insertion. | Guarantees 100% forensic auditability for medical malpractice and clinical review boards. |
