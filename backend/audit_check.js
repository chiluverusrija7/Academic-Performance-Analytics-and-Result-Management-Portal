const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ host: 'localhost', port: 5432, database: 'EduInsight', user: 'postgres', password: '12345' });

(async () => {
  try {
    // Check if student 1 was actually deleted
    const s = await pool.query('SELECT student_id, roll_no, first_name FROM student WHERE student_id = 1');
    console.log('Student 1 exists?', s.rows.length > 0 ? `YES - ${s.rows[0].roll_no} (${s.rows[0].first_name})` : 'DELETED!');

    // Count all students
    const mx = await pool.query('SELECT COUNT(*) as count, MAX(student_id) as max_id FROM student');
    console.log('Total students:', mx.rows[0].count, ', max student_id:', mx.rows[0].max_id);

    // Check FK delete rules on tables that reference student
    const fkQuery = `
      SELECT 
        tc.table_name AS child_table,
        kcu.column_name AS child_column,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints rc 
        ON tc.constraint_name = rc.constraint_name 
        AND tc.table_schema = rc.constraint_schema
      JOIN information_schema.constraint_column_usage ccu 
        ON rc.unique_constraint_name = ccu.constraint_name 
        AND rc.unique_constraint_schema = ccu.constraint_schema
      WHERE ccu.table_name = 'student'
      AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `;
    const fkRes = await pool.query(fkQuery);
    console.log('\nFK constraints referencing student table:');
    fkRes.rows.forEach(r => console.log(`  ${r.child_table}.${r.child_column} -> DELETE RULE: ${r.delete_rule}`));

    // Check enrollment records for student_id 1
    const enr = await pool.query('SELECT COUNT(*) as cnt FROM enrollment WHERE student_id = 1');
    console.log('\nEnrollments for student_id=1:', enr.rows[0].cnt);

    // Check if test student (from earlier CRUD pass) is gone
    const tst = await pool.query("SELECT student_id, roll_no FROM student WHERE roll_no LIKE '%TEST%' OR roll_no LIKE '%AUDIT%' ORDER BY student_id DESC LIMIT 5");
    console.log('\nTest students in DB:', tst.rows);

  } catch (e) {
    console.error('Error:', e.message);
  }
  await pool.end();
})();
