# Failure Handling, Resilience & Disaster Recovery

## 1. Failure Modes & Graceful Degradation Matrix

In an acute hospital setting, system failure must never lead to catastrophic clinical blind spots. This specification defines operational behavior across partial and total technical outages.

| Failure Mode | Immediate Staff Experience | Permitted Operations | Blocked Operations | Recovery & Reconciliation |
| :--- | :--- | :--- | :--- | :--- |
| **Real-Time SSE Stream Disconnect** | Flashing yellow header: *"Connection Lost — Reconnecting..."*. Action buttons disabled. | Screen displays last known cached roster; paper tracking begins. | Calling patients; submitting new triage scores (prevents stale race conditions). | Automatic reconnect within 5s; syncs full server snapshot via `GET /snapshot`. |
| **Database Master Write Failure** | System transitions to Read-Only Replica mode; banner alert displayed. | Staff can view current waiting room roster and prior triage notes. | Submitting new registrations, vitals, or dispositions. | Automatic failover promotes read-replica to master within 30 seconds. |
| **API Server Crash / Restart** | Transient 502/504 HTTP error for 5–10 seconds during container auto-restart. | Client preserves in-progress form inputs in encrypted session storage. | API requests queue in browser service worker retry buffer. | Health checks restore container; clients retry buffered requests with idempotency keys. |
| **Total Facility Network / Power Outage** | Hospital emergency generators activate; computers reboot or lose network. | **Activate Physical Paper Triage Runbook (`SAF-007`)**. Pre-printed triage cards. | All digital software operations pause. | Post-outage bulk reconciliation via Outage Reconciliation Tool. |

---

## 2. Stale-Data Defense Protocol

When a clinician acts on a queue roster that was not updated due to a network blip:
1. **Row Versioning Guard**:
   Every queue entry maintains a `row_version` integer column.
   ```sql
   UPDATE queue_entries 
   SET status = 'CALLED', row_version = row_version + 1
   WHERE id = :id AND row_version = :expected_version;
   ```
2. **Conflict Resolution**:
   - If another clinician called the patient while the client was disconnected, `row_version` no longer matches.
   - The query updates 0 rows; the server returns `409 Conflict: Patient Has Already Been Called`.
   - The client displays a friendly notification: *"Patient [A-104] was just called by Dr. Reynolds in Exam Room 2. Refreshing queue..."* and synchronizes the newest state.

---

## 3. Post-Downtime Data Reconciliation Runbook

Following any extended system downtime (> 15 minutes) where physical paper triage cards were used:
1. Charge Nurse logs in with Supervisor role and selects **"Outage Reconciliation Intake"**.
2. Staff batch-enters paper cards:
   - Paper Token Number.
   - Exact Arrival Timestamp recorded on paper card.
   - Patient Name / Temporary Identifier.
   - Initial Recorded Vitals & Triage Urgency Level.
   - Any Doctor Consultations already conducted on paper.
3. The system inserts the historical records, calculating retroactive door-to-triage metrics and tagging all entries with `IS_RECONCILED_POST_OUTAGE = true`.
