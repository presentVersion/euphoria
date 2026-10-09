# Notification Center & Clinical Alert Specification

## 1. Alert Hierarchy: Clinical Safety vs. Administrative Notifications

The system maintains a strict division between **Internal Medical Safety Alarms** and **Administrative Operational Notifications**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION TIER HIERARCHY                     │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: CRITICAL LIFE-THREAT ALARMS (Level 1 Red Flags, Cardiac Arrest)│
│   - Continuous IEC 60601-1-8 medical alarm sound                       │
│   - Full-screen flashing red modal banner across all department screens │
│   - Cannot be dismissed without authenticated staff acknowledgement    │
│                                                                        │
│ TIER 2: HIGH-PRIORITY CLINICAL ALERTS (Reassessment Overdue, SpO2 Drop)│
│   - Distinct double-chime audio pulse every 60 seconds                 │
│   - Pinned amber alert card in Charge Nurse and Triage headers         │
│   - Requires clinical review to clear                                  │
│                                                                        │
│ TIER 3: OPERATIONAL NOTIFICATIONS (Patient Called, Room Ready, LWBS)   │
│   - Subtle single chime; sliding toast banner                          │
│   - Auto-dismisses after 8 seconds; archived in Notification Center    │
│                                                                        │
│ TIER 4: ADMINISTRATIVE NOTIFICATIONS (Shift Handover, Duplicate Match) │
│   - Silent badge counter update on notification bell icon              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. In-Application Notification Center Specifications

### 2.1 UI Notification Center Drawer
- Persistent bell icon in global navigation with an unread badge counter.
- Clicking reveals a sliding notification drawer partitioned into:
  - **Clinical Safety Tab**: Active red flags and overdue reassessment notices.
  - **Operational Tab**: Called patients, transfer requests, and room allocations.
  - **System Tab**: Backup notices, connection status, shift announcements.

### 2.2 Audible Alarm Management & Medical Sound Standards
- Audio conforms to medical auditory alarm frequencies (pitch intervals between 200 Hz and 2000 Hz, with harmonious harmonics).
- Browser autoplay permissions are acquired on initial staff login via a mandatory interactive modal confirmation: *"Enable Clinical Audio Alarms"*.
- **Volume & Silencing Rules**:
  - Staff can click **"MUTE FOR 2 MINUTES"** if actively attending to the patient.
  - If the patient is not admitted or stabilized within 2 minutes, the alarm automatically resumes sounding.

---

## 3. Auxiliary External Delivery Adapters (SMS / WhatsApp)

For optional outpatient or patient-facing notifications (e.g., notifying family members or ambulatory waiting patients):
- External messaging gateways are treated as **untrusted, asynchronous auxiliary adapters**.
- **Clinical Safety Rule**: Clinical emergency escalation must **NEVER** depend on SMS, email, or third-party webhooks. A failure of an external SMS gateway must never block or delay the internal hospital queue engine.
- External payloads are sanitized:
  - *Permitted*: *"Hospital Update: Token A-104 is approximately 2 patients away from consultation. Please report to the waiting area."*
  - *Strictly Forbidden*: Never include patient diagnosis, clinical symptoms, doctor names, or personal identifiable health data in external text messages.
