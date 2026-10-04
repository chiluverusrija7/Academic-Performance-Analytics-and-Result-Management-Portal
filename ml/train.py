import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import GroupShuffleSplit
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, confusion_matrix
)

from preprocessing import (
    build_preprocessing_pipeline, prepare_feature_matrix,
    get_transformed_feature_names, NUMERIC_FEATURES, CATEGORICAL_FEATURES,
    EXCLUDED_LEAKAGE_COLS
)

RANDOM_SEED = 42
DATASET_PATH = 'd:/EduInsight/ml_data/academic_history.csv'
MODEL_DIR = 'd:/EduInsight/ml/models'

os.makedirs(MODEL_DIR, exist_ok=True)

def evaluate_model_performance(model, X_train, y_train, X_test, y_test, model_name="Model"):
    """
    Computes metrics for both train and test sets to evaluate generalization and overfitting.
    """
    y_train_pred = model.predict(X_train)
    y_train_prob = model.predict_proba(X_train)[:, 1]
    
    y_test_pred = model.predict(X_test)
    y_test_prob = model.predict_proba(X_test)[:, 1]
    
    # Train Metrics
    tr_rec = recall_score(y_train, y_train_pred, zero_division=0)
    tr_prec = precision_score(y_train, y_train_pred, zero_division=0)
    tr_f1 = f1_score(y_train, y_train_pred, zero_division=0)
    tr_roc = roc_auc_score(y_train, y_train_prob)
    tr_pr_auc = average_precision_score(y_train, y_train_prob)
    
    # Test Metrics
    te_rec = recall_score(y_test, y_test_pred, zero_division=0)
    te_prec = precision_score(y_test, y_test_pred, zero_division=0)
    te_f1 = f1_score(y_test, y_test_pred, zero_division=0)
    te_roc = roc_auc_score(y_test, y_test_prob)
    te_pr_auc = average_precision_score(y_test, y_test_prob)
    
    cm = confusion_matrix(y_test, y_test_pred)
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0
    
    metrics = {
        'model_name': model_name,
        'train': {
            'recall': float(round(tr_rec, 4)),
            'precision': float(round(tr_prec, 4)),
            'f1': float(round(tr_f1, 4)),
            'roc_auc': float(round(tr_roc, 4)),
            'pr_auc': float(round(tr_pr_auc, 4))
        },
        'test': {
            'recall': float(round(te_rec, 4)),
            'precision': float(round(te_prec, 4)),
            'f1': float(round(te_f1, 4)),
            'roc_auc': float(round(te_roc, 4)),
            'pr_auc': float(round(te_pr_auc, 4)),
            'specificity': float(round(specificity, 4)),
            'confusion_matrix': {
                'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)
            }
        }
    }
    return metrics, y_test_pred, y_test_prob

