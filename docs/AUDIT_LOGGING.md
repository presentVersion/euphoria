# Forensic Audit Logging & Cryptographic Integrity

## 1. Audit Principles & Legal Evidentiary Standard

In an Emergency Department, every clinical urgency assessment, priority override, patient call, and administrative access carries severe medical-legal consequences.

The audit logging subsystem is designed to meet strict court-admissible forensic standards:
1. **Append-Only Immutability**: Audit records can never be updated, overwritten, or deleted by any application user or administrator.
2. **Cryptographic Chaining (Tamper Evidence)**: Each audit log entry includes a SHA-256 hash incorporating the previous entry's hash, creating an unbroken tamper-evident ledger.
3. **Fail-Closed Transactional Binding**: If the audit record fails to insert, the parent clinical transaction (e.g., triage confirmation or override) automatically aborts (`SAF-008`).

---

## 2. Audit Event Schema & Chaining Mechanism

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,                        -- Authenticated Staff User ID (or NULL if system)
    actor_role staff_role_enum,           -- Role claim active at time of mutation
    action VARCHAR(100) NOT NULL,         -- e.g., 'URGENCY_CONFIRMED', 'OVERRIDE_RECORDED'
    entity_type VARCHAR(100) NOT NULL,    -- 'Encounter', 'TriageAssessment', 'QueueEntry'
    entity_id UUID NOT NULL,              -- Target entity UUID
    previous_state JSONB,                 -- JSON snapshot before change
    new_state JSONB,                      -- JSON snapshot after change
    justification TEXT,                   -- Mandatory clinical rationale for overrides
    ip_address VARCHAR(45) NOT NULL,      -- Source client IP address
    previous_log_hash VARCHAR(64),        -- SHA-256 hash of prior audit row
    current_log_hash VARCHAR(64) NOT NULL,-- SHA-256(previous_hash + actor_id + action + timestamp + payload)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Revoke all mutation rights from application database user
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM PUBLIC;
```

---

## 3. Cryptographic Chaining Algorithm

Before inserting an audit row, the backend calculates the current entry's cryptographic hash:

```typescript
import { createHash } from 'node:crypto';

export function computeAuditHash(
  previousHash: string,
  actorId: string,
  action: string,
  entityId: string,
  timestamp: string,
  payloadString: string
): string {
  const content = `${previousHash}|${actorId}|${action}|${entityId}|${timestamp}|${payloadString}`;
  return createHash('sha256').update(content, 'utf8').digest('hex');
}
```

### Tamper-Detection Verification Script
Administrators can run a verification routine that walks the entire ledger from genesis:
- If an adversary with direct database access alters any row (e.g., retroactively editing a triage override reason), the hash chain breaks at that exact entry.
- The verification routine reports the corrupted row index and alerts the Hospital Security Officer.

---

## 4. Audited Event Catalog

Every major system lifecycle event is logged with full context:
- `PATIENT_REGISTERED`: Logs demographic intake and registering staff ID.
- `EMERGENCY_BYPASS_INVOKED`: High-priority log of unverified patient entry.
- `TRIAGE_ASSESSMENT_CONFIRMED`: Records matched protocol rules, suggested vs. confirmed acuity.
- `CLINICAL_OVERRIDE_EXECUTED`: Records mandatory clinical rationale and previous vs. new urgency.
- `URGENCY_DOWNGRADE_APPROVED`: Dual-signature audit recording Nurse ID and Supervisor ID.
- `PATIENT_CALLED`: Doctor ID, exam room, and call timestamp.
- `BREAK_GLASS_ACCESS_INVOKED`: Clinician emergency access with recorded medical reason.
