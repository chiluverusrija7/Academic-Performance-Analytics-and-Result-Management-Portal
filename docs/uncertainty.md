# Split-Conformal Uncertainty Quantification

EduInsight AI implements split conformal prediction to quantify epistemic and aleatoric prediction uncertainty with distribution-free finite-sample validity.

## Conformal Coverage Guarantee

For a user-specified significance level $\alpha = 0.10$, the conformal prediction set $C(X_{n+1})$ satisfies:

$$P\left(Y_{n+1} \in C(X_{n+1})\right) \ge 1 - \alpha$$

## Prediction Set Classifications

- `{"RISK"}`: High-confidence predicted academic risk.
- `{"SAFE"}`: High-confidence predicted academic safety.
- `{"SAFE", "RISK"}`: Ambiguous borderline prediction triggering progress monitoring rather than invasive interventions.
