"""
uncertainty_metrics.py
Uncertainty and Conformal Prediction Evaluation Metrics for EduInsight AI (Phase 4).

Provides statistical measurement of:
- Empirical coverage (overall and class-stratified)
- Prediction set size efficiency
- Ambiguity and singleton rates
- Checkpoint comparison summaries
"""

import numpy as np
import pandas as pd


def compute_conformal_metrics(y_true, prediction_sets, probs=None, alpha=0.10):
    """
    Computes rigorous conformal prediction evaluation metrics.

    Parameters:
    - y_true: array-like of true binary labels (0 or 1)
    - prediction_sets: list of sets/lists/arrays containing predicted label strings or ints
    - probs: optional array-like of predicted risk probabilities
    - alpha: significance level (e.g., 0.10 for nominal 90% coverage)

    Returns:
    - dict of evaluated conformal metrics
    """
    y_true = np.array(y_true)
    n = len(y_true)
    if n == 0:
        raise ValueError("Cannot compute metrics on empty ground truth array.")

    # Normalize prediction sets to integer format {0, 1}
    normalized_sets = []
    for pset in prediction_sets:
        nset = set()
        for item in pset:
            if isinstance(item, str):
                if item.upper() in ["SAFE", "0", "NON-RISK", "NON_RISK"]:
                    nset.add(0)
                elif item.upper() in ["RISK", "1", "AT-RISK", "AT_RISK"]:
                    nset.add(1)
            elif isinstance(item, (int, np.integer)):
                nset.add(int(item))
        normalized_sets.append(nset)

    # 1. Coverage
    covered = np.array([y_true[i] in normalized_sets[i] for i in range(n)])
    empirical_coverage = float(np.mean(covered))
    target_coverage = float(1.0 - alpha)

    # Class-stratified coverage
    mask_risk = (y_true == 1)
    mask_safe = (y_true == 0)

    risk_coverage = float(np.mean(covered[mask_risk])) if mask_risk.sum() > 0 else 0.0
    safe_coverage = float(np.mean(covered[mask_safe])) if mask_safe.sum() > 0 else 0.0

    # 2. Prediction Set Size
    set_sizes = np.array([len(s) for s in normalized_sets])
    avg_set_size = float(np.mean(set_sizes))
    median_set_size = float(np.median(set_sizes))

    # 3. Efficiency & Ambiguity
    singleton_count = int(np.sum(set_sizes == 1))
    ambiguous_count = int(np.sum(set_sizes == 2))
    empty_count = int(np.sum(set_sizes == 0))

    singleton_rate = float(singleton_count / n)
    ambiguity_rate = float(ambiguous_count / n)
    empty_rate = float(empty_count / n)

    # Singleton class breakdown
    singleton_risk_count = int(sum(1 for s in normalized_sets if s == {1}))
    singleton_safe_count = int(sum(1 for s in normalized_sets if s == {0}))

    results = {
        "alpha": float(alpha),
        "target_coverage": target_coverage,
        "empirical_coverage": round(empirical_coverage, 4),
        "coverage_gap": round(empirical_coverage - target_coverage, 4),
        "risk_class_coverage": round(risk_coverage, 4),
        "safe_class_coverage": round(safe_coverage, 4),
        "avg_set_size": round(avg_set_size, 4),
        "median_set_size": round(median_set_size, 4),
        "ambiguity_rate_pct": round(ambiguity_rate * 100, 2),
        "singleton_rate_pct": round(singleton_rate * 100, 2),
        "empty_rate_pct": round(empty_rate * 100, 2),
        "total_test_samples": n,
        "total_risk_samples": int(mask_risk.sum()),
        "total_safe_samples": int(mask_safe.sum()),
        "singleton_safe_count": singleton_safe_count,
        "singleton_risk_count": singleton_risk_count,
        "ambiguous_count": ambiguous_count,
        "empty_count": empty_count
    }

    return results


def format_conformal_summary_table(metric_rows):
    """
    Formats a list of metric dicts into a structured DataFrame.
    """
    df = pd.DataFrame(metric_rows)
    return df
