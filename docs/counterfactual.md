# Counterfactual What-If Simulation Engine

The counterfactual engine solves for minimal, actionable modifications to student behavior that shift predicted risk below the decision threshold.

## Optimization Objective

$$\min_{\delta \in \mathcal{A}} \|\delta\|_1 \quad \text{s.t.} \quad \hat{f}(x + \delta) \le \tau_{\text{safe}}$$

Where:
- $\mathcal{A}$ defines actionable feature boundaries (e.g., non-negative changes to attendance and marks, fixed immutable demographics).
- $\tau_{\text{safe}} = 0.50$ is the target safety probability threshold.
