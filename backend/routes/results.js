const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/results/:studentId - Get semester results for a student
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
      `SELECT student_id, first_name, last_name, roll_no, current_semester 
       FROM student WHERE student_id = $1`,
      [studentId]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    const resultsRes = await db.query(
      `SELECT 
        r.result_id,
        r.student_id,
        r.semester_id,
        r.total_credits,
        r.earned_credits,
        r.total_marks,
        r.percentage,
        r.sgpa,
        r.cgpa,
        r.backlogs,
        r.result_classification,
        r.result_status,
        r.published_date,
        r.remarks,
        r.created_at,
        sem.semester_no,
        sem.academic_year,
        sem.term_name,
        u.name AS published_by_name
       FROM result r
       JOIN semester sem ON r.semester_id = sem.semester_id
       LEFT JOIN users u ON r.published_by = u.user_id
       WHERE r.student_id = $1
       ORDER BY sem.semester_no ASC;`,
      [studentId]
    );

    res.json({
      success: true,
      student: studentCheck.rows[0],
      count: resultsRes.rows.length,
      data: resultsRes.rows,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student results',
      error: error.message,
    });
  }
});

module.exports = router;
