# Real-Time Event Streaming & SSE Specification

## 1. Transport Architecture: Server-Sent Events (SSE)

Real-time synchronization across staff consoles and public waiting room monitors is driven by **Server-Sent Events (SSE)** over persistent HTTPS connections (`/api/v1/realtime/stream`).

### Why SSE over WebSockets?
1. **Unidirectional Push**: Hospital workflows are strictly driven by backend state changes; client mutations use standard, auditable REST POST/PUT endpoints.
2. **Hospital Firewall Traversal**: SSE operates over standard HTTPS (Port 443), seamlessly traversing restrictive hospital enterprise proxy firewalls that block bidirectional WebSocket handshakes.
3. **Native Browser Reconnection**: Built-in browser `EventSource` automatically reconnects upon temporary Wi-Fi drops with automatic `Last-Event-ID` state recovery.

```
[Browser Client (Doctor / Triage / Display)]
                  │
                  │ GET /api/v1/realtime/stream?dept_id=...
                  ▼
         [API Server - SSE Hub]
                  │
                  ├── Registers client in Department Room Channel
                  ├── Emits periodic 15-second heartbeat (:keepalive)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [Domain Service Mutation]  [Database Commit]
        │
        ▼
 [Event Broadcaster] ──► Dispatches typed SSE event to channel clients
```

---

## 2. Event Envelope & Catalog

All real-time events adhere to a standard JSON envelope:

```typescript
export interface RealtimeEventEnvelope<T = unknown> {
  eventId: string;             // UUIDv4 unique event identifier
  eventType: string;           // Standard event name from catalog
  timestamp: string;           // ISO-8601 UTC timestamp
  facilityId: string;          // Facility UUID
  departmentId: string;        // Department UUID
  schemaVersion: string;       // e.g., "1.0.0"
  payload: T;                  // Typed event payload
}
```

### Complete Event Catalog

| Event Name | Trigger Condition | Recipient Channels | Payload Content |
| :--- | :--- | :--- | :--- |
| **`PATIENT_REGISTERED`** | Patient registration completed at front desk. | Triage Bay Terminals | `encounterId`, `tokenNumber`, `arrivalTime`, `chiefComplaintCategory` |
| **`TRIAGE_CONFIRMED`** | Urgency level confirmed by Triage Nurse. | Doctor Consoles, Charge Nurse | `encounterId`, `tokenNumber`, `urgencyLevel`, `targetCareArea`, `priorityScore` |
| **`URGENCY_OVERRIDDEN`**| Clinician alters urgency score. | Supervisor, Doctor Consoles | `encounterId`, `tokenNumber`, `oldUrgency`, `newUrgency`, `overrideReason` |
| **`RED_FLAG_TRIGGERED`**| Immediate life threat detected or panic pressed. | **ALL TERMINALS (Broadcast)**| `encounterId`, `tokenNumber`, `alertType`, `reason`, `location` |
| **`RED_FLAG_ACKNOWLEDGED`**| Clinician acknowledges active red flag. | **ALL TERMINALS (Broadcast)**| `alertId`, `acknowledgedById`, `acknowledgedAt` |
| **`REASSESSMENT_OVERDUE`**| Reassessment deadline breached by $> 5\text{ mins}$. | Charge Nurse, Triage Bay | `encounterId`, `tokenNumber`, `urgencyLevel`, `minutesOverdue` |
| **`QUEUE_REORDERED`** | Queue priority recalculated. | Doctor Consoles, Charge Nurse | `queueId`, `updatedEntries`: `[{ token, priorityScore, rank }]` |
| **`PATIENT_CALLED`** | Doctor calls patient to examination room. | Public Boards, Doctor Consoles| `tokenNumber`, `careArea`, `roomNumber`, `calledAt` |
| **`CONSULTATION_STARTED`**| Patient enters room; consultation begins. | Department Manager, Charge Nurse | `consultationId`, `encounterId`, `roomNumber`, `startedAt` |
| **`CONSULTATION_COMPLETED`**| Doctor finalizes disposition. | Bed Mgmt, Charge Nurse | `encounterId`, `tokenNumber`, `disposition`, `completedAt` |
| **`PATIENT_TRANSFERRED`**| Patient transferred to another care area. | Sending & Receiving Consoles | `encounterId`, `tokenNumber`, `fromCareArea`, `toCareArea` |

---

## 3. Client Connection Lifecycle & Stale-State Defense

```
[Client Connects to /api/v1/realtime/stream]
                  │
                  ▼
          [Connected & Active] ──(Heartbeat every 15s)──► [Connection Healthy]
                  │
          [Network Interrupted (Wi-Fi drop)]
                  │
                  ▼
          [Reconnecting State (0 - 5 seconds)]
                  │
                  ├── (Reconnection Succeeds within 5s) ──► Resync `Last-Event-ID` -> Back to Active
                  │
                  ▼ (Disconnected > 5 seconds)
      ┌────────────────────────────────────────────────────────┐
      │         STALE-DATA SAFETY LOCKOUT ENGAGED              │
      │  - UI displays prominent flashing yellow banner:       │
      │    "CONNECTION LOST — QUEUE DATA MAY BE STALE"         │
      │  - "Call Patient" and "Confirm Triage" buttons LOCKED  │
      │  - Prevents race conditions against stale roster       │
      └───────────────────────────┬────────────────────────────┘
                                  │
                  [Reconnection Restored (HTTP 200)]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │        AUTHORITATIVE FULL-STATE RECONCILIATION         │
      │  - Client triggers `GET /api/v1/queues/{id}/snapshot`   │
      │  - Client state replaced with server snapshot          │
      │  - Action buttons unlocked; warning banner cleared     │
      └────────────────────────────────────────────────────────┘
```

---

## 4. Privacy & Payload Sanitization

- **Public Display Scoping**: Public waiting room screens connect to a dedicated public SSE channel (`/api/v1/realtime/public-stream?dept_id=...`).
- Public channels **NEVER** transmit patient names, MRNs, vital signs, or medical complaints. Payloads contain strictly sanitized anonymous tokens (e.g., `token: "A-104"`, `room: "Exam Room 3"`).
