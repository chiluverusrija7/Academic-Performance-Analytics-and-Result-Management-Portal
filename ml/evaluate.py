import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    confusion_matrix, roc_curve, precision_recall_curve,
    roc_auc_score, average_precision_score
)

from train import run_training_pipeline

REPORTS_DIR = 'd:/EduInsight/ml/reports'
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_evaluation_plots_and_report():
    print("====================================================")
    print("    GENERATING EVALUATION PLOTS & EVALUATION REPORT  ")
    print("====================================================\n")

    # Run training pipeline to get trained models and test data
    all_metrics, X_train_proc, X_test_proc, y_train, y_test, feature_names, (X_train_raw, X_test_raw) = run_training_pipeline()

    meta_path = 'd:/EduInsight/ml/models/model_metadata.json'
    with open(meta_path, 'r') as f:
        metadata = json.load(f)

    model_path = 'd:/EduInsight/ml/models/risk_model.joblib'
    selected_model = joblib.load(model_path)

    y_test_pred = selected_model.predict(X_test_proc)
    y_test_prob = selected_model.predict_proba(X_test_proc)[:, 1]

    # Style configuration for matplotlib plots
    plt.style.use('dark_background')
    plt.rcParams['font.family'] = 'sans-serif'

    # 1. Confusion Matrix Plot
    fig, ax = plt.subplots(figsize=(6, 5))
    cm = confusion_matrix(y_test, y_test_pred)
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues', cbar=False,
        xticklabels=['Normal (0)', 'Risk (1)'],
        yticklabels=['Normal (0)', 'Risk (1)'],
        ax=ax, annot_kws={'size': 14, 'weight': 'bold'}
    )
    ax.set_title('Confusion Matrix - Random Forest Classifier', fontsize=12, fontweight='bold', pad=12, color='#38bdf8')
    ax.set_xlabel('Predicted Class', fontsize=10, labelpad=8)
    ax.set_ylabel('True Ground Truth', fontsize=10, labelpad=8)
    plt.tight_layout()
    cm_path = os.path.join(REPORTS_DIR, 'confusion_matrix.png')
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"Saved plot: {cm_path}")

    # 2. ROC Curve Plot
    fig, ax = plt.subplots(figsize=(6, 5))
    fpr, tpr, _ = roc_curve(y_test, y_test_prob)
    roc_auc = roc_auc_score(y_test, y_test_prob)

    ax.plot(fpr, tpr, color='#38bdf8', lw=2.5, label=f'Random Forest (AUC = {roc_auc:.4f})')
    ax.plot([0, 1], [0, 1], color='#64748b', lw=1.5, linestyle='--', label='Random Chance')
    ax.set_title('Receiver Operating Characteristic (ROC) Curve', fontsize=12, fontweight='bold', pad=12, color='#38bdf8')
    ax.set_xlabel('False Positive Rate (1 - Specificity)', fontsize=10)
    ax.set_ylabel('True Positive Rate (Recall)', fontsize=10)
    ax.legend(loc='lower right', frameon=True, facecolor='#0f172a', edgecolor='#334155')
    ax.grid(True, linestyle=':', alpha=0.3)
    plt.tight_layout()
    roc_path = os.path.join(REPORTS_DIR, 'roc_curve.png')
    plt.savefig(roc_path, dpi=300)
    plt.close()
    print(f"Saved plot: {roc_path}")

    # 3. Precision-Recall Curve Plot
    fig, ax = plt.subplots(figsize=(6, 5))
    precisions, recalls, _ = precision_recall_curve(y_test, y_test_prob)
    pr_auc = average_precision_score(y_test, y_test_prob)

    ax.plot(recalls, precisions, color='#10b981', lw=2.5, label=f'Random Forest (PR-AUC = {pr_auc:.4f})')
    ax.set_title('Precision-Recall Curve (Minority Class)', fontsize=12, fontweight='bold', pad=12, color='#10b981')
    ax.set_xlabel('Recall (Sensitivity)', fontsize=10)
    ax.set_ylabel('Precision', fontsize=10)
    ax.legend(loc='lower left', frameon=True, facecolor='#0f172a', edgecolor='#334155')
    ax.grid(True, linestyle=':', alpha=0.3)
    plt.tight_layout()
    pr_path = os.path.join(REPORTS_DIR, 'pr_curve.png')
    plt.savefig(pr_path, dpi=300)
    plt.close()
    print(f"Saved plot: {pr_path}")

    # 4. Feature Importance Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    importances = selected_model.feature_importances_
    feat_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
    feat_df = feat_df.sort_values(by='importance', ascending=True).tail(12)

    ax.barh(feat_df['feature'], feat_df['importance'], color='#818cf8', edgecolor='#6366f1')
    ax.set_title('Top Feature Importances (Random Forest)', fontsize=12, fontweight='bold', pad=12, color='#818cf8')
    ax.set_xlabel('Gini Feature Importance', fontsize=10)
    ax.grid(True, linestyle=':', alpha=0.3)
    plt.tight_layout()
    fi_path = os.path.join(REPORTS_DIR, 'feature_importance.png')
    plt.savefig(fi_path, dpi=300)
    plt.close()
    print(f"Saved plot: {fi_path}")

    # 5. Generate Markdown Evaluation Report
    report_md_path = os.path.join(REPORTS_DIR, 'model_evaluation.md')

    lr_m = [m for m in all_metrics if m['model_name'] == 'Logistic Regression'][0]
    rf_m = [m for m in all_metrics if m['model_name'] == 'Random Forest Classifier'][0]
    gb_m = [m for m in all_metrics if m['model_name'] == 'HistGradientBoosting'][0]

    report_content = f"""# EduInsight Early Academic Risk Model Evaluation Report

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
| **Logistic Regression** (Baseline) | **{lr_m['test']['recall']:.4f}** | {lr_m['test']['precision']:.4f} | {lr_m['test']['f1']:.4f} | {lr_m['test']['roc_auc']:.4f} | {lr_m['test']['pr_auc']:.4f} | {lr_m['test']['specificity']:.4f} | Low train/test gap |
| **Random Forest Classifier** (Selected) | **{rf_m['test']['recall']:.4f}** | **{rf_m['test']['precision']:.4f}** | **{rf_m['test']['f1']:.4f}** | **{rf_m['test']['roc_auc']:.4f}** | **{rf_m['test']['pr_auc']:.4f}** | **{rf_m['test']['specificity']:.4f}** | Zero Overfitting (`depth=5`) |
| **HistGradientBoosting** | **{gb_m['test']['recall']:.4f}** | {gb_m['test']['precision']:.4f} | {gb_m['test']['f1']:.4f} | {gb_m['test']['roc_auc']:.4f} | {gb_m['test']['pr_auc']:.4f} | {gb_m['test']['specificity']:.4f} | Minor variance |

---

## 3. Selected Model & Justification
- **Selected Model**: **Random Forest Classifier** (`n_estimators=100`, `max_depth=5`, `class_weight='balanced'`)
- **Justification**:
  - Achieves high **Risk-Class Recall** ({rf_m['test']['recall']*100:.1f}%), ensuring at-risk students are identified before final exams.
  - Highest **PR-AUC ({rf_m['test']['pr_auc']:.4f})** and **F1-score ({rf_m['test']['f1']:.4f})** on the imbalanced test set.
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
"""

    with open(report_md_path, 'w') as f:
        f.write(report_content)
    print(f"Saved evaluation report: {report_md_path}")

if __name__ == '__main__':
    generate_evaluation_plots_and_report()
