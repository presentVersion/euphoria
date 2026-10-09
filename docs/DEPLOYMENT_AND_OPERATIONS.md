# Deployment & Operations Blueprint

## 1. Containerization & Multi-Stage Dockerfile Blueprint

The application is packaged as an immutable, lightweight, security-hardened Docker container image.

```dockerfile
# Multi-Stage Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 triageuser
COPY --from=builder --chown=triageuser:nodejs /app/dist ./dist
COPY --from=builder --chown=triageuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=triageuser:nodejs /app/package.json ./package.json
USER triageuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1
CMD ["node", "dist/server.js"]
```

---

## 2. Health Monitoring & Kubernetes / Docker Probes

The application exposes two distinct health monitoring endpoints:
1. **Liveness Probe (`GET /api/v1/health`)**:
   - Returns `200 OK` if the Node.js event loop is responsive.
   - Used by container orchestrators to detect process deadlocks and restart containers.
2. **Readiness Probe (`GET /api/v1/health/ready`)**:
   - Performs active downstream connectivity checks:
     - Tests PostgreSQL database connectivity (`SELECT 1`).
     - Verifies active triage protocol definition is loaded.
   - If PostgreSQL is unreachable, returns `503 Service Unavailable`.
   - Used by reverse proxies to stop routing traffic to unhealthy instances during database failovers.

---

## 3. Production Deployment Topology

```
[Incoming HTTPS Traffic (Port 443)]
                 │
                 ▼
     [Reverse Proxy / Ingress] ──► Terminates TLS 1.3, Strips Untrusted Headers
                 │
        ┌────────┴────────┐
        ▼                 ▼
   [App Pod 1]       [App Pod 2] ──► (Stateless Application Containers)
        │                 │
        └────────┬────────┘
                 │
                 ▼
    [Primary PostgreSQL 16 DB] ──(Streaming WAL Replication)──► [Standby Replica DB]
                 │
                 ▼
    [Encrypted Backup Storage (S3 / Offsite Volume)]
```
