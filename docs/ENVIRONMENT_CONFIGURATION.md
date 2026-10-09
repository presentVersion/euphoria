# Environment Configuration Dictionary & Profiles

## 1. Environment Configuration Profiles

The application behavior adjusts dynamically based on the `NODE_ENV` environment variable:
- **`development`**: Local developer mode. Uses local database, relaxed CORS for dev tools, outputs detailed Pino debug logs, allows synthetic test data seeding, activates `DEMO-PROTOCOL-v1` with visible UI watermark.
- **`test`**: Automated testing mode. Uses ephemeral test database container, isolates SSE streams, silences non-error logs, mocks external SMS/network adapters.
- **`production`**: Live clinical mode. Strict TLS 1.3 enforcement, Argon2id with production cost parameters, blocks unapproved triage protocols (`SAF-006`), disables synthetic data seeding, enables strict CSP headers.

---

## 2. Configuration Dictionary

| Variable Name | Required? | Default Value (Dev) | Description & Security Constraints |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Deployment environment: `development`, `test`, `production`. |
| `PORT` | No | `3000` | Port for the web application HTTP listener. |
| `HOST` | No | `0.0.0.0` | Bind address for HTTP server. |
| `DATABASE_URL` | Yes | `postgres://triage_admin:pass@localhost:5432/triage_db` | PostgreSQL connection string. Must use SSL in production (`?sslmode=require`). |
| `JWT_SECRET` | Yes | `dev-insecure-jwt-secret-min-32-chars-key!` | 256-bit entropy secret for signing session JWTs. Must be set via KMS in production. |
| `COOKIE_SECRET` | Yes | `dev-insecure-cookie-secret-min-32-chars!` | Secret for signing HTTP-only cookies. |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed origins for CORS headers. In production, locked to hospital domain. |
| `ACTIVE_TRIAGE_PROTOCOL`| Yes | `DEMO-PROTOCOL-v1` | Protocol code to activate. In production, must be an approved institutional protocol. |
| `AUDIT_LOG_ENABLED` | Yes | `true` | Must remain `true` at all times. Disabling in production is forbidden. |
| `SSE_HEARTBEAT_INTERVAL_MS`| No | `15000` | Interval in milliseconds between SSE keep-alive comments. |
| `RATE_LIMIT_MAX_REQ` | No | `120` | Max requests per minute per authenticated user IP. |
| `DEFAULT_FACILITY_ID` | Yes | `f1a2b3c4-1111-2222-3333-444455556666` | Default Facility UUID for single-hospital deployment. |
| `ENABLE_AUDIO_ALARMS` | No | `true` | Enables in-browser auditory alarm playback for Level 1 red flags. |
