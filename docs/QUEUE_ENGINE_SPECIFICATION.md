# Dynamic Queue Engine Specification

## 1. Engine Architecture & Core Principles

The Dynamic Queue Engine is the operational core of the application. It computes, reorders, and coordinates the flow of waiting patients across department care areas.

### Non-Negotiable Queue Principles
1. **Clinical Acuity Trumps Arrival Time**: A critically ill patient arriving at 10:15 AM must always be prioritized over an ambulatory, stable patient who arrived at 08:00 AM.
2. **Deterministic & Reproducible**: Given identical inputs (urgency, arrival time, escalation flags), the queue calculation always produces the exact same ranking.
3. **Active Anti-Starvation Protection**: Low-acuity patients who have waited for extended durations receive operational escalation to prevent indefinite neglect.
4. **Backend-Enforced Concurrency**: Queue ordering and patient calling are enforced atomically by PostgreSQL transactions (`FOR UPDATE SKIP LOCKED`). The frontend never decides who is called next.

---

## 2. Deterministic Multi-Factor Priority Algorithm

The active priority score for any queue entry is evaluated dynamically using the formula:

$$\text{Priority Score} = (\text{Urgency Weight}) + (\text{Red Flag Boost}) + (\text{Overdue Boost}) + (\text{Waiting Time Score}) + (\text{Starvation Factor})$$

### 2.1 Coefficient Breakdown

| Component | Value / Formula | Rationale |
| :--- | :--- | :--- |
| **Urgency Weight** | Level 1: $100{,}000$<br>Level 2: $50{,}000$<br>Level 3: $25{,}000$<br>Level 4: $10{,}000$<br>Level 5: $1{,}000$ | Establishes discrete priority tiers ensuring higher clinical acuity dominates ranking. |
| **Red-Flag Boost** | $+50{,}000$ (if active red-flag) | Instantly elevates any patient with an acute physiological crisis to the top of the queue. |
| **Overdue Reassessment**| $+20{,}000$ (if reassessment overdue) | Elevates deteriorating or un-reassessed patients ahead of routine waiting patients in their tier. |
| **Waiting Time Score** | $+1.0 \text{ point per elapsed minute}$ | Evaluates time spent waiting since initial hospital arrival timestamp. |
| **Starvation Factor** | $+5.0 \text{ points per minute}$ (after $2\times$ target wait) | Accelerates priority for stable patients experiencing extreme delays. |

### 2.2 Deterministic Tie-Breaking
When two patients have identical priority scores within the same department:
1. **Primary Tie-Breaker**: Earliest `arrival_time` (Ascending UTC timestamp).
2. **Secondary Tie-Breaker**: `encounter.id` (Ascending UUID string comparison).

This guarantees 100% deterministic, jitter-free sorting across multiple concurrent queries.

---

## 3. Dynamic Reordering Triggers

The Queue Engine recalculates priorities and broadcasts updated queue order across SSE channels upon any of the following lifecycle events:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      QUEUE REORDERING EVENT TRIGGERS                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [PATIENT_REGISTERED]     - New patient enters WAITING_FOR_TRIAGE   │
│ 2. [TRIAGE_CONFIRMED]       - Initial urgency assigned; enters queue   │
│ 3. [URGENCY_OVERRIDDEN]     - Clinician upgrades/downgrades acuity     │
│ 4. [RED_FLAG_TRIGGERED]     - Life-threat detected (+50,000 boost)     │
│ 5. [REASSESSMENT_OVERDUE]   - Reassessment deadline breached (+20,000) │
│ 6. [PATIENT_REASSESSED]     - Reassessment completed; score normalized │
│ 7. [PATIENT_CALLED]         - Clinician calls patient; removed from Q  │
│ 8. [CARE_AREA_TRANSFERRED]  - Patient moved to another department queue│
│ 9. [PATIENT_DEPARTED]       - Patient discharged, admitted, or LWBS    │
│ 10. [PERIODIC_TIME_TICK]    - 60-second periodic elapsed time sync     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Concurrency Control & Double-Call Prevention

In busy emergency departments, two doctors frequently attempt to call the "Next Patient" at the exact same fraction of a second.

### The Race Condition Problem
Without database-level locking, Doctor A in Room 1 and Doctor B in Room 2 both read Patient `A-104` as the top waiting patient, causing both clinicians to call the same patient simultaneously.

### The Solution: Atomic Row Locking (`SKIP LOCKED`)
When a clinician clicks **"Call Next Patient"**, the backend executes the following atomic SQL query within a serializable transaction:

```sql
BEGIN TRANSACTION;

-- Atomically select and lock the highest priority waiting patient
SELECT id, encounter_id, token_number
FROM queue_entries
WHERE queue_id = :queue_id
  AND status = 'WAITING'
ORDER BY priority_score DESC, entered_queue_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- If no row returned, queue is empty
-- Otherwise, update queue entry status
UPDATE queue_entries
SET status = 'CALLED',
    called_at = CURRENT_TIMESTAMP,
    called_by_id = :clinician_id,
    consultation_room = :room_number,
    row_version = row_version + 1,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :selected_queue_entry_id;

-- Record consultation assignment
INSERT INTO consultations (
    encounter_id, clinician_id, care_area_id, room_number, status, started_at
) VALUES (
    :encounter_id, :clinician_id, :care_area_id, :room_number, 'CALLED', CURRENT_TIMESTAMP
);

COMMIT;
```

**Outcome**:
- Doctor A locks and acquires Patient `A-104`.
- Doctor B's query automatically skips `A-104` (because it is locked) and immediately locks and returns Patient `A-105`.
- **Result**: Exactly zero double-calls; zero blocking latency; 100% throughput efficiency.

---

## 5. Anti-Starvation & Operational Safeguards

To prevent low-acuity patients (Level 4 and 5) from waiting indefinitely when high-acuity patients arrive continuously:
1. **Target Wait Thresholds**:
   - Level 4 Target Wait: 60 minutes.
   - Level 5 Target Wait: 120 minutes.
2. **Starvation Warning Gate**:
   - When elapsed wait exceeds $200\%$ of target wait (e.g., Level 4 patient waiting $> 120\text{ minutes}$):
     - Priority score receives an accelerated $+5.0\text{ points/min}$ multiplier.
     - A `STARVATION_ALERT` notification is dispatched to the Charge Nurse console.
     - The Charge Nurse can allocate an auxiliary clinician to open a dedicated Fast-Track consultation lane without artificially modifying the patient's medical urgency tier.
