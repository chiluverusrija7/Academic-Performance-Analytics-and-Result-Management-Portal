# JWT Authentication & Role-Based Access Control

EduInsight AI implements JSON Web Token (JWT) authentication and role-based access control (RBAC).

## Roles & Hierarchy

- `STUDENT`: Access to Personal Academic Command Center, attendance, timetable, marks, and embedded risk advisor.
- `FACULTY`: Access to Prioritized Interventions Queue, 360° student drawers, cohort analytics, and case management.
- `ADMIN` / `HOD` / `EXAM_CELL`: Full institutional governance, model lab, department analytics, and user management.

## Authentication Flow

1. User submits credentials to `POST /api/auth/login`.
2. Password hash verified against `users` table or `student` table.
3. Signed JWT token created with HMAC-SHA256 and expiration.
4. Protected FastAPI and Express routes validate `Authorization: Bearer <token>` header.
