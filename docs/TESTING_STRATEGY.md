# Comprehensive Testing Strategy & Quality Assurance Architecture

## 1. Quality Assurance Philosophy & Testing Pyramid

Healthcare software requires an exhaustive, multi-layered testing regimen ensuring clinical safety, race-condition defense, and zero data loss.

```
                  /\
                 /  \      E2E Workflows (Playwright) - 15%
                /────\     - Full clinical encounters (Arrival to Disposition)
               /      \    - Multi-terminal SSE synchronization
              /────────\   
             /          \  Integration & Safety Tests (Vitest + Testcontainers) - 35%
            /            \ - API contracts, atomic transactions, row locking
           /              \- Clinical safety invariants (SAF-001 to SAF-008)
          /────────────────\
         /                  \ Unit Tests (Vitest) - 50%
        /                    \- Physiological validation ranges, triage rule formulas
       /                      \- Multi-factor priority scoring, audit hash chains
      /────────────────────────\
```

---

## 2. Test Suites Breakdown

### 2.1 Unit Testing (Vitest)
- **Scope**: Pure functional logic with zero external network or database dependencies.
- **Key Modules Tested**:
  1. `TriageEngine.evaluateProtocol()`: Verifies deterministic urgency level output across 150 physiological combinations.
  2. `QueueCalculator.computePriorityScore()`: Validates priority score weights ($100{,}000$ for Level 1, $+50{,}000$ red flag, $+20{,}000$ overdue).
  3. `AuditService.computeAuditHash()`: Verifies SHA-256 state chaining and tamper detection.
  4. `ZodSchemas`: Validates rejection of physiological extremes (e.g., HR $> 300$, SpO2 $> 100\%$, pain score $< 0$ or $> 10$).

### 2.2 Integration Testing (Vitest + PostgreSQL Testcontainers)
- **Scope**: Repository layer, API route handlers, and database transaction boundaries.
- **Key Workflows Tested**:
  1. **Encounter Creation**: Verifies partial unique index prevents duplicate active encounters for the same patient.
  2. **Audit Trigger Consistency**: Verifies clinical mutations cannot commit if audit row insertion fails (`SAF-008`).
  3. **Reassessment Scheduling**: Verifies correct `due_at` timestamp generated based on confirmed urgency tier.

### 2.3 End-to-End Workflow Testing (Playwright)
- **Scope**: Browser-based multi-user workflows simulating real hospital staff interaction.
- **Key Scenarios Tested**:
  1. Receptionist registers patient $\rightarrow$ Triage Nurse assesses vitals $\rightarrow$ Doctor calls patient $\rightarrow$ Doctor completes encounter with discharge disposition.
  2. Multi-browser real-time test: Receptionist submits emergency bypass in Window 1; Resuscitation Bay in Window 2 immediately sounds audible chime and renders red-flag banner in $< 500\text{ ms}$.

### 2.4 Clinical Safety Test Suite (`test/safety/`)
Dedicated automated test suite asserting that the 8 Clinical Safety Invariants cannot be violated:
- `test_saf_001_emergency_bypass_never_blocked_by_missing_fields()`
- `test_saf_002_missing_vitals_never_default_to_normal()`
- `test_saf_003_unconfirmed_triage_suggestion_cannot_enter_queue()`
- `test_saf_004_urgency_downgrade_rejected_without_supervisor_signature()`
- `test_saf_005_overdue_reassessment_boosts_priority_score()`
- `test_saf_006_unapproved_protocol_refuses_production_startup()`
- `test_saf_007_reconciliation_endpoint_preserves_original_arrival_time()`
- `test_saf_008_failing_audit_aborts_clinical_transaction()`

### 2.5 Concurrency & Race Condition Suite
- Simulates 50 simultaneous HTTP requests from 10 distinct clinician tokens clicking "Call Next Patient" for the same waiting queue.
- **Pass Criteria**:
  - Exactly 1 clinician acquires Patient 1.
  - Exactly 1 clinician acquires Patient 2, etc.
  - Zero duplicate calls (`status = 'CALLED'`).
  - Zero deadlock exceptions in database logs.

### 2.6 Security & Penetration Suite
- Automated fuzz testing with SQL injection, XSS payloads, and malformed JSON.
- BOLA test: Attempting to update another department's encounter without permission returns `404 Not Found`.
- Attempting an urgency downgrade without a supervisor token returns `403 Forbidden`.
