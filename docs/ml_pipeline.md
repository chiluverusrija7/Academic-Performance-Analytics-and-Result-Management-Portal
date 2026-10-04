# Temporal ML Predictive Pipeline

EduInsight AI tracks student risk longitudinally across three in-semester milestones ($W4, W8, W12$).

## Temporal Milestones

- **Week 4 Pipeline:** Uses early attendance percentages, historical semester SGPA, and credit progression.
- **Week 8 Pipeline:** Incorporates Mid-1 internal assessment scores, assignment completion rates, and practical lab marks.
- **Week 12 Pipeline:** Evaluates comprehensive pre-examination indicators including multi-subject failure risk.

## Zero-Leakage Guarantee

No post-hoc target variables (final SGPA, final CGPA, external examination scores, final classification) are ever included in in-semester feature matrices.
