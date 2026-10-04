# EduInsight AI — Synthetic Dataset Generation Summary

## Synthetic Data Disclosure
> **IMPORTANT DISCLAIMER:**
> This dataset (`ml_data/academic_history.csv`, `ml_data/subject_level_history.csv`, and checkpoint views) is a **synthetic historical academic dataset** created specifically for machine learning research, experimentation, and temporal evaluation in the EduInsight AI capstone project.
> 
> It **does not represent real identifiable university students** and must not be presented as live operational data. The live 16-table PostgreSQL academic database remains the genuine operational foundation of the institution.

---

## 1. High-Level Dataset Summary

* **Total Unique Students:** `300`
* **Total Student-Semester Observations:** `1,680`
* **Total Subject-Level Academic Records:** `9,120`
* **Academic Risk Cases (`target_risk = 1`):** `225` (**`13.39%`** prevalence)
* **Normal / Safe Cases (`target_risk = 0`):** `1,455` (**`86.61%`**)

---

## 2. Cohort Progression & Longitudinal Distribution

Students are modeled across 5 distinct matriculation cohorts up to academic year 2024-25:

| Cohort Entry Year | Unique Students | Active Semesters | Student-Semester Observations | Academic Years Spanned |
| :--- | :---: | :---: | :---: | :--- |
| **2020-21** | 60 | Sem 1 – Sem 8 | 480 | 2020-21, 2021-22, 2022-23, 2023-24 |
| **2021-22** | 60 | Sem 1 – Sem 8 | 480 | 2021-22, 2022-23, 2023-24, 2024-25 |
| **2022-23** | 60 | Sem 1 – Sem 6 | 360 | 2022-23, 2023-24, 2024-25 |
| **2023-24** | 60 | Sem 1 – Sem 4 | 240 | 2023-24, 2024-25 |
| **2024-25** | 60 | Sem 1 – Sem 2 | 120 | 2024-25 |
| **Total** | **300** | **1 – 8** | **1,680** | **5 Academic Cycles** |

---

## 3. Departmental Representation

| Department Code | Department Name | Degree Program | Unique Students |
| :--- | :--- | :--- | :---: |
| **`CSE`** | Computer Science and Engineering | B.Tech | 75 |
| **`ECE`** | Electronics and Communication Engineering | B.Tech | 75 |
| **`AIML`** | Artificial Intelligence and Machine Learning | B.Tech | 75 |
| **`DS`** | Data Science | B.Tech | 75 |

---

## 4. Semester Observations Breakdown

| Semester Number | Observation Count | Percentage of Dataset |
| :---: | :---: | :---: |
| **Sem 1** | 300 | 17.9% |
| **Sem 2** | 300 | 17.9% |
| **Sem 3** | 240 | 14.3% |
| **Sem 4** | 240 | 14.3% |
| **Sem 5** | 180 | 10.7% |
| **Sem 6** | 180 | 10.7% |
| **Sem 7** | 120 | 7.1% |
| **Sem 8** | 120 | 7.1% |

---

## 5. Major Generation Assumptions & Latent Trajectory Models

1. **Subject-First Hierarchical Generation:** All student-semester features are genuinely calculated from granular subject-level records (`attendance_w4/8/12`, `internal_marks_w4/8/12`, `final_marks`, and `backlog`), ensuring consistent internal mathematical properties.
2. **Longitudinal State Transitions:** Students possess persistent latent capabilities (aptitude, attendance discipline, resilience) that carry forward across semesters, accurately tracking cumulative CGPA, prior semester SGPA, and cumulative backlog debt.
3. **Realistic Noise & Exceptions:** No deterministic formulas exist (e.g. attendance < 75% does not guarantee failure). Some students with low attendance score well through self-study; some high-attendance students encounter conceptual difficulties.
4. **Natural Imbalance:** The academic risk prevalence of **13.39%** naturally emerges from realistic grading thresholds rather than arbitrary label injection.
