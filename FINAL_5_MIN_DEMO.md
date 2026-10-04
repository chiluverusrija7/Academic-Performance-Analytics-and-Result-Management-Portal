# EduInsight AI — Rapid 5-Minute Live Demonstration Guide

**Target Time:** 5 Minutes Exact  
**Case Study:** Student `STU0016` (AIML, Semester 2, Checkpoint **Week 12**)

---

### Minute 1:00 — The Problem & Student Selection
- **Navigate to**: `http://localhost:5173/intelligence` $\to$ Choose **`STU0016`** $\to$ Select **Week 12**.
- **Show**: $76.37\%$ Attendance vs. **$99.91\%$ Predicted Risk** (`HIGH RISK`).
- **Say**: *"Standard university systems miss this student because their 76% attendance passes routine checks. Our XGBoost model catches their severe 99.91% risk early at Week 12."*

---

### Minute 2:00 — Why the Student is at Risk (SHAP Attribution)
- **Show**: Top Risk Factors $\implies$ `internal_marks_avg_w12` ($46.09\%$, $+4.30$), `low_scoring_subjects_w12` ($3$ failing subjects, $+2.82$).
- **Say**: *"SHAP Explainability proves why: the student is failing 3 core subjects with continuous internal marks averaging only 46.09%."*

---

### Minute 3:00 — Mathematical Uncertainty (Conformal Prediction)
- **Show**: Status $\implies$ **`CONFIDENT_RISK`** with Prediction Set: `{"RISK"}` ($\ge 95\%$ Coverage).
- **Say**: *"Our Conformal Prediction layer verifies that this is not an ambiguous borderline guess, but a high-certainty risk classification backed by distribution-free coverage guarantees."*

---

### Minute 4:00 — What-If Recovery (Counterfactual Simulator)
- **Action**: In the Counterfactual Tool, apply $+10\%$ Attendance, $+10$ Marks, $-1$ Failing Subject.
- **Show**: Re-evaluated Risk $\implies$ **$46.28\%$** (`SAFE`, $\Delta = -53.63\%$).
- **Say**: *"By passing realistic behavioral improvements through the actual trained model, our simulator proves that raising marks to 56% and clearing 1 failing subject drops predicted risk to 46.28%, shifting the student to SAFE."*

---

### Minute 5:00 — Actionable Remediation (Intervention Engine)
- **Show**: Primary Action $\implies$ **`SUBJECT_REMEDIATION`** (Priority: `CRITICAL`, Urgency Score: `0.5494`).
- **Say**: *"Finally, our Prescriptive Intervention Engine translates this into immediate targeted small-group tutorials and ranks STU0016 at the top of the Faculty Prioritization Queue. EduInsight AI delivers complete, actionable decision support."*
