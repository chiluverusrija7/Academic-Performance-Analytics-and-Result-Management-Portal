const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('schema_inspection_raw.json', 'utf8'));
const { pool } = require('./config/db');

async function checkMore() {
  const client = await pool.connect();
  const allUsers = await client.query(`SELECT user_id, username, password_hash, role, name, faculty_id FROM users;`);
  console.log('All Users:', allUsers.rows);

  const roles = await client.query(`SELECT DISTINCT role, COUNT(*) FROM users GROUP BY role;`);
  console.log('\nUsers role breakdown:', roles.rows);

  const depts = await client.query(`SELECT dept_id, dept_code, dept_name FROM department;`);
  console.log('\nDepartments:', depts.rows);

  const courses = await client.query(`SELECT course_id, dept_id, course_code, course_name FROM course;`);
  console.log('\nCourses:', courses.rows);

  const semesters = await client.query(`SELECT semester_id, course_id, semester_no, semester_name, academic_year FROM semester;`);
  console.log('\nSemesters:', semesters.rows);

  const exams = await client.query(`SELECT exam_id, semester_id, exam_name, exam_type, academic_year FROM exam;`);
  console.log('\nExams:', exams.rows);

  client.release();
  await pool.end();
}
checkMore();
