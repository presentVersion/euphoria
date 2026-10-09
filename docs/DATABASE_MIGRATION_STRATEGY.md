# Database Migration Strategy & Seeding Policy

## 1. Migration Framework & Versioning Philosophy

The database migration strategy guarantees deterministic, repeatable, and reversible schema changes while preserving clinical data integrity and audit records.

### Tool Selection
- **ORM / Migration Tool**: **Drizzle ORM** (with `drizzle-kit`) or **Prisma Migrate**.
- **Migration Storage**: Flat SQL migration files stored under `src/db/migrations/` (e.g., `0001_initial_schema.sql`, `0002_add_reassessment_index.sql`).
- **Metadata Tracking**: Migration execution history tracked in `__drizzle_migrations` table with timestamp and SHA-256 checksums.

---

## 2. Zero-Downtime Migration Pattern (Expand / Contract)

In a live hospital environment, clinical operations cannot pause for database schema changes. Destructive modifications (e.g., renaming columns, dropping tables) are strictly managed via the two-phase **Expand / Contract pattern**:

```
PHASE 1: EXPAND
  1. Add new nullable column or table.
  2. Deploy application code that writes to both old and new columns.
  3. Run backfill migration script in background batches.

PHASE 2: VERIFY
  1. Verify zero read/write anomalies via application logs.
  2. Point all application reads to the new column.

PHASE 3: CONTRACT
  1. Remove application references to the old column.
  2. Execute migration to drop the deprecated column.
```

---

## 3. Database Seeding Strategy

### 3.1 Environment Separation
1. **Local Development & Testing (`NODE_ENV=development | test`)**:
   - Seed script: `npm run db:seed:dev`
   - Inserts synthetic facilities, departments (ED, Pediatrics, Urgent Care), care areas, staff accounts with known test credentials, and 14 synthetic clinical demonstration patients (Scenarios A through N).
   - All synthetic patients are tagged with `[SYNTHETIC-DEMO]` in notes and marked with synthetic MRNs (`MRN-DEMO-XXXX`).
2. **Production (`NODE_ENV=production`)**:
   - Seed script: `npm run db:seed:prod`
   - **STRICT RESTRICTION**: Production seed strictly inserts foundational organizational metadata only:
     - Facility records.
     - Department codes and Care Area schemas.
     - Default system roles and initial Emergency Root Administrator account (requiring immediate password rotation).
   - **FORBIDDEN**: Synthetic patient records, mock vitals, and test queue entries are strictly barred from production execution. The seed script checks `process.env.NODE_ENV === 'production'` and aborts if mock patient data is detected.

---

## 4. Rollback & Disaster Recovery Runbook

### Forward Migration Failure
If a migration script fails midway during deployment:
1. Migration runner halts immediately and raises non-zero exit code.
2. PostgreSQL transaction aborts, automatically rolling back uncommitted DDL.
3. Deploy pipeline blocks application container restart until migration failure is diagnosed.

### Production Rollback Procedure
1. Identify the failing migration file (e.g., `0004_failing_trigger.sql`).
2. Check the corresponding down-migration script (`0004_failing_trigger.down.sql`).
3. Execute dry-run rollback in staging environment.
4. Execute `npm run db:migrate:down` against production with active connection pooling paused.
5. Verify schema integrity and restore connection pool.
