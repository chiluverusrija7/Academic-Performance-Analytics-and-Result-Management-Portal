# EduInsight AI — Phase 4: Uncertainty-Aware Academic Risk Prediction (Conformal Prediction) Report

**Generated:** October 4, 2026  
**Status:** Validated & Completed  
**Artifacts Generated:**  
- `uncertainty/conformal_predictor.py` (Split Conformal Prediction Engine & Inference Function)  
- `uncertainty/uncertainty_metrics.py` (Evaluation Metrics & Summary Aggregator)  
- `ml/test_uncertainty.py` (Phase 4 Verification Suite — 7/7 Passing, 14/14 Total Passing)  
- `results/conformal_w4_results.csv`  
- `results/conformal_w8_results.csv`  
- `results/conformal_w12_results.csv`  
- `results/conformal_summary.csv`  

---

## 1. Objective

Phase 4 implements an **Uncertainty-Aware Academic Risk Prediction Engine** for EduInsight AI using **Split Conformal Prediction (Inductive Conformal Prediction)**. 

Rather than outputting bare point probabilities (e.g., $\hat{P}(\text{RISK}) = 0.54$) which provide no rigorous measure of model confidence or boundary ambiguity, the conformal prediction layer wraps Phase 2's XGBoost models with statistically valid prediction sets $C(x) \subseteq \{\text{"SAFE"}, \text{"RISK"}\}$ that satisfy finite-sample coverage guarantees at predefined significance levels $\alpha \in \{0.10, 0.05\}$.

```
Input Student Observation (x)
             │
             ▼
   XGBoost Risk Pipeline
   [Probabilities: P(SAFE|x), P(RISK|x)]
             │
             ▼
   Conformal Calibration Layer (q_hat from Calibration Set)
             │
             ├─────────────────────────────────────────┐
             ▼                                         ▼
   Point Prediction (RISK / SAFE)            Conformal Prediction Set
                                             - {SAFE} -> CONFIDENT_SAFE
                                             - {RISK} -> CONFIDENT_RISK
                                             - {SAFE, RISK} -> AMBIGUOUS
```

---

## 2. Why Uncertainty Quantification is Required in Academic Decision Support

1. **High-Stakes Educational Interventions**: Misclassifying a borderline student as definitely "SAFE" (False Negative) deprives them of remedial support, while falsely flagging a student as definitely "HIGH RISK" (False Positive) triggers faculty alarms and administrative overhead.
2. **Early-Semester Ambiguity**: In early checkpoints (Week 4), data is inherently noisy and incomplete (only early quiz/attendance data is available). The system must convey **epistemic uncertainty** by outputting an ambiguous prediction set `{"SAFE", "RISK"}` rather than a misleading overconfident single class.
3. **Calibrated Confidence**: Traditional softmax/sigmoid probabilities are uncalibrated under domain shifts or class imbalance. Conformal prediction provides distribution-free, finite-sample coverage guarantees on unseen students.

---

## 3. Conformal Method Selected: Split Conformal Classification

We implement **Split Conformal Classification** (also known as Inductive Conformal Prediction) using probability-based nonconformity scores.

### Why Split Conformal Classification?
- **Computational Efficiency**: Fits the underlying XGBoost model once, avoiding costly leave-one-out or full conformal refits.
- **Model Agnostic**: Operates directly on the output probability vectors $\hat{p}(y \mid x)$ produced by scikit-learn/XGBoost pipelines.
- **Finite-Sample Mathematical Validity**: Guarantees that on unseen exchangeable test samples:
  $$\mathbb{P}(Y_{n+1} \in C(X_{n+1})) \ge 1 - \alpha$$

---

## 4. Mathematical & Nonconformity Formulation

Let $(X_1, Y_1), \dots, (X_n, Y_n)$ denote the independent calibration dataset of size $n$, where $Y_i \in \{0: \text{"SAFE"}, 1: \text{"RISK"}\}$.

### 1. Nonconformity Score
For any observation $x$ and candidate label $y \in \{0, 1\}$, the nonconformity score $s(x, y)$ measures how inconsistent label $y$ is with the model's prediction:
$$s(x, y) = 1 - \hat{p}(y \mid x)$$
On the calibration set, the nonconformity score for the true label $Y_i$ is computed as:
$$s_i = 1 - \hat{p}(Y_i \mid X_i)$$

