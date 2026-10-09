# Department Allocation & Care Area Routing Specification

## 1. Care Area Topology & Department Organization

Emergency Departments are divided into distinct operational zones (Care Areas) optimized for specific patient acuity tiers and specialized clinical equipment.

```
┌────────────────────────────────────────────────────────────────────────┐
│               EMERGENCY DEPARTMENT CARE AREA TOPOLOGY                  │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [RESUSCITATION BAY (Trauma / Resus)]                                │
│    - Dedicated to Level 1 (Immediate Life Threat) & Severe Red Flags   │
│    - 1:1 Nursing Ratio; Crash Carts, Ventilators, Defibrillators       │
│                                                                        │
│ 2. [ACUTE CARE BAY (Majors / High Acuity)]                             │
│    - Dedicated to Level 2 (Emergent) & Deteriorating Level 3 Patients  │
│    - Monitored stretcher bays; Continuous ECG/SpO2 telemetry           │
│                                                                        │
│ 3. [URGENT CARE (Minors / Sub-Acute)]                                  │
│    - Dedicated to Level 3 (Urgent) stable medical/surgical patients    │
│    - Standard examination rooms; IV treatment chairs                   │
│                                                                        │
│ 4. [PEDIATRIC EMERGENCY CARE]                                          │
│    - Dedicated care area for patients aged < 16 years (Levels 2–5)     │
│    - Child-safe examination suites; Specialized pediatric dosing       │
│                                                                        │
│ 5. [FAST-TRACK / AMBULATORY CLINIC]                                    │
│    - Dedicated to Level 4 (Semi-Urgent) and Level 5 (Non-Urgent)       │
│    - Rapid turnaround; Simple lacerations, sprains, prescription needs │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Automated Care Area Routing Rules

Upon confirmation of clinical triage, the system assigns the patient to the optimal Care Area based on age, acuity, and clinical complaint:

| Triage Acuity | Patient Age | Chief Complaint Keywords | Designated Care Area | Sub-Queue |
| :---: | :---: | :--- | :--- | :--- |
| **Level 1** | Any | Cardiac Arrest, Severe Hypoxia, Massive Trauma | **Resuscitation Bay** | `Q-RESUS` |
| **Level 2** | $< 16\text{ yrs}$| Pediatric Distress, Febrile Infant | **Pediatric Emergency** | `Q-PED-ACUTE` |
| **Level 2** | $\ge 16\text{ yrs}$| Chest Pain, Stroke, Severe Dyspnea, Acute Abdomen | **Acute Care Bay** | `Q-ACUTE` |
| **Level 3** | $< 16\text{ yrs}$| Pediatric Fracture, Dehydration, Asthma | **Pediatric Emergency** | `Q-PED-URGENT` |
| **Level 3** | $\ge 16\text{ yrs}$| Moderate Pain, Multiple Labs/Imaging Required | **Urgent Care** | `Q-URGENT` |
| **Level 4 & 5**| Any | Minor Sprain, Suture, Rash, Medication Refill | **Fast-Track Clinic** | `Q-FAST-TRACK`|

*Clinician Discretion: Triage nurses can manually override the designated Care Area with recorded justification (e.g., routing a combative patient to an isolated psychiatric evaluation room).*

---

## 3. Cross-Department Transfer & Formal Handoff

When a patient's condition evolves (e.g., a patient in Fast-Track develops acute chest pain or an Urgent Care patient deteriorates into Level 2 status):

```
[Sending Care Area: Urgent Care]
               │
               │ 1. Initiates Transfer Request (Selects Target: Acute Care Bay)
               ▼
[Encounter Status: TRANSFER_PENDING]
  - Patient appears on Receiving Care Area console with flashing blue badge
  - Sending clinician records mandatory SBAR handoff note (Situation, Background, Assessment, Recommendation)
               │
               │ 2. Receiving Care Area Nurse reviews SBAR and bed availability
               ▼
[Receiving Nurse clicks "ACCEPT TRANSFER"]
  - Queue entry in Urgent Care marked `REASSIGNED`
  - New queue entry created in Acute Care Bay queue (`Q-ACUTE`)
  - Priority score recalculated for new queue
  - Transfer finalized with dual-staff timestamps
```

---

## 4. Care Area Capacity & Surge Overflow

1. **Capacity Tracking**:
   - Each Care Area tracks active bed occupancy:
     $$\text{Occupancy Rate} = \frac{\text{Occupied Beds} + \text{Patients Called}}{\text{Total Bed Count}} \times 100\%$$
2. **Surge Thresholds**:
   - **Yellow Alert ($> 85\%$ Occupancy)**: Prompts Charge Nurse to expedite discharges and prepare overflow beds.
   - **Red Alert ($> 100\%$ Occupancy / Bed Block)**:
     - Prompts supervisor to divert incoming Level 4/5 patients to affiliated outpatient ambulatory centers.
     - Never closes Resuscitation or Acute bays to incoming Level 1/2 emergencies (divert policy does not apply to life threats).
