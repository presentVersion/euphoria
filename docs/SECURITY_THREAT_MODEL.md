# Security Threat Model & Attack Surface Analysis (STRIDE)

## 1. STRIDE Threat Model Matrix

The application handles highly sensitive Protected Health Information (PHI) and safety-critical queue prioritization. This threat model applies Microsoft STRIDE methodology across all system boundaries.

| Threat Category | Potential Attack Vector | Impact Severity | Architectural Mitigation | Verification Test |
| :--- | :--- | :---: | :--- | :--- |
| **Spoofing** | Attacker impersonates an emergency physician to access patient medical records. | Critical | Argon2id password hashing, rotating JWT session cookies, rate-limiting on login (5/15m), and mandatory supervisor co-signatures. | Brute force login test; token forgery penetration test. |
| **Tampering** | Rogue actor or compromised account lowers a patient's urgency level to manipulate queue metrics. | Critical | Strict RBAC; database check constraints; urgency downgrades require Charge Nurse dual-signature; immutable append-only audit trail. | Unauthorized urgency downgrade API test (`403 Forbidden`). |
| **Repudiation** | Clinician denies having called a patient or overriding an algorithmic triage recommendation. | High | Cryptographically chained audit logs storing actor UUID, role, IP address, timestamp, previous state, new state, and rationale. | Forensic audit log query verifying SHA-256 state chain. |
| **Information Disclosure** | Public waiting room display leaks patient diagnoses, full names, or clinical symptoms. | Critical | Separate public SSE stream (`/public-stream`); sanitization pipeline stripping all PII/PHI; displays only anonymous sequential tokens (`A-104`). | Automated API payload inspection verifying zero PHI in public endpoints. |
| **Denial of Service** | Volumetric HTTP flood or SSE connection exhaustion blinds triage staff during emergency surge. | High | Rate-limiting reverse proxy (Nginx/Cloudflare); maximum 10 SSE connections per IP; database connection pool clamping; read-replica fallback. | Apache Benchmark / k6 stress testing at 500 req/sec. |
| **Elevation of Privilege** | Receptionist manipulates request payload to perform doctor consultation or prescribe orders. | Critical | Server-side RBAC validation on every endpoint; Zod schema sanitization stripping unexpected body fields (no mass-assignment). | BOLA / Broken Function Level Authorization fuzz test. |

---

## 2. In-Depth Vulnerability Defenses

### 2.1 Broken Object-Level Authorization (BOLA / IDOR) Defense
- **Risk**: An attacker changes `encounterId` in the URL to view or modify an encounter belonging to another department or patient.
- **Defense**: The database query combines the `encounterId` with a mandatory tenant and department access check:
  ```sql
  SELECT * FROM encounters e
  JOIN staff_department_assignments sda ON sda.department_id = e.department_id
  WHERE e.id = :requested_encounter_id 
    AND sda.staff_user_id = :authenticated_user_id;
  ```
  If no row is returned, the API returns a generic `404 Not Found` rather than `403`, preventing ID enumeration.

### 2.2 SQL & Query Injection Defense
- All database queries use parameterized SQL via Drizzle ORM / Prisma prepared statements.
- Raw string concatenation in SQL queries is strictly prohibited by ESLint AST rules.

### 2.3 Cross-Site Scripting (XSS) & Content Security Policy (CSP)
- Response headers enforce a strict Content Security Policy:
  `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; style-src 'self' 'unsafe-inline'; base-uri 'self'; frame-ancestors 'none';`
- Frontend React JSX auto-escapes rendered text. Free-text chief complaint and notes fields are sanitized to disallow HTML tags.

### 2.4 Sensitive Data in Application Logs
- Application loggers (Pino/Winston) employ strict automated redaction filters:
  - Redacted keys: `password`, `passwordHash`, `token`, `authorization`, `creditCard`, `nationalId`, `phone`, `ssn`.
  - Clinical observations and patient names are stripped from standard operational debug logs.
