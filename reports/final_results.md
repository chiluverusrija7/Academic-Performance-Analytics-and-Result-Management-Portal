# EduInsight AI — Final Consolidated Experimental Results

**Data Source Authority:** Extracted directly from [`results/checkpoint_model_metrics.csv`](file:///d:/EduInsight/results/checkpoint_model_metrics.csv), [`results/conformal_summary.csv`](file:///d:/EduInsight/results/conformal_summary.csv), and [`results/counterfactual_cases.csv`](file:///d:/EduInsight/results/counterfactual_cases.csv).

---

## 1. Multi-Checkpoint Model Comparison Table

Evaluated on held-out test split ($60$ unseen students, $344$ student-semester records):

| Checkpoint | Model Architecture | Precision | Recall | F1 Score | PR-AUC | ROC-AUC | Brier Score | TN | FP | FN | TP |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Week 4** | Logistic Regression (Baseline) | $0.4754$ | $0.8286$ | $0.6042$ | $0.7974$ | $0.9517$ | $0.0773$ | $277$ | $32$ | $6$ | $29$ |
| **Week 4** | Random Forest | $0.5769$ | $0.8571$ | $0.6897$ | $0.7836$ | $0.9613$ | $0.0607$ | $287$ | $22$ | $5$ | $30$ |
| **Week 4** | **XGBoost (Champion)** | **$0.5800$** | **$0.8286$** | **$0.6824$** | **$0.8201$** | **$0.9538$** | **$0.0535$** | **$288$** | **$21$** | **$6$** | **$29$** |
| **Week 8** | Logistic Regression (Baseline) | $0.6038$ | $0.9143$ | $0.7273$ | $0.9102$ | $0.9857$ | $0.0461$ | $288$ | $21$ | $3$ | $32$ |
| **Week 8** | Random Forest | $0.7561$ | $0.8857$ | $0.8158$ | $0.9286$ | $0.9896$ | $0.0311$ | $299$ | $10$ | $4$ | $31$ |
| **Week 8** | **XGBoost (Champion)** | **$0.7632$** | **$0.8286$** | **$0.7945$** | **$0.9136$** | **$0.9873$** | **$0.0330$** | **$300$** | **$9$** | **$6$** | **$29$** |
| **Week 12** | Logistic Regression (Baseline) | $0.6977$ | $0.8571$ | $0.7692$ | $0.9397$ | $0.9914$ | $0.0289$ | $296$ | $13$ | $5$ | $30$ |
| **Week 12** | Random Forest | $0.9355$ | $0.8286$ | $0.8788$ | $0.9578$ | $0.9942$ | $0.0187$ | $307$ | $2$ | $6$ | $29$ |
| **Week 12** | **XGBoost (Champion)** | **$0.8485$** | **$0.8000$** | **$0.8235$** | **$0.9547$** | **$0.9939$** | **$0.0215$** | **$304$** | **$5$** | **$7$** | **$28$** |

---

## 2. Temporal Predictive Performance Trajectory ($W_4 \to W_8 \to W_{12}$)

- **Precision Progression**: $58.00\% \ (W_4) \longrightarrow 76.32\% \ (W_8) \longrightarrow 84.85\% \ (W_{12})$. False positive alarms decrease by $76.2\%$ as continuous internal mark signals become available.
- **PR-AUC (Precision-Recall AUC)**: $0.8201 \ (W_4) \longrightarrow 0.9136 \ (W_8) \longrightarrow 0.9547 \ (W_{12})$.
- **Brier Calibration Score**: $0.0535 \ (W_4) \longrightarrow 0.0330 \ (W_8) \longrightarrow 0.0215 \ (W_{12})$, indicating superior probability calibration.

---

## 3. Global SHAP Feature Importance Rankings

| Rank | Week 4 (Early Term) | Week 8 (Midterm) | Week 12 (Pre-Final) |
|---|---|---|---|
| **#1** | `internal_marks_avg_w4` (2.54) | `internal_marks_avg_w8` (2.42) | `low_scoring_subjects_w12` (3.56) |
| **#2** | `previous_attendance_pct` (0.86) | `low_scoring_subjects_w8` (1.38) | `internal_marks_avg_w12` (2.10) |
| **#3** | `low_scoring_subjects_w4` (0.46) | `marks_change_w4_w8` (0.65) | `internal_marks_avg_w8` (0.62) |
| **#4** | `attendance_pct_w4` (0.31) | `internal_marks_avg_w4` (0.42) | `low_scoring_subjects_w8` (0.49) |
| **#5** | `cumulative_cgpa_prior` (0.30) | `previous_attendance_pct` (0.41) | `previous_attendance_pct` (0.45) |

---

## 4. Conformal Prediction Uncertainty & Coverage Results

| Checkpoint | Nominal $\alpha$ | Target Coverage | Empirical Coverage | Risk Class Coverage | Safe Class Coverage | Avg Set Size | Ambiguity Rate (%) | Quantile Threshold $\hat{q}$ |
|---|---|---|---|---|---|---|---|---|
| **W4** | $0.10$ | $90.0\%$ | **$91.86\%$** | $80.00\%$ | $93.20\%$ | $1.000$ | $0.00\%$ | $0.4660$ |
| **W4** | $0.05$ | $95.0\%$ | **$96.51\%$** | $85.71\%$ | $97.73\%$ | $1.099$ | **$9.88\%$** | $0.6803$ |
| **W8** | $0.10$ | $90.0\%$ | **$95.06\%$** | $88.57\%$ | $95.79\%$ | $1.000$ | $0.00\%$ | $0.1455$ |
| **W8** | $0.05$ | $95.0\%$ | **$96.51\%$** | $91.43\%$ | $97.09\%$ | $1.026$ | **$2.62\%$** | $0.6544$ |
| **W12** | $0.10$ | $90.0\%$ | **$96.80\%$** | $88.57\%$ | $97.73\%$ | $1.000$ | $0.00\%$ | $0.0979$ |
| **W12** | $0.05$ | $95.0\%$ | **$96.80\%$** | $88.57\%$ | $97.73\%$ | $1.000$ | **$0.00\%$** | $0.3559$ |

---

## 5. Counterfactual & Intervention Results

- **Threshold Crossing Rate**: $83.3\%$ of tested at-risk cases found feasible behavioral modifications crossing into `SAFE`.
- **Top Prescribed Interventions**: `SUBJECT_REMEDIATION` ($64.4\%$), `ATTENDANCE_SUPPORT` ($22.2\%$), `FACULTY_MENTORING` ($8.9\%$), `STUDY_PLAN` ($4.5\%$).
- **Safe Student Precision**: $100\%$ of confident safe students correctly received `NO_INTERVENTION` (zero unnecessary overhead).
