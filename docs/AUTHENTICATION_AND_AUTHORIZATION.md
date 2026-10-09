# Authentication & Authorization Specification

## 1. Authentication Architecture & Session Security

The system employs a defense-in-depth security model protecting patient health records (PHI) and operational queues.

### 1.1 Credential & Password Governance
- **Hashing Algorithm**: **Argon2id** (memory cost $64\text{ MB}$, time cost $3\text{ iterations}$, parallelism $4$).
- **Password Strength Rules**:
  - Minimum 12 characters.
  - Requires uppercase, lowercase, numerical digit, and special symbol.
  - Reject commonly breached passwords via dictionary matching.
- **Brute-Force Protection**:
  - 5 consecutive failed login attempts locks the user account for $15\text{ minutes}$.
  - Failed attempts log IP address and employee ID to the security audit trail.

### 1.2 Session Management & Token Transport
- **Token Transport**: Signed JSON Web Tokens (JWT) transported exclusively in **HTTP-Only, Secure, SameSite=Strict** cookies.
- **Token Lifespan**:
  - Access Token: $15\text{ minutes}$ expiration window.
  - Refresh Token: $8\text{ hours}$ (matching hospital shift length), stored in database with automatic rotation and family reuse detection.
- **Inactivity Timeout**:
  - Clinician workstations automatically lock after $10\text{ minutes}$ of idle keyboard/mouse activity, requiring password or biometric re-authentication to unlock.

---

## 2. Server-Side Authorization & RBAC Enforcement

Client-side UI conditional rendering is an aesthetic convenience; **authorization is strictly enforced on the server for every single API request**.

```typescript
// Middleware Enforcement Example
export function requirePermission(permission: PermissionKey) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user;
    if (!user) {
      return reply.status(401).send({ error: "UNAUTHENTICATED" });
    }

    const hasPermission = checkUserPermission(user.role, permission);
    if (!hasPermission) {
      // Check if user has an active break-glass session for this encounter
      const hasBreakGlass = await verifyActiveBreakGlass(user.id, req.params.encounterId);
      if (!hasBreakGlass) {
        await logSecurityViolation(user.id, permission, req.ip, req.url);
        return reply.status(403).send({ 
          error: "FORBIDDEN", 
          message: "You lack the clinical permission required for this operation." 
        });
      }
    }
  };
}
```

---

## 3. Sensitive Clinical Operations & Dual Authorization

Certain high-consequence operations present severe medical malpractice risks:
1. **Urgency Downgrades** (e.g., Level 2 to Level 3).
2. **Merging Duplicate Medical Records**.
3. **Closing an Encounter as Left Without Being Seen (LWBS) for high-acuity patients**.

### Dual-Signature Workflow
- The request requires the primary actor's authentication plus a `supervisorApprovalToken`.
- The frontend triggers an in-line supervisor authentication modal.
- The Charge Nurse enters their credentials and justification.
- The server validates the supervisor's active role, verifies their identity, and binds both employee IDs into the transactional audit record.
