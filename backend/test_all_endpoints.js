const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${url}`, options);
    const data = await res.json();
    const passed = res.status === expectedStatus && data.success !== false;

    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} -> ${method} ${url} (Status: ${res.status})`);
    if (!passed) {
      console.log('   Error details:', data);
    }
    return { name, method, url, status: res.status, passed, data };
  } catch (err) {
    console.log(`[FAIL] ${name} -> ${method} ${url} (Exception: ${err.message})`);
    return { name, method, url, status: 0, passed: false, error: err.message };
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('   STARTING REST API SUITE & FUNCTIONALITY PASS');
  console.log('====================================================\n');

  const results = [];

  // 1. Health
  results.push(await testEndpoint('Health Check', 'GET', '/health'));

  // 2. Auth - Admin Login
  results.push(await testEndpoint(
    'Auth: Admin Login',
    'POST',
    '/auth/login',
    { username: 'admin', password: 'admin123' },
    200
  ));

  // 3. Auth - Faculty Login
  results.push(await testEndpoint(
    'Auth: Faculty Login',
    'POST',
    '/auth/login',
    { username: 'faculty01', password: 'demo_hash_01' },
    200
  ));

  // 4. Auth - Student Login
  results.push(await testEndpoint(
    'Auth: Student Login (Roll No)',
    'POST',
    '/auth/login',
    { username: '23CSE001', password: 'any' },
    200
  ));

  // 5. Auth - Invalid Credentials
  const invRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'faculty01', password: 'wrongpassword' }),
  });
  console.log(`[${invRes.status === 401 ? 'PASS' : 'FAIL'}] Auth: Invalid Login -> POST /auth/login (Status: ${invRes.status})`);
  results.push({
    name: 'Auth: Invalid Login Rejection',
    method: 'POST',
    url: '/auth/login',
    status: invRes.status,
    passed: invRes.status === 401,
  });

  // 6. Auth - Empty Credentials
  const empRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '', password: '' }),
  });
  console.log(`[${empRes.status === 400 ? 'PASS' : 'FAIL'}] Auth: Empty Login Rejection -> POST /auth/login (Status: ${empRes.status})`);
  results.push({
    name: 'Auth: Empty Login Rejection',
    method: 'POST',
    url: '/auth/login',
    status: empRes.status,
    passed: empRes.status === 400,
  });

  // 7. Students - List All
  results.push(await testEndpoint('Students: List All', 'GET', '/students'));

  // 8. Students - Get Student #1
  results.push(await testEndpoint('Students: Get Student #1', 'GET', '/students/1'));

  // 9. Students - Search Filter
  results.push(await testEndpoint('Students: Search Query', 'GET', '/students?search=Aarav'));

  // 10. Students - CRUD: Create Test Student
  const testStudentPayload = {
    roll_no: 'TEST_ROLL_999',
    reg_no: 'TEST_REG_999',
    dept_id: 1,
    course_id: 1,
    first_name: 'TestStudent',
    last_name: 'Verification',
    email: 'test.verification999@eduinsight.edu',
    gender: 'Other',
    current_semester: 1,
    section: 'T',
    status: 'Active',
  };
  const createRes = await testEndpoint(
    'Students: Create (POST)',
    'POST',
    '/students',
    testStudentPayload,
    201
  );
  results.push(createRes);

  let newStudentId = null;
  if (createRes.passed && createRes.data && createRes.data.data) {
    newStudentId = createRes.data.data.student_id;
  }

  // 11. Students - CRUD: Update Test Student
  if (newStudentId) {
    results.push(await testEndpoint(
      `Students: Update Student #${newStudentId} (PUT)`,
      'PUT',
      `/students/${newStudentId}`,
      { first_name: 'UpdatedName', phone_no: '9998887776' },
      200
    ));

    // 12. Students - CRUD: Delete Test Student
    results.push(await testEndpoint(
      `Students: Delete Student #${newStudentId} (DELETE)`,
      'DELETE',
      `/students/${newStudentId}`,
      null,
      200
    ));
  }

  // 13. Faculty - List All
  results.push(await testEndpoint('Faculty: List All', 'GET', '/faculty'));

  // 14. Faculty - By ID
  results.push(await testEndpoint('Faculty: Get Faculty #1', 'GET', '/faculty/1'));

  // 15. Faculty - Filter by Dept
  results.push(await testEndpoint('Faculty: Filter by Department', 'GET', '/faculty?dept_id=1'));

  // 16. Faculty - CRUD: Create Test Faculty
  const testFacPayload = {
    employee_code: 'TEST_FAC_999',
    dept_id: 1,
    first_name: 'TestProfessor',
    last_name: 'Audit',
    email: 'test.prof999@eduinsight.edu',
    designation: 'Assistant Professor',
    qualification: 'Ph.D in AI',
    specialization: 'Deep Learning',
  };
  const createFacRes = await testEndpoint(
    'Faculty: Create (POST)',
    'POST',
    '/faculty',
    testFacPayload,
    201
  );
  results.push(createFacRes);

  let newFacultyId = null;
  if (createFacRes.passed && createFacRes.data && createFacRes.data.data) {
    newFacultyId = createFacRes.data.data.faculty_id;
  }

  // 17. Faculty - CRUD: Update
  if (newFacultyId) {
    results.push(await testEndpoint(
      `Faculty: Update #${newFacultyId} (PUT)`,
      'PUT',
      `/faculty/${newFacultyId}`,
      { first_name: 'UpdatedProf', specialization: 'Advanced NLP' },
      200
    ));

    // 18. Faculty - CRUD: Delete
    results.push(await testEndpoint(
      `Faculty: Delete #${newFacultyId} (DELETE)`,
      'DELETE',
      `/faculty/${newFacultyId}`,
      null,
      200
    ));
  }

  // 19. Exams - List All
  results.push(await testEndpoint('Exams: List All', 'GET', '/exams'));

  // 20. Exams - CRUD: Schedule Exam
  const examPayload = {
    semester_id: 1,
    exam_name: 'Test Assessment 2026',
    exam_type: 'Quiz',
    academic_year: '2026-27',
    status: 'Scheduled',
  };
  const createExamRes = await testEndpoint(
    'Exams: Schedule Exam (POST)',
    'POST',
    '/exams',
    examPayload,
    201
  );
  results.push(createExamRes);

  let newExamId = null;
  if (createExamRes.passed && createExamRes.data && createExamRes.data.data) {
    newExamId = createExamRes.data.data.exam_id;
  }

  // 21. Exams - CRUD: Delete Exam
  if (newExamId) {
    results.push(await testEndpoint(
      `Exams: Delete Exam #${newExamId} (DELETE)`,
      'DELETE',
      `/exams/${newExamId}`,
      null,
      200
    ));
  }

  // 22. Attendance - Get for Student #1
  results.push(await testEndpoint('Attendance: Get for Student #1', 'GET', '/attendance/1'));

  // 23. Attendance - Record Session (POST)
  results.push(await testEndpoint(
    'Attendance: Record Session (POST)',
    'POST',
    '/attendance',
    {
      enrollment_id: 1,
      subject_id: 1,
      faculty_id: 1,
      class_date: '2026-09-17',
      period_no: 4,
      is_present: true,
      remarks: 'Automated test attendance',
    },
    201
  ));

  // 24. Marks - Get for Student #1
  results.push(await testEndpoint('Marks: Get for Student #1', 'GET', '/marks/1'));

  // 25. Marks - Enter Score (POST)
  const markPayload = {
    enrollment_id: 1,
    subject_id: 1,
    exam_id: 1,
    faculty_id: 1,
    internal_marks: 38,
    external_marks: 56,
    exam_type: 'Internal',
    remarks: 'Automated test evaluation',
  };
  const markRes = await testEndpoint(
    'Marks: Enter Score (POST)',
    'POST',
    '/marks',
    markPayload,
    201
  );
  results.push(markRes);

  let newMarkId = null;
  if (markRes.passed && markRes.data && markRes.data.data) {
    newMarkId = markRes.data.data.mark_id;
  }

  // 26. Marks - Update Score (PUT)
  if (newMarkId) {
    results.push(await testEndpoint(
      `Marks: Update Score #${newMarkId} (PUT)`,
      'PUT',
      `/marks/${newMarkId}`,
      { internal_marks: 39.5, external_marks: 58, remarks: 'Updated after re-eval' },
      200
    ));
  }

  // 27. Results - Get for Student #1
  results.push(await testEndpoint('Results: Get for Student #1', 'GET', '/results/1'));

  // 28. Fees - Get for Student #1
  results.push(await testEndpoint('Fees: Get for Student #1', 'GET', '/fees/1'));

  // 29. Subjects - List All
  results.push(await testEndpoint('Subjects: List All', 'GET', '/subjects'));

  // 30. Departments - List All
  results.push(await testEndpoint('Departments: List All', 'GET', '/departments'));

  // 31. Courses - List All
  results.push(await testEndpoint('Courses: List All', 'GET', '/courses'));

  // 32. Semesters - List All
  results.push(await testEndpoint('Semesters: List All', 'GET', '/semesters'));

  // 33. Enrollments - Get for Student #1
  results.push(await testEndpoint('Enrollments: Get for Student #1', 'GET', '/enrollments/1'));

  // 34. Constraint: Duplicate Roll No Check (409)
  const dupRes = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roll_no: '23CSE001',
      reg_no: '2023CSE001_DUP',
      dept_id: 1,
      course_id: 1,
      first_name: 'Duplicate',
      email: 'dup@eduinsight.edu',
    }),
  });
  console.log(`[${dupRes.status === 409 ? 'PASS' : 'FAIL'}] Constraint: Duplicate Student Roll No -> POST /students (Status: ${dupRes.status})`);
  results.push({
    name: 'Constraint: Duplicate Student Roll No (409)',
    method: 'POST',
    url: '/students',
    status: dupRes.status,
    passed: dupRes.status === 409,
  });

  console.log('\n====================================================');
  console.log('   TEST SUITE EXECUTION SUMMARY');
  console.log('====================================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Total APIs Tested: ${results.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${results.length - passedCount}`);

  const fs = require('fs');
  fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
}

runAllTests();

