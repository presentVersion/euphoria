# Centralized Business Rules Registry (`BR-001` through `BR-050`)

This document is the authoritative enterprise rules register for the Smart Patient Queue & Emergency Triage System. All software implementation, database constraints, API validations, and testing assertions must comply with these numbered rules.

---

## 1. Patient Identity & Encounter Rules (`BR-001` – `BR-008`)

- **BR-001 (Unique Active Encounter)**: A patient can have multiple historical encounters in the hospital record, but cannot have more than one non-closed encounter active concurrently.
- **BR-002 (Immutable Arrival Timestamp)**: The `arrival_time` recorded when an encounter is created is immutable and can never be updated, edited, or reset.
- **BR-003 (Mandatory Chief Complaint)**: An encounter cannot be created without a recorded presenting chief complaint of at least 5 characters.
- **BR-004 (Duplicate Match Key)**: A new registration matching an existing record on Phone + Birth Year, or Phonetic Name + Exact Birth Date, must be flagged for manual staff review.
- **BR-005 (Prohibition of Silent Merging)**: Automated merging of patient records based on name similarity is strictly prohibited; merges require explicit authorization.
- **BR-006 (Administrative Sex Handling)**: If a patient's sex is unknown or refused, it must be recorded as `UNKNOWN` without halting encounter generation.
- **BR-007 (Temporary Identifier Structure)**: Unidentified patients must be assigned an immutable temporary token formatted as `TEMP-EMERG-[YYYYMMDD]-[HEX4]`.
- **BR-008 (Correction Window)**: Registration clerks may correct demographic clerical errors within 2 hours of submission; corrections require a logged reason.

---

## 2. Emergency Bypass Rules (`BR-009` – `BR-014`)

- **BR-009 (Emergency Bypass Primacy)**: Acute, life-threatening arrivals must never be delayed by demographic data collection (`SAF-001`).
- **BR-010 (Emergency Default Urgency)**: Encounters created via Emergency Bypass are automatically initialized with Urgency Level 1 (Resuscitation).
- **BR-011 (Immediate Care Area Allocation)**: Emergency Bypass encounters must be assigned to an active Resuscitation Bay (`is_resuscitation = true`).
- **BR-012 (Instant Alarm Broadcast)**: Emergency Bypass execution must immediately emit an audible and visual Red-Flag Alarm across all Resuscitation Bay terminals.
- **BR-013 (Wristband Generation)**: Emergency Bypass encounters must generate a scannable temporary barcode wristband within 5 seconds.
- **BR-014 (Post-Stabilization Reconciliation)**: Once stabilized, temporary emergency encounters must be linked to a permanent patient record by a Charge Nurse.

---

## 3. Clinical Triage & Urgency Assessment (`BR-015` – `BR-024`)

- **BR-015 (3-Layer Triage Separation)**: Triage logic must maintain clean separation: Protocol Rules (Layer 1) $\rightarrow$ Software Engine (Layer 2) $\rightarrow$ Clinician Confirmation (Layer 3).
- **BR-016 (Non-Autonomous Urgency)**: Software-suggested urgency levels must never commit to active queues without explicit, authenticated human clinician confirmation.
- **BR-017 (Prohibition of Inferred Vitals)**: Missing physiological vital signs must remain `NULL` and can never be default-populated with "normal" physiological constants (`SAF-002`).
- **BR-018 (Severe Red-Flag Triggers)**: Observations meeting protocol life threats (SpO2 $< 88\%$, Systolic BP $< 75$, GCS $\le 8$) must trigger an automated Level 1 suggestion and global alarm.
- **BR-019 (Clinical Escalation Discretion)**: Triage nurses may elevate clinical urgency above the software suggestion at any time without secondary approval.
- **BR-020 (Supervised Acuity Downgrade)**: Lowering urgency level (e.g., Level 2 to Level 3) requires supervisor co-signature and recorded clinical justification (`SAF-004`).
- **BR-021 (Protocol Version Binding)**: Each triage assessment must store the immutable code of the active protocol version used to evaluate it.
- **BR-022 (Production Protocol Lockdown)**: An unapproved demonstration protocol cannot be activated when `NODE_ENV=production` (`SAF-006`).
- **BR-023 (Reassessment Scheduling)**: Confirming triage must automatically schedule a secondary reassessment deadline based on acuity (Level 2: 15m; Level 3: 30m; Level 4: 60m; Level 5: 120m).
- **BR-024 (Longitudinal Observation Preservation)**: Reassessments must create a new versioned observation record without overwriting prior triage vitals.

