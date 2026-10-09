# Accessibility (a11y) & Internationalization (i18n) Specification

## 1. Accessibility Engineering (WCAG 2.1 AA Standard)

Emergency clinical environments feature extreme human-factor stresses: harsh fluorescent or dim trauma lighting, high noise levels, rapid keyboard entry, and staff with varying visual capabilities.

### 1.1 Non-Color Dual Encoding (`NFR-ACC-001`)
- **Strict Rule**: Color must **NEVER** be the sole indicator of clinical urgency, error status, or queue state.
- **Enforcement**:
  - Every urgency badge pairs an accessible background color with:
    1. An explicit numerical tier (e.g., `[1]`, `[2]`, `[3]`).
    2. A standardized clinical text label (e.g., `LEVEL 1 - RESUSCITATION`, `LEVEL 2 - EMERGENT`).
    3. An accessible icon (e.g., Warning Diamond for Level 1, Triangle for Level 2, Circle for Level 3).

### 1.2 Screen Reader Announcements & ARIA Live Regions
- Critical emergency events announce immediately to screen reader users using ARIA live regions:
  ```html
  <div role="alert" aria-live="assertive" aria-atomic="true" class="sr-only">
    Critical Red-Flag Alert: Unresponsive Patient in Triage Bay 2.
  </div>
  ```
- Queue call events announce with `aria-live="polite"`:
  ```html
  <div role="status" aria-live="polite" class="sr-only">
    Patient Token A-104 called to Consultation Room 3.
  </div>
  ```

### 1.3 Rapid Keyboard Operability (`NFR-ACC-002`)
- Triage nurses must be able to perform a complete triage assessment using keyboard shortcuts alone:
  - `Alt + N`: Focus Patient Search / New Registration.
  - `Alt + E`: Emergency Bypass trigger.
  - `Alt + T`: Focus Vital Signs form.
  - `Alt + 1` through `Alt + 5`: Rapid urgency level confirmation.
  - `Enter`: Commit form.

---

## 2. Internationalization (i18n) & Localization Architecture

### 2.1 Separation of Clinical Documentation vs. Interface Labels
- **Interface Labels**: Navigation, buttons, form headers, and system messages are loaded dynamically from localized JSON bundles (`en-US`, `hi-IN`, `ta-IN`, etc.).
- **Clinical Records**: Original clinical notes, physician descriptions, and chief complaints are preserved in their **exact original recorded language** to prevent medical malpractice translation errors.

### 2.2 Timezone & Timestamp Localization
- All database timestamps are strictly stored in UTC (`TIMESTAMPTZ`).
- The frontend renders timestamps localized to the facility's configured operational timezone (e.g., `Asia/Kolkata` / IST: UTC+5:30) with explicit 24-hour military time formats (`HH:mm:ss`) to prevent AM/PM confusion in medical charts.
