import psycopg2

def setup_intervention_status():
    conn = psycopg2.connect(dbname='EduInsight', user='postgres', password='12345', host='localhost', port=5432)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS intervention_status (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        checkpoint VARCHAR(10) NOT NULL DEFAULT 'W12',
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REASSESS')),
        priority VARCHAR(20) DEFAULT 'HIGH',
        intervention_type VARCHAR(100),
        assigned_faculty_id INTEGER REFERENCES faculty(faculty_id),
        assigned_faculty_name VARCHAR(150),
        assigned_date TIMESTAMP DEFAULT NOW(),
        next_review_date DATE,
        completion_date DATE,
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, checkpoint)
    );
    """)

    # Seed initial demonstration assignments
    seed_records = [
        ('STU0016', 'W12', 'ASSIGNED', 'CRITICAL', 'Subject Remediation & Peer Tutoring', 1, 'Prof. Suresh Bhat', '2026-10-02', '2026-10-16', 'Scheduled twice-weekly remedial problem sessions in DBMS.'),
        ('STU0042', 'W12', 'IN_PROGRESS', 'HIGH', 'Attendance Support & Academic Counseling', 7, 'Prof. Vikram Reddy', '2026-09-28', '2026-10-12', 'Attendance monitoring active. Student showed 85% attendance over past week.'),
        ('STU0105', 'W12', 'PENDING', 'MEDIUM', 'Laboratory Practical Coaching', 6, 'Prof. Priya Nair', None, '2026-10-20', 'Flagged for Saturday makeup lab practical session.'),
        ('STU0001', 'W12', 'COMPLETED', 'LOW', 'Routine Academic Mentoring', 1, 'Prof. Suresh Bhat', '2026-09-15', None, 'Mentoring check-in complete. Student on-track with SGPA > 8.2.')
    ]

    for s_id, cp, st, pr, itype, fac_id, fac_name, adate, rdate, notes in seed_records:
        cur.execute("""
            INSERT INTO intervention_status (student_id, checkpoint, status, priority, intervention_type, assigned_faculty_id, assigned_faculty_name, assigned_date, next_review_date, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (student_id, checkpoint) DO UPDATE
            SET status = EXCLUDED.status,
                priority = EXCLUDED.priority,
                intervention_type = EXCLUDED.intervention_type,
                assigned_faculty_id = EXCLUDED.assigned_faculty_id,
                assigned_faculty_name = EXCLUDED.assigned_faculty_name,
                next_review_date = EXCLUDED.next_review_date,
                notes = EXCLUDED.notes,
                updated_at = NOW();
        """, (s_id, cp, st, pr, itype, fac_id, fac_name, adate, rdate, notes))

    conn.commit()
    cur.execute("SELECT count(*) FROM intervention_status;")
    print("Total intervention status records:", cur.fetchone()[0])
    cur.close()
    conn.close()
    print("Intervention status table ready!")

if __name__ == '__main__':
    setup_intervention_status()
