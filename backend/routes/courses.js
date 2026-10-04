const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/courses - List all courses with department info
router.get('/', async (req, res) => {
  try {
    const { dept_id } = req.query;
    let query = `
      SELECT 
        c.course_id,
        c.dept_id,
        c.course_code,
        c.course_name,
        c.course_type,
        c.degree_level,
        c.duration_years,
        c.total_semesters,
        c.total_credits,
        c.intake_capacity,
        c.eligibility_criteria,
        c.description,
        c.status,
        c.created_at,
        c.updated_at,
        d.dept_name,
        d.dept_code,
        COUNT(DISTINCT s.student_id) AS enrolled_students_count,
        COUNT(DISTINCT sub.subject_id) AS total_subjects_count
      FROM course c
      LEFT JOIN department d ON c.dept_id = d.dept_id
      LEFT JOIN student s ON c.course_id = s.course_id
      LEFT JOIN subject sub ON c.course_id = sub.course_id
      WHERE 1=1
    `;
    const params = [];

    if (dept_id) {
      params.push(parseInt(dept_id, 10));
      query += ` AND c.dept_id = $${params.length}`;
    }

    query += `
      GROUP BY c.course_id, d.dept_name, d.dept_code
      ORDER BY c.course_id ASC;
    `;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
});

module.exports = router;
