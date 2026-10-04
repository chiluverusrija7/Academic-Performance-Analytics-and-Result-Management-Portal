import psycopg2

def sync_student_results_and_faculty():
    conn = psycopg2.connect(dbname='EduInsight', user='postgres', password='12345', host='localhost', port=5432)
    cur = conn.cursor()

    # Ensure student 1 has Semester 1 and Semester 2 results
    cur.execute("""
        INSERT INTO result (student_id, semester_id, total_credits, earned_credits, total_marks, percentage, sgpa, cgpa, backlogs, result_classification, result_status, published_date)
        VALUES 
        (1, 1, 24, 24, 520, 81.25, 8.42, 8.42, 0, 'First Class with Distinction', 'Published', '2024-06-30')
        ON CONFLICT DO NOTHING;
    """)

    # Also let's check faculty assigned to student's enrolled subjects
    cur.execute("""
        SELECT DISTINCT f.faculty_id, f.first_name, f.last_name, f.email, f.designation, d.dept_name, s.subject_name, s.subject_code, s.subject_id
        FROM subject s
        JOIN faculty_subject fs ON s.subject_id = fs.subject_id
        JOIN faculty f ON fs.faculty_id = f.faculty_id
        LEFT JOIN department d ON f.dept_id = d.dept_id;
    """)
    rows = cur.fetchall()
    print(f"Total faculty mappings: {len(rows)}")

    conn.commit()
    cur.close()
    conn.close()
    print("Database sync complete!")

if __name__ == '__main__':
    sync_student_results_and_faculty()
