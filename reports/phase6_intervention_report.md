# EduInsight AI — Phase 6: Prescriptive Academic Intervention Engine Report

**Generated:** October 4, 2026  
**Status:** Validated & Completed  
**Artifacts Generated:**  
- `interventions/intervention_library.py` (Intervention Catalog, Action Templates, & Exclusion Policy)  
- `interventions/intervention_engine.py` (Multi-Signal Decision Engine & Prioritization Queue)  
- `ml/test_interventions.py` (Phase 6 Verification Suite — 8/8 Passing, 29/29 Total Combined Passing)  
- `results/intervention_plans.csv` (Dashboard Queued Intervention Records)  
- `results/intervention_plans.json` (Structured JSON Action Plans)  

---

## 1. Objective

Phase 6 implements the **Prescriptive Academic Intervention Engine** for EduInsight AI.

The engine transforms diagnostic predictions (Phase 2), feature attributions (Phase 3), conformal confidence sets (Phase 4), and feasible what-if simulations (Phase 5) into **structured, prioritized, and evidence-grounded academic action plans**.

```
Predictive Risk Probability (Phase 2)
              +
SHAP Top Risk Drivers (Phase 3)
              +
Conformal Uncertainty Set & Status (Phase 4)
              +
Feasible Counterfactual Perturbations (Phase 5)
              +
Temporal Checkpoint (W4, W8, W12)
              │
              ▼
   Prescriptive Academic Intervention Engine
  - Rule-based Multi-Signal Synthesis
  - Demographic & Immutable Feature Filtering
  - Conformal Uncertainty Gating
  - Minimum-Effort Counterfactual Alignment
              │
  ┌───────────┴───────────┐
  ▼                       ▼
Structured Action Plan   Prioritized Intervention Queue
(Primary + Secondary     (Ranked by Composite Urgency
 Interventions, Reasons)  for Faculty & Advisors)
```

---

## 2. Finite Intervention Catalog & Action Templates

The engine uses a controlled vocabulary of 7 distinct academic intervention types:

| Intervention Type | Target Profile | Suggested Institutional Workflow | Default Time Horizon |
|---|---|---|---|
| **`ATTENDANCE_SUPPORT`** | In-semester absenteeism, low attendance subjects | Attendance recovery contract, weekly faculty advisor check-ins, lab attendance tracking | Immediate (Next 2-3 weeks) |
| **`SUBJECT_REMEDIATION`** | Multiple low-scoring subjects, failing internal marks | Small-group remedial tutorials, peer tutoring assignments, practice assessment drills | Short-term (Next 2-4 weeks) |
| **`FACULTY_MENTORING`** | Downward performance velocity, conceptual roadblocks | Bi-weekly 1-on-1 faculty advisory sessions, assignment bottleneck reviews, study strategy | Ongoing (Mid-to-Late semester) |
| **`STUDY_PLAN`** | Moderate performance decline, early-term struggle | Guided coursework timetable, milestone assignment submission targets, structured self-study | Next 2-4 weeks |
| **`EARLY_ACADEMIC_COUNSELLING`** | Cumulative historical backlogs, severe disengagement | Formal Dean/HOD counselling session, credit load balancing, backlog clearing roadmap | Immediate (Within 1 week) |
| **`PERFORMANCE_MONITORING`** | Borderline metrics, ambiguous conformal uncertainty | Automated progress tracking on advisor watchlist without intrusive manual burden | Until next checkpoint |
| **`NO_INTERVENTION`** | Confidently safe students, strong protective signals | Regular curricular progression; no remedial resource allocation required | Standard semester progression |

---

## 3. Demographic Safeguards & Bias Exclusion Policy

To ensure equity and institutional fairness, the intervention engine enforces an **Absolute Exclusion Policy**:
- **Demographic & Identity Attributes**: `admission_category`, `dept_code`, `course_code`, `fee_payment_status`, `entrance_rank_percentile`, `cohort_entry_year`, `semester_no`.
- **Downstream Outcomes / Target Leakage**: `final_sgpa`, `final_cgpa`, `final_marks_average`, `final_backlogs_count`, `target_risk`.

> [!IMPORTANT]
> A demographic feature may have statistical correlation in an ML model, but it is **strictly prohibited from triggering an academic intervention**. Only actionable behavioral metrics (attendance, continuous assessment marks, subject-level failures, backlog recovery) drive recommendations.

---

## 4. Priority & Recommendation Confidence Logic

### Priority Assignment Matrix

| Priority Level | Risk Probability ($P$) | Conformal Uncertainty Status | Trigger Conditions |
|---|---|---|---|
| **`CRITICAL`** | $P \ge 0.85$ | `CONFIDENT_RISK` | Severe multi-subject failure ($\ge 2$ failing subjects), acute attendance deficit ($<65\%$), or high historical backlogs ($\ge 3$). |
| **`HIGH`** | $P \ge 0.65$ | `CONFIDENT_RISK` | Substantial actionable risk drivers with feasible counterfactual remediation. |
| **`MEDIUM`** | $0.40 \le P < 0.65$ | `CONFIDENT_RISK` / `AMBIGUOUS` | Moderate risk signals, or **ambiguous prediction sets** (`{"SAFE", "RISK"}`). |
| **`LOW`** | $0.25 \le P < 0.40$ | Any | Early warning signs; preventive monitoring recommended. |
| **`NONE`** | $P < 0.25$ | `CONFIDENT_SAFE` | Strong protective factors; `NO_INTERVENTION` output. |

