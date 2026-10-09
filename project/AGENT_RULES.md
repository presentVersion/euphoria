# Agent Rules & Instructions — Smart Patient Queue & Emergency Triage

**Audience**: All future AI agents and developers operating in this repository.  
**Authority**: High Priority / Strict Compliance Required.  

---

## 1. Prime Directives for Future Agents

1. **Read Project Status First**: Always inspect [PROJECT_STATUS.md](file:///c:/Users/INCUBATION%20LAB/tou/project/PROJECT_STATUS.md) and [IMPLEMENTATION_PLAN.md](file:///c:/Users/INCUBATION%20LAB/tou/project/IMPLEMENTATION_PLAN.md) before writing any code or modifying configurations.
2. **Execute One Defined Phase at a Time**: Never skip phases or implement features across multiple phases simultaneously. Follow the sequential order established in the implementation plan.
3. **Do Not Redesign the UI or Prescribe Visual Styling**:
   - The user will provide their own UI components from libraries such as React Bits and 21st.dev.
   - Do NOT replace, rewrite, or alter the visual design, theme, color palette, or layout of user-provided components.
   - Focus exclusively on wiring functional page contracts, API hooks, validation, accessibility, and real-time state listeners as documented in [FUNCTIONAL_PAGE_CONTRACTS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/FUNCTIONAL_PAGE_CONTRACTS.md).
4. **Never Invent Medical Triage Protocols**:
   - The software must never claim to have an internally invented, medically validated triage algorithm.
   - All triage logic must adhere strictly to the 3-layer architecture defined in [TRIAGE_ENGINE_SPECIFICATION.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/TRIAGE_ENGINE_SPECIFICATION.md).
   - Development rules engines must be clearly flagged as demonstration profiles (`IS_PRODUCTION_APPROVED = false`).
5. **Strict Clinical Safety Invariants**:
   - Enforce `SAF-001` (Human Clinician Primacy): Triage decisions are made or confirmed by authorized clinical staff.
   - Enforce `SAF-002` (Missing Vitals Invariant): Never impute or silently assume normal values for unrecorded observations.
   - Enforce `SAF-003` (Emergency-First Registration): Never block patient care on missing administrative or demographic fields. Provide instant temporary IDs (`TEMP-YYYYMMDD-XXXX`).
   - Enforce `SAF-004` (Downgrade Dual-Authorization): Acuity downgrades require mandatory clinical rationale and Charge Nurse co-signature.
   - Enforce `SAF-005` (Fail-Safe Protocol Lockout): Fall back safely to manual clinician entry if the rules engine fails.
   - Enforce `SAF-006` (Production Protocol Gate): Block production startup if unapproved protocol profiles are active.
6. **Concurrency Safety is Mandatory**:
   - Never use simple `SELECT ... UPDATE` queries for queue operations where multiple clinicians could call the same patient.
   - Always use atomic database row-level locking: `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1`.
7. **Use Synthetic Data Exclusively**:
   - Real patient data or live hospital database connections must never be used in development, testing, or demonstrations.
   - All mock datasets must use fictional synthetic personas matching [SYNTHETIC_DEMO_SCENARIOS.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYNTHETIC_DEMO_SCENARIOS.md).
8. **Preserve Cryptographic Audit Integrity**:
   - Every clinical override, triage confirmation, urgency change, and queue alteration must be recorded in the append-only `audit_events` table with SHA-256 HMAC hash chaining.
   - Never delete or truncate audit records.
9. **Never Commit Secrets**:
   - Secrets, JWT signing keys, and passwords must be loaded strictly from environment variables.
   - Never commit `.env` files containing live credentials. Use `.env.example` as the schema template.
10. **Report Progress and Unknowns Honestly**:
    - Never pretend that an integration works or that a test passed if it was not executed.
    - If a hospital policy or clinical threshold is unspecified, mark it as configurable and request user guidance.

---

## 2. Standard Development Workflow for Each Phase

When assigned a specific implementation phase (e.g., Phase 1):
1. **Verify Prerequisites**: Confirm that all preceding phases are marked completed in [PROJECT_STATUS.md](file:///c:/Users/INCUBATION%20LAB/tou/project/PROJECT_STATUS.md).
2. **Review Specifications**: Read the relevant documents in `docs/` and contracts in `spec/`.
3. **Implement Incrementally**: Create the source files for that phase following the architecture patterns established in [SYSTEM_ARCHITECTURE.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/SYSTEM_ARCHITECTURE.md) and [MODULE_BOUNDARIES.md](file:///c:/Users/INCUBATION%20LAB/tou/docs/MODULE_BOUNDARIES.md).
4. **Write and Run Automated Tests**: Execute the unit, integration, and safety tests defined for that phase.
5. **Update Tracking**: Update [PROJECT_STATUS.md](file:///c:/Users/INCUBATION%20LAB/tou/project/PROJECT_STATUS.md) and [FEATURE_TRACKER.md](file:///c:/Users/INCUBATION%20LAB/tou/project/FEATURE_TRACKER.md).
6. **Stop and Report**: Present the completed deliverables and wait for user confirmation before advancing to the next phase.
