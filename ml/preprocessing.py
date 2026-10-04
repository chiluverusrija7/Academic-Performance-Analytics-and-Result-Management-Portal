import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

# 1. Feature Classification
IDENTIFIER_COLS = ['student_id', 'academic_year']

CATEGORICAL_FEATURES = ['department', 'course']

NUMERIC_FEATURES = [
    'attendance_pct_to_date',
    'in_sem_avg_pct',
    'low_internal_subjects_count',
    'subjects_below_internal_threshold',
    'internal_assessment_count',
    'current_semester',
    'previous_sgpa',
    'previous_marks_average',
    'previous_backlogs',
    'previous_attendance_pct',
    'performance_trend',
    'subjects_attempted'
]

# Features with missing values in Semester 1
LONGITUDINAL_NULL_FEATURES = [
    'previous_sgpa',
    'previous_marks_average',
    'previous_backlogs',
    'previous_attendance_pct'
]

EXCLUDED_LEAKAGE_COLS = [
    'final_external_avg_pct',
    'final_total_pct',
    'final_sgpa',
    'final_backlogs',
    'final_result_classification',
    'target_risk'
]

TARGET_COL = 'target_risk'

def build_preprocessing_pipeline():
    """
    Builds a scikit-learn ColumnTransformer pipeline for early prediction features.
    Handles Semester 1 missing longitudinal features via median imputation + missing indicator,
    encodes categorical variables, and scales numerical features.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median', add_indicator=True)),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERIC_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES)
        ]
    )

    return preprocessor

def prepare_feature_matrix(df):
    """
    Extracts features (X), target (y), and groups (student_id) from raw DataFrame.
    Strictly excludes leakage columns.
    """
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES].copy()
    y = df[TARGET_COL].values if TARGET_COL in df.columns else None
    groups = df['student_id'].values if 'student_id' in df.columns else None
    
    return X, y, groups

def get_transformed_feature_names(preprocessor, categorical_features=CATEGORICAL_FEATURES, numeric_features=NUMERIC_FEATURES):
    """
    Retrieves human-readable feature names after OneHot encoding and MissingIndicator addition.
    """
    feature_names = []
    
    # Numeric features
    num_pipeline = preprocessor.named_transformers_['num']
    imputer = num_pipeline.named_steps['imputer']
    
    for i, col in enumerate(numeric_features):
        feature_names.append(col)
    
    # Missing indicator columns added by SimpleImputer
    if hasattr(imputer, 'indicator_') and imputer.indicator_ is not None:
        missing_indices = imputer.indicator_.features_
        for idx in missing_indices:
            feature_names.append(f"{numeric_features[idx]}_is_missing")
            
    # Categorical features
    cat_pipeline = preprocessor.named_transformers_['cat']
    ohe = cat_pipeline.named_steps['onehot']
    if hasattr(ohe, 'get_feature_names_out'):
        cat_names = ohe.get_feature_names_out(categorical_features)
        feature_names.extend(list(cat_names))
        
    return feature_names
