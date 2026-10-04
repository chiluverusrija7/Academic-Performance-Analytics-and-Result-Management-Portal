# Prescriptive Intervention Engine

EduInsight AI synthesizes predictions, SHAP drivers, conformal uncertainty, and counterfactuals into structured prescriptive action plans.

## Prioritization Specification

$$\text{Urgency Score} = 0.35 \cdot P(\text{Risk}) + 0.25 \cdot \text{Certainty Weight} + 0.25 \cdot \text{Priority Weight} + 0.10 \cdot \text{Checkpoint Weight} + 0.05 \cdot \text{Counterfactual Available}$$

## Action Playbooks

- `SUBJECT_REMEDIATION`: Triggered by internal marks deficits in technical subjects.
- `ATTENDANCE_SUPPORT`: Triggered by lecture attendance $< 75\%$.
- `FACULTY_MENTORING`: Triggered by cross-subject conceptual difficulty or historical backlogs.
- `STUDY_PLAN`: Structured time management support for borderline students.
