# Privacy & Healthcare Data Governance Specification

## 1. Data Minimization & Protected Health Information (PHI)

The system enforces data minimization across all storage and display surfaces.

### 1.1 Data Minimization Principles
- The application collects **only** the clinical and administrative information required for immediate emergency triage and patient queue coordination.
- **Excluded**: Detailed non-emergency billing records, insurance policy scans, detailed longitudinal medical histories, and non-relevant demographic surveys are intentionally excluded from the core queue workflow.

### 1.2 Public Display Data Sanitization
- Waiting room displays and public queue tracking boards display **zero identifiable personal health information**.
- Publicly visible fields:
  - Anonymous sequential token (e.g., `AC-104`).
  - Target Care Area name (e.g., "Acute Care Bay").
  - Assigned Consultation Room (e.g., "Room 3").
  - Estimated Wait Band (e.g., "15–30 mins").
- **Strictly Redacted**: Patient full names, ages, diagnoses, symptoms, and vital signs are completely stripped from public payloads.

---

## 2. Encryption Standards

| Data State | Encryption Standard | Implementation Layer | Key Management |
| :--- | :--- | :--- | :--- |
| **In Transit** | TLS 1.3 (Strict) | Reverse Proxy / API Gateway | 2048-bit RSA / ECC certificates; automated ACME renewal. |
| **At Rest (Database)**| AES-256 | PostgreSQL Tablespace / Volume Encryption | Disk-level encryption with cloud or hardware KMS. |
| **At Rest (Backups)** | AES-GCM-256 | Compressed WAL / SQL dump archives | Dedicated offline backup encryption key. |
| **Sensitive Column** | Column-level AES | `phone_number`, `clinical_notes` | Encrypted before insert using application-level KMS secret. |

---

## 3. Jurisdictional Governance & Indian DPDP Act Alignment

When deployed in healthcare facilities in India, the application aligns with the **Digital Personal Data Protection (DPDP) Act, 2023** and National Digital Health Mission (ABDM) guidelines:

1. **Emergency Healthcare Exception (Deemed Consent)**:
   - Under Section 7(a) of the DPDP Act 2023, personal data may be processed without prior consent for medical emergency situations involving a threat to the life or acute health of the data principal.
   - The Emergency Bypass workflow operates under this statutory exception, allowing immediate patient identification, wristband tagging, and resuscitation triage.
2. **Data Principal Rights & Record Correction**:
   - Patients or legal guardians can request administrative demographic corrections.
   - Medical triage assessments and vital sign measurements are retained as medical-legal records and cannot be expunged, ensuring compliance with clinical governance standards.
3. **Retention Periods**:
   - Emergency department encounter records are retained for a minimum of 7 years in accordance with hospital legal record retention policies.
   - Ephemeral queue logs and real-time event logs are purged after 90 days.
