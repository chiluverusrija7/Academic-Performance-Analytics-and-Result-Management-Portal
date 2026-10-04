# EduInsight AI — 5-Minute Live Capstone Demonstration Script

**Demonstrator:** Lead AI Engineer / Presenter  
**Audience:** Capstone Evaluation Panel / External Examiners  
**Core Narrative:** Following a single student (`STU0016`, AIML, Semester 2) across the complete 5-layer intelligence pipeline.

---

## Stage 1: Problem Introduction & Student Selection (Minute 0:00 – 1:00)

- **What to Click**:
  1. Open browser to `http://localhost:5173`.
  2. Log in as Department Faculty / Academic Advisor.
  3. Navigate to **Intelligence Center**.
  4. In the Student Selector dropdown, choose **`STU0016 (AIML, Semester 2)`**.
  5. Select Checkpoint: **Week 12**.

- **What Appears on Screen**:
  - Academic Context Card: Department = AIML, Semester = 2, Current Attendance = $76.37\%$, Internal Marks = $46.09\%$, Failing Subjects = $3$.
  - Large Risk Header: **$99.91\%$ Predicted Academic Risk** (`HIGH RISK`).

- **What to Say**:
  > *"Good morning, esteemed panel. Today, we demonstrate EduInsight AI. We are inspecting student STU0016 at Week 12. Notice that the student has reasonable overall attendance (76.37%), yet our Phase 2 XGBoost model flags them with a 99.91% predicted academic risk. Standard institutional dashboards relying solely on aggregate attendance would miss this student completely. Let us see why our system caught this risk."*

---

## Stage 2: Conformal Uncertainty & SHAP Explainability (Minute 1:00 – 2:30)

- **What to Click**:
  - Scroll down to the **Uncertainty & SHAP Explainability** card.

- **What Appears on Screen**:
  - Uncertainty Status: **`CONFIDENT_RISK`** with Prediction Set: `{"RISK"}` (Coverage Target: 90% / 95%).
  - Top Risk Drivers:
    - `internal_marks_avg_w12` ($46.09\%$, SHAP $= +4.30$)
    - `low_scoring_subjects_w12` ($3$ subjects, SHAP $= +2.82$)
    - `internal_marks_avg_w8` ($44.63\%$, SHAP $= +1.27$)
  - Top Protective Factor: `cumulative_cgpa_prior` ($7.33$ CGPA, SHAP $= -0.19$).

- **What to Say**:
  > *"First, in our Uncertainty layer (Phase 4), the system uses Split Conformal Prediction to establish that this is a CONFIDENT_RISK observation with a single-class prediction set. Second, looking at our SHAP Explainability layer (Phase 3), we see exactly why: the primary risk drivers are not overall attendance, but an internal mark average of 46.09% and 3 failing subjects below the 50% threshold. The student's prior 7.33 CGPA offers only mild protective buffering."*

---

## Stage 3: Counterfactual What-If Simulation (Minute 2:30 – 3:45)

- **What to Click**:
  - Scroll to the **Counterfactual What-If Simulator** section.
  - View the automated minimum-change recommendation: `Combined Intervention (+10% Att, +10 Marks, Remediate 1 Failing Subject)`.
  - Optionally, type in custom values: Attendance $\to 86.37\%$, Marks $\to 56.09\%$, Click **"Run What-If Simulation"**.

- **What Appears on Screen**:
  - Re-evaluated Risk: **$46.28\%$** (`SAFE`).
  - Risk Reduction: **$-53.63\%$**.
  - Re-evaluated Uncertainty: **`AMBIGUOUS`** ($C(x) = \{\text{"SAFE"}\}$).
  - Attribution Shift: `internal_marks_avg_w12` SHAP attribution collapses from $+4.30 \to +0.00$.

- **What to Say**:
  > *"Diagnosis without a cure is incomplete. In Phase 5, our Counterfactual Simulator solves for the minimal feasible behavioral change required to reach safety. Notice that every what-if prediction is recalculated in real time by passing the modified vector through our actual trained XGBoost pipeline. If the student raises attendance to 86.37%, improves marks to 56.09%, and clears 1 failing subject, predicted risk drops from 99.91% to 46.28%, shifting them into the SAFE category."*

---

## Stage 4: Prescriptive Action Plan & Prioritization Queue (Minute 3:45 – 5:00)

- **What to Click**:
  - Scroll to the **Prescriptive Action Plan** card.
  - Click **"View Faculty Prioritization Queue"**.

- **What Appears on Screen**:
  - Prescriptive Plan: Primary Action $\implies$ **`SUBJECT_REMEDIATION`** (Priority: `CRITICAL`, Confidence: `HIGH`, Time Horizon: `Next 2-4 weeks`).
  - Secondary Action $\implies$ `FACULTY_MENTORING` (Priority: `MEDIUM`).
  - Prioritized Watchlist: Ranked table showing `STU0016` at Rank #1 with an Urgency Score of **$0.5494$**.

- **What to Say**:
  > *"Finally, in Phase 6, our Prescriptive Intervention Engine translates this evidence into an actionable institutional plan: Targeted Multi-Subject Remediation with small-group tutorials within 2-4 weeks. Furthermore, the system ranks all at-risk students into a Prioritized Intervention Queue weighted by risk, certainty, and urgency score, allowing faculty advisors to maximize their remedial impact."*
  >
  > *"In conclusion, EduInsight AI delivers a complete, validated decision-support pipeline from raw data to actionable student intervention. Thank you, and we welcome your questions."*
