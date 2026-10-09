# System Architecture: Smart Patient Queue & Emergency Triage

## 1. Architectural Style & Core Design Principles

The Smart Patient Queue & Emergency Triage System is designed using a **Modular Monolith with Event-Driven Real-Time Reactive Streaming** architecture.

### Architectural Tenets
1. **Domain-Driven Design (DDD)**: High cohesion within clinical domains (Registration, Triage, Queue, Consultation) and loose coupling through explicit TypeScript service interfaces.
2. **Deterministic Queue Calculations**: Queue ordering is strictly calculated and enforced on the backend; client interfaces are reactive displays, never authoritative sources of queue priority.
3. **Database-Enforced Invariants**: Critical safety invariants (e.g., zero double-calling of patients, zero duplicate active queue entries) are enforced by database foreign keys, partial unique indexes, and atomic row-level locks.
4. **UI-Agnostic Core Service Contracts**: Clean RESTful and SSE API boundaries enable smooth drop-in integration of custom design components (e.g., React Bits, 21st.dev) without rewriting data logic or state handlers.
5. **Fail-Closed Clinical Governance**: If an automated component (e.g., triage scoring formula or notification service) fails, the system safely falls back to direct manual clinical input with full auditability.

---

## 2. C4 Context Architecture (Level 1)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM CONTEXT BOUNDARY                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

    [Receptionist / Clerk]      [Triage Nurse]       [Treating Clinician]     [Charge Nurse / Supervisor]
              │                        │                      │                         │
              │ (Search/Register)      │ (Vitals/Acuity)      │ (Call/Consult/Dispose)  │ (Monitor/Override)
              ▼                        ▼                      ▼                         ▼
    ┌────────────────────────────────────────────────────────────────────────────────────────┐
    │              SMART PATIENT QUEUE & EMERGENCY TRIAGE PLATFORM                          │
    │  - Web-based multi-station frontend application                                       │
    │  - Real-time reactive queue synchronization                                            │
    │  - 3-Layer clinical triage decision support engine                                    │
    │  - Dynamic multi-factor queue prioritization engine                                   │
    │  - Automated reassessment & emergency escalation alarms                                │
    │  - Immutable forensic audit logging                                                   │
    └────────────────────────────────────────────────────────────────────────────────────────┘
              │                        │                      │                         │
              ▼                        ▼                      ▼                         ▼
      [PostgreSQL 16]          [Redis / In-Mem Bus]   [Public Waiting Board]     [External HIS/FHIR]
      (Authoritative State)    (Real-time SSE Hub)    (Sanitized Tokens Only)    (Optional Enterprise EMR)
```

---

## 3. C4 Container Architecture (Level 2)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ CONTAINER BREAKDOWN                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Frontend Web Client (React 19 / TypeScript / Vite or Next.js App Router)                  │
│    - Multi-Station Portals: Registration Desk, Triage Bay, Doctor Console, Supervisor Wall   │
│    - State Layer: TanStack Query (Server State), Zustand (Session), SSE Event Hook           │
│    - UI Layer: Custom Drop-in Component slots ready for React Bits / 21st.dev assets         │
│                                                                                              │
│ 2. API Gateway & Backend Application Server (Node.js / TypeScript / Fastify or Express)      │
│    - REST Controller Layer: Schema validation (Zod), Authentication, RBAC Guard              │
│    - Domain Service Layer: Triage Engine, Queue Priority Calculator, Consultation Manager     │
│    - Real-Time Event Hub: Server-Sent Events (SSE) broadcaster with departmental room filters│
│    - Repository Layer: Type-safe database queries, atomic transaction coordinators            │
│                                                                                              │
│ 3. Database Layer (PostgreSQL 16 Relational Engine)                                          │
│    - Authoritative Relational Store: Patients, Encounters, Observations, Queues, Audits      │
│    - Concurrency Guards: `FOR UPDATE SKIP LOCKED`, Partial Unique Indexes, Check Constraints│
│    - Append-Only Audit Table: Triggers capturing row-level changes and cryptographic hashes   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Interaction & Data Flow Architecture (Level 3)

### 4.1 Triage & Queue Reordering Pipeline
```
[Triage Nurse Client]
       │
       │ POST /api/v1/triage/assessments { encounter_id, vitals, symptoms }
       ▼
[Triage Controller] ──► [Zod Request Validation]
       │
       ▼
[Triage Service]
       │
       ├──► 1. Evaluate Red Flags (e.g., SpO2 < 90% -> Trigger Level 1 Alert)
       ├──► 2. Evaluate Protocol Rules (Calculate Suggested Urgency Level 1-5)
       └──► 3. Compare Nurse Confirmed Acuity vs Suggested (Detect Override)
       │
       ▼
