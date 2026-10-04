const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (username, password) => 
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  health: () => apiRequest('/health'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students${query ? `?${query}` : ''}`);
  },
  getStudent: (id) => apiRequest(`/students/${id}`),
  createStudent: (data) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' }),

  // Student specific data
  getAttendance: (studentId) => apiRequest(`/attendance/${studentId}`),
  recordAttendance: (data) => apiRequest('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getMarks: (studentId) => apiRequest(`/marks/${studentId}`),
  saveMarks: (data) => apiRequest('/marks', { method: 'POST', body: JSON.stringify(data) }),
  updateMarks: (id, data) => apiRequest(`/marks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getResults: (studentId) => apiRequest(`/results/${studentId}`),
  getFees: (studentId) => apiRequest(`/fees/${studentId}`),
  getEnrollments: (studentId) => apiRequest(`/enrollments/${studentId}`),

  // Faculty
  getFacultyList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/faculty${query ? `?${query}` : ''}`);
  },
  getFaculty: (id) => apiRequest(`/faculty/${id}`),
  getStudentFaculty: (studentId) => apiRequest(`/faculty/student/${studentId}`),
  createFaculty: (data) => apiRequest('/faculty', { method: 'POST', body: JSON.stringify(data) }),
  updateFaculty: (id, data) => apiRequest(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaculty: (id) => apiRequest(`/faculty/${id}`, { method: 'DELETE' }),

  // Academic Entities
  getSubjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/subjects${query ? `?${query}` : ''}`);
  },
  getSubject: (id) => apiRequest(`/subjects/${id}`),
  getDepartments: () => apiRequest('/departments'),
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/courses${query ? `?${query}` : ''}`);
  },
  getSemesters: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/semesters${query ? `?${query}` : ''}`);
  },
  getExams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/exams${query ? `?${query}` : ''}`);
  },
  createExam: (data) => apiRequest('/exams', { method: 'POST', body: JSON.stringify(data) }),
  deleteExam: (id) => apiRequest(`/exams/${id}`, { method: 'DELETE' }),

  // Intelligence / ML Risk & Phase 7/11 Endpoints
  getRiskPrediction: (studentId) => apiRequest(`/intelligence/risk/${studentId}`),
  getIntelligenceStudents: (limit = 100) => apiRequest(`/intelligence/students?limit=${limit}`),
  analyzeStudent: (studentId, checkpoint = 'W12', semester = null, alpha = 0.10) => {
    let url = `/intelligence/analyze/${studentId}?checkpoint=${checkpoint}&alpha=${alpha}`;
    if (semester) url += `&semester=${semester}`;
    return apiRequest(url);
  },
  runCustomCounterfactual: (studentId, body) =>
    apiRequest(`/intelligence/counterfactual/${studentId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getStudentTrajectory: (studentId) => apiRequest(`/intelligence/trajectory/${studentId}`),
  getInterventionQueue: (checkpoint = 'W12', limit = 50) =>
    apiRequest(`/intelligence/queue?checkpoint=${checkpoint}&limit=${limit}`),
  getCohortAnalytics: () => apiRequest('/intelligence/cohort-analytics'),
  getInterventionStatuses: (checkpoint = 'W12') =>
    apiRequest(`/intelligence/interventions?checkpoint=${checkpoint}`),
  saveInterventionStatus: (payload) =>
    apiRequest('/intelligence/interventions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Analytics
  getAnalyticsOverview: () => apiRequest('/analytics/overview'),
  getDepartmentAnalytics: () => apiRequest('/analytics/departments'),
  getSubjectAnalytics: () => apiRequest('/analytics/subjects'),
  getTopPerformers: (limit = 10) => apiRequest(`/analytics/top-performers?limit=${limit}`),
  getMarksDistribution: () => apiRequest('/analytics/marks-distribution'),
  getStudentSummary: (studentId) => apiRequest(`/analytics/student-summary/${studentId}`),
  getFacultySummary: (facultyId) => apiRequest(`/analytics/faculty-summary/${facultyId}`),

  // Timetable & Schedule
  getTimetable: (studentId) => apiRequest(`/timetable/student/${studentId}`),
  getTodaySchedule: (studentId) => apiRequest(`/timetable/today/${studentId}`),
  getUpcomingClasses: (studentId) => apiRequest(`/timetable/upcoming/${studentId}`),
};

