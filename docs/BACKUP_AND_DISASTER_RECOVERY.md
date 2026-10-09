# Backup & Disaster Recovery Specification

## 1. Resilience Objectives (RTO & RPO Targets)

For a hospital emergency department, data loss or prolonged system outages risk patient safety and create severe legal liabilities:

| Metric | Target | Operational Rationale | Architectural Enforcement |
| :--- | :---: | :--- | :--- |
| **Recovery Point Objective (RPO)** | $\le 1\text{ minute}$ | Maximum acceptable data loss during sudden catastrophic hardware failure. | Continuous PostgreSQL Write-Ahead Log (WAL) streaming archiving via `pg_wal`. |
| **Recovery Time Objective (RTO)** | $\le 15\text{ minutes}$| Maximum elapsed time to restore service after primary data center loss. | Automated standby database replica promotion and container restart. |

---

## 2. Multi-Tiered Backup Strategy

1. **Continuous Write-Ahead Log (WAL) Archiving**:
   - PostgreSQL `archive_mode = on` continuously uploads closed WAL segments to encrypted off-site cloud storage every 60 seconds.
   - Enables **Point-in-Time Recovery (PITR)** to any second in history.
2. **Nightly Full Logical Snapshot**:
   - Automated cron executes `pg_dump -Fc` at 02:00 AM UTC.
   - Backup file encrypted with AES-256 before egress.
   - Retained for 30 daily snapshots, 12 monthly snapshots, and 7 annual archives.
3. **Audit Ledger Verification Check**:
   - Each nightly backup triggers an automated cryptographic audit hash chain integrity scan.
   - Rejection: If the hash chain shows tampering or truncation, an immediate alert is dispatched to the Chief Medical Information Officer (CMIO).

---

## 3. Disaster Recovery Drill Runbook

Every 6 months, the IT engineering team executes a mandatory recovery drill on an isolated staging cluster:
```bash
# 1. Spin up clean PostgreSQL container
docker run -d --name dr-restore-test -e POSTGRES_PASSWORD=restore_test postgres:16-alpine

# 2. Download and decrypt latest nightly snapshot
gpg --decrypt backup_20261009.dump.gpg > backup_clean.dump

# 3. Restore database schema and data
pg_restore -h localhost -p 5432 -U postgres -d triage_db -v backup_clean.dump

# 4. Execute audit integrity verification query
docker exec -it dr-restore-test psql -U postgres -d triage_db \
  -c "SELECT count(*), max(created_at) FROM audit_logs;"

# 5. Boot test application container and verify health probe
curl -f http://localhost:3000/api/v1/health/ready
```