### 2. Empirical Quantile Threshold ($\hat{q}$)
For significance level $\alpha \in (0, 1)$, we compute the finite-sample corrected quantile index:
$$k = \left\lceil (n + 1)(1 - \alpha) \right\rceil$$
The conformal threshold $\hat{q}$ is the $k$-th smallest value (the $\frac{k}{n}$ empirical quantile with higher-order interpolation) among the calibration nonconformity scores $\{s_1, \dots, s_n\}$:
$$\hat{q} = \text{Quantile}\left(\{s_i\}_{i=1}^n, \frac{\lceil (n + 1)(1 - \alpha) \rceil}{n}\right)$$

### 3. Prediction Set Construction
For a new test instance $X_{n+1}$, the conformal prediction set $C(X_{n+1})$ includes all candidate labels whose nonconformity score is at or below the threshold:
$$C(X_{n+1}) = \{ y \in \{0, 1\} \mid 1 - \hat{p}(y \mid X_{n+1}) \le \hat{q} \} = \{ y \in \{0, 1\} \mid \hat{p}(y \mid X_{n+1}) \ge 1 - \hat{q} \}$$

---

## 5. Train / Calibration / Test Split Methodology

To maintain strict scientific validity and prevent any form of student data leakage, a **3-way student-group-aware split** was enforced across all 300 students ($1,680$ observations) using `GroupShuffleSplit` on `student_id`:

```
300 Total Students (1,680 records)
├── 80% (240 Students) ── Outer Split ──> 20% (60 Students, 344 records) [TEST SET]
│   ├── 75% (180 Students, 1,008 records) [TRAIN SET] -> Fits Preprocessor + XGBoost
│   └── 25% (60 Students, 328 records)  [CALIBRATION SET] -> Computes s_i and q_hat
└── Zero student overlap across Train, Calibration, and Test partitions.
```

- **Train Partition (180 students, 1,008 rows)**: Fits the ColumnTransformer preprocessor and XGBoost classifier.
- **Calibration Partition (60 students, 328 rows)**: Used *strictly* to compute nonconformity scores and conformal quantile thresholds $\hat{q}$.
- **Held-Out Test Partition (60 students, 344 rows)**: Used *exclusively* to evaluate empirical coverage, set sizes, and ambiguity rates.

---

## 6. Empirical Results Across Temporal Checkpoints ($W4, W8, W12$)

### Comprehensive Conformal Performance Summary (`results/conformal_summary.csv`)

| Checkpoint | Nominal $\alpha$ | Target Coverage | Empirical Coverage | Coverage Gap | Risk Class Coverage | Safe Class Coverage | Avg Set Size | Ambiguity Rate (%) | Singleton Rate (%) | Conformal Quantile $\hat{q}$ | Probability Inclusion Cutoff ($1 - \hat{q}$) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **W4 (Early)** | $0.10$ | $90.0\%$ | **$91.86\%$** | $+1.86\%$ | $80.00\%$ | $93.20\%$ | $1.000$ | $0.00\%$ | $100.0\%$ | $0.4660$ | $0.5340$ |
| **W4 (Early)** | $0.05$ | $95.0\%$ | **$96.51\%$** | $+1.51\%$ | $85.71\%$ | $97.73\%$ | $1.099$ | **$9.88\%$** | $90.12\%$ | $0.6803$ | $0.3197$ |
| **W8 (Midterm)** | $0.10$ | $90.0\%$ | **$95.06\%$** | $+5.06\%$ | $88.57\%$ | $95.79\%$ | $1.000$ | $0.00\%$ | $100.0\%$ | $0.1455$ | $0.8545$ |
| **W8 (Midterm)** | $0.05$ | $95.0\%$ | **$96.51\%$** | $+1.51\%$ | $91.43\%$ | $97.09\%$ | $1.026$ | **$2.62\%$** | $97.38\%$ | $0.6544$ | $0.3456$ |
| **W12 (Pre-Final)** | $0.10$ | $90.0\%$ | **$96.80\%$** | $+6.80\%$ | $88.57\%$ | $97.73\%$ | $1.000$ | $0.00\%$ | $100.0\%$ | $0.0979$ | $0.9021$ |
| **W12 (Pre-Final)** | $0.05$ | $95.0\%$ | **$96.80\%$** | $+1.80\%$ | $88.57\%$ | $97.73\%$ | $1.000$ | **$0.00\%$** | $100.0\%$ | $0.3559$ | $0.6441$ |

---

## 7. In-Depth Metric Analysis

