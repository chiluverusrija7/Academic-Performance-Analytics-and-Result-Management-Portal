# EduInsight AI — Comprehensive Viva Questions & Answers (50 Questions)

---

## Group A: Project Basics & Scope
1. **What is EduInsight AI?**  
   *An explainable, uncertainty-aware academic decision-support system that predicts student academic risk early in the semester (Weeks 4, 8, and 12) and provides prescriptive remedial guidance.*
2. **What problem does it solve?**  
   *It eliminates the latency of retrospective semester-end grading by detecting academic disengagement early enough for faculty intervention.*
3. **What are the 5 core AI layers?**  
   *Temporal ML Risk Prediction, SHAP Explainability, Conformal Uncertainty, Counterfactual Simulator, and Prescriptive Intervention Engine.*

---

## Group B: DBMS & PostgreSQL
4. **How many tables exist in the operational database?**  
   *16 relational tables covering students, admissions, departments, courses, semesters, subjects, faculty, enrollments, attendance, exams, marks, grades, results, and fees.*
5. **Did you modify or alter the PostgreSQL database?**  
   *No. The 16-table PostgreSQL schema remains 100% untouched to ensure operational database integrity.*
6. **How do you separate operational data from synthetic ML data?**  
   *Operational tables store live university entities, while synthetic datasets are used for ML training and evaluation; all API responses explicitly declare their data provenance.*

---

## Group C: Longitudinal Datasets & Preprocessing
7. **What is the size of the ML training dataset?**  
   *300 unique students, 1,680 student-semester observations, and 9,120 subject-level records.*
8. **What is the baseline risk prevalence?**  
   *13.39% (225 positive risk observations out of 1,680).*
9. **How are missing values handled for first-semester students?**  
   *Using median imputation (`SimpleImputer(strategy="median")`) encapsulated within scikit-learn pipelines.*
10. **How are categorical features handled?**  
    *Using `OneHotEncoder(handle_unknown="ignore", sparse_output=False)`.*

---

## Group D: Temporal Modeling & Validation
11. **Why evaluate at Weeks 4, 8, and 12?**  
    *They represent critical institutional decision milestones: early attendance drop-off (W4), midterm evaluation velocity (W8), and pre-final remedial tutorials (W12).*
12. **How did you prevent student-level data leakage?**  
    *Using `GroupShuffleSplit` on `student_id` to ensure zero student overlap across Train, Calibration, and Test partitions.*
13. **How did you prevent temporal leakage?**  
    *Week 4 pipelines only access Week 4 features; Week 8 pipelines cannot access Week 12 features; final exam outcomes are excluded from all inputs.*
14. **How did you prevent target leakage?**  
    *Downstream semester outcome variables (`final_sgpa`, `final_cgpa`, `final_backlogs_count`) were strictly excluded.*

---

## Group E: Machine Learning Models & Metrics
15. **Which models were compared?**  
    *Logistic Regression (Baseline with balanced weights), Random Forest Classifier, and XGBoost Classifier.*
16. **Which model is the champion?**  
    *XGBoost, achieving the highest PR-AUC and lowest Brier score calibration loss across all checkpoints.*
17. **What was the final performance at Week 12?**  
    *PR-AUC $= 0.9547$, ROC-AUC $= 0.9939$, F1 $= 0.8235$, Precision $= 0.8485$, Recall $= 0.8000$.*
18. **Why is PR-AUC preferred over ROC-AUC and Accuracy?**  
    *Due to class imbalance (13.39% risk prevalence); PR-AUC evaluates precision-recall trade-offs specifically on the minority positive class.*
19. **What is the Brier Score?**  
    *A strictly proper scoring rule measuring probability calibration; values closer to 0 indicate superior probability accuracy (EduInsight scored 0.0215 at W12).*

---

## Group F: SHAP Explainability
20. **What algorithm is used for explainability?**  
    *`shap.TreeExplainer` applied directly to XGBoost decision tree ensembles.*
21. **What is the mathematical formulation of SHAP?**  
    *$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$, where $\phi_i$ represents the additive Shapley attribution of feature $i$.*
22. **What does a positive vs. negative SHAP value mean?**  
    *Positive SHAP indicates a risk-increasing contribution; negative SHAP indicates a protective/risk-reducing factor.*
23. **What is the #1 risk driver at Week 12?**  
    *`low_scoring_subjects_w12` (mean $|SHAP| = 3.56$), indicating that failing multiple subjects is the primary institutional risk driver.*
24. **Is SHAP causal?**  
    *No. SHAP measures feature attribution in the model's prediction space; it describes statistical associations, not physical real-world causation.*

---

## Group G: Conformal Prediction & Uncertainty
25. **Why do we need Conformal Prediction?**  
    *Standard ML probabilities can be overconfident on borderline cases; Conformal Prediction provides distribution-free finite-sample coverage guarantees.*
