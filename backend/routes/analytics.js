const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET /api/analytics/overview
 * Returns top-level stats: student count, faculty count, departments, etc.
 */
router.get('/overview', async (req, res) => {
  try {
    const [stuRes, facRes, deptRes, courseRes, subRes] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM student'),
      db.query('SELECT COUNT(*) AS total FROM faculty'),
      db.query('SELECT COUNT(*) AS total FROM department'),
      db.query('SELECT COUNT(*) AS total FROM course'),
      db.query('SELECT COUNT(*) AS total FROM subject'),
    ]);

    res.json({
      success: true,
      data: {
        total_students: parseInt(stuRes.rows[0].total, 10),
        total_faculty: parseInt(facRes.rows[0].total, 10),
        total_departments: parseInt(deptRes.rows[0].total, 10),
        total_courses: parseInt(courseRes.rows[0].total, 10),
        total_subjects: parseInt(subRes.rows[0].total, 10),
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/departments
 * Returns per-department analytics: student count, average SGPA, average marks,
 * pass percentage, attendance average.
 */
router.get('/departments', async (req, res) => {
  try {
    const deptQuery = `
      SELECT
        d.dept_id,
        d.dept_code,
        d.dept_name,
        COUNT(DISTINCT s.student_id) AS student_count,
        ROUND(AVG(r.sgpa)::numeric, 2) AS avg_sgpa,
        ROUND(AVG(r.percentage)::numeric, 2) AS avg_marks_pct,
        ROUND(
          (COUNT(CASE WHEN r.result_status = 'Pass' OR r.result_status = 'Passed' OR r.result_status = 'PASS' THEN 1 END)::numeric
          / NULLIF(COUNT(r.result_id), 0)) * 100,
        2) AS pass_percentage,
        ROUND(
          (SUM(CASE WHEN att.is_present THEN 1 ELSE 0 END)::numeric
          / NULLIF(COUNT(att.attendance_id), 0)) * 100,
        2) AS avg_attendance_pct
      FROM department d
      LEFT JOIN student s ON s.dept_id = d.dept_id
      LEFT JOIN result r ON r.student_id = s.student_id
      LEFT JOIN enrollment e ON e.student_id = s.student_id
      LEFT JOIN attendance att ON att.enrollment_id = e.enrollment_id
      GROUP BY d.dept_id, d.dept_code, d.dept_name
      ORDER BY d.dept_code
    `;

    const result = await db.query(deptQuery);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Department analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/subjects
 * Returns per-subject analytics: average marks, pass %, attendance %.
 */
router.get('/subjects', async (req, res) => {
  try {
    const subQuery = `
      SELECT
        sub.subject_id,
        sub.subject_code,
        sub.subject_name,
        sub.credits,
        c.course_code,
        c.course_name,
        d.dept_code,
        d.dept_name,
        COUNT(DISTINCT e.student_id) AS student_count,
        ROUND(AVG(CASE WHEN m.exam_type = 'End Semester' THEN m.total_marks END)::numeric, 2) AS avg_total_marks,
        ROUND(AVG(CASE WHEN m.exam_type = 'Internal' THEN m.internal_marks END)::numeric, 2) AS avg_internal_marks,
        sub.max_marks,
        sub.pass_marks,
        ROUND(
          (COUNT(CASE WHEN m.exam_type = 'End Semester' AND m.total_marks >= sub.pass_marks THEN 1 END)::numeric
          / NULLIF(COUNT(CASE WHEN m.exam_type = 'End Semester' THEN 1 END), 0)) * 100,
        2) AS pass_percentage,
        ROUND(
          (COUNT(CASE WHEN m.exam_type = 'End Semester' AND m.total_marks < sub.pass_marks THEN 1 END)::numeric
          / NULLIF(COUNT(CASE WHEN m.exam_type = 'End Semester' THEN 1 END), 0)) * 100,
        2) AS fail_percentage,
        ROUND(
          (SUM(CASE WHEN att.is_present THEN 1 ELSE 0 END)::numeric
          / NULLIF(COUNT(att.attendance_id), 0)) * 100,
        2) AS avg_attendance_pct,
        COUNT(CASE WHEN m.exam_type = 'Internal' AND m.internal_marks < 20 THEN 1 END) AS low_internal_count
      FROM subject sub
      JOIN course c ON sub.course_id = c.course_id
      LEFT JOIN department d ON c.dept_id = d.dept_id
      LEFT JOIN marks m ON m.subject_id = sub.subject_id
      LEFT JOIN enrollment e ON m.enrollment_id = e.enrollment_id
      LEFT JOIN attendance att ON att.subject_id = sub.subject_id AND att.enrollment_id = e.enrollment_id
      GROUP BY sub.subject_id, sub.subject_code, sub.subject_name, sub.credits, sub.max_marks, sub.pass_marks,
               c.course_code, c.course_name, d.dept_code, d.dept_name
      ORDER BY sub.subject_code
    `;

    const result = await db.query(subQuery);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Subject analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/top-performers
 * Returns top students by SGPA and percentage from live result data.
 */
router.get('/top-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);

    const topBySgpaQuery = `
      SELECT
        s.student_id,
        s.roll_no,
        s.first_name,
        s.last_name,
        s.current_semester,
        d.dept_code,
        d.dept_name,
        c.course_name,
        ROUND(AVG(r.sgpa)::numeric, 2) AS avg_sgpa,
        ROUND(AVG(r.percentage)::numeric, 2) AS avg_percentage,
        SUM(COALESCE(r.backlogs, 0)) AS total_backlogs
      FROM student s
      LEFT JOIN department d ON s.dept_id = d.dept_id
      LEFT JOIN course c ON s.course_id = c.course_id
      LEFT JOIN result r ON r.student_id = s.student_id
      GROUP BY s.student_id, s.roll_no, s.first_name, s.last_name, s.current_semester,
               d.dept_code, d.dept_name, c.course_name
      HAVING AVG(r.sgpa) IS NOT NULL
      ORDER BY avg_sgpa DESC
      LIMIT $1
    `;

    const topByMarksQuery = `
      SELECT
        s.student_id,
        s.roll_no,
        s.first_name,
        s.last_name,
        s.current_semester,
        d.dept_code,
        d.dept_name,
        ROUND(AVG(m.total_marks)::numeric, 2) AS avg_total_marks,
        ROUND((AVG(m.total_marks) / 100.0) * 100::numeric, 2) AS marks_pct
      FROM student s
      LEFT JOIN department d ON s.dept_id = d.dept_id
      LEFT JOIN enrollment e ON e.student_id = s.student_id
      LEFT JOIN marks m ON m.enrollment_id = e.enrollment_id AND m.exam_type = 'End Semester'
      GROUP BY s.student_id, s.roll_no, s.first_name, s.last_name, s.current_semester, d.dept_code, d.dept_name
      HAVING AVG(m.total_marks) IS NOT NULL
      ORDER BY avg_total_marks DESC
      LIMIT $1
    `;

    // Department toppers
    const deptTopperQuery = `
      WITH ranked AS (
        SELECT
          s.student_id,
          s.roll_no,
          s.first_name,
          s.last_name,
          d.dept_code,
          d.dept_name,
          ROUND(AVG(r.sgpa)::numeric, 2) AS avg_sgpa,
          ROW_NUMBER() OVER (PARTITION BY d.dept_id ORDER BY AVG(r.sgpa) DESC) AS dept_rank
        FROM student s
        LEFT JOIN department d ON s.dept_id = d.dept_id
        LEFT JOIN result r ON r.student_id = s.student_id
        GROUP BY s.student_id, s.roll_no, s.first_name, s.last_name, d.dept_id, d.dept_code, d.dept_name
        HAVING AVG(r.sgpa) IS NOT NULL
      )
      SELECT * FROM ranked WHERE dept_rank = 1 ORDER BY dept_code
    `;

    const [sgpaRes, marksRes, deptTopRes] = await Promise.all([
      db.query(topBySgpaQuery, [limit]),
      db.query(topByMarksQuery, [limit]),
      db.query(deptTopperQuery),
    ]);

    res.json({
      success: true,
      data: {
        top_by_sgpa: sgpaRes.rows,
        top_by_marks: marksRes.rows,
        dept_toppers: deptTopRes.rows,
      },
    });
  } catch (err) {
    console.error('Top performers analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/marks-distribution
 * Returns an aggregate marks distribution for charting.
 */
router.get('/marks-distribution', async (req, res) => {
  try {
    const query = `
      SELECT grade_band, count FROM (
        SELECT
          CASE
            WHEN m.total_marks >= 90 THEN 'Excellent (90-100)'
            WHEN m.total_marks >= 75 THEN 'Distinction (75-89)'
            WHEN m.total_marks >= 60 THEN 'First Class (60-74)'
            WHEN m.total_marks >= 40 THEN 'Pass (40-59)'
            ELSE 'Fail (<40)'
          END AS grade_band,
          CASE
            WHEN m.total_marks >= 90 THEN 1
            WHEN m.total_marks >= 75 THEN 2
            WHEN m.total_marks >= 60 THEN 3
            WHEN m.total_marks >= 40 THEN 4
            ELSE 5
          END AS sort_order,
          COUNT(*) AS count
        FROM marks m
        WHERE m.exam_type = 'End Semester'
        GROUP BY grade_band, sort_order
      ) sub
      ORDER BY sort_order
    `;
    const result = await db.query(query);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Marks distribution error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/student-summary/:studentId
 * Returns a complete academic summary for a single student.
 */
router.get('/student-summary/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const [stuRes, attRes, marksRes, resultsRes] = await Promise.all([
      db.query(`
        SELECT s.*, d.dept_name, d.dept_code, c.course_name
        FROM student s
        LEFT JOIN department d ON s.dept_id = d.dept_id
        LEFT JOIN course c ON s.course_id = c.course_id
        WHERE s.student_id = $1
      `, [studentId]),

      db.query(`
        SELECT
          COUNT(*) AS total_classes,
          COUNT(CASE WHEN is_present THEN 1 END) AS attended_classes,
          ROUND(
            (COUNT(CASE WHEN is_present THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
          2) AS attendance_pct
        FROM attendance a
        JOIN enrollment e ON a.enrollment_id = e.enrollment_id
        WHERE e.student_id = $1
      `, [studentId]),

      db.query(`
        SELECT
          sub.subject_code,
          sub.subject_name,
          ROUND(AVG(m.internal_marks)::numeric, 2) AS avg_internal,
          ROUND(AVG(m.total_marks)::numeric, 2) AS avg_total,
          MAX(m.total_marks) AS best_score
        FROM marks m
        JOIN enrollment e ON m.enrollment_id = e.enrollment_id
        JOIN subject sub ON m.subject_id = sub.subject_id
        WHERE e.student_id = $1
        GROUP BY sub.subject_id, sub.subject_code, sub.subject_name
        ORDER BY sub.subject_code
      `, [studentId]),

      db.query(`
        SELECT r.*, sem.semester_no, sem.academic_year
        FROM result r
        JOIN semester sem ON r.semester_id = sem.semester_id
        WHERE r.student_id = $1
        ORDER BY sem.semester_no
      `, [studentId]),
    ]);

    if (stuRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Student ${studentId} not found` });
    }

    res.json({
      success: true,
      data: {
        student: stuRes.rows[0],
        attendance: attRes.rows[0],
        marks_by_subject: marksRes.rows,
        results: resultsRes.rows,
      },
    });
  } catch (err) {
    console.error('Student summary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/analytics/faculty-summary/:facultyId
 * Returns authorized academic intelligence data scoped to a single faculty member.
 */
router.get('/faculty-summary/:facultyId', async (req, res) => {
  try {
    const facultyId = parseInt(req.params.facultyId, 10);
    if (isNaN(facultyId)) {
      return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
    }

    const [facRes, subRes, statsRes, stuRes] = await Promise.all([
      db.query(`
        SELECT f.*, d.dept_name, d.dept_code, d.building, d.office_location
        FROM faculty f
        LEFT JOIN department d ON f.dept_id = d.dept_id
        WHERE f.faculty_id = $1
      `, [facultyId]),

      db.query(`
        SELECT fs.faculty_subject_id, fs.faculty_id, fs.subject_id, fs.semester_id, fs.section, fs.academic_year,
               fs.status AS assignment_status, s.subject_code, s.subject_name, s.credits, s.subject_type,
               sem.semester_no, c.course_name, c.course_code
        FROM faculty_subject fs
        JOIN subject s ON fs.subject_id = s.subject_id
        JOIN semester sem ON fs.semester_id = sem.semester_id
        LEFT JOIN course c ON s.course_id = c.course_id
        WHERE fs.faculty_id = $1
        ORDER BY sem.semester_no ASC, s.subject_code ASC
      `, [facultyId]),

      db.query(`
        SELECT 
          sub.subject_id,
          sub.subject_code,
          sub.subject_name,
          fs.section,
          COUNT(DISTINCT e.student_id) as enrolled_students,
          ROUND(AVG(m.internal_marks)::numeric, 2) as avg_internal_marks,
          ROUND(AVG((m.internal_marks / 40.0) * 100)::numeric, 1) as avg_internal_pct,
          ROUND(AVG(m.total_marks)::numeric, 2) as avg_total_marks,
          MAX(m.internal_marks) as max_internal_marks,
          MIN(m.internal_marks) as min_internal_marks,
          COUNT(DISTINCT CASE WHEN m.internal_marks < 20 THEN e.student_id END) as low_internal_count,
          ROUND(
            (COUNT(CASE WHEN a.is_present THEN 1 END)::numeric / NULLIF(COUNT(a.attendance_id), 0)) * 100, 
          1) as avg_attendance_pct
        FROM faculty_subject fs
        JOIN subject sub ON fs.subject_id = sub.subject_id
        JOIN enrollment e ON e.semester_id = fs.semester_id AND e.section = fs.section
        LEFT JOIN marks m ON m.enrollment_id = e.enrollment_id AND m.subject_id = sub.subject_id AND m.exam_type = 'Internal'
        LEFT JOIN attendance a ON a.enrollment_id = e.enrollment_id AND a.subject_id = sub.subject_id
        WHERE fs.faculty_id = $1
        GROUP BY sub.subject_id, sub.subject_code, sub.subject_name, fs.section
        ORDER BY sub.subject_code
      `, [facultyId]),

      db.query(`
        SELECT 
          s.student_id, 
          s.roll_no, 
          s.first_name, 
          s.last_name, 
          s.email, 
          s.current_semester,
          e.enrollment_id, 
          e.section,
          sub.subject_id, 
          sub.subject_code, 
          sub.subject_name,
          m.internal_marks,
          m.total_marks,
          ROUND((m.internal_marks / 40.0) * 100, 1) as internal_pct,
          att_stats.total_classes,
          att_stats.attended_classes,
          att_stats.attendance_pct
        FROM faculty_subject fs
        JOIN subject sub ON fs.subject_id = sub.subject_id
        JOIN enrollment e ON e.semester_id = fs.semester_id AND e.section = fs.section
        JOIN student s ON e.student_id = s.student_id
        LEFT JOIN marks m ON m.enrollment_id = e.enrollment_id AND m.subject_id = sub.subject_id AND m.exam_type = 'Internal'
        LEFT JOIN (
          SELECT 
            a.enrollment_id,
            a.subject_id,
            COUNT(*) as total_classes,
            COUNT(CASE WHEN a.is_present THEN 1 END) as attended_classes,
            ROUND((COUNT(CASE WHEN a.is_present THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 1) as attendance_pct
          FROM attendance a
          GROUP BY a.enrollment_id, a.subject_id
        ) att_stats ON att_stats.enrollment_id = e.enrollment_id AND att_stats.subject_id = sub.subject_id
        WHERE fs.faculty_id = $1
        ORDER BY s.roll_no, sub.subject_code
      `, [facultyId])
    ]);

    if (facRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Faculty ${facultyId} not found` });
    }

    res.json({
      success: true,
      data: {
        faculty: facRes.rows[0],
        subjects: subRes.rows,
        subject_stats: statsRes.rows,
        students: stuRes.rows,
      },
    });
  } catch (err) {
    console.error('Faculty summary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
