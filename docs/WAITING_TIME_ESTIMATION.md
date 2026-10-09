# Estimated Waiting Time Forecasting Specification

## 1. Principles & Clinical Safety Boundaries

Waiting time estimation is an operational forecasting subsystem designed to manage patient expectations and assist staffing decisions.

### Strict Safety Invariants
1. **Never a Clinical Guarantee**: An estimated wait time is a statistical forecast, never a promise of when medical care will commence. Emergency arrivals take precedence over all prior estimates.
2. **Never Determines Clinical Safety**: The system **must never** conclude that a patient is safe to wait merely because their estimated wait is short.
3. **No Fabricated Precision**: The system refuses to output misleadingly precise numbers (e.g., "17 minutes"). Instead, it outputs broad confidence bands (e.g., "15–30 mins") with explicit uncertainty ratings.
4. **Transparent Data Sparing Fallback**: If insufficient historical consultation data exists for the current shift ($< 5\text{ completed encounters}$), the API returns `status: "ESTIMATE_UNAVAILABLE"` rather than guessing.

---

## 2. Statistical Forecasting Algorithm

The estimated wait time for patient $i$ in care area $C$ is computed using a queuing-theory model adjusted for empirical clinician throughput:

$$\text{Estimated Wait (minutes)} = \frac{\sum_{j \in \text{Patients Ahead}} \text{ExpectedServiceTime}(j)}{\text{ActiveClinicians}(C)} \times \text{SurgeFactor}$$

### 2.1 Formula Inputs & Coefficients

| Input Variable | Description | Source / Calculation |
| :--- | :--- | :--- |
| $\text{Patients Ahead}$ | Number of active patients in the same queue with $\text{PriorityScore} > \text{PriorityScore}(i)$. | Dynamically counted from `queue_entries`. |
| $\text{ExpectedServiceTime}(j)$ | Expected duration of consultation for patient $j$ based on their assigned urgency level: | Rolling 4-hour median of completed consultations in Care Area $C$: |
| | - Level 1 (Resuscitation) | $45\text{ minutes}$ (intensive team involvement) |
| | - Level 2 (Emergent) | $30\text{ minutes}$ |
| | - Level 3 (Urgent) | $20\text{ minutes}$ |
| | - Level 4 (Semi-Urgent) | $12\text{ minutes}$ |
| | - Level 5 (Non-Urgent) | $8\text{ minutes}$ |
| $\text{ActiveClinicians}(C)$ | Number of doctors currently logged in and assigned to Care Area $C$. | Query from `staff_department_assignments` with active status. Minimum denominator is clamped to $1$. |
| $\text{SurgeFactor}$ | Buffer multiplier accounting for emergency interruptions: | $1.20$ during standard volume;<br>$1.45$ if any active Level 1 Red Flag exists in the facility. |

---

## 3. Confidence Bands & Output Mapping

Calculated raw minute values are discretized into standardized communication bands:

| Raw Calculated Wait | Public / Patient Display Band | Confidence Level | UI Indicator |
| :---: | :---: | :---: | :--- |
| $< 15\text{ mins}$ | **"Under 15 mins"** | High | Green badge |
| $15 – 35\text{ mins}$ | **"15 – 35 mins"** | High | Green badge |
| $36 – 60\text{ mins}$ | **"35 – 60 mins"** | Moderate | Yellow badge |
| $61 – 90\text{ mins}$ | **"60 – 90 mins"** | Moderate | Yellow badge |
| $91 – 150\text{ mins}$| **"90 – 150 mins"** | Low | Amber badge |
| $> 150\text{ mins}$ | **"Over 2.5 hours"** | Low | Red badge |

---

## 4. Fallback Handling & Sparse Data Scenarios

```typescript
export interface WaitingTimeEstimateResult {
  status: 'AVAILABLE' | 'ESTIMATE_UNAVAILABLE' | 'EMERGENCY_SURGE_DELAY';
  bandDisplay: string | null;
  estimatedMinutesMin: number | null;
  estimatedMinutesMax: number | null;
  confidence: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
  activePatientsAhead: number;
  disclaimer: string;
}

export function computeEstimatedWait(
  queueEntry: QueueEntry,
  patientsAhead: QueueEntry[],
  recentCompletedConsultations: Consultation[],
  activeCliniciansCount: number
): WaitingTimeEstimateResult {
  // Fallback 1: Sparse data check (< 5 samples in recent window)
  if (recentCompletedConsultations.length < 5) {
    return {
      status: 'ESTIMATE_UNAVAILABLE',
      bandDisplay: 'Estimate Currently Unavailable',
      estimatedMinutesMin: null,
      estimatedMinutesMax: null,
      confidence: 'NONE',
      activePatientsAhead: patientsAhead.length,
      disclaimer: 'Insufficient recent consultation data to calculate a reliable estimate. Clinicians are triaging patients continuously.'
    };
  }

  // Fallback 2: No active clinicians assigned to area
  if (activeCliniciansCount <= 0) {
    return {
      status: 'ESTIMATE_UNAVAILABLE',
      bandDisplay: 'Staffing Transition in Progress',
      estimatedMinutesMin: null,
      estimatedMinutesMax: null,
      confidence: 'NONE',
      activePatientsAhead: patientsAhead.length,
      disclaimer: 'Clinician shift change underway. Consultations will resume shortly.'
    };
  }

  // Calculate standard estimate bands...
  // (Standard calculation logic)
}
```

---

## 5. Public Display API Contract

The API endpoint `GET /api/v1/queues/{queue_id}/wait-estimate` sanitizes all responses, stripping any internal patient identifiers:
```json
{
  "queue_id": "c1f72a44-802b-4e68-9a3c-1b7f0224d49a",
  "department_name": "Urgent Care",
  "status": "AVAILABLE",
  "estimated_band": "35 – 60 mins",
  "patients_in_queue": 14,
  "last_updated_at": "2026-10-09T05:30:00Z",
  "disclaimer": "Wait times are estimates only. Patients with acute medical emergencies will be seen immediately ahead of non-emergency visits."
}
```