---

## 4. Dynamic Queue Engine Rules (`BR-025` – `BR-034`)

- **BR-025 (Multi-Factor Scoring Formula)**: Priority score is strictly evaluated via: $\text{Score} = (\text{Urgency Weight}) + (\text{Red Flag Boost}) + (\text{Overdue Boost}) + (\text{Waiting Mins}) + (\text{Starvation Factor})$.
- **BR-026 (Acuity Tier Primacy)**: High-acuity patients must always outrank lower-acuity patients regardless of arrival time.
- **BR-027 (Deterministic Tie-Breaking)**: Priority score ties must sort strictly by earliest arrival timestamp, then ascending UUID string.
- **BR-028 (Single Active Queue Entry)**: An encounter cannot exist in more than one active waiting queue simultaneously.
- **BR-029 (Reassessment Overdue Escalation)**: Breaching a reassessment deadline by $> 5\text{ mins}$ injects a $+20{,}000$ priority score penalty until reassessed.
- **BR-030 (Anti-Starvation Multiplier)**: Waiting $> 200\%$ of target wait accelerates the priority score by $+5.0\text{ points/min}$ and alerts the Charge Nurse.
- **BR-031 (Care Area Filtering)**: Queue views must be partitioned by Care Area; clinicians cannot view patients outside their care area without break-glass access.
- **BR-032 (Sequential Token Generation)**: Queue tokens must be sequential per department per calendar day (e.g., `AC-101`, `AC-102`).
- **BR-033 (Temporary Hold Preservation)**: Patients placed on diagnostic hold retain their prior priority position upon returning from hold.
- **BR-034 (Dynamic Queue Recalculation)**: Queue priority rankings must recalculate and broadcast via SSE within 500ms of any clinical state change.

---

## 5. Consultation & Concurrency Rules (`BR-035` – `BR-042`)

- **BR-035 (Atomic Patient Calling)**: Patient calling must use row-level database locking (`FOR UPDATE SKIP LOCKED`) to eliminate double-call conflicts.
- **BR-036 (Single Active Consultation)**: A patient cannot have more than one active consultation in progress at the same time.
- **BR-037 (Room Availability Check)**: A patient cannot be called to an examination room that is currently marked as occupied.
- **BR-038 (Mandatory Clinical Disposition)**: An encounter cannot be closed without a formal disposition: `DISCHARGED`, `ADMITTED_INPATIENT`, `TRANSFERRED_EXTERNAL`, `LWBS`, or `DECEASED`.
- **BR-039 (LWBS Safety Review)**: If a patient triaged as Level 1, 2, or 3 departs before evaluation, the system must trigger an automated risk audit review.
- **BR-040 (Cross-Department Handoff)**: Department transfers require explicit confirmation and acceptance by the receiving care area nurse before queue reassignment completes.
- **BR-041 (Immutable Closed Encounter)**: Once an encounter is finalized and closed, its clinical records become read-only.
- **BR-042 (Door-to-Doctor Finalization)**: Starting consultation locks the door-to-doctor elapsed time metric permanently.

---

## 6. Security, Governance & Audit Rules (`BR-043` – `BR-050`)

- **BR-043 (Role-Based Server Enforcement)**: Authorization must be verified on the server for every endpoint; client-side UI hiding is not authorization.
- **BR-044 (Break-Glass Time Limit)**: Break-glass emergency elevated access is strictly capped at a 2-hour duration and requires an audit justification.
- **BR-045 (Immutable Audit Table)**: Audit logs are append-only; database permissions revoke `UPDATE`, `DELETE`, and `TRUNCATE` from all application roles.
- **BR-046 (Cryptographic Hash Chaining)**: Every audit log entry must store a SHA-256 hash incorporating the previous entry's hash to guarantee tamper evidence.
- **BR-047 (Fail-Closed Audit Binding)**: If an audit log entry fails to persist, the parent clinical transaction must abort (`SAF-008`).
- **BR-048 (Public Display Sanitization)**: Public displays must strictly strip all patient names, diagnoses, and medical data, showing only anonymous tokens.
- **BR-049 (No Fabricated Wait Times)**: When fewer than 5 completed consultations exist in the current shift window, the system must return `ESTIMATE_UNAVAILABLE` rather than guessing.
- **BR-050 (Conflict Resolution Precedence)**: When rules conflict, **Clinical Patient Safety (`SAF`)** strictly overrides **Operational Efficiency / Throughput KPIs**.
