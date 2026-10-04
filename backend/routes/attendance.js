const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/attendance/:studentId - Get attendance records & analytics for a student
router.get('/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    // Verify student exists
    const studentCheck = await db.query(
      `SELECT student_id, first_name, last_name, roll_no FROM student WHERE student_id = $1`,
      [studentId]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    // Retrieve detailed attendance records
    const attendanceRes = await db.query(
      `SELECT 
        a.attendance_id,
        a.enrollment_id,
        a.subject_id,
        a.faculty_id,
        a.class_date,
        a.period_no,
        a.is_present,
        a.remarks,
        a.recorded_at,
        s.subject_code,
        s.subject_name,
        s.short_name AS subject_short_name,
        s.credits,
        f.first_name AS faculty_first_name,
        f.last_name AS faculty_last_name,
        sem.semester_no,
        sem.academic_year
       FROM attendance a
       JOIN enrollment e ON a.enrollment_id = e.enrollment_id
       JOIN subject s ON a.subject_id = s.subject_id
       LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
       LEFT JOIN semester sem ON e.semester_id = sem.semester_id
       WHERE e.student_id = $1
       ORDER BY a.class_date DESC, a.period_no ASC;`,
      [studentId]
    );

    // Subject-wise summary
    const summaryRes = await db.query(
      `SELECT 
        s.subject_id,
        s.subject_code,
        s.subject_name,
        COUNT(a.attendance_id) AS total_classes,
        COUNT(CASE WHEN a.is_present = true THEN 1 END) AS attended_classes,
        COUNT(CASE WHEN a.is_present = false THEN 1 END) AS missed_classes,
        ROUND(
          (COUNT(CASE WHEN a.is_present = true THEN 1 END)::numeric / NULLIF(COUNT(a.attendance_id), 0)) * 100, 
          2
        ) AS attendance_percentage
       FROM attendance a
       JOIN enrollment e ON a.enrollment_id = e.enrollment_id
       JOIN subject s ON a.subject_id = s.subject_id
       WHERE e.student_id = $1
       GROUP BY s.subject_id, s.subject_code, s.subject_name
       ORDER BY s.subject_code;`,
      [studentId]
    );

    const totalClasses = attendanceRes.rows.length;
    const totalPresent = attendanceRes.rows.filter(r => r.is_present).length;
    const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      student: studentCheck.rows[0],
      stats: {
        total_classes: totalClasses,
        attended_classes: totalPresent,
        missed_classes: totalClasses - totalPresent,
        overall_percentage: parseFloat(overallPercentage),
      },
      subject_summary: summaryRes.rows,
      records: attendanceRes.rows,
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message,
    });
  }
});

// POST /api/attendance - Record/mark new session attendance
router.post('/', async (req, res) => {
  try {
    const { enrollment_id, subject_id, faculty_id, class_date, period_no, is_present, remarks } = req.body;

    if (!enrollment_id || !subject_id || is_present === undefined) {
      return res.status(400).json({
        success: false,
        message: 'enrollment_id, subject_id, and is_present are required',
      });
    }

    const insertQuery = `
      INSERT INTO attendance (
        enrollment_id, subject_id, faculty_id, class_date, period_no, is_present, remarks, recorded_at
      ) VALUES (
        $1, $2, $3, COALESCE($4, CURRENT_DATE), COALESCE($5, 1), $6, $7, NOW()
      )
      ON CONFLICT (enrollment_id, subject_id, class_date, period_no)
      DO UPDATE SET
        is_present = EXCLUDED.is_present,
        faculty_id = COALESCE(EXCLUDED.faculty_id, attendance.faculty_id),
        remarks = COALESCE(EXCLUDED.remarks, attendance.remarks),
        recorded_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(insertQuery, [
      enrollment_id, subject_id, faculty_id || null, class_date || null,
      period_no || null, is_present, remarks || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attendance',
      error: error.message,
    });
  }
});

module.exports = router;
