const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/enrollments/:studentId - Get enrollment history for a student
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

    const enrollRes = await db.query(
      `SELECT 
        e.enrollment_id,
        e.student_id,
        e.semester_id,
        e.enrollment_date,
        e.registration_number,
        e.section,
        e.attendance_status,
        e.fee_status,
        e.academic_status,
        e.enroll_status,
        e.remarks,
        e.created_at,
        e.updated_at,
        sem.semester_no,
        sem.academic_year,
        sem.term_name,
        sem.start_date AS semester_start_date,
        sem.end_date AS semester_end_date,
        c.course_name,
        c.course_code
       FROM enrollment e
       JOIN semester sem ON e.semester_id = sem.semester_id
       JOIN course c ON sem.course_id = c.course_id
       WHERE e.student_id = $1
       ORDER BY sem.semester_no ASC;`,
      [studentId]
    );

    res.json({
      success: true,
      student: studentCheck.rows[0],
      count: enrollRes.rows.length,
      data: enrollRes.rows,
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment records',
      error: error.message,
    });
  }
});

module.exports = router;
