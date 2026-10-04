import os
import psycopg2
import psycopg2.extras
import pandas as pd
import numpy as np
from dotenv import load_dotenv

load_dotenv('d:/EduInsight/backend/.env')

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres'),
        dbname=os.getenv('DB_NAME', 'EduInsight')
    )

def build_features_for_student(student_id):
    """
    Queries live PostgreSQL database to build the mid-semester feature vector
    for a given student_id.
    Returns:
        dict: Feature map matching feature_schema.json if sufficient data exists.
        None: If student not found or insufficient current academic data.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # 1. Fetch Student Profile & Department/Course
        cur.execute("""
            SELECT s.student_id, s.current_semester, d.dept_code, c.course_name, c.course_code
            FROM student s
            LEFT JOIN department d ON s.dept_id = d.dept_id
            LEFT JOIN course c ON s.course_id = c.course_id
            WHERE s.student_id = %s
        """, (student_id,))
        student_row = cur.fetchone()
        
        if not student_row:
            conn.close()
            return None
        
        current_semester = student_row['current_semester'] or 5
        raw_dept = (student_row['dept_code'] or 'CSE').upper()
        raw_course = student_row['course_name'] or student_row['course_code'] or 'B.Tech CSE'
        
        # Normalize Department
        if 'AIML' in raw_dept or 'AI' in raw_dept:
            department = 'AIML'
        elif 'DS' in raw_dept or 'DATA' in raw_dept:
            department = 'DS'
        elif 'ECE' in raw_dept or 'ELECTRONIC' in raw_dept:
            department = 'ECE'
        else:
            department = 'CSE'
            
        # Normalize Course
        if 'AIML' in raw_course.upper() or 'AI' in raw_course.upper():
            course = 'B.Tech AIML'
        elif 'DS' in raw_course.upper() or 'DATA' in raw_course.upper():
            course = 'B.Tech DS'
        elif 'ECE' in raw_course.upper() or 'ELECTRONIC' in raw_course.upper():
            course = 'B.Tech ECE'
        else:
            course = 'B.Tech CSE'

        # 2. Fetch Attendance metrics
        cur.execute("""
            SELECT COUNT(*) AS total_classes,
                   COUNT(CASE WHEN a.is_present = true THEN 1 END) AS attended_classes
            FROM attendance a
            JOIN enrollment e ON a.enrollment_id = e.enrollment_id
            WHERE e.student_id = %s
        """, (student_id,))
        att_row = cur.fetchone()
        
        total_classes = att_row['total_classes'] if att_row else 0
        attended_classes = att_row['attended_classes'] if att_row else 0
        
        # 3. Fetch Internal Marks metrics
        cur.execute("""
            SELECT m.mark_id, m.subject_id, m.internal_marks, m.external_marks, s.max_marks
            FROM marks m
            JOIN enrollment e ON m.enrollment_id = e.enrollment_id
            JOIN subject s ON m.subject_id = s.subject_id
            WHERE e.student_id = %s AND (m.exam_type ILIKE 'Internal' OR m.external_marks = 0 OR m.external_marks IS NULL)
        """, (student_id,))
        marks_rows = cur.fetchall()
        
        # Check Insufficient Data condition: NO attendance AND NO internal marks
        if total_classes == 0 and len(marks_rows) == 0:
            conn.close()
            return None
        
        if total_classes > 0:
            attendance_pct_to_date = round((attended_classes / float(total_classes)) * 100.0, 2)
        else:
            attendance_pct_to_date = 75.0  # Fallback median if missing but marks exist
            
        if len(marks_rows) > 0:
            # internal_marks is out of 40
            internal_pcts = [float(r['internal_marks'] or 0) / 40.0 * 100.0 for r in marks_rows]
            in_sem_avg_pct = round(float(np.mean(internal_pcts)), 2)
            low_internal_subjects_count = int(sum(1 for pct in internal_pcts if pct < 50.0))
            subjects_below_internal_threshold = low_internal_subjects_count
            internal_assessment_count = len(marks_rows)
        else:
            in_sem_avg_pct = 70.0
            low_internal_subjects_count = 0
            subjects_below_internal_threshold = 0
            internal_assessment_count = 0

        # 4. Fetch Historical Semester Performance
        cur.execute("""
            SELECT sgpa, percentage, backlogs
            FROM result
            WHERE student_id = %s
            ORDER BY semester_id ASC
        """, (student_id,))
        result_rows = cur.fetchall()
        
        if len(result_rows) > 0:
            sgpas = [float(r['sgpa']) for r in result_rows if r['sgpa'] is not None]
            percentages = [float(r['percentage']) for r in result_rows if r['percentage'] is not None]
            backlogs_list = [int(r['backlogs']) for r in result_rows if r['backlogs'] is not None]
            
            previous_sgpa = round(float(np.mean(sgpas)), 2) if sgpas else None
            previous_marks_average = round(float(np.mean(percentages)), 2) if percentages else None
            previous_backlogs = sum(backlogs_list) if backlogs_list else 0
        else:
            previous_sgpa = None
            previous_marks_average = None
            previous_backlogs = 0

        previous_attendance_pct = None  # Missing historical attendance column, left as None for pipeline imputation
        
        # 5. Compute Trend & Subjects Attempted
        if previous_marks_average is not None and in_sem_avg_pct is not None:
            performance_trend = round((in_sem_avg_pct - previous_marks_average) / 100.0, 4)
        else:
            performance_trend = 0.0

        cur.execute("""
            SELECT COUNT(DISTINCT subject_id) AS sub_count
            FROM marks m
            JOIN enrollment e ON m.enrollment_id = e.enrollment_id
            WHERE e.student_id = %s
        """, (student_id,))
        sub_row = cur.fetchone()
        subjects_attempted = sub_row['sub_count'] if (sub_row and sub_row['sub_count'] > 0) else 6

        conn.close()

        features = {
            'student_id': student_id,
            'department': department,
            'course': course,
            'current_semester': current_semester,
            'attendance_pct_to_date': attendance_pct_to_date,
            'in_sem_avg_pct': in_sem_avg_pct,
            'low_internal_subjects_count': low_internal_subjects_count,
            'subjects_below_internal_threshold': subjects_below_internal_threshold,
            'internal_assessment_count': internal_assessment_count,
            'previous_sgpa': previous_sgpa,
            'previous_marks_average': previous_marks_average,
            'previous_backlogs': previous_backlogs,
            'previous_attendance_pct': previous_attendance_pct,
            'performance_trend': performance_trend,
            'subjects_attempted': subjects_attempted
        }
        
        return features

    except Exception as e:
        print(f"Error building features for student {student_id}: {e}")
        return None

if __name__ == '__main__':
    print("--- TESTING FEATURE BUILDER ---")
    for sid in [1, 26, 35, 75]:
        feat = build_features_for_student(sid)
        print(f"\nStudent ID: {sid}")
        if feat is None:
            print("  Status: INSUFFICIENT DATA / STUDENT NOT FOUND")
        else:
            print("  Extracted Features:")
            for k, v in feat.items():
                print(f"    {k}: {v}")
