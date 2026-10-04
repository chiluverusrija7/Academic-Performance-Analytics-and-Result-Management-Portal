# EduInsight AI — Comprehensive Technical Methodology

---

## 1. End-to-End Methodology Stages

```
[A. Data Generation] ──> [B. Feature Engineering] ──> [C. Supervised Modeling] ──> [D. Explainability] ──> [E. Uncertainty] ──> [F. Counterfactuals] ──> [G. Interventions]
```

---

## 2. Stage-by-Stage Input, Process, & Output Specifications

### Stage A: Data Generation & Database Baseline
- **Input**: 16-table relational PostgreSQL schema and academic institutional rules.
- **Process**: Generated a synthetic longitudinal dataset simulating multi-year cohort progression ($300$ students, $1,680$ student-semester records, $9,120$ subject records). Modeled realistic attendance decay, assessment correlation, and backlog accumulation.
- **Output**: Relational history CSVs (`academic_history.csv`, `subject_level_history.csv`) with $13.39\%$ baseline positive risk prevalence ($225$ risk observations).

### Stage B: Temporal Feature Engineering
- **Input**: Raw subject attendance logs and internal marks records.
- **Process**: Structured data into 3 distinct in-semester milestones:
  - **Week 4**: Early attendance percentage, continuous quiz average, low-attendance subjects, low-scoring subjects, historical CGPA/SGPA.
  - **Week 8**: Midterm attendance, midterm internal marks, velocity features ($\Delta \text{Marks}_{W4 \to W8}$, $\Delta \text{Att}_{W4 \to W8}$).
  - **Week 12**: Late-term attendance, late-term internal marks, multi-checkpoint velocity ($\Delta \text{Marks}_{W8 \to W12}$, $\text{performance\_trend}$).
- **Output**: Three leakage-free feature matrices (`checkpoint_w4.csv`, `checkpoint_w8.csv`, `checkpoint_w12.csv`).

### Stage C: Supervised Machine Learning & Evaluation
- **Input**: Feature matrices and binary target variable `target_risk` ($\text{SGPA} < 5.0$ or $\text{Backlogs} \ge 2$).
- **Process**:
  - Enforced strict student-group-aware partitioning (`GroupShuffleSplit` on `student_id`) to prevent student leakage.
  - Applied 5-fold `GroupKFold` cross-validation on training data.
  - Built scikit-learn pipelines with `OneHotEncoder`, `SimpleImputer(strategy="median")`, and `StandardScaler`.
  - Trained Logistic Regression (baseline), Random Forest Classifier, and XGBoost Classifier (Champion).
- **Output**: Serialized joblib pipelines (`pipelines/checkpoint_w{4,8,12}_pipeline.joblib`) and evaluation metrics.

### Stage D: Explainability Engine (SHAP)
- **Input**: Trained XGBoost pipeline and preprocessed student feature vectors.
- **Process**: Evaluated exact additive Shapley values via `shap.TreeExplainer(classifier)`:
  $$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$$
  Mapped transformed feature names cleanly back to human-readable domain variables.
- **Output**: Global institutional importance rankings (`reports/shap_global_w{4,8,12}.csv`), beeswarm plots, and local instance explanations.

### Stage E: Uncertainty Quantification (Split Conformal Prediction)
- **Input**: Predicted probabilities $\hat{p}(y \mid x)$ and true labels on held-out calibration set ($n_{\text{cal}} = 328$).
- **Process**:
  - Computed nonconformity scores $s_i = 1 - \hat{p}(Y_i \mid X_i)$.
  - Calculated finite-sample corrected quantile cutoff:
    $$\hat{q} = \text{Quantile}\left(\{s_i\}_{i=1}^{n_{\text{cal}}}, \frac{\lceil (n_{\text{cal}} + 1)(1 - \alpha) \rceil}{n_{\text{cal}}}\right)$$
  - Constructed conformal prediction sets: $C(x) = \{ y \in \{\text{SAFE}, \text{RISK}\} \mid \hat{p}(y \mid x) \ge 1 - \hat{q} \}$.
- **Output**: Prediction sets with $\ge 95\%$ coverage guarantees and controlled statuses (`CONFIDENT_RISK`, `CONFIDENT_SAFE`, `AMBIGUOUS`).

### Stage F: Counterfactual What-If Simulator
- **Input**: At-risk student feature vector $x$ and checkpoint constraints.
- **Process**:
  - Filtered candidate modifications to modifiable in-semester behaviors (attendance, marks, failing subjects).
  - Enforced physical bounds ($[0, 100]\%$) and immutable variable protections.
  - Re-evaluated candidate vectors through the actual trained pipeline: $\hat{P}_{\text{risk}}(x + \delta) = \text{pipeline.predict\_proba}(x + \delta)$.
  - Solved for the minimum-cost perturbation crossing the $0.50$ decision threshold.
- **Output**: Feasible behavioral counterfactuals with exact model-predicted probability reductions.

### Stage G: Prescriptive Intervention Engine
- **Input**: Risk probability, top SHAP drivers, conformal uncertainty status, and counterfactual feasibility.
- **Process**:
  - Evaluated multi-signal decision rules connecting evidence to 7 finite intervention types.
  - Enforced uncertainty gating (ambiguous predictions capped at `MEDIUM` priority with low-intensity monitoring).
  - Calculated composite urgency scores and sorted students into a prioritized queue.
- **Output**: Structured institutional action plans and dashboard queue records (`intervention_plans.csv`, `intervention_plans.json`).
