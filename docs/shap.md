# TreeSHAP Explainability Layer

EduInsight AI uses `shap.TreeExplainer` to decompose XGBoost risk predictions into additive feature attributions in log-odds space.

## Mathematical Formulation

$$f(x) = \phi_0 + \sum_{i=1}^M \phi_i(x)$$

Where:
- $\phi_0$ is the base expected value across the training cohort.
- $\phi_i > 0$ represents a risk-increasing contributing factor.
- $\phi_i < 0$ represents a protective anchor reducing predicted risk.

## Non-Causal Attribution Standard

All UI and API responses enforce non-causal descriptions ("contributing factor", "protective indicator") to preserve statistical integrity.