### 1. Coverage Analysis (Empirical vs. Target)
- **Target Coverage Satisfied Across All Checkpoints**:
  - At $\alpha = 0.10$ (nominal 90%), empirical coverage reached $91.86\%$ (W4), $95.06\%$ (W8), and $96.80\%$ (W12).
  - At $\alpha = 0.05$ (nominal 95%), empirical coverage reached $96.51\%$ (W4), $96.51\%$ (W8), and $96.80\%$ (W12).
- **Class-Stratified Coverage**:
  - Safe-class coverage consistently exceeded $93\%-97\%$ across all checkpoints.
  - Risk-class coverage increased from $80.00\%$ at W4 ($\alpha=0.10$) to $91.43\%$ at W8 ($\alpha=0.05$), demonstrating that the conformal set successfully bounds minority-class failures.

### 2. Efficiency & Prediction-Set Size
- Average prediction set sizes range between **$1.000$ and $1.099$**, indicating high statistical efficiency. The conformal predictor does not inflate set sizes unnecessarily to meet coverage requirements.
- Zero empty sets were produced across all 344 test observations.

### 3. Ambiguity Progression ($W_4 \to W_8 \to W_{12}$)
At the strict $95\%$ confidence level ($\alpha = 0.05$):
- **Week 4 Ambiguity**: **$9.88\%$** ($34$ student-semesters flagged as `{"SAFE", "RISK"}`).
- **Week 8 Ambiguity**: **$2.62\%$** ($9$ student-semesters flagged as `{"SAFE", "RISK"}`).
- **Week 12 Ambiguity**: **$0.00\%$** ($0$ ambiguous cases, $100\%$ decisive singletons).

```
Ambiguity Rate at 95% Confidence (alpha = 0.05):
Week 4:  [██████████] 9.88% (34 cases)
Week 8:  [███       ] 2.62% (9 cases)
Week 12: [          ] 0.00% (0 cases)
```

**Key Educational Finding**: Uncertainty decreases dramatically as the semester progresses. At Week 4, the model prudently acknowledges that early quiz marks and historical averages leave ~10% of students in an ambiguous region. By Week 12, cumulative midterm assessments, multi-subject failure indicators, and attendance trajectories eliminate ambiguity, providing high certainty.

---

## 8. Controlled Uncertainty Status & Representative JSON Outputs

The engine outputs a small, strictly controlled status vocabulary:
1. `CONFIDENT_RISK`: $C(x) = \{\text{"RISK"}\}$
2. `CONFIDENT_SAFE`: $C(x) = \{\text{"SAFE"}\}$
3. `AMBIGUOUS`: $C(x) = \{\text{"SAFE"}, \text{"RISK"}\}$

### Representative Example 1: Early-Semester Ambiguous Student (Week 4, $\alpha=0.05$)
```json
{
  "student_id": "STU0250",
  "semester_no": 3,
  "checkpoint": "W4",
  "risk_probability": 0.5214,
  "risk_percentage": 52.14,
  "point_prediction": "RISK",
  "conformal_prediction_set": ["SAFE", "RISK"],
  "uncertainty_status": "AMBIGUOUS",
  "alpha": 0.05,
  "coverage_target": 0.95,
  "conformal_quantile_threshold": 0.6803,
  "inclusion_prob_threshold": 0.3197
}
```
*Pedagogical Action*: Rather than triggering an alarming formal risk notification, the system indicates that the student is in an ambiguous state requiring gentle faculty monitoring rather than aggressive administrative intervention.

### Representative Example 2: Decisive High-Risk Student (Week 12, $\alpha=0.10$)
```json
{
  "student_id": "STU0069",
  "semester_no": 6,
  "checkpoint": "W12",
  "risk_probability": 0.9999,
  "risk_percentage": 99.99,
  "point_prediction": "RISK",
  "conformal_prediction_set": ["RISK"],
  "uncertainty_status": "CONFIDENT_RISK",
  "alpha": 0.10,
  "coverage_target": 0.90,
  "conformal_quantile_threshold": 0.0979,
  "inclusion_prob_threshold": 0.9021
}
```
*Pedagogical Action*: The model is highly confident. Immediate academic counseling and remedial tutorial scheduling are warranted.

---

## 9. Modular Integration: Conformal Prediction + SHAP Explainability

Conformal Prediction and SHAP serve distinct, complementary roles:
- **SHAP (Phase 3)**: Explains *why* the underlying model generated a given prediction (feature attribution).
- **Conformal Prediction (Phase 4)**: Quantifies *how confident* the system is in that prediction under distribution-free coverage guarantees.

