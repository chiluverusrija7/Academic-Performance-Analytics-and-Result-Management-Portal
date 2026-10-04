const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/departments - List all departments
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.dept_id,
        d.dept_code,
        d.dept_name,
        d.hod_id,
        d.office_location,
        d.building,
        d.floor_no,
        d.contact_email,
        d.contact_phone,
        d.established_year,
        d.status,
        d.created_at,
        d.updated_at,
        f.first_name AS hod_first_name,
        f.last_name AS hod_last_name,
        f.email AS hod_email,
        COUNT(DISTINCT c.course_id) AS total_courses,
        COUNT(DISTINCT fac.faculty_id) AS total_faculty,
        COUNT(DISTINCT s.student_id) AS total_students
      FROM department d
      LEFT JOIN faculty f ON d.hod_id = f.faculty_id
      LEFT JOIN course c ON d.dept_id = c.dept_id
      LEFT JOIN faculty fac ON d.dept_id = fac.dept_id
      LEFT JOIN student s ON d.dept_id = s.dept_id
      GROUP BY d.dept_id, f.first_name, f.last_name, f.email
      ORDER BY d.dept_id ASC;
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message,
    });
  }
});

module.exports = router;
