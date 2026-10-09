# Performance Budgets, Indexing & Scalability Architecture

## 1. Measurable Engineering Performance Targets

All performance targets are verified under active production loads of 500 concurrent waiting encounters and 50 concurrent active clinical staff sessions:

| Operation | Latency Budget (p95) | Latency Budget (p99) | Verification Benchmark |
| :--- | :---: | :---: | :--- |
| **Patient Index Search** | $\le 200\text{ ms}$ | $\le 400\text{ ms}$ | SQL query across 100,000 synthetic patient records by MRN or phone. |
| **Queue Roster Retrieval** | $\le 100\text{ ms}$ | $\le 200\text{ ms}$ | Active sub-queue fetch with 200 waiting entries. |
| **Priority Recalculation Batch** | $\le 80\text{ ms}$ | $\le 150\text{ ms}$ | Recalculate priority scores for all active waiting patients in department. |
| **Triage Assessment Commit** | $\le 150\text{ ms}$ | $\le 300\text{ ms}$ | Insert vitals, insert triage, update encounter, insert audit log in 1 transaction. |
| **Atomic Patient Call Lock** | $\le 50\text{ ms}$ | $\le 100\text{ ms}$ | `FOR UPDATE SKIP LOCKED` transaction under concurrent requests. |
| **SSE Event Broadcast** | $\le 100\text{ ms}$ | $\le 250\text{ ms}$ | Event dispatch from API server to 50 active browser listeners. |

---

## 2. Database Indexing Strategy

To guarantee sub-100ms response times without excessive in-memory caching overhead, PostgreSQL indexes are tailored to active query filters:

```sql
-- 1. Accelerates Patient Search by MRN, Name, and Phone
CREATE INDEX idx_patients_search ON patients (last_name, first_name, date_of_birth);
CREATE INDEX idx_patients_phone ON patients (phone_number) WHERE phone_number IS NOT NULL;

-- 2. Partial Index for Active Encounters Only (ignoring archived closed visits)
CREATE INDEX idx_encounters_active_dept ON encounters (department_id, status) 
WHERE status NOT IN ('DISCHARGED', 'ADMITTED', 'TRANSFERRED', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED');

-- 3. High-Performance Queue Priority Sorting Index
CREATE INDEX idx_queue_active_priority 
ON queue_entries (queue_id, priority_score DESC, entered_queue_at ASC) 
WHERE status IN ('WAITING', 'REASSESSMENT_OVERDUE');

-- 4. Active Red-Flag Alerts Index (instant lookup for global banners)
CREATE INDEX idx_active_red_flags ON red_flag_alerts (status) WHERE status = 'ACTIVE';

-- 5. Pending Reassessment Due Clocks
CREATE INDEX idx_pending_reassessments ON reassessment_records (status, scheduled_due_at) 
WHERE status IN ('PENDING', 'OVERDUE');
```

---

## 3. Connection Pooling & Resource Limits

1. **Connection Pooling**:
   - Managed via **PgBouncer** or Node.js pool allocator.
   - Max Connections: 30 active pool connections (preventing database memory thrashing).
   - Idle Connection Timeout: 10 seconds.
2. **Rate Limiting**:
   - Public / Login Endpoints: Maximum 10 requests / minute per IP.
   - Staff Operational Endpoints: Maximum 120 requests / minute per authenticated staff token.
   - Real-Time SSE Streams: Maximum 5 concurrent connections per client device.
