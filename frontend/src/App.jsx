import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentExams } from './pages/student/StudentExams';
import { StudentMarks } from './pages/student/StudentMarks';
import { StudentResults } from './pages/student/StudentResults';
import { StudentFees } from './pages/student/StudentFees';
import { StudentEnrollments } from './pages/student/StudentEnrollments';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyProfile } from './pages/faculty/FacultyProfile';
import { FacultySubjects } from './pages/faculty/FacultySubjects';
import { FacultyStudents } from './pages/faculty/FacultyStudents';
import { FacultyAttendance } from './pages/faculty/FacultyAttendance';
import { FacultyMarks } from './pages/faculty/FacultyMarks';
import { FacultyIntelligence } from './pages/faculty/FacultyIntelligence';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminSemesters } from './pages/admin/AdminSemesters';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminExams } from './pages/admin/AdminExams';
import { AdminEnrollments } from './pages/admin/AdminEnrollments';
import { AdminFees } from './pages/admin/AdminFees';

// Intelligence Center
import { IntelligenceCenter } from './pages/intelligence/IntelligenceCenter';
import { StudentIntelligence } from './pages/intelligence/StudentIntelligence';

function RootRoute() {
  return <Landing />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/landing" element={<Landing />} />

          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Layout */}
          <Route element={<AppLayout />}>
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentExams /></ProtectedRoute>} />
            <Route path="/student/marks" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentMarks /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentResults /></ProtectedRoute>} />
            <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentFees /></ProtectedRoute>} />
            <Route path="/student/enrollments" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentEnrollments /></ProtectedRoute>} />

            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyProfile /></ProtectedRoute>} />
            <Route path="/faculty/subjects" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultySubjects /></ProtectedRoute>} />
            <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyStudents /></ProtectedRoute>} />
            <Route path="/faculty/attendance" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyAttendance /></ProtectedRoute>} />
            <Route path="/faculty/marks" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyMarks /></ProtectedRoute>} />
            <Route path="/faculty/intelligence" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyIntelligence /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/faculty" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminFaculty /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminDepartments /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/semesters" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminSemesters /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminExams /></ProtectedRoute>} />
            <Route path="/admin/enrollments" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminEnrollments /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL']}><AdminFees /></ProtectedRoute>} />

            {/* Intelligence Center Routes */}
            <Route path="/intelligence" element={<ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'EXAM_CELL', 'FACULTY']}><IntelligenceCenter /></ProtectedRoute>} />
            <Route path="/student/intelligence" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentIntelligence /></ProtectedRoute>} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
