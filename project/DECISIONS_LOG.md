# Architecture Decisions Log — Smart Patient Queue & Emergency Triage

**Total Decisions**: 15 (ADR-001 through ADR-015)  
**Detailed Source**: [ARCHITECTURE_DECISIONS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/ARCHITECTURE_DECISIONS.md)  
**Governance**: Binding on all future implementation phases  

---

## Decision Summary Table

| ADR ID | Title | Status | Chosen Option | Key Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Modular Monolith Architecture | Accepted | Single Node.js/TypeScript codebase with strict module boundaries | Eliminates distributed transaction complexity, network latency, and partition failures in emergency workflows. |
| **ADR-002** | Primary Database Selection | Accepted | PostgreSQL 16 with ACID transactions and partial indexes | Native UUIDs, JSONB for flexible vitals, robust concurrency primitives (`SKIP LOCKED`), and proven enterprise stability. |
| **ADR-003** | Dynamic Queue Priority Model | Accepted | Deterministic Multi-Factor Formula combining Acuity, Wait Time, and Overdue Reassessment | Prevents waiting-room starvation while ensuring immediate life-threat precedence. |
| **ADR-004** | Queue Concurrency Control | Accepted | Pessimistic Row-Level Locking (`FOR UPDATE SKIP LOCKED`) | Eliminates race conditions when multiple clinicians simultaneously call the next available patient. |
| **ADR-005** | Three-Layer Clinical Triage Architecture | Accepted | Decoupled Protocol Rules, Triage Engine, and Human Clinician Confirmation | Prevents hardcoded clinical bias, preserves clinician liability and primacy, and enables pluggable clinical standards. |
| **ADR-006** | Real-Time Communication Transport | Accepted | Server-Sent Events (SSE) over HTTP/2 | Firewall friendly, native browser reconnection, unidirectional efficiency, and lower overhead than WebSockets. |
| **ADR-007** | Tamper-Resistant Audit Trail | Accepted | Append-Only Table with SHA-256 HMAC Hash Chaining | Provides cryptographically verifiable audit log integrity for legal compliance and clinical safety review. |
| **ADR-008** | Authentication and Session Security | Accepted | Argon2id Password Hashing + JWT in HTTP-Only Strict Cookies | Defends against brute-force attacks and prevents script-based token exfiltration via XSS. |
| **ADR-009** | Waiting-Time Estimation Strategy | Accepted | Rolling Empirical Service-Time Model with Confidence Bands | Avoids misleading black-box precision; provides transparent upper/lower wait-time intervals with low-data fallback. |
| **ADR-010** | Emergency-First Patient Registration | Accepted | 1-Click Emergency Bypass with Generated Temporary IDs | Guarantees that clinical resuscitation is never delayed by missing administrative or demographic fields. |
| **ADR-011** | Inter-Department Handoff Protocol | Accepted | SBAR Structured Data Contract with Explicit Acceptance Handshake | Eliminates clinical blind spots and dropped patient ownership during transfers between care areas. |
| **ADR-012** | Database Access and Schema Tooling | Accepted | Drizzle ORM with TypeScript Schemas | Zero-overhead type-safe SQL queries with explicit transaction management and predictable SQL generation. |
| **ADR-013** | Outage Resilience and Offline Recovery | Accepted | Read-Only Stale UI Lockout + Paper-to-Digital Reconciliation Ingestion | Prevents dangerous conflicting mutations during network splits; provides a standardized runbook for post-downtime data entry. |
| **ADR-014** | Healthcare Data Privacy Governance | Accepted | Field-Level Minimization + Indian DPDP Act Deemed Consent Alignment | Restricts captured data strictly to immediate emergency care needs; supports lawful emergency processing without bureaucratic delay. |
| **ADR-015** | UI Component Architecture and Separation | Accepted | Design-Agnostic Functional Data Contracts | Enables seamless drop-in integration of user-provided React Bits and 21st.dev components without altering their visual aesthetics. |
