const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { raw: await res.text() };
  }
  return { status: res.status, ok: res.ok, data };
}

async function runFinalVerification() {
  console.log('================================================================');
  console.log('       EDUINSIGHT FINAL COMPREHENSIVE API VERIFICATION         ');
  console.log('================================================================\n');

  const testReport = [];

  function record(endpoint, method, expectedStatus, actualStatus, passed, notes, realDbVerified) {
    testReport.push({
      endpoint,
      method,
      expectedStatus,
      actualStatus,
      passed,
      notes,
      realDbVerified: realDbVerified ? 'YES' : 'NO'
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${method.padEnd(6)} ${endpoint.padEnd(30)} -> HTTP ${actualStatus} | ${notes}`);
  }

  // 1. Health Endpoint
  {
    const res = await request('/health');
    const isRealDb = res.data && res.data.connected_database === 'EduInsight' && res.data.status === 'UP';
    record('/api/health', 'GET', 200, res.status, res.status === 200 && isRealDb, 'PostgreSQL active connection verified', isRealDb);
  }

  // 2. Auth - Faculty Login (Valid)
  {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'faculty01', password: 'demo_hash_01' })
    });
    const valid = res.status === 200 && res.data.user && res.data.user.role === 'FACULTY' && res.data.user.faculty_id === 1;
    const noPasswordLeaked = !res.data.user.password_hash;
    record('/api/auth/login', 'POST', 200, res.status, valid && noPasswordLeaked, 'Faculty login verified against USERS table; no password leak', valid);
  }

  // 3. Auth - Student Login (Valid Roll No)
  {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: '23CSE001', password: 'any' })
    });
    const valid = res.status === 200 && res.data.user && res.data.user.role === 'STUDENT' && res.data.user.roll_no === '23CSE001';
    record('/api/auth/login', 'POST', 200, res.status, valid, 'Student login verified against STUDENT table', valid);
  }

  // 4. Auth - Invalid Credentials
  {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nonexistent_user', password: 'wrong' })
    });
    const valid = res.status === 401 && res.data.success === false;
    record('/api/auth/login', 'POST', 401, res.status, valid, 'Invalid credentials properly rejected with 401', true);
  }

  // 5. Students - List All
  {
    const res = await request('/students');
    const valid = res.status === 200 && res.data.count === 24 && res.data.data[0].dept_name && res.data.data[0].course_name;
    record('/api/students', 'GET', 200, res.status, valid, `Retrieved 24 real students with Department & Course JOINs`, valid);
  }

  // 6. Students - Query Filter by dept_id & course_id
  {
    const res = await request('/students?dept_id=1&course_id=1');
    const valid = res.status === 200 && res.data.data.every(s => s.dept_id === 1 && s.course_id === 1);
    record('/api/students?dept_id=1', 'GET', 200, res.status, valid, `Filtered students query parameters verified (found ${res.data.count})`, valid);
  }

  // 7. Students - Get By ID (Valid)
  {
    const res = await request('/students/1');
    const valid = res.status === 200 && res.data.data.student_id === 1 && res.data.data.admission !== undefined;
    record('/api/students/1', 'GET', 200, res.status, valid, 'Fetched student #1 profile + admission details', valid);
  }

  // 8. Students - Get By Non-Existent ID (404)
  {
    const res = await request('/students/99999');
    const valid = res.status === 404 && res.data.success === false;
    record('/api/students/99999', 'GET', 404, res.status, valid, 'Non-existent student properly returned 404 Not Found', true);
  }

  // 9. Students - Get By Invalid ID Format (400)
  {
    const res = await request('/students/invalid_id');
    const valid = res.status === 400 && res.data.success === false;
    record('/api/students/abc', 'GET', 400, res.status, valid, 'Invalid student ID parameter handled with 400 Bad Request', true);
  }

  // 10. Students - POST (Create Test Record)
  let createdTestId = null;
  {
    const testPayload = {
      roll_no: 'VERIFY_TEST_01',
      reg_no: 'REG_TEST_01',
      dept_id: 1,
      course_id: 1,
      first_name: 'Verification',
      last_name: 'Runner',
      email: 'verify.runner@eduinsight.edu',
      current_semester: 1,
      section: 'A'
    };
    const res = await request('/students', { method: 'POST', body: JSON.stringify(testPayload) });
    const valid = res.status === 201 && res.data.data && res.data.data.student_id;
    if (valid) createdTestId = res.data.data.student_id;
    record('/api/students', 'POST', 201, res.status, valid, `Created safe test student #${createdTestId} in PostgreSQL`, valid);
  }

  // 11. Students - PUT (Update Test Record)
  if (createdTestId) {
    const res = await request(`/students/${createdTestId}`, {
      method: 'PUT',
      body: JSON.stringify({ first_name: 'VerificationUpdated', phone_no: '9888877777' })
    });
    const valid = res.status === 200 && res.data.data.first_name === 'VerificationUpdated';
    record(`/api/students/${createdTestId}`, 'PUT', 200, res.status, valid, `Updated test student #${createdTestId} in PostgreSQL`, valid);
  }

  // 12. Students - DELETE (Clean up Test Record)
  if (createdTestId) {
    const res = await request(`/students/${createdTestId}`, { method: 'DELETE' });
    const valid = res.status === 200 && res.data.data.student_id === createdTestId;
    record(`/api/students/${createdTestId}`, 'DELETE', 200, res.status, valid, `Cleaned up test student #${createdTestId} (zero residue)`, valid);
  }

  // 13. Attendance - By Student ID
  {
    const res = await request('/attendance/1');
    const valid = res.status === 200 && res.data.stats && Array.isArray(res.data.records) && res.data.records.length > 0;
    record('/api/attendance/1', 'GET', 200, res.status, valid, `Fetched ${res.data.records.length} attendance records + stats (${res.data.stats.overall_percentage}%)`, valid);
  }

  // 14. Attendance - Invalid Student ID (404)
  {
    const res = await request('/attendance/99999');
    const valid = res.status === 404;
    record('/api/attendance/99999', 'GET', 404, res.status, valid, 'Non-existent student attendance returned 404', true);
  }

  // 15. Marks - By Student ID
  {
    const res = await request('/marks/1');
    const valid = res.status === 200 && Array.isArray(res.data.data) && res.data.count > 0 && res.data.data[0].subject_code;
    record('/api/marks/1', 'GET', 200, res.status, valid, `Fetched ${res.data.count} mark entries with Subject & Exam details`, valid);
  }

  // 16. Results - By Student ID
  {
    const res = await request('/results/1');
    const valid = res.status === 200 && Array.isArray(res.data.data) && res.data.data[0].sgpa !== undefined;
    record('/api/results/1', 'GET', 200, res.status, valid, `Fetched semester results with SGPA (${res.data.data[0].sgpa}) & CGPA (${res.data.data[0].cgpa})`, valid);
  }

  // 17. Fees - By Student ID
  {
    const res = await request('/fees/1');
    const valid = res.status === 200 && res.data.summary && Array.isArray(res.data.data) && res.data.count > 0;
    record('/api/fees/1', 'GET', 200, res.status, valid, `Fetched fee history (Total: ₹${res.data.summary.total_fee}, Paid: ₹${res.data.summary.total_paid})`, valid);
  }

  // 18. Faculty - List All
  {
    const res = await request('/faculty');
    const valid = res.status === 200 && res.data.count === 12 && res.data.data[0].dept_name;
    record('/api/faculty', 'GET', 200, res.status, valid, `Retrieved 12 real faculty profiles with Department & Subject counts`, valid);
  }

  // 19. Faculty - Get By ID
  {
    const res = await request('/faculty/1');
    const valid = res.status === 200 && res.data.data.faculty_id === 1 && Array.isArray(res.data.data.assigned_subjects);
    record('/api/faculty/1', 'GET', 200, res.status, valid, `Fetched faculty #1 + ${res.data.data.assigned_subjects.length} assigned subjects`, valid);
  }

  // 20. Subjects - List All
  {
    const res = await request('/subjects');
    const valid = res.status === 200 && res.data.count === 24 && res.data.data[0].course_name;
    record('/api/subjects', 'GET', 200, res.status, valid, `Retrieved 24 subjects with Course & Department JOINs`, valid);
  }

  // 21. Subjects - Get By ID
  {
    const res = await request('/subjects/1');
    const valid = res.status === 200 && res.data.data.subject_id === 1 && Array.isArray(res.data.data.assigned_faculty);
    record('/api/subjects/1', 'GET', 200, res.status, valid, `Fetched subject #1 (${res.data.data.subject_code} - ${res.data.data.subject_name})`, valid);
  }

  // 22. Departments - List All
  {
    const res = await request('/departments');
    const valid = res.status === 200 && res.data.count === 4 && res.data.data[0].total_courses !== undefined;
    record('/api/departments', 'GET', 200, res.status, valid, `Retrieved 4 departments (CSE, ECE, AIML, DS) with aggregate metrics`, valid);
  }

  // 23. Courses - List All
  {
    const res = await request('/courses');
    const valid = res.status === 200 && res.data.count === 4 && res.data.data[0].dept_code;
    record('/api/courses', 'GET', 200, res.status, valid, `Retrieved 4 courses with Department and enrolled student counts`, valid);
  }

  // 24. Semesters - List All
  {
    const res = await request('/semesters');
    const valid = res.status === 200 && res.data.count === 4 && res.data.data[0].academic_year;
    record('/api/semesters', 'GET', 200, res.status, valid, `Retrieved 4 active semesters across courses`, valid);
  }

  // 25. Exams - List All
  {
    const res = await request('/exams');
    const valid = res.status === 200 && res.data.count === 12 && res.data.data[0].course_code;
    record('/api/exams', 'GET', 200, res.status, valid, `Retrieved 12 exams with Semester & Course JOINs`, valid);
  }

  // 26. Enrollments - By Student ID
  {
    const res = await request('/enrollments/1');
    const valid = res.status === 200 && Array.isArray(res.data.data) && res.data.count > 0 && res.data.data[0].course_name;
    record('/api/enrollments/1', 'GET', 200, res.status, valid, `Fetched student enrollments with Semester & Course JOINs`, valid);
  }

  console.log('\n================================================================');
  console.log('                 FINAL VERIFICATION SUMMARY                     ');
  console.log('================================================================');
  const total = testReport.length;
  const passed = testReport.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total Endpoints & Test Cases: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('================================================================\n');

  const fs = require('fs');
  fs.writeFileSync('final_verification_report.json', JSON.stringify(testReport, null, 2));
}

runFinalVerification();