### Conformal Uncertainty Gating
When the conformal uncertainty status is **`AMBIGUOUS`** ($C(x) = \{\text{"SAFE"}, \text{"RISK"}\}$):
- Priority is **automatically capped at `MEDIUM`** (or `LOW`).
- Highly intrusive interventions (e.g. formal disciplinary counselling) are gated; the system defaults to **`PERFORMANCE_MONITORING`** or **`STUDY_PLAN`** to avoid premature over-intervention.

### Recommendation Confidence Calibration
- **`HIGH`**: High risk certainty ($P \ge 0.75$ or $P \le 0.20$), `CONFIDENT_RISK` / `CONFIDENT_SAFE`, actionable SHAP features align directly with a feasible threshold-crossing counterfactual.
- **`MEDIUM`**: Moderate risk probability ($0.50 \le P < 0.75$), or counterfactual yields partial reduction.
- **`LOW`**: Conformal status is `AMBIGUOUS`, or weak SHAP attribution signals.

---

## 5. Temporal Adaptation ($W_4 \to W_8 \to W_{12}$)

- **Week 4 (Early Milestone)**: Focuses on low-intensity preventive guidance (`STUDY_PLAN`, `ATTENDANCE_SUPPORT`, early faculty check-ins) to catch disengagement before formal midterm exams.
- **Week 8 (Midterm Milestone)**: Focuses on trajectory correction (`FACULTY_MENTORING`, `SUBJECT_REMEDIATION`, mid-term study contracts) responding to actual midterm exam results.
- **Week 12 (Pre-Final Comprehensive Milestone)**: Focuses on urgent high-impact remediation (`SUBJECT_REMEDIATION`, intensive exam prep tutorials, Dean counselling) for students facing imminent semester-end failure.

---

## 6. Multi-Criteria Student Prioritization Queue

Advisors and faculty have limited bandwidth. The engine automatically ranks intervention candidates using a composite **Urgency Score**:
$$\text{Urgency Score} = 0.35 \times P(\text{Risk}) + 0.25 \times \text{Certainty Weight} + 0.25 \times \text{Priority Weight} + 0.10 \times \text{Checkpoint Urgency} + 0.05 \times \text{Actionability}$$

### Top Prioritized Students in Evaluation Cohort (`results/intervention_plans.csv`)

| Rank | Student ID | Sem | Checkpoint | Risk Prob | Uncertainty | Priority | Confidence | Primary Intervention | Secondary Intervention | Estimated Risk Reduction ($\Delta$) | Urgency Score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **1** | `STU0016` | 2 | **W8** | $0.9983$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-83.94\%$ | **$0.5494$** |
| **2** | `STU0017` | 2 | **W8** | $0.9971$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-92.56\%$ | **$0.5490$** |
| **3** | `STU0016` | 4 | **W8** | $0.9959$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-89.80\%$ | **$0.5486$** |
| **4** | `STU0016` | 3 | **W8** | $0.9946$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-81.88\%$ | **$0.5481$** |
| **5** | `STU0017` | 6 | **W4** | $0.9910$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-89.41\%$ | **$0.5369$** |
| **6** | `STU0016` | 4 | **W4** | $0.9793$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-80.00\%$ | **$0.5328$** |
| **7** | `STU0017` | 5 | **W4** | $0.9793$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-90.34\%$ | **$0.5328$** |
| **8** | `STU0027` | 1 | **W4** | $0.9674$ | `CONFIDENT_RISK` | `CRITICAL` | `HIGH` | `SUBJECT_REMEDIATION` | `FACULTY_MENTORING` | $-69.49\%$ | **$0.5286$** |

---

## 7. Representative Structured Action Plan Outputs (`results/intervention_plans.json`)

