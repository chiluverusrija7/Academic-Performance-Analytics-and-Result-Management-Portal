const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const marksRoutes = require('./routes/marks');
const resultRoutes = require('./routes/results');
const feeRoutes = require('./routes/fees');
const facultyRoutes = require('./routes/faculty');
const subjectRoutes = require('./routes/subjects');
const departmentRoutes = require('./routes/departments');
const courseRoutes = require('./routes/courses');
const semesterRoutes = require('./routes/semesters');
const examRoutes = require('./routes/exams');
const enrollmentRoutes = require('./routes/enrollments');
const intelligenceRoutes = require('./routes/intelligence');
const analyticsRoutes = require('./routes/analytics');
const timetableRoutes = require('./routes/timetable');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'EduInsight AI - Core Backend API',
    status: 'ONLINE',
    port: PORT,
    frontend_ui: 'http://localhost:5173',
    flask_presentation_ui: 'http://localhost:5001',
    fastapi_ai_docs: 'http://localhost:8000/docs',
    message: 'This is the backend REST API. Open the UI at http://localhost:5173'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await db.query('SELECT current_database() AS current_db, NOW() AS server_time;');
    res.json({
      status: 'UP',
      backend: 'Node.js / Express',
      database: 'PostgreSQL',
      connected_database: dbRes.rows[0].current_db,
      db_server_time: dbRes.rows[0].server_time,
      port: PORT,
    });
  } catch (error) {
    console.error('Health check DB error:', error);
    res.status(500).json({
      status: 'DOWN',
      error: error.message,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timetable', timetableRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`EduInsight REST API server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = { app, server };