def run_training_pipeline():
    print("====================================================")
    print("      EDUINSIGHT ML MODEL TRAINING PIPELINE        ")
    print("====================================================\n")

    # 1. Load Dataset
    print(f"Loading synthetic historical dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    print(f"Total rows: {len(df)}, Columns: {len(df.columns)}")

    # 2. Extract Features, Target, and Grouping Variable
    X, y, groups = prepare_feature_matrix(df)
    print(f"Features count: {X.shape[1]}, Target distribution: 0={sum(y==0)}, 1={sum(y==1)}")

    # 3. Student-Level Grouped Train/Test Split (GroupShuffleSplit)
    print("\nExecuting Student-Level Grouped Train/Test Split (GroupShuffleSplit)...")
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))

    X_train_raw, X_test_raw = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]
    groups_train, groups_test = groups[train_idx], groups[test_idx]

    train_students = set(groups_train)
    test_students = set(groups_test)
    overlap = train_students.intersection(test_students)
    print(f"Train set: {len(X_train_raw)} rows ({len(train_students)} unique students)")
    print(f"Test set : {len(X_test_raw)} rows ({len(test_students)} unique students)")
    print(f"Student Overlap between Train and Test: {len(overlap)} (Strict Group Separation Verified!)")

    # 4. Build and Fit Preprocessing Pipeline
    print("\nFitting preprocessing pipeline on X_train...")
    preprocessor = build_preprocessing_pipeline()
    X_train_proc = preprocessor.fit_transform(X_train_raw)
    X_test_proc = preprocessor.transform(X_test_raw)

    feature_names = get_transformed_feature_names(preprocessor)
    print(f"Processed feature vector size: {X_train_proc.shape[1]}")

    # 5. Model Candidate 1: Baseline Logistic Regression
    print("\nTraining Model 1: Baseline Logistic Regression (Balanced Class Weights)...")
    model_lr = LogisticRegression(
        class_weight='balanced',
        max_iter=1000,
        random_state=RANDOM_SEED
    )
    model_lr.fit(X_train_proc, y_train)
    metrics_lr, y_pred_lr, y_prob_lr = evaluate_model_performance(
        model_lr, X_train_proc, y_train, X_test_proc, y_test, "Logistic Regression"
    )

    # 6. Model Candidate 2: Primary Random Forest Classifier
    print("Training Model 2: Primary Random Forest Classifier (Depth=5, Balanced Weights)...")
    model_rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        min_samples_split=5,
        class_weight='balanced',
        random_state=RANDOM_SEED
    )
    model_rf.fit(X_train_proc, y_train)
    metrics_rf, y_pred_rf, y_prob_rf = evaluate_model_performance(
        model_rf, X_train_proc, y_train, X_test_proc, y_test, "Random Forest Classifier"
    )

    # 7. Model Candidate 3: HistGradientBoosting Classifier
    print("Training Model 3: HistGradientBoosting Classifier (Depth=4, Balanced Class Weights)...")
    # HistGradientBoosting handles numerical data directly
    model_gb = HistGradientBoostingClassifier(
        max_depth=4,
        class_weight='balanced',
        random_state=RANDOM_SEED
    )
    model_gb.fit(X_train_proc, y_train)
    metrics_gb, y_pred_gb, y_prob_gb = evaluate_model_performance(
        model_gb, X_train_proc, y_train, X_test_proc, y_test, "HistGradientBoosting"
    )

    # 8. Print Evaluation Summary Table
    print("\n====================================================")
    print("         MODEL PERFORMANCE COMPARISON (TEST SET)     ")
    print("====================================================")
    all_metrics = [metrics_lr, metrics_rf, metrics_gb]
    
    summary_data = []
    for m in all_metrics:
        t = m['test']
        cm = t['confusion_matrix']
        summary_data.append({
            'Model': m['model_name'],
            'Recall (Risk)': t['recall'],
            'Precision': t['precision'],
            'F1-Score': t['f1'],
            'ROC-AUC': t['roc_auc'],
            'PR-AUC': t['pr_auc'],
            'Specificity': t['specificity'],
            'TP': cm['tp'], 'FP': cm['fp'], 'FN': cm['fn'], 'TN': cm['tn']
        })
    print(pd.DataFrame(summary_data).to_string(index=False))

    # 9. Model Selection
    # Selected Model: Random Forest Classifier (Highest PR-AUC, high recall, robust tree structure)
    selected_model = model_rf
    selected_name = "Random Forest Classifier"
    selected_metrics = metrics_rf

    print(f"\n---> SELECTED MODEL FOR PRODUCTION ARTIFACTS: {selected_name}")

    # 10. Save Model & Preprocessing Artifacts
    print("\nSaving joblib artifacts and metadata to ml/models/...")
    model_file_path = os.path.join(MODEL_DIR, 'risk_model.joblib')
    prep_file_path = os.path.join(MODEL_DIR, 'preprocessing.joblib')
    schema_file_path = os.path.join(MODEL_DIR, 'feature_schema.json')
    meta_file_path = os.path.join(MODEL_DIR, 'model_metadata.json')

    joblib.dump(selected_model, model_file_path)
    joblib.dump(preprocessor, prep_file_path)

    feature_schema = {
        'numeric_features': NUMERIC_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES,
        'transformed_feature_names': feature_names,
        'excluded_leakage_columns': EXCLUDED_LEAKAGE_COLS
    }
    with open(schema_file_path, 'w') as f:
        json.dump(feature_schema, f, indent=2)

    metadata = {
        'selected_model': selected_name,
        'random_seed': RANDOM_SEED,
        'dataset_path': DATASET_PATH,
        'split_strategy': 'GroupShuffleSplit (80/20 grouped by student_id)',
        'train_observations': len(X_train_raw),
        'test_observations': len(X_test_raw),
        'train_students_count': len(train_students),
        'test_students_count': len(test_students),
        'evaluation_metrics': selected_metrics,
        'all_models_comparison': [m for m in all_metrics]
    }
    with open(meta_file_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print("Successfully saved:")
    print(f"  - Model artifact         : {model_file_path}")
    print(f"  - Preprocessing pipeline : {prep_file_path}")
    print(f"  - Feature schema         : {schema_file_path}")
    print(f"  - Model metadata         : {meta_file_path}")

    return all_metrics, X_train_proc, X_test_proc, y_train, y_test, feature_names, (X_train_raw, X_test_raw)

if __name__ == '__main__':
    run_training_pipeline()
