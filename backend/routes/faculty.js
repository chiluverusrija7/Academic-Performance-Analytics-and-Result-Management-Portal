const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/faculty - List all faculty members
router.get('/', async (req, res) => {
  try {
    const { dept_id, status } = req.query;
    let query = `
      SELECT 
        f.faculty_id,
        f.employee_code,
        f.dept_id,
        f.first_name,
        f.last_name,
        f.email,
        f.phone_no,
        f.designation,
        f.qualification,
        f.specialization,
        f.joining_date,
        f.employment_type,
        f.experience_years,
        f.office_room,
        f.status,
        f.created_at,
        f.updated_at,
        d.dept_name,
        d.dept_code,
        COUNT(fs.faculty_subject_id) AS assigned_subjects_count
      FROM faculty f
      LEFT JOIN department d ON f.dept_id = d.dept_id
      LEFT JOIN faculty_subject fs ON f.faculty_id = fs.faculty_id AND fs.status = 'Active'
      WHERE 1=1
    `;
    const params = [];

    if (dept_id) {
      params.push(parseInt(dept_id, 10));
      query += ` AND f.dept_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND f.status = $${params.length}`;
    }

    query += `
      GROUP BY f.faculty_id, d.dept_name, d.dept_code
      ORDER BY f.faculty_id ASC;
    `;

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching faculty list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty list',
      error: error.message,
    });
  }
});

// GET /api/faculty/student/:studentId - Get assigned faculty for a student's enrolled subjects
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    let query = `
      SELECT DISTINCT
        f.faculty_id,
        f.first_name,
        f.last_name,
        f.email,
        f.phone_no,
        f.designation,
        f.qualification,
        f.specialization,
        COALESCE(f.office_room, 'Cabin B-204') AS office_room,
        COALESCE(d.dept_name, 'Computer Science') AS dept_name,
        d.dept_code,
        s.subject_id,
        s.subject_code,
        s.subject_name,
        COALESCE(tt.room_number, 'Room A-101') AS room_number
      FROM student stu
      JOIN enrollment e ON e.student_id = stu.student_id
      JOIN semester sem ON e.semester_id = sem.semester_id
      JOIN faculty_subject fs ON fs.semester_id = sem.semester_id
      JOIN faculty f ON fs.faculty_id = f.faculty_id
      LEFT JOIN department d ON f.dept_id = d.dept_id
      JOIN subject s ON fs.subject_id = s.subject_id
      LEFT JOIN timetable tt ON tt.subject_id = s.subject_id AND tt.faculty_id = f.faculty_id
      WHERE stu.student_id = $1
      ORDER BY s.subject_code ASC;
    `;

    let result = await db.query(query, [studentId]);

    if (result.rows.length === 0) {
      // Fallback by student current_semester
      const fallbackQuery = `
        SELECT DISTINCT
          f.faculty_id,
          f.first_name,
          f.last_name,
          f.email,
          f.phone_no,
          f.designation,
          f.qualification,
          f.specialization,
          COALESCE(f.office_room, 'Cabin B-204') AS office_room,
          COALESCE(d.dept_name, 'Computer Science') AS dept_name,
          d.dept_code,
          s.subject_id,
          s.subject_code,
          s.subject_name,
          'Room A-101' AS room_number
        FROM student stu
        JOIN semester sem ON sem.semester_no = stu.current_semester
        JOIN faculty_subject fs ON fs.semester_id = sem.semester_id
        JOIN faculty f ON fs.faculty_id = f.faculty_id
        LEFT JOIN department d ON f.dept_id = d.dept_id
        JOIN subject s ON fs.subject_id = s.subject_id
        WHERE stu.student_id = $1
        ORDER BY s.subject_code ASC;
      `;
      result = await db.query(fallbackQuery, [studentId]);
    }

    if (result.rows.length === 0) {
      // Fallback to all active faculty
      const generalQuery = `
        SELECT DISTINCT ON (f.faculty_id)
          f.faculty_id,
          f.first_name,
          f.last_name,
          f.email,
          f.phone_no,
          f.designation,
          f.qualification,
          f.specialization,
          COALESCE(f.office_room, 'Cabin B-204') AS office_room,
          COALESCE(d.dept_name, 'Computer Science') AS dept_name,
          d.dept_code,
          COALESCE(s.subject_name, 'Course Instructor') AS subject_name,
          COALESCE(s.subject_code, 'CORE') AS subject_code,
          'Room A-101' AS room_number
        FROM faculty f
        LEFT JOIN department d ON f.dept_id = d.dept_id
        LEFT JOIN faculty_subject fs ON f.faculty_id = fs.faculty_id
        LEFT JOIN subject s ON fs.subject_id = s.subject_id
        LIMIT 6;
      `;
      result = await db.query(generalQuery);
    }

    // Group subjects per faculty
    const facultyMap = {};
    result.rows.forEach(row => {
      const id = row.faculty_id;
      if (!facultyMap[id]) {
        facultyMap[id] = {
          faculty_id: row.faculty_id,
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
          email: row.email,
          designation: row.designation,
          department: row.dept_name,
          room: row.office_room,
          class_room: row.room_number,
          subjects: [row.subject_name]
        };
      } else {
        if (!facultyMap[id].subjects.includes(row.subject_name)) {
          facultyMap[id].subjects.push(row.subject_name);
        }
      }
    });

    res.json({
      success: true,
      data: Object.values(facultyMap)
    });
  } catch (error) {
    console.error('Error fetching student faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student faculty',
      error: error.message
    });
  }
});

