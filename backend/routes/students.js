const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/students - List all students with filters
router.get('/', async (req, res) => {
  try {
    const { dept_id, course_id, semester, search } = req.query;
    let query = `
      SELECT 
        s.student_id,
        s.roll_no,
        s.reg_no,
        s.dept_id,
        s.course_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.date_of_birth,
        s.gender,
        s.blood_group,
        s.email,
        s.alternate_email,
        s.phone_no,
        s.alternate_phone,
        s.address,
        s.city,
        s.state,
        s.pincode,
        s.admission_year,
        s.admission_date,
        s.current_semester,
        s.section,
        s.admission_type,
        s.category,
        s.nationality,
        s.guardian_name,
        s.guardian_relation,
        s.guardian_phone,
        s.guardian_email,
        s.status,
        s.created_at,
        s.updated_at,
        d.dept_name,
        d.dept_code,
        c.course_name,
        c.course_code
      FROM student s
      LEFT JOIN department d ON s.dept_id = d.dept_id
      LEFT JOIN course c ON s.course_id = c.course_id
      WHERE 1=1
    `;
    const params = [];

    if (dept_id) {
      params.push(parseInt(dept_id, 10));
      query += ` AND s.dept_id = $${params.length}`;
    }
    if (course_id) {
      params.push(parseInt(course_id, 10));
      query += ` AND s.course_id = $${params.length}`;
    }
    if (semester) {
      params.push(parseInt(semester, 10));
      query += ` AND s.current_semester = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.roll_no ILIKE $${params.length} OR s.reg_no ILIKE $${params.length} OR s.email ILIKE $${params.length})`;
    }

    query += ` ORDER BY s.student_id ASC;`;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
});

// GET /api/students/:id - Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    const studentRes = await db.query(
      `SELECT 
        s.*,
        d.dept_name,
        d.dept_code,
        c.course_name,
        c.course_code
       FROM student s
       LEFT JOIN department d ON s.dept_id = d.dept_id
       LEFT JOIN course c ON s.course_id = c.course_id
       WHERE s.student_id = $1;`,
      [studentId]
    );

    if (studentRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    // Also fetch admission info if available
    const admissionRes = await db.query(
      `SELECT * FROM admission WHERE student_id = $1;`,
      [studentId]
    );

    const student = studentRes.rows[0];
    student.admission = admissionRes.rows[0] || null;

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: error.message,
    });
  }
});

// POST /api/students - Insert a new student
router.post('/', async (req, res) => {
  try {
    const {
      roll_no,
      reg_no,
      dept_id,
      course_id,
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      email,
      alternate_email,
      phone_no,
      alternate_phone,
      address,
      city,
      state,
      pincode,
      admission_year,
      admission_date,
      current_semester,
      section,
      admission_type,
      category,
      nationality,
      guardian_name,
      guardian_relation,
      guardian_phone,
      guardian_email,
      status
    } = req.body;

    // Required fields validation
    if (!roll_no || !reg_no || !dept_id || !course_id || !first_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: roll_no, reg_no, dept_id, course_id, and first_name are mandatory.',
      });
    }

    const insertQuery = `
      INSERT INTO student (
        roll_no, reg_no, dept_id, course_id, first_name, middle_name, last_name,
        date_of_birth, gender, blood_group, email, alternate_email, phone_no,
        alternate_phone, address, city, state, pincode, admission_year,
        admission_date, current_semester, section, admission_type, category,
        nationality, guardian_name, guardian_relation, guardian_phone,
        guardian_email, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        COALESCE($25, 'Indian'), $26, $27, $28,
        $29, COALESCE($30, 'Active'), NOW(), NOW()
      ) RETURNING *;
    `;

    const values = [
      roll_no, reg_no, dept_id, course_id, first_name, middle_name || null, last_name || null,
      date_of_birth || null, gender || null, blood_group || null, email || null, alternate_email || null, phone_no || null,
      alternate_phone || null, address || null, city || null, state || null, pincode || null, admission_year || null,
      admission_date || null, current_semester || null, section || null, admission_type || null, category || null,
      nationality || null, guardian_name || null, guardian_relation || null, guardian_phone || null,
      guardian_email || null, status || null
    ];

    const result = await db.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Duplicate value violates unique constraint (roll_no, reg_no, or email already exists)',
        error: error.detail,
      });
    }
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Invalid department or course ID referenced',
        error: error.detail,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
});

// PUT /api/students/:id - Update student record
router.put('/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    const {
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      gender,
      blood_group,
      email,
      alternate_email,
      phone_no,
      alternate_phone,
      address,
      city,
      state,
      pincode,
      current_semester,
      section,
      category,
      guardian_name,
      guardian_relation,
      guardian_phone,
      guardian_email,
      status
    } = req.body;

    const updateQuery = `
      UPDATE student SET
        first_name = COALESCE($1, first_name),
        middle_name = COALESCE($2, middle_name),
        last_name = COALESCE($3, last_name),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        blood_group = COALESCE($6, blood_group),
        email = COALESCE($7, email),
        alternate_email = COALESCE($8, alternate_email),
        phone_no = COALESCE($9, phone_no),
        alternate_phone = COALESCE($10, alternate_phone),
        address = COALESCE($11, address),
        city = COALESCE($12, city),
        state = COALESCE($13, state),
        pincode = COALESCE($14, pincode),
        current_semester = COALESCE($15, current_semester),
        section = COALESCE($16, section),
        category = COALESCE($17, category),
        guardian_name = COALESCE($18, guardian_name),
        guardian_relation = COALESCE($19, guardian_relation),
        guardian_phone = COALESCE($20, guardian_phone),
        guardian_email = COALESCE($21, guardian_email),
        status = COALESCE($22, status),
        updated_at = NOW()
      WHERE student_id = $23
      RETURNING *;
    `;

    const values = [
      first_name, middle_name, last_name, date_of_birth, gender, blood_group,
      email, alternate_email, phone_no, alternate_phone, address, city, state, pincode,
      current_semester, section, category, guardian_name, guardian_relation,
      guardian_phone, guardian_email, status, studentId
    ];

    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);
    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID',
      });
    }

    const result = await db.query(
      `DELETE FROM student WHERE student_id = $1 RETURNING *;`,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${studentId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    if (error.code === '23503') { // Foreign key constraint prevents delete
      return res.status(409).json({
        success: false,
        message: 'Cannot delete student because related records exist in admissions, enrollments, fees, or results.',
        error: error.detail,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
});

module.exports = router;