### Example 1: Critical Priority Subject Remediation (`STU0016`, W8)
```json
{
  "student_id": "STU0016",
  "semester_no": 2,
  "checkpoint": "W8",
  "risk_probability": 0.9983,
  "risk_class": "HIGH",
  "uncertainty_status": "CONFIDENT_RISK",
  "conformal_prediction_set": ["RISK"],
  "priority": "CRITICAL",
  "recommendation_confidence": "HIGH",
  "primary_intervention": {
    "type": "SUBJECT_REMEDIATION",
    "title": "Targeted Multi-Subject Academic Remediation",
    "priority": "CRITICAL",
    "confidence": "HIGH",
    "reason": "Student has 4 subject(s) below internal benchmarks, identified as a primary risk driver.",
    "trigger_evidence": [
      "low_scoring_subjects_w8 (value: 4, SHAP: +1.649)",
      "internal_marks_avg_w8 (value: 44.63, SHAP: +1.267)"
    ],
    "suggested_action": "Enroll student in small-group tutorial sessions for high-risk subjects, assign dedicated peer tutors, and conduct remedial assessment drills.",
    "expected_model_effect": "Remediating 1 or more failing subjects below 50% internal mark benchmark is the primary driver for transitioning predictions to SAFE.",
    "time_horizon": "Short-term (Next 2-4 weeks)"
  },
  "secondary_intervention": {
    "type": "FACULTY_MENTORING",
    "title": "One-on-One Faculty Academic Mentoring",
    "priority": "MEDIUM",
    "suggested_action": "Schedule bi-weekly advisory sessions with departmental faculty mentor."
  },
  "counterfactual_evidence": {
    "scenario_name": "Remediate 2 Failing Subject(s)",
    "modified_features": {
      "low_scoring_subjects_w8": 2,
      "internal_marks_avg_w8": 52.63
    },
    "predicted_risk_reduction": 0.8394,
    "new_risk_probability": 0.1589,
    "new_point_prediction": "SAFE",
    "feasibility": "FEASIBLE_THRESHOLD_CROSSED"
  }
}
```

### Example 2: Confident Safe Student (`STU0001`, W12)
```json
{
  "student_id": "STU0001",
  "semester_no": 1,
  "checkpoint": "W12",
  "risk_probability": 0.0013,
  "risk_class": "LOW",
  "uncertainty_status": "CONFIDENT_SAFE",
  "conformal_prediction_set": ["SAFE"],
  "priority": "NONE",
  "recommendation_confidence": "HIGH",
  "primary_intervention": {
    "type": "NO_INTERVENTION",
    "title": "No Remedial Intervention Warranted",
    "priority": "NONE",
    "suggested_action": "Continue regular curriculum; student exhibits strong academic indicators and low predicted risk.",
    "time_horizon": "Standard semester progression"
  },
  "secondary_intervention": null,
  "counterfactual_evidence": null
}
```

---

## 8. Prescriptive vs. Descriptive Distinction

- **Descriptive Analytics (Traditional)**: *"Student STU0016 has 76% attendance and 46% marks."*
- **Predictive Analytics (Phase 2 & 4)**: *"Student STU0016 has a 99.91% risk of failure (Confident Risk)."*
- **Diagnostic Analytics (Phase 3)**: *"Risk is primarily driven by 3 failing subjects (SHAP = +2.82) and low internal marks (SHAP = +4.30)."*
- **Counterfactual Simulation (Phase 5)**: *"If internal marks increase by +10 and 1 failing subject is cleared, predicted risk drops to 46.28%."*
- **Prescriptive Support (Phase 6)**: *"Enroll STU0016 in Targeted Multi-Subject Remediation (Priority: CRITICAL, Confidence: HIGH, Urgency Score: 0.549) with bi-weekly Faculty Mentoring, targeting remedial completion within 2-4 weeks."*

---

## 9. Limitations & Ethical Safeguards

1. **Non-Causal Decision Support**: Recommendations are decision-support heuristics derived from model attributions and counterfactual simulations. They provide evidence-based guidance for faculty mentors rather than automated deterministic actions.
2. **Faculty Agency & Autonomy**: The system is designed as paired decision support. Advisors retain full override capability based on non-quantified personal or health circumstances.
3. **Synthetic Cohort Context**: The evaluation uses the Phase 1 longitudinal dataset. Real-world deployment will utilize live institutional student support services and counseling workflows.

---

## 10. Recommendations for Phase 7 (Unified API & Production Architecture)

1. **Unified REST API Endpoint**: Wrap all six layers into a clean FastAPI/Express microservice (`/api/v1/academic-risk/analyze`).
2. **Dashboard UI Component Integration**: Feed `intervention_plans.json` and `results/intervention_plans.csv` directly to the Faculty Intelligence Center and Student Personal Intelligence dashboards.
3. **Audit & Feedback Logging**: Capture faculty intervention acceptance/rejection logs for continuous institutional model calibration.

---

## 11. Phase 6 Completion Checklist

- [x] Prediction (Phase 2), SHAP (Phase 3), Conformal (Phase 4), and Counterfactuals (Phase 5) reused.
- [x] Finite catalog of 7 intervention types implemented.
- [x] Multi-signal mapping connecting SHAP + raw features + counterfactuals implemented.
- [x] Priority assignment matrix (CRITICAL $\to$ NONE) implemented with uncertainty gating.
- [x] Recommendation confidence levels (HIGH, MEDIUM, LOW) implemented.
- [x] Demographic and protected feature exclusion safeguards enforced.
- [x] `NO_INTERVENTION` logic implemented and verified for safe students.
- [x] Multi-criteria student prioritization queue implemented.
- [x] Structured JSON and CSV dashboard artifacts exported.
- [x] Automated test suite passing (8/8 in Phase 6, 29/29 total combined).
- [x] Comprehensive technical report created (`reports/phase6_intervention_report.md`).

---

**Phase 6 Verdict: READY FOR PHASE 7**