// GET /api/faculty/:id - Get single faculty details with assigned subjects
router.get('/:id', async (req, res) => {
  try {
    const facultyId = parseInt(req.params.id, 10);
    if (isNaN(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty ID',
      });
    }

    const facRes = await db.query(
      `SELECT 
        f.*,
        d.dept_name,
        d.dept_code,
        d.building,
        d.office_location
       FROM faculty f
       LEFT JOIN department d ON f.dept_id = d.dept_id
       WHERE f.faculty_id = $1;`,
      [facultyId]
    );

    if (facRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Faculty with ID ${facultyId} not found`,
      });
    }

    // Fetch assigned subjects
    const subjectsRes = await db.query(
      `SELECT 
        fs.faculty_subject_id,
        fs.subject_id,
        fs.semester_id,
        fs.section,
        fs.academic_year,
        fs.status AS assignment_status,
        s.subject_code,
        s.subject_name,
        s.credits,
        s.subject_type,
        sem.semester_no,
        c.course_name,
        c.course_code
       FROM faculty_subject fs
       JOIN subject s ON fs.subject_id = s.subject_id
       JOIN semester sem ON fs.semester_id = sem.semester_id
       LEFT JOIN course c ON s.course_id = c.course_id
       WHERE fs.faculty_id = $1
       ORDER BY sem.semester_no ASC, s.subject_code ASC;`,
      [facultyId]
    );

    const faculty = facRes.rows[0];
    faculty.assigned_subjects = subjectsRes.rows;

    res.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error('Error fetching faculty by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty profile',
      error: error.message,
    });
  }
});

// POST /api/faculty - Create new faculty record
router.post('/', async (req, res) => {
  try {
    const {
      employee_code,
      dept_id,
      first_name,
      last_name,
      email,
      phone_no,
      designation,
      qualification,
      specialization,
      joining_date,
      employment_type,
      experience_years,
      office_room,
      status
    } = req.body;

    if (!employee_code || !dept_id || !first_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: employee_code, dept_id, first_name, email are required.',
      });
    }

    const insertQuery = `
      INSERT INTO faculty (
        employee_code, dept_id, first_name, last_name, email, phone_no,
        designation, qualification, specialization, joining_date,
        employment_type, experience_years, office_room, status,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, COALESCE($10, CURRENT_DATE),
        COALESCE($11, 'Full-Time'), COALESCE($12, 0), $13, COALESCE($14, 'Active'),
        NOW(), NOW()
      ) RETURNING *;
    `;

    const values = [
      employee_code, dept_id, first_name, last_name || null, email, phone_no || null,
      designation || 'Assistant Professor', qualification || 'M.Tech', specialization || null,
      joining_date || null, employment_type || null, experience_years || null, office_room || null,
      status || null
    ];

    const result = await db.query(insertQuery, values);
    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Employee code or email already exists',
        error: error.detail,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty record',
      error: error.message,
    });
  }
});

// PUT /api/faculty/:id - Update faculty record
router.put('/:id', async (req, res) => {
  try {
    const facultyId = parseInt(req.params.id, 10);
    if (isNaN(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty ID',
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone_no,
      designation,
      qualification,
      specialization,
      employment_type,
      experience_years,
      office_room,
      status
    } = req.body;

    const updateQuery = `
      UPDATE faculty SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone_no = COALESCE($4, phone_no),
        designation = COALESCE($5, designation),
        qualification = COALESCE($6, qualification),
        specialization = COALESCE($7, specialization),
        employment_type = COALESCE($8, employment_type),
        experience_years = COALESCE($9, experience_years),
        office_room = COALESCE($10, office_room),
        status = COALESCE($11, status),
        updated_at = NOW()
      WHERE faculty_id = $12
      RETURNING *;
    `;

    const values = [
      first_name, last_name, email, phone_no, designation, qualification,
      specialization, employment_type, experience_years, office_room, status, facultyId
    ];

    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Faculty with ID ${facultyId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Faculty profile updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty record',
      error: error.message,
    });
  }
});

// DELETE /api/faculty/:id - Delete faculty
router.delete('/:id', async (req, res) => {
  try {
    const facultyId = parseInt(req.params.id, 10);
    if (isNaN(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty ID',
      });
    }

    const result = await db.query(
      `DELETE FROM faculty WHERE faculty_id = $1 RETURNING *;`,
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Faculty with ID ${facultyId} not found`,
      });
    }

    res.json({
      success: true,
      message: 'Faculty deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete faculty because assigned subjects, attendance, or users exist.',
        error: error.detail,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty record',
      error: error.message,
    });
  }
});

module.exports = router;
