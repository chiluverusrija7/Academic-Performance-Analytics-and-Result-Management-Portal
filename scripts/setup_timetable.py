import psycopg2
from psycopg2.extras import execute_values
from datetime import time
import random

def setup_timetable():
    conn = psycopg2.connect(dbname='EduInsight', user='postgres', password='12345', host='localhost', port=5432)
    cur = conn.cursor()

    # Create timetable table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS timetable (
        timetable_id SERIAL PRIMARY KEY,
        subject_id INTEGER NOT NULL REFERENCES subject(subject_id) ON DELETE CASCADE,
        faculty_id INTEGER REFERENCES faculty(faculty_id),
        semester_id INTEGER NOT NULL REFERENCES semester(semester_id),
        section VARCHAR(10) NOT NULL DEFAULT 'A',
        day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room_number VARCHAR(20),
        academic_year VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)

    # Get subjects with faculty & semester
    cur.execute("""
        SELECT DISTINCT fs.subject_id, fs.faculty_id, fs.semester_id, COALESCE(fs.section, 'A'), COALESCE(fs.academic_year, '2024-25')
        FROM faculty_subject fs
        WHERE fs.status = 'Active' OR fs.status IS NULL;
    """)
    fs_rows = cur.fetchall()
    print(f"Found {len(fs_rows)} faculty_subject rows")

    if not fs_rows:
        cur.execute("SELECT subject_id FROM subject LIMIT 15;")
        subjects = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT faculty_id FROM faculty LIMIT 8;")
        faculties = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT semester_id FROM semester LIMIT 4;")
        semesters = [r[0] for r in cur.fetchall()]
        fs_rows = []
        for i, sid in enumerate(subjects):
            fs_rows.append((sid, faculties[i % len(faculties)], semesters[i % len(semesters)], 'A', '2024-25'))

    DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    TIME_SLOTS = [
        (time(9, 0), time(10, 0)),
        (time(10, 0), time(11, 0)),
        (time(11, 15), time(12, 15)),
        (time(13, 0), time(14, 0)),
        (time(14, 0), time(15, 0)),
        (time(15, 15), time(16, 15)),
    ]
    ROOMS = ['A-101', 'A-102', 'B-201', 'B-202', 'B-203', 'C-101', 'C-102', 'LAB-1', 'LAB-2', 'D-301']

    timetable_rows = []
    assigned = set()
    random.seed(42)

    for i, row in enumerate(fs_rows):
        subject_id, faculty_id, semester_id, section, academic_year = row
        days_chosen = random.sample(DAYS, min(3, len(DAYS)))
        for day in days_chosen:
            slot_idx = random.randint(0, len(TIME_SLOTS)-1)
            key = (semester_id, section, day, slot_idx)
            if key in assigned:
                for alt in range(len(TIME_SLOTS)):
                    key = (semester_id, section, day, alt)
                    if key not in assigned:
                        slot_idx = alt
                        break
            assigned.add(key)
            start_t, end_t = TIME_SLOTS[slot_idx]
            room = ROOMS[i % len(ROOMS)]
            timetable_rows.append((subject_id, faculty_id, semester_id, section, day, start_t, end_t, room, academic_year))

    if timetable_rows:
        cur.execute("TRUNCATE TABLE timetable RESTART IDENTITY;")
        execute_values(cur, """
            INSERT INTO timetable (subject_id, faculty_id, semester_id, section, day_of_week, start_time, end_time, room_number, academic_year)
            VALUES %s
        """, timetable_rows)
        print(f"Inserted {len(timetable_rows)} timetable entries")

    conn.commit()

    cur.execute("""
        SELECT t.timetable_id, s.subject_name, f.first_name, f.last_name, t.day_of_week, t.start_time, t.end_time, t.room_number
        FROM timetable t
        JOIN subject s ON t.subject_id = s.subject_id
        LEFT JOIN faculty f ON t.faculty_id = f.faculty_id
        LIMIT 5;
    """)
    rows = cur.fetchall()
    print("Sample Timetable rows:")
    for r in rows:
        print(r)

    cur.close()
    conn.close()
    print("Timetable setup complete!")

if __name__ == '__main__':
    setup_timetable()
