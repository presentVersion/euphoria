# System Requirements Baseline: Smart Patient Queue & Emergency Triage

## 1. Requirements Framework & Stakeholder Baseline

This document outlines the overarching requirements baseline for the Smart Patient Queue & Emergency Triage System. The requirements are classified using ISO/IEC/IEEE 29148 standards, organized into functional capabilities, non-functional constraints, and strict clinical safety invariants.

### Priority Legend
- **P0 (Mandatory / Core MVP)**: Critical for life safety, legal accountability, and baseline operational functionality. Must be implemented in the initial functional version.
- **P1 (High Priority / Enterprise Ready)**: Essential for production hospital deployment, supervisory control, and complete audit governance.
- **P2 (Operational Extension)**: Enhancements that improve staff efficiency, patient communication, and predictive intelligence.
- **P3 (Future Capability)**: Long-term strategic extensions (e.g., FHIR integration, multi-facility clustering).

---

## 2. Problem Statement Mapping

The four mandatory elements defined in the primary challenge problem statement are directly mapped to technical requirements packages:

```
┌────────────────────────────────────────────────────────┐
│ PROBLEM STATEMENT CORE PILLARS                         │
└────────────────────────────────────────────────────────┘
  │
  ├── Pillar 1: Patient Registration & Symptoms Capture
  │   └── Mapped to: FR-REG-001 through FR-REG-008, DOMAIN-REG, PAGE-REG
  │
  ├── Pillar 2: Urgency Determination & Clinical Triage
  │   └── Mapped to: FR-TRI-001 through FR-TRI-010, SAF-001 to SAF-006
  │
  ├── Pillar 3: Dynamic Prioritization Queue Engine
  │   └── Mapped to: FR-QUE-001 through FR-QUE-010, ALGO-QUE-001
  │
  └── Pillar 4: Healthcare Staff Monitoring & Consultation UI
      └── Mapped to: FR-CON-001 through FR-CON-008, PAGE-QUEUE, PAGE-DOC
```

---

## 3. Requirements Categories Summary

1. **Patient Registration (`FR-REG`)**: Identity lookup, emergency bypass, duplicate resolution, encounter creation.
2. **Clinical Triage Decision Support (`FR-TRI`)**: Physiological measurement validation, red-flag screening, protocol execution, clinical confirmation, override auditing.
3. **Dynamic Queue Engine (`FR-QUE`)**: Multi-factor priority computation, care-area routing, atomic concurrency locking, anti-starvation mechanisms.
4. **Consultation & Patient Flow (`FR-CON`)**: Patient calling, consultation encounter lifecycle, clinical disposition, handoffs, and departures.
5. **Security, Identity & Access Control (`FR-SEC`)**: Role-based access control, session security, break-glass workflows, encryption.
6. **Real-Time Communication (`FR-RT`)**: Event streaming (SSE/WS), automatic client reconnection, stale-data warnings.
7. **Reporting & Operational Analytics (`FR-REP`)**: Door-to-doctor times, triage compliance, bottleneck detection, LWBS rates.
8. **Clinical Safety Invariants (`SAF`)**: Non-negotiable medical safety rules protecting patients from unvalidated algorithmic decisions and unmonitored deterioration.
9. **Performance & Reliability (`NFR`)**: Sub-second UI response, high availability, graceful degradation during partial outages.

Refer to the detailed catalogs:
- [FUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_REQUIREMENTS.md)
- [NONFUNCTIONAL_REQUIREMENTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/NONFUNCTIONAL_REQUIREMENTS.md)
