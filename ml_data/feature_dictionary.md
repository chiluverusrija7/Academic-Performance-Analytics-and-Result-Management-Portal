# EduInsight AI — Longitudinal ML Feature Dictionary & Leakage Audit

## Overview
This document defines every variable in the EduInsight Synthetic Longitudinal Academic Dataset (`ml_data/academic_history.csv`) and its checkpoint-specific representations (`checkpoint_w4.csv`, `checkpoint_w8.csv`, `checkpoint_w12.csv`).

---

## 1. Feature Classification & Temporal Availability Matrix

| Column Name | Category | Data Type | Availability Point | Allowed as Predictor in W4? | Allowed as Predictor in W8? | Allowed as Predictor in W12? | Target / Outcome Only? | Leakage Risk Notes |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `student_id` | `IDENTIFIER` | String (`STU0001`) | Semester Start | No (Group ID) | No (Group ID) | No (Group ID) | No | Group split identifier. |
| `cohort_entry_year` | `METADATA` | String (`2020-21`) | Semester Start | Yes | Yes | Yes | No | Cohort identifier. |
| `semester_id` | `IDENTIFIER` | String (`SEM_...`) | Semester Start | No (ID) | No (ID) | No (ID) | No | Record ID. |
| `semester_no` | `STATIC` | Integer (`1` to `8`) | Semester Start | Yes | Yes | Yes | No | Stage of student degree. |
| `academic_year` | `METADATA` | String (`2022-23`) | Semester Start | Yes | Yes | Yes | No | Calendar cycle. |
| `dept_code` | `STATIC` | Categorical (`CSE`, etc.) | Semester Start | Yes | Yes | Yes | No | Academic discipline. |
| `course_code` | `STATIC` | String (`B.TECH`) | Semester Start | Yes | Yes | Yes | No | Program type. |
| `admission_category` | `STATIC` | Categorical | Semester Start | Yes | Yes | Yes | No | Quota category. |
| `entrance_rank_percentile` | `STATIC` | Float (`0.0`–`100.0`) | Semester Start | Yes | Yes | Yes | No | Baseline entry percentile. |
| `fee_payment_status` | `STATIC` | Categorical | Semester Start | Yes | Yes | Yes | No | Timeliness of fee clearance. |
| `total_registered_credits` | `STATIC` | Integer (`16`–`24`) | Semester Start | Yes | Yes | Yes | No | Academic workload. |
| `enrolled_subjects_count` | `STATIC` | Integer (`4`–`6`) | Semester Start | Yes | Yes | Yes | No | Course module count. |
| `has_prior_semester_history` | `PRIOR_HISTORY` | Binary (`0`/`1`) | Semester Start | Yes | Yes | Yes | No | `0` for Sem 1, `1` for Sem >= 2. |
| `previous_sgpa` | `PRIOR_HISTORY` | Float (`0.0`–`10.0`) | Semester Start | Yes | Yes | Yes | No | Prior term SGPA (Null for Sem 1). |
| `cumulative_cgpa_prior` | `PRIOR_HISTORY` | Float (`0.0`–`10.0`) | Semester Start | Yes | Yes | Yes | No | Prior cumulative GPA (Null for Sem 1). |
| `previous_attendance_pct` | `PRIOR_HISTORY` | Float (`0.0`–`100.0`) | Semester Start | Yes | Yes | Yes | No | Prior term attendance (Null for Sem 1). |
| `previous_backlogs_count` | `PRIOR_HISTORY` | Integer ($\ge 0$) | Semester Start | Yes | Yes | Yes | No | Prior term backlogs (Null for Sem 1). |
| `historical_backlogs_cumulative` | `PRIOR_HISTORY` | Integer ($\ge 0$) | Semester Start | Yes | Yes | Yes | No | Cumulative backlog debt ($0$ for Sem 1). |
| `attendance_pct_w4` | `W4` | Float (`0.0`–`100.0`) | Week 4 | Yes | Yes | Yes | No | Early attendance. |
| `internal_marks_avg_w4` | `W4` | Float (`0.0`–`100.0`) | Week 4 | Yes | Yes | Yes | No | Early continuous internal marks. |
| `low_scoring_subjects_w4` | `W4` | Integer ($\ge 0$) | Week 4 | Yes | Yes | Yes | No | Count of subjects $< 50\%$ internal. |
| `low_attendance_subjects_w4` | `W4` | Integer ($\ge 0$) | Week 4 | Yes | Yes | Yes | No | Count of subjects $< 75\%$ attendance. |
| `attendance_pct_w8` | `W8` | Float (`0.0`–`100.0`) | Week 8 | **NO (Leakage)** | Yes | Yes | No | Midterm attendance. |
| `internal_marks_avg_w8` | `W8` | Float (`0.0`–`100.0`) | Week 8 | **NO (Leakage)** | Yes | Yes | No | Midterm internal exam marks. |
| `low_scoring_subjects_w8` | `W8` | Integer ($\ge 0$) | Week 8 | **NO (Leakage)** | Yes | Yes | No | Count of subjects $< 50\%$ internal. |
| `low_attendance_subjects_w8` | `W8` | Integer ($\ge 0$) | Week 8 | **NO (Leakage)** | Yes | Yes | No | Count of subjects $< 75\%$ attendance. |
| `attendance_change_w4_w8` | `W8` | Float | Week 8 | **NO (Leakage)** | Yes | Yes | No | Attendance trajectory W4 → W8. |
| `marks_change_w4_w8` | `W8` | Float | Week 8 | **NO (Leakage)** | Yes | Yes | No | Marks trajectory W4 → W8. |
| `attendance_pct_w12` | `W12` | Float (`0.0`–`100.0`) | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Pre-final attendance. |
| `internal_marks_avg_w12` | `W12` | Float (`0.0`–`100.0`) | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Total internal evaluation. |
| `low_scoring_subjects_w12` | `W12` | Integer ($\ge 0$) | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Count of subjects $< 50\%$ internal. |
| `low_attendance_subjects_w12` | `W12` | Integer ($\ge 0$) | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Count of subjects $< 75\%$ attendance. |
| `attendance_change_w8_w12` | `W12` | Float | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Attendance trajectory W8 → W12. |
| `marks_change_w8_w12` | `W12` | Float | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Marks trajectory W8 → W12. |
| `performance_trend` | `W12` | Float | Week 12 | **NO (Leakage)** | **NO (Leakage)** | Yes | No | Overall slope across checkpoints. |
| `final_sgpa` | `TARGET_ONLY` | Float (`0.0`–`10.0`) | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `final_cgpa` | `TARGET_ONLY` | Float (`0.0`–`10.0`) | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `final_marks_average` | `TARGET_ONLY` | Float (`0.0`–`100.0`) | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `final_backlogs_count` | `TARGET_ONLY` | Integer ($\ge 0$) | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `final_backlog_bucket` | `TARGET_ONLY` | Categorical (`0`,`1`,`2+`) | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `final_result_classification` | `TARGET_ONLY` | Categorical | End of Term | **NO (Leakage)** | **NO (Leakage)** | **NO (Leakage)** | **YES** | Outcome variable. |
| `target_risk` | `TARGET_ONLY` | Binary (`0`/`1`) | End of Term | **LABEL ONLY** | **LABEL ONLY** | **LABEL ONLY** | **YES** | Primary ML classification target. |

