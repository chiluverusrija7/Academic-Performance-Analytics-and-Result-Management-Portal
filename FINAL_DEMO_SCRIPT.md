# EduInsight AI — Final Live Demonstration Script

**Target Duration:** 7–10 Minutes  
**Primary Student Case:** `STU0016` (Department of AI & Data Science / AIML, Semester 2)  
**Backup Cases Available:** `STU0017` (High Risk), `STU0250` (Ambiguous), `STU0001` (Confident Safe)

---

## Step 1: System Introduction & Student Selection
- **User Action**:
  - Open `http://localhost:5173`.
  - Log in with faculty credentials (`faculty@eduinsight.edu`).
  - Navigate to **Intelligence Center** $\to$ Select Student **`STU0016`** $\to$ Select Checkpoint **Week 12**.
- **Expected Screen**:
  - Academic Context Card loads: Department = AIML, Semester = 2, Attendance = $76.37\%$, Continuous Marks = $46.09\%$, Failing Subjects = $3$.
  - Large Risk Banner displays: **$99.91\%$ Predicted Academic Risk** (`HIGH RISK`).
- **What to Say**:
  > *"1. This is the selected student, STU0016, in their 2nd semester of B.Tech AIML. Notice that their aggregate attendance is 76.37%—which clears standard university attendance cutoffs. However, our Phase 2 XGBoost model flags them with a 99.91% predicted academic risk. Standard ERP systems would completely overlook this student."*

---

## Step 2: Temporal Predictive Analysis & SHAP Explainability
- **User Action**:
  - Scroll to the **SHAP Feature Attribution Breakdown** section.
- **Expected Screen**:
  - Top Risk Factors displayed with positive red indicators:
    1. `internal_marks_avg_w12` ($46.09\%$, SHAP: $+4.304$)
    2. `low_scoring_subjects_w12` ($3$ subjects, SHAP: $+2.821$)
    3. `internal_marks_avg_w8` ($44.63\%$, SHAP: $+1.267$)
  - Top Protective Factor displayed with green indicator:
    - `cumulative_cgpa_prior` ($7.33$ CGPA, SHAP: $-0.189$)
- **What to Say**:
  > *"2. At Week 12, the system predicts high risk, and in Phase 3 our SHAP TreeExplainer tells us why. Rather than general absenteeism, the primary drivers are an internal assessment average of 46.09% and 3 failing subjects below the 50% threshold. The student's prior 7.33 CGPA provides only minor protective resistance against these active in-semester deficits."*

---

## Step 3: Conformal Uncertainty Quantification
- **User Action**:
  - Point to the **Conformal Uncertainty & Prediction Set** badge.
- **Expected Screen**:
  - Prediction Set: **`{"RISK"}`**
  - Uncertainty Status: **`CONFIDENT_RISK`**
  - Coverage Guarantee: $\ge 95\%$ ($\alpha = 0.05$).
- **What to Say**:
  > *"3. The conformal layer tells us whether the prediction is sufficiently certain or ambiguous. Here, using Split Conformal Prediction, the system outputs a single-class prediction set of {'RISK'}, establishing that the model is mathematically confident in this flag at the 95% confidence level."*

---

## Step 4: Real-Model Counterfactual What-If Simulation
- **User Action**:
  - Scroll to the **Counterfactual What-If Simulator**.
  - Review the automated optimal recommendation: `Combined (+10% Att, +10 Marks, Remediate 1 Failing Subject)`.
  - Type in custom changes: Attendance $\to 86.37\%$, Internal Marks $\to 56.09\%$, Click **"Run What-If Simulation"**.
- **Expected Screen**:
  - Real-time recalculation spinner $\to$ Updated Card appears.
  - Re-evaluated Predicted Risk: **$46.28\%$** (`SAFE`).
  - Risk Reduction: **$-53.63\%$** (Crossing the $0.50$ operational risk threshold).
  - Uncertainty transitions to `AMBIGUOUS` with prediction set `{"SAFE"}`.
- **What to Say**:
  > *"4. Now we test a realistic what-if change. Instead of guessing, our Phase 5 simulator passes the modified student vector through the actual trained XGBoost pipeline. The model's predicted risk changes from 99.91% to 46.28%, successfully transitioning the student from RISK to SAFE."*

---

## Step 5: Prescriptive Academic Intervention Plan
- **User Action**:
  - Scroll to the **Prescriptive Action Plan** card.
- **Expected Screen**:
  - Primary Intervention: **`SUBJECT_REMEDIATION`** (Priority: `CRITICAL`, Confidence: `HIGH`).
  - Suggested Action: *"Enroll student in small-group tutorial sessions for high-risk subjects, assign dedicated peer tutors, and conduct remedial assessment drills."*
  - Expected Model Effect: *"Remediating 1 or more failing subjects is the primary driver for transitioning predictions to SAFE."*
  - Time Horizon: *"Short-term (Next 2-4 weeks)"*.
  - Secondary Action: `FACULTY_MENTORING` (Priority: `MEDIUM`).
- **What to Say**:
  > *"5. Based on the multi-signal evidence, the intervention engine in Phase 6 recommends Targeted Subject Remediation with small-group tutorial sessions over the next 2-4 weeks. The engine provides actionable pedagogical guidance tailored to the student's exact failure modes."*

---

## Step 6: Faculty Prioritization Queue
- **User Action**:
  - Click **"View Faculty Prioritization Watchlist"** in the navigation bar.
- **Expected Screen**:
  - Ranked table of all at-risk students ordered by composite **Urgency Score**.
  - `STU0016` appears at Rank #1 with an Urgency Score of **$0.5494$**.
- **What to Say**:
  > *"6. For university administrators and academic mentors, the system generates a prioritized intervention queue. Rather than sorting by probability alone, it weights risk severity, conformal certainty, and milestone urgency to ensure faculty allocate their remedial hours where the potential impact is greatest."*
