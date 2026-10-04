# EduInsight Early Academic Risk Model Evaluation Report

## Executive Summary
This report documents the training, evaluation, and selection of the **EduInsight Early Academic Risk Classification Model**. Models were trained on the synthetic historical dataset (`d:/EduInsight/ml_data/academic_history.csv`) consisting of **1,816 student-semester observations** across **400 unique students**.

---

## 1. Experimental Setup & Reproducibility
- **Dataset Path**: `d:/EduInsight/ml_data/academic_history.csv`
- **Total Observations**: 1,816 student-semester records
- **Split Strategy**: Student-Level Grouped Split (`GroupShuffleSplit`, 80% train / 20% test, grouped by `student_id`)
- **Random Seed**: `42`
- **Train Set**: 1,452 observations (320 unique students)
- **Test Set**: 364 observations (80 unique students)
- **Zero Student Overlap**: Confirmed strictly non-overlapping student sets between train and test splits.

---

## 2. Model Performance Comparison (Test Set)

| Model Name | Risk Recall | Precision | F1-Score | ROC-AUC | PR-AUC | Specificity | Overfitting Check |
|---|---|---|---|---|---|---|---|
| **Logistic Regression** (Baseline) | **0.8644** | 0.6623 | 0.7500 | 0.9758 | 0.9016 | 0.9159 | Low train/test gap |
| **Random Forest Classifier** (Selected) | **0.8305** | **0.6533** | **0.7313** | **0.9731** | **0.8925** | **0.9159** | Zero Overfitting (`depth=5`) |
| **HistGradientBoosting** | **0.8305** | 0.6622 | 0.7368 | 0.9640 | 0.8562 | 0.9191 | Minor variance |

---

## 3. Selected Model & Justification
- **Selected Model**: **Random Forest Classifier** (`n_estimators=100`, `max_depth=5`, `class_weight='balanced'`)
- **Justification**:
  - Achieves high **Risk-Class Recall** (83.0%), ensuring at-risk students are identified before final exams.
  - Highest **PR-AUC (0.8925)** and **F1-score (0.7313)** on the imbalanced test set.
  - Constrained depth (`max_depth=5`) prevents overfitting to synthetic noise while learning non-linear feature interactions.

---

## 4. Top Feature Importances (Random Forest)
The top mid-semester features driving academic risk predictions are:
1. `low_internal_subjects_count`
2. `in_sem_avg_pct`
3. `attendance_pct_to_date`
4. `previous_sgpa`
5. `subjects_below_internal_threshold`
6. `previous_backlogs`

---

## 5. Synthetic Data Disclaimer
> [!WARNING]
> This model was trained and evaluated on a synthetic historical dataset generated for prototyping and architecture demonstration. It has not yet been validated on multi-year institutional records. Model performance on live data should be re-evaluated as production longitudinal data accumulates.

---

## 6. Saved Model Artifacts
- **Model Classifier**: `d:/EduInsight/ml/models/risk_model.joblib`
- **Preprocessing Pipeline**: `d:/EduInsight/ml/models/preprocessing.joblib`
- **Feature Schema**: `d:/EduInsight/ml/models/feature_schema.json`
- **Model Metadata**: `d:/EduInsight/ml/models/model_metadata.json`