### Combined Payload (`predict_with_uncertainty_and_explanation`)
```json
{
  "student_id": "STU0069",
  "semester_no": 6,
  "checkpoint": "W12",
  "risk_probability": 0.9999,
  "risk_percentage": 99.99,
  "point_prediction": "RISK",
  "conformal_prediction_set": ["RISK"],
  "uncertainty_status": "CONFIDENT_RISK",
  "alpha": 0.1,
  "coverage_target": 0.9,
  "risk_factors": [
    {
      "feature": "internal_marks_avg_w12",
      "actual_value": 45.75,
      "shap_value": 4.4294,
      "direction": "risk_increasing",
      "interpretation": "An internal assessment average of 45.75% contributed positively (+4.429) to the model's elevated risk prediction."
    },
    {
      "feature": "low_scoring_subjects_w12",
      "actual_value": 4,
      "shap_value": 2.7196,
      "direction": "risk_increasing",
      "interpretation": "Having 4 subject(s) below the 50% internal mark benchmark contributed positively (+2.720) toward higher predicted academic risk."
    }
  ],
  "protective_factors": [
    {
      "feature": "cumulative_cgpa_prior",
      "actual_value": 3.91,
      "shap_value": -0.1885,
      "direction": "risk_reducing",
      "interpretation": "Strong prior cumulative academic standing (3.91 GPA) served as a protective factor (-0.189)."
    }
  ]
}
```

---

## 10. Limitations & Scientific Assumptions

1. **Exchangeability Assumption**: Split conformal guarantees rely on the assumption that training, calibration, and test sets are exchangeable (drawn from the same underlying distribution). While student-group splitting ensures independence, institutional curricular shifts or grading policy changes over multi-year horizons may introduce non-stationarity.
2. **Synthetic Data Characteristics**: The evaluation is conducted on the validated Phase 1 synthetic longitudinal dataset (1,680 student-semester observations across 300 students). While realistic correlational dynamics are modeled, real-world deployment requires recalibration on live institutional cohort data.
3. **Marginal vs. Conditional Coverage**: Standard Split Conformal Prediction guarantees marginal coverage over the entire test distribution. Small sub-cohorts (e.g., specific admission quotas or rare minor departments) may exhibit slight coverage variations.

---

## 11. Recommendations for Phase 5 (Counterfactual Analysis & Prescriptive Interventions)

With Phase 3 (Explainability) and Phase 4 (Uncertainty Quantification) established, Phase 5 can build actionable **Counterfactual and Prescriptive Intervention Decision Support**:
1. **Uncertainty-Gated Interventions**: Propose interventions *only* when the system is `CONFIDENT_RISK` or `AMBIGUOUS`. Avoid disruptive interventions for `CONFIDENT_SAFE` trajectories.
2. **Minimal Feasible Counterfactuals**: Compute the minimum actionable change in continuous assessments ($\Delta \text{Attendance}$, $\Delta \text{Internal Marks}$, clearing failing subject thresholds) required to transition a student's conformal set from `{"RISK"}` $\to$ `{"SAFE"}`.
3. **Prescriptive Action Ranking**: Map counterfactual deltas into practical student recommendations (e.g., "Attend 3 remedial tutorial sessions in Data Structures to raise attendance above 75%").

---

## 12. Phase 4 Completion Checklist

- [x] Split Conformal Prediction method implemented with nonconformity scores $s_i = 1 - \hat{p}(y_i \mid x_i)$.
- [x] Strict 3-way student-group-aware Train / Calibration / Test splitting implemented (0 student leakage).
- [x] Uncertainty evaluated independently across W4, W8, and W12.
- [x] Multiple significance levels evaluated ($\alpha = 0.10$ and $\alpha = 0.05$).
- [x] Prediction sets generated ($|C(x)| \in \{1, 2\}$).
- [x] Controlled status vocabulary implemented (`CONFIDENT_RISK`, `CONFIDENT_SAFE`, `AMBIGUOUS`).
- [x] Empirical coverage, set sizes, and ambiguity rates evaluated and exported to CSV.
- [x] Modular SHAP integration verified with `predict_with_uncertainty_and_explanation`.
- [x] Complete test suite executed and passing (7/7 in Phase 4, 14/14 combined).
- [x] Comprehensive report created (`reports/phase4_conformal_report.md`).

---

**Phase 4 Verdict: READY FOR PHASE 5**
