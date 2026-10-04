# EduInsight AI — Technical & Institutional Limitations

---

## 1. Synthetic ML Dataset Disclosure
The predictive models, SHAP explainer, conformal calibration quantiles, and counterfactual simulations were developed and evaluated on the validated Phase 1 synthetic longitudinal dataset ($1,680$ student-semester records across $300$ students). While realistic correlational dynamics and attrition curves were modeled, **real-world deployment requires ethical review and recalibration on live institutional cohort data**.

---

## 2. Statistical Association vs. Causal Mechanisms
- **SHAP Attributions**: SHAP values calculate additive contributions within the model's prediction space; they reflect statistical correlations learned by tree ensembles, not unobserved physical causation.
- **Counterfactual Simulations**: What-if predictions model changes under the learned decision boundary. Unobserved real-world factors (e.g. personal health, socio-economic challenges) may alter how an attendance increase translates to exam performance.

---

## 3. Conformal Prediction & Exchangeability Assumptions
- **Marginal vs. Conditional Coverage**: Split Conformal Prediction provides marginal coverage guarantees over the overall test distribution. Small demographic sub-cohorts may experience minor coverage variations.
- **Non-Stationarity / Concept Drift**: Conformal guarantees assume exchangeable distributions between calibration and test data. Shifts in university grading policies or new curricula across academic years require periodic recalibration.

---

## 4. Human-in-the-Loop & Advisory Scope
EduInsight AI is designed strictly as an **advisory decision-support system**. It explicitly does not automate disciplinary, academic suspension, or grading actions. Human faculty advisors and mentors retain full discretion to evaluate qualitative student context.

---

## 5. Discrete Search Space in Counterfactuals
The counterfactual search engine uses structured grid steps (+5%, +10%, clearing 1 subject). While pedagogically intuitive and highly efficient, gradient-based continuous counterfactual algorithms could theoretically find infinitesimally smaller mathematical perturbations.
