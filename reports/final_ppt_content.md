# EduInsight AI — Final Presentation Slide Deck Specification (15 Slides)

---

### Slide 1: Title Slide
- **Title**: EduInsight AI
- **Subtitle**: An Explainable, Uncertainty-Aware Academic Decision Support System
- **Presenter**: Project Team
- **Key Visual**: Multi-Tier Pipeline Diagram (DBMS $\to$ ML $\to$ SHAP $\to$ Conformal $\to$ Counterfactual $\to$ Prescriptive)
- **Speaker Notes**: *"Welcome. Today we present EduInsight AI, an integrated decision-support system designed to detect and remediate early academic risk."*

---

### Slide 2: Problem Statement & Educational Challenge
- **Core Challenge**: Late academic failure diagnosis in universities.
- **Key Points**:
  - Semester-end SGPA/backlog reports arrive too late for remediation.
  - High attrition in core engineering and technical disciplines.
  - Static attendance thresholds ($<75\%$) miss complex multi-subject failure dynamics.
  - Black-box ML models lack trust, confidence bounds, and actionable recommendations.
- **Speaker Notes**: *"Current university systems tell advisors who failed yesterday rather than who needs help today. We need proactive, explainable intervention."*

---

### Slide 3: Existing System vs. Proposed Solution
- **Existing Approach**: 16-table relational PostgreSQL operational database with static descriptive queries and retrospective KPIs.
- **Proposed EduInsight AI**: 5-layer decision-support architecture extending the DBMS foundation with temporal ML, SHAP, Conformal Prediction, Counterfactuals, and Prescriptive Interventions.
- **Comparison Table**:

| Dimension | Conventional University ERP | EduInsight AI System |
|---|---|---|
| Timing | Post-hoc (Semester-end) | In-Semester (Weeks 4, 8, 12) |
| Output | Retrospective GPA | Risk Probability + Confidence Set |
| Transparency | Black-box / None | SHAP Feature Attributions |
| Guidance | None | Prescriptive Action Plans |

- **Speaker Notes**: *"We preserve the 16-table PostgreSQL operational database while building a complete 5-layer intelligence pipeline on top of it."*

---

### Slide 4: System Architecture & Data Flow
- **Key Points**:
  - **Operational Layer**: 16-table PostgreSQL database.
  - **Inference Layer**: Python FastAPI microservice with centralized orchestrator.
  - **Gateway Layer**: Node.js Express REST API with JWT authentication & RBAC.
  - **UI Layer**: React 18 / Tailwind CSS dashboard.
- **Key Visual**: Clean block diagram showing the 7 tiers with explicit synthetic vs operational data boundaries.
- **Speaker Notes**: *"Our architecture strictly decouples live operational data from validated ML training sets, ensuring zero database schema alteration."*

---

### Slide 5: Longitudinal Dataset & Leakage Safeguards
- **Dataset Scale**: $300$ students, $1,680$ student-semester records, $9,120$ subject records ($13.39\%$ risk rate).
- **Milestones**: Week 4, Week 8, Week 12.
- **Zero-Leakage Guardrails**:
  - *Student Leakage*: `GroupShuffleSplit` ensures 0 overlapping students between Train, Calibration, and Test.
  - *Temporal Leakage*: Features restricted to in-semester timestamps.
  - *Target Leakage*: Final SGPA and semester backlogs strictly excluded.
- **Speaker Notes**: *"Scientific rigor was our top priority: we enforced strict student-grouped cross-validation to eliminate all forms of data leakage."*

---

### Slide 6: Predictive Modeling & Checkpoint Evaluation
- **Models Evaluated**: Logistic Regression (Baseline), Random Forest, XGBoost (Champion).
- **Results Across Checkpoints**:
  - Week 4: PR-AUC $= 0.8201$, ROC-AUC $= 0.9538$, F1 $= 0.6824$
  - Week 8: PR-AUC $= 0.9136$, ROC-AUC $= 0.9873$, F1 $= 0.7945$
  - Week 12: PR-AUC $= 0.9547$, ROC-AUC $= 0.9939$, F1 $= 0.8235$
- **Key Takeaway**: Precision improves from $58.0\% \to 84.9\%$ as midterm evaluation data becomes available.
- **Speaker Notes**: *"Notice how precision and PR-AUC steadily climb as the semester progresses, reducing false alarm rates by 76% by Week 12."*

---

### Slide 7: Explainable AI with SHAP
- **Methodology**: `shap.TreeExplainer` on serialized XGBoost pipelines.
- **Key Drivers**:
  - Week 4: Early continuous assessment marks and historical attendance.
  - Week 8: Midterm marks and performance trajectory velocity ($\Delta Marks$).
  - Week 12: Multi-subject failure count (`low_scoring_subjects_w12`, mean $|SHAP| = 3.56$).
- **Ethical Safeguard**: Strict non-causal statistical interpretations enforced.
- **Speaker Notes**: *"SHAP reveals that by Week 12, the number of failing subjects becomes the single strongest institutional risk driver."*

---