[Database Transaction Boundary] (BEGIN TRANSACTION)
       │
       ├──► INSERT INTO triage_assessments (...)
       ├──► UPDATE encounters SET urgency_level = ..., status = 'TRIAGED'
       ├──► INSERT INTO queue_entries (priority_score = CALCULATE(), status = 'WAITING')
       ├──► INSERT INTO audit_logs (...)
       ▼
(COMMIT TRANSACTION)
       │
       ▼
[Event Publisher] ──► Dispatches `QUEUE_REORDERED` & `CLINICAL_ALERT` to SSE Hub
       │
       ▼
[Connected Clients (Doctor, Charge Nurse, Public Board)] ──► Real-Time DOM Update (< 200ms)
```

### 4.2 Atomic Patient Calling Pipeline
```
[Doctor Console]
       │
       │ POST /api/v1/queues/{queue_id}/call-next { clinician_id, room_id }
       ▼
[Queue Controller] ──► Authenticate Clinician & Verify Room Availability
       │
       ▼
[Queue Service - Concurrency Manager]
       │
       ▼ (BEGIN TRANSACTION)
       SELECT id FROM queue_entries
       WHERE department_id = :dept_id AND status = 'WAITING'
       ORDER BY priority_score DESC, arrival_time ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED;  <── [ATOMIC ROW LOCK PREVENTS DOUBLE-CALLING]
       │
       ├──► UPDATE queue_entries SET status = 'CALLED', called_at = NOW(), clinician_id = :cid
       ├──► INSERT INTO consultations (encounter_id, clinician_id, room_id, status = 'CALLED')
       ├──► INSERT INTO audit_logs (...)
       ▼ (COMMIT TRANSACTION)
       │
       ▼
[SSE Broadcaster] ──► Dispatches `PATIENT_CALLED { token: 'A-104', room: 'Room 3' }`
```

---

## 5. Technology Stack Selection & Rationale

| Layer | Selected Technology | Technical Rationale | Operational Feasibility |
| :--- | :--- | :--- | :--- |
| **Language** | **TypeScript 5.x** (Strict Mode) | End-to-end type safety across domain models, API contracts, and frontend state. Eliminates runtime type errors in clinical calculations. | Standard enterprise stack; zero compilation friction. |
| **Frontend Framework** | **React 19 / Next.js 15 or Vite** | Component-driven architecture ideal for integrating user's custom components from React Bits and 21st.dev without altering data plumbing. | Fast developer experience, excellent reactive state management. |
| **Backend Framework** | **Fastify or Express with TypeScript** | High-performance HTTP server, native JSON schema validation, modular plugin architecture, straightforward SSE streaming. | Low memory footprint; easily containerized in Docker. |
| **Database** | **PostgreSQL 16** | Robust relational integrity, ACID compliance, native `FOR UPDATE SKIP LOCKED` for race-condition prevention, JSONB for flexible protocol rules. | Gold standard for healthcare transactional data; zero-cost local Docker setup. |
| **Data Access Layer**| **Drizzle ORM or Prisma** | Type-safe SQL query generation, automated schema migrations, zero untyped string queries, clean transaction API. | Seamless migration tooling; excellent developer velocity. |
| **Real-Time Stream**| **Server-Sent Events (SSE)** | Lightweight HTTP-based unidirectional push; native browser `EventSource` API; bypasses WebSocket proxy/firewall headaches in hospitals. | Standard HTTP port 443; automatic browser reconnection. |
| **Validation Layer** | **Zod 3.x** | Runtime schema validation matching compile-time TypeScript types; sanitizes inputs against injection attacks before reaching business logic. | Zero-dependency, composable schema definitions. |
| **Audit Storage** | **PostgreSQL Append-Only Table** | Relational integrity with database-level triggers enforcing immutable append-only constraints and SHA-256 state chaining. | No additional database required for MVP; forensically auditable. |

---

## 6. Tiered Network & Security Topology

```
[Public Internet / Hospital Wi-Fi]
               │
               ▼ (TLS 1.3 Termination, Reverse Proxy, Rate Limiting)
     [Reverse Proxy / Nginx / Cloudflare]
               │
               ├──► [Static Asset CDN / Frontend Client Build]
               │
               ▼ (Internal Private Subnet)
     [Application API Server (Node.js/Fastify)]
               │
               ├──► (SSE Connection Pool)
               ├──► (REST Endpoints: /api/v1/*)
               │
               ▼ (Encrypted Database Wire - SSL Required)
     [PostgreSQL Database (Isolated VPC / Docker Network)]
         - Port 5432 bound only to internal Docker bridge
         - Automated WAL archives to persistent backup volume
```