---

## 2. Checkpoint Dataset Schemas

### A. `ml_data/checkpoint_w4.csv` (Earliest Warning Checkpoint)
* **Predictor Features (21):** Static attributes, admission profile, prior academic history, Week 4 attendance & internal marks.
* **Excluded (19):** Week 8 features, Week 12 features, and all final outcome fields.
* **Target:** `target_risk` (retained solely as evaluation ground truth).

### B. `ml_data/checkpoint_w8.csv` (Midterm Evaluation Checkpoint)
* **Predictor Features (27):** Everything in W4 + Week 8 attendance & internal marks + Week 4 $	o$ Week 8 trajectory deltas.
* **Excluded (13):** Week 12 features and all final outcome fields.
* **Target:** `target_risk`.

### C. `ml_data/checkpoint_w12.csv` (Pre-Final Review Checkpoint)
* **Predictor Features (34):** Everything in W8 + Week 12 attendance & internal marks + Week 8 $	o$ Week 12 trajectory deltas + overall performance trend.
* **Excluded (6):** All final outcome fields (`final_sgpa`, `final_cgpa`, `final_marks_average`, `final_backlogs_count`, `final_backlog_bucket`, `final_result_classification`).
* **Target:** `target_risk`.

---

## 3. Recommended Splitting Strategy for Phase 2
Because the dataset contains multiple semesters for each student:
1. **Group Split:** Standard `GroupKFold` or `GroupShuffleSplit` on `student_id` is mandatory to avoid temporal leakage across folds.
2. **Temporal Split:** Train on cohorts 2020-21 through 2023-24, evaluate on the most recent 2024-25 cohort.
