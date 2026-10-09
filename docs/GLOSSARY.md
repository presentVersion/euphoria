# Standardized Terminology & Domain Glossary

This glossary defines technical, clinical, and operational terminology used throughout the Smart Patient Queue & Emergency Triage system.

| Term | Abbreviation | Definition & Context |
| :--- | :---: | :--- |
| **Emergency Severity Index** | **ESI** | A widely validated 5-level emergency department triage algorithm stratifying patients from Level 1 (Resuscitation) to Level 5 (Non-urgent) based on acuity and anticipated resource needs. |
| **Manchester Triage System** | **MTS** | A 5-tier European clinical triage protocol using presentation flowcharts to categorize patients into Red (Immediate), Orange (Very Urgent), Yellow (Urgent), Green (Standard), and Blue (Non-urgent). |
| **Left Without Being Seen** | **LWBS** | An emergency department operational metric tracking patients who registered or completed triage but departed the facility before being evaluated by a licensed physician. |
| **Medical Record Number** | **MRN** | A unique, persistent institutional identifier assigned to a patient across all lifetime hospital encounters. |
| **Encounter** | **ENC** | A discrete, time-bounded clinical interaction or visit to a healthcare facility, spanning from physical arrival to final medical disposition. |
| **Resuscitation Bay** | **RESUS** | A specialized emergency department care area equipped with advanced life-support equipment (crash carts, ventilators, defibrillators) for treating Level 1 life threats. |
| **Fast-Track** | **FT** | A dedicated emergency outpatient care area designed for rapid turnaround of low-acuity patients (Levels 4 and 5) requiring simple procedures or single investigations. |
| **Door-to-Doctor Time** | **D2D** | The elapsed time in minutes from a patient's physical arrival or registration timestamp to the moment medical consultation begins with an examining clinician. |
| **Protected Health Information**| **PHI** | Individually identifiable health information created or received by a healthcare provider, protected under HIPAA and global privacy statutes. |
| **Server-Sent Events** | **SSE** | A standard HTTP-based server push technology enabling persistent, unidirectional event streaming from backend servers to web browser clients over standard port 443. |
| **Break-Glass Access** | — | A high-consequence emergency override protocol allowing clinicians to bypass standard departmental access boundaries during acute mass-casualty or resuscitation events, subject to mandatory forensic audit logging. |
| **Skip Locked (`SKIP LOCKED`)**| — | A PostgreSQL concurrency control feature (`SELECT ... FOR UPDATE SKIP LOCKED`) allowing concurrent transactions to lock and acquire the next available queue row without blocking or double-allocating. |
| **SBAR Handoff** | **SBAR** | Standardized medical communication framework: Situation, Background, Assessment, and Recommendation, used during patient transfers between hospital care areas. |
| **AVPU Scale** | **AVPU** | Rapid neurological assessment scale measuring patient consciousness: Alert, Verbal, Pain, Unresponsive. |
| **Glasgow Coma Scale** | **GCS** | Physiological neurological assessment scoring eye, verbal, and motor responses from 3 (deep unconsciousness) to 15 (fully alert). |
| **Digital Personal Data Protection**| **DPDP** | The Indian statutory privacy framework enacted in 2023 governing the processing of digital personal data, featuring statutory exceptions for medical emergencies. |
