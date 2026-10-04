# Database Schema & Relational Structure

EduInsight AI operates on PostgreSQL with 16 core operational tables, plus timetable, intervention tracking, and pgvector knowledge storage.

## Relational Entity Schema

1. `student` — Core student profiles (roll_no, reg_no, dept_id, course_id, current_semester, section).
2. `faculty` — Academic instructors and counselors.
3. `department` — Institutional academic units (CSE, AIML, ECE, MECH, DS).
4. `course` — Degree programs (B.Tech, M.Tech).
5. `semester` — Term definitions and academic calendars.
6. `subject` — Course modules with credit values, lecture hours, and lab flags.
7. `faculty_subject` — Faculty course assignments.
8. `enrollment` — Student-semester enrollment mappings.
9. `attendance` — Session-by-session attendance logs with timestamps and presence flags.
10. `exam` — Scheduled continuous assessments and final examinations.
11. `marks` — Internal and external component score records.
12. `grade` — Institutional grading bands.
13. `result` — Official published SGPA, CGPA, credits, and classifications.
14. `fee` — Financial billing and payment tracking.
15. `admission` — Historical admission records and quotas.
16. `users` — Authentication credentials and system roles.
17. `timetable` — Weekly classroom scheduling with period slots, days, and room numbers.
18. `intervention_status` — Persistent tracking of faculty case assignments, statuses, review dates, and case notes.
19. `academic_knowledge_vector` — pgvector semantic document store with 384-dimensional embeddings.