26. **What conformal method is used?**  
    *Split Conformal Classification (Inductive Conformal Prediction) using nonconformity scores $s_i = 1 - \hat{p}(Y_i \mid X_i)$.*
27. **What is a prediction set?**  
    *A subset of candidate classes $C(x) \subseteq \{\text{"SAFE"}, \text{"RISK"}\}$ guaranteed to contain the true label with probability $\ge 1 - \alpha$.*
28. **What significance levels were evaluated?**  
    *$\alpha = 0.10$ (nominal 90% coverage) and $\alpha = 0.05$ (nominal 95% coverage).*
29. **What empirical coverage was achieved at $\alpha = 0.05$?**  
    *Week 4: 96.51%, Week 8: 96.51%, Week 12: 96.80% (all strictly exceeding the 95% target).*
30. **What does an AMBIGUOUS prediction status mean?**  
    *The prediction set is $C(x) = \{\text{"SAFE"}, \text{"RISK"}\}$, indicating epistemic uncertainty where the model cannot decisively isolate a single class.*
31. **How does ambiguity evolve across checkpoints?**  
    *At 95% confidence, ambiguity drops from 9.88% (W4) $\to$ 2.62% (W8) $\to$ 0.00% (W12).*

---

## Group H: Counterfactual Simulation
32. **What is a counterfactual in this project?**  
    *A minimal, realistic change in a student's modifiable academic behavior that reduces model-predicted risk below the 0.50 threshold.*
33. **Are counterfactual predictions fabricated?**  
    *No. Every candidate vector is re-evaluated by passing modified features through the actual trained pipeline (`pipeline.predict_proba`).*
34. **Which features are modifiable?**  
    *In-semester attendance percentages, continuous internal assessment averages, and failing subject counts.*
35. **Which features are immutable?**  
    *Demographics, admission category, department, entrance rank, historical CGPA, and prior backlogs.*
36. **What physical bounds are enforced?**  
    *Percentages bounded within $[0, 100]\%$; failing subject counts bounded as non-negative integers $\le 6$.*
37. **What happens if an impossible intervention is requested (e.g. attendance = 115%)?**  
    *The simulator marks the candidate as INFEASIBLE and returns a validation error.*

---

## Group I: Prescriptive Interventions & Decision Support
38. **What are the 7 intervention types?**  
    *`ATTENDANCE_SUPPORT`, `SUBJECT_REMEDIATION`, `FACULTY_MENTORING`, `STUDY_PLAN`, `EARLY_ACADEMIC_COUNSELLING`, `PERFORMANCE_MONITORING`, `NO_INTERVENTION`.*
39. **How does uncertainty affect recommendations?**  
    *Ambiguous predictions are gated: priority is capped at `MEDIUM` with low-intensity `PERFORMANCE_MONITORING` to prevent premature over-intervention.*
40. **How are students prioritized for faculty?**  
    *Using an Urgency Score: $0.35 \times \text{Risk} + 0.25 \times \text{Certainty} + 0.25 \times \text{Priority} + 0.10 \times \text{Checkpoint} + 0.05 \times \text{Actionability}$.*
41. **Can demographic attributes trigger an intervention?**  
    *No. The engine enforces an absolute exclusion policy on demographic attributes to prevent bias.*
42. **What does a safe student receive?**  
    *`NO_INTERVENTION` (Priority: `NONE`) to ensure faculty resources are not wasted.*

---

## Group J: Software Architecture & Engineering
43. **What backend frameworks are used?**  
    *Python FastAPI (port 8000) for ML inference orchestration and Node.js / Express (port 5000) for REST API gateway and PostgreSQL queries.*
44. **What frontend framework is used?**  
    *React 18 with Tailwind CSS, Lucide icons, and Recharts.*
45. **What is the average latency for a 360-degree student analysis?**  
    *1.32 seconds for full synchronous execution of Prediction + SHAP + Conformal + Counterfactual + Interventions.*
46. **How many automated tests exist?**  
    *41 unit and integration tests, all passing with a 100% success rate.*

---

## Group K: Limitations & Ethical Governance
47. **What is the synthetic data limitation?**  
    *The model was trained on a synthetic longitudinal dataset; real-world deployment requires ethical review and institutional domain recalibration.*
48. **Is EduInsight AI an autonomous disciplinary system?**  
    *No. It is an advisory decision support system; human faculty mentors retain full override authority.*
49. **What is the difference between descriptive and prescriptive analytics?**  
    *Descriptive tells you what happened (retrospective GPA); prescriptive provides prioritized action plans to optimize future outcomes.*
50. **What is the future scope?**  
    *External validation across partner universities, fairness auditing across sub-cohorts, real-time LMS data streaming, and automated intervention outcome tracking.*
