# Operational Analytics & Reporting Specification

## 1. Reporting Philosophy & Ethical Boundaries

Operational metrics in healthcare measure department efficiency, patient safety, and resource utilization.
- **Ethical Core Principle**: High throughput or fast consultation times **never equal clinical quality**. The system strictly refuses to incentivize clinical shortcuts (e.g., prematurely discharging patients or artificially downgrading triage urgency) to meet administrative wait-time KPIs.

---

## 2. Core Operational Metrics Catalog

### 2.1 Door-to-Triage Time
- **Description**: Elapsed time from patient registration arrival to completed clinical triage assessment.
- **Mathematical Formula**:
  $$\text{DoorToTriage} = \text{TriageAssessment.assessed\_at} - \text{Encounter.arrival\_time}$$
- **Target Standard**: $\le 10\text{ minutes}$ (Median); $\le 15\text{ minutes}$ (90th percentile).
- **Inclusion**: All completed encounters.
- **Exclusion**: Direct Emergency Bypass patients (who bypass triage waiting completely).

### 2.2 Door-to-Doctor Time
- **Description**: Elapsed time from arrival to the start of physician consultation.
- **Mathematical Formula**:
  $$\text{DoorToDoctor} = \text{Consultation.started\_at} - \text{Encounter.arrival\_time}$$
- **Target Standard**:
  - Level 1: Immediate ($0\text{ minutes}$)
  - Level 2: $\le 15\text{ minutes}$
  - Level 3: $\le 60\text{ minutes}$
  - Level 4: $\le 120\text{ minutes}$
  - Level 5: $\le 240\text{ minutes}$

### 2.3 Left Without Being Seen (LWBS) Rate
- **Description**: Proportion of registered patients who leave before receiving medical evaluation.
- **Mathematical Formula**:
  $$\text{LWBS Rate} = \frac{\text{Count of encounters with status } \texttt{'LEFT\_WITHOUT\_BEING\_SEEN'}}{\text{Total Registered Encounters in Window}} \times 100\%$$
- **Target Standard**: $< 2.0\%$. A spike in LWBS indicates severe waiting room congestion.

### 2.4 Reassessment Compliance Rate
- **Description**: Proportion of waiting patients reassessed within their protocol-mandated due time window.
- **Mathematical Formula**:
  $$\text{Reassessment Compliance} = \frac{\text{Count of Reassessments completed within } \text{due\_at} \pm 10\text{m}}{\text{Total Scheduled Reassessments in Window}} \times 100\%$$
- **Target Standard**: $> 95.0\%$.

### 2.5 Total Length of Stay (LOS)
- **Description**: Total duration from arrival to final disposition and discharge or admission.
- **Mathematical Formula**:
  $$\text{LOS} = \text{Encounter.closed\_at} - \text{Encounter.arrival\_time}$$
- **Target Standard**: $\le 4\text{ hours}$ for $90\%$ of non-admitted emergency patients.

---

## 3. Operational Heatmaps & Bottleneck Detection

The reporting engine aggregates encounter milestones into 4 continuous operational phases:
1. **Registration to Triage Waiting Area** (Intake bottleneck).
2. **Triage to Doctor Call** (Waiting room physician capacity bottleneck).
3. **In-Consultation to Diagnostic Results** (Laboratory / Imaging investigation bottleneck).
4. **Disposition to Bed Transfer / Discharge** (Inpatient ward bed-block bottleneck).

### Bottleneck Alert Trigger
If the median wait in any single phase exceeds $150\%$ of historical baseline, an operational bottleneck alert is flagged on the Department Manager console, indicating which department resource is constrained.
