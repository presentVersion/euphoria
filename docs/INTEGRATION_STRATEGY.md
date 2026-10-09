# External Integration Strategy & Boundary Adapters

## 1. Integration Boundary Philosophy

To maintain absolute reliability during acute hospital operations:
- **Core Autonomy Mandate**: The Smart Patient Queue & Emergency Triage system is **100% self-sufficient**. It must never fail, lock up, or delay a clinical encounter because an external hospital system (EHR, Lab, Radiology, or SMS gateway) is experiencing an outage or network partition.
- **Asynchronous Adapter Pattern**: All external integrations operate behind asynchronous, non-blocking adapter interfaces.

```
┌────────────────────────────────────────────────────────┐
│            CORE EMERGENCY TRIAGE & QUEUE SYSTEM        │
└────────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
[FHIR / EMR Adapter]  [SMS / Comm Adapter] [Lab / Rad Adapter]
       │                   │                   │
   (Async Sync)       (Best-Effort)        (Status Probe)
       │                   │                   │
       ▼                   ▼                   ▼
 [Enterprise EHR]     [SMS Gateway]       [Hospital LIS]
  (Epic / Cerner)     (Twilio / MSG91)     (External Lab)
```

---

## 2. HL7 FHIR R4 Integration Mapping Stubs

The system provides standard mapping adapters to synchronize emergency encounters with enterprise Electronic Health Record (EHR) platforms:

| Internal Domain Entity | HL7 FHIR R4 Resource | Mapping Notes |
| :--- | :--- | :--- |
| `Patient` | `Patient` | Maps `mrn` to `identifier[system='hospital-mrn']`, name, gender, birthDate. |
| `Encounter` | `Encounter` | Maps `class='emergency'`, `status='in-progress'`, `period.start=arrival_time`. |
| `VitalSignObservation` | `Observation` (vital-signs) | Maps LOINC codes: Heart Rate (`8867-4`), BP (`85354-9`), SpO2 (`2708-6`), Temp (`8310-5`). |
| `TriageAssessment` | `Observation` (triage) | Maps ESI urgency score to `Observation.valueInteger`. |
| `Consultation` | `ClinicalImpression` | Maps clinician working diagnosis and disposition summary. |

---

## 3. Communication Gateway Integration (SMS / WhatsApp)

For non-clinical, optional patient-facing wait-time updates:
- **Interface**:
  ```typescript
  export interface NotificationGatewayAdapter {
    sendSms(recipientPhone: string, sanitizedMessage: string): Promise<DeliveryResult>;
  }
  ```
- **Failure Isolation**: If the external messaging provider returns an HTTP error, the system records `DELIVERY_FAILED` in `notification_logs` and continues normal operations. Internal audio-visual clinical alarms are unaffected.