### Slide 8: Uncertainty Quantification via Conformal Prediction
- **Methodology**: Split Conformal Prediction with probability nonconformity scores ($s_i = 1 - \hat{p}(y_i \mid x_i)$).
- **Results ($\alpha = 0.05$, Target $95\%$)**:
  - Week 4: $96.51\%$ coverage (Ambiguity: $9.88\%$)
  - Week 8: $96.51\%$ coverage (Ambiguity: $2.62\%$)
  - Week 12: $96.80\%$ coverage (Ambiguity: $0.00\%$)
- **Key Contribution**: Ambiguous boundary cases ($C(x) = \{\text{SAFE}, \text{RISK}\}$) are explicitly identified to prevent over-intervention.
- **Speaker Notes**: *"Conformal prediction guarantees 95% coverage on unseen students, giving educators calibrated confidence bounds rather than bare point probabilities."*

---

### Slide 9: Counterfactual What-If Simulator
- **Objective**: $\min_{\delta} \text{Cost}(\delta) \quad \text{s.t. } \hat{P}_{\text{risk}}(x + \delta) < 0.50 \quad \text{and} \quad \text{Feasible}(x + \delta)$.
- **Key Features**:
  - Evaluates modifications through the actual trained pipeline.
  - Enforces physical bounds ($[0, 100]\%$) and protects immutable demographic traits.
  - Re-evaluates risk reductions in real time.
- **Example**: Modifying attendance by $+10\%$, marks by $+10$, and clearing 1 failing subject drops predicted risk from $99.91\% \to 46.28\%$.
- **Speaker Notes**: *"Our simulator empowers students and advisors by showing the exact, minimal behavioral changes required to reach academic safety."*

---

### Slide 10: Prescriptive Academic Intervention Engine
- **Catalog**: 7 structured intervention types (`SUBJECT_REMEDIATION`, `ATTENDANCE_SUPPORT`, `FACULTY_MENTORING`, `STUDY_PLAN`, `EARLY_ACADEMIC_COUNSELLING`, `PERFORMANCE_MONITORING`, `NO_INTERVENTION`).
- **Priority Gating**: Ambiguous predictions are capped at `MEDIUM` priority with low-intensity monitoring.
- **Demographic Safeguard**: Demographic identity is strictly prohibited from triggering recommendations.
- **Speaker Notes**: *"Our engine synthesizes risk, SHAP attributions, conformal certainty, and counterfactuals into structured action plans for advisors."*

---

### Slide 11: Prioritized Student Queue & Dashboard Integration
- **Urgency Formula**: $0.35 \times \text{Risk} + 0.25 \times \text{Certainty} + 0.25 \times \text{Priority} + 0.10 \times \text{Checkpoint} + 0.05 \times \text{Actionability}$.
- **Dashboard Views**:
  - Student Intelligence: Personalized risk overview, protective factors, and what-if planner.
  - Faculty Intelligence: Prioritized student queue, subject bottlenecks, and remedial scheduling.
  - Admin Intelligence: Institutional cohort analytics and calibration health.
- **Speaker Notes**: *"Advisors receive a prioritized queue ranked by multi-criteria urgency scores, optimizing remedial resource allocation."*

---

### Slide 12: End-to-End Demonstration Walkthrough
- **Case Study**: Student `STU0016` (AIML, Semester 2, Week 12).
- **Summary**:
  - Risk $= 99.91\%$ (`CONFIDENT_RISK`).
  - Drivers $= 3$ failing subjects and $46.09\%$ internal marks.
  - Counterfactual $\implies$ Reaches $46.28\%$ (`SAFE`) via combined action.
  - Action Plan $\implies$ `SUBJECT_REMEDIATION` (Priority: `CRITICAL`, Urgency: `0.5494`).
- **Speaker Notes**: *"In this live case, we see the entire 5-stage pipeline execute seamlessly from raw metrics to actionable remediation."*

---

### Slide 13: Validation & Quality Assurance
- **Automated Test Results**: **41/41 unit & integration tests passing (100% success rate)**.
- **Performance Benchmarks**:
  - Engine Initialization: $6.89$s
  - Complete 360-Degree Analysis: $1.32$s
  - Custom What-If Latency: $0.18$s
- **Speaker Notes**: *"Every single layer is backed by automated test suites verifying mathematical validity, data leakage prevention, and API contracts."*

---

### Slide 14: Limitations & Ethical Governance
- **Synthetic Data Disclosure**: Models trained on validated synthetic longitudinal data; institutional recalibration required prior to real-world deployment.
- **Advisory Role**: Serves strictly as decision support; faculty mentors retain full authority.
- **Non-Causal Associations**: SHAP and counterfactuals describe statistical associations rather than deterministic causal laws.
- **Speaker Notes**: *"We maintain strict academic honesty: our system is an advisory tool built with rigorous ethical and privacy guardrails."*

---

### Slide 15: Conclusion & Future Scope
- **Conclusion**: EduInsight AI successfully unites temporal predictive modeling, SHAP explainability, conformal uncertainty, counterfactual simulations, and prescriptive intervention engines into a coherent decision-support system.
- **Future Scope**: Multi-institutional external validation, fairness auditing across sub-cohorts, real-time LMS data streaming, and automated remediation outcome tracking.
- **Speaker Notes**: *"Thank you for your time. We are ready for your questions."*
