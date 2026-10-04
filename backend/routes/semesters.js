const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/semesters - List all semesters
router.get('/', async (req, res) => {
  try {
    const { course_id, academic_year, status } = req.query;
    let query = `
      SELECT 
        sem.semester_id,
        sem.course_id,
        sem.semester_no,
        sem.academic_year,
        sem.term_name,
        sem.start_date,
        sem.end_date,
        sem.registration_start,
        sem.registration_end,
        sem.exam_start_date,
        sem.exam_end_date,
        sem.result_publish_date,
        sem.status,
        sem.created_at,
        c.course_name,
        c.course_code,
        d.dept_name,
        d.dept_code,
        COUNT(DISTINCT e.enrollment_id) AS enrolled_students_count
      FROM semester sem
      JOIN course c ON sem.course_id = c.course_id
      LEFT JOIN department d ON c.dept_id = d.dept_id
      LEFT JOIN enrollment e ON sem.semester_id = e.semester_id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      params.push(parseInt(course_id, 10));
      query += ` AND sem.course_id = $${params.length}`;
    }
    if (academic_year) {
      params.push(academic_year);
      query += ` AND sem.academic_year = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND sem.status = $${params.length}`;
    }

    query += `
      GROUP BY sem.semester_id, c.course_name, c.course_code, d.dept_name, d.dept_code
      ORDER BY sem.course_id ASC, sem.semester_no ASC;
    `;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch semesters',
      error: error.message,
    });
  }
});

module.exports = router;
