import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { FacultyAcademicIntelligence } from '../../components/faculty/FacultyAcademicIntelligence';
import {
  BookOpen,
  Users,
  CheckSquare,
  FileSpreadsheet,
  User,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

export function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const facultyId = user?.faculty_id || 1;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [facRes, stuRes, examRes] = await Promise.all([
        api.getFaculty(facultyId),
        api.getStudents(),
        api.getExams(),
      ]);

      if (facRes.success) setFaculty(facRes.data);
      if (stuRes.success) setStudents(stuRes.data);
      if (examRes.success) setExams(examRes.data);

      if (isRefresh) {
        toast.success('Faculty dashboard updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to load faculty portal');
      toast.error(err.message || 'Error loading dashboard', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [facultyId]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadData(false)} />;

  const assignedSubjects = faculty?.assigned_subjects || [];

  const chartData = assignedSubjects.map((s) => ({
    code: s.subject_code,
    name: s.subject_name,
    credits: parseInt(s.credits || 0, 10),
    semester: s.semester_no,
  }));

  const subjectColumns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Curriculum Title', accessor: 'subject_name' },
    { header: 'Degree Program', accessor: 'course_name' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Section', accessor: 'section', align: 'center' },
    { header: 'Credits', accessor: 'credits', align: 'center' },
    { header: 'Status', accessor: 'assignment_status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-sky-950/70 via-navy-900 to-navy-900 border border-sky-500/20 rounded-2xl p-6 md:p-7 overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="sky" size="sm">
                {faculty?.designation || 'Assistant Professor'}
              </Badge>
              <Badge variant="primary" size="sm">
                {faculty?.dept_name} ({faculty?.dept_code})
              </Badge>
              <Badge variant="success" size="sm" dot>
                {faculty?.status || 'Active'}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-display">
              Prof. {faculty?.first_name} {faculty?.last_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Employee Code: <span className="text-sky-300 font-semibold">{faculty?.employee_code}</span> • Office: <span className="text-slate-200">{faculty?.office_room || 'Room 303'}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Specialization: <span className="font-semibold text-slate-200">{faculty?.specialization || 'Computer Science & AI'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadData(true)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={User}
              onClick={() => navigate('/faculty/profile')}
            >
              My Profile
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Assigned Subjects"
          value={assignedSubjects.length}
          subtitle="Active teaching curriculum"
          icon={BookOpen}
          color="blue"
        />
        <MetricCard
          title="Department Students"
          value={students.length}
          subtitle="Enrolled student batch size"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Academic Experience"
          value={`${faculty?.experience_years || '4'} Years`}
          subtitle={`Joined: ${faculty?.joining_date ? new Date(faculty.joining_date).toLocaleDateString() : 'August 2022'}`}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Chart and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Allocated Teaching Credits Chart */}
        <Card
          title="Teaching Allocation &amp; Credits"
          subtitle="Credit weightage of assigned curriculum modules"
          icon={BookOpen}
          className="lg:col-span-2"
        >
          {chartData.length > 0 ? (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="code"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 6]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1824',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val, name, item) => [`${val} Credits (Sem ${item.payload.semester})`, item.payload.name]}
                  />
                  <Bar dataKey="credits" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-6 text-center">No assigned subjects found.</p>
          )}
        </Card>

        {/* Quick Portal Navigation */}
        <div className="space-y-4">
          <Card
            title="Attendance Portal"
            icon={CheckSquare}
            action={
              <Link to="/faculty/attendance" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>Open</span>
                <ArrowRight size={12} />
              </Link>
            }
          >
            <p className="text-xs text-slate-400 mb-3">
              Mark daily classroom attendance logs and track student session percentages in real time.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/faculty/attendance')}
            >
              Record Attendance
            </Button>
          </Card>

          <Card
            title="Marks &amp; Grades"
            icon={FileSpreadsheet}
            action={
              <Link to="/faculty/marks" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>Enter</span>
                <ArrowRight size={12} />
              </Link>
            }
          >
            <p className="text-xs text-slate-400 mb-3">
              Submit continuous internal evaluation marks and final grades directly into PostgreSQL.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/faculty/marks')}
            >
              Enter Student Marks
            </Button>
          </Card>
        </div>
      </div>

      {/* Allocated Subjects Table */}
      <Card
        title="Current Allocated Teaching Subjects"
        icon={BookOpen}
        subtitle="Live subject allocations from PostgreSQL faculty_subject table"
      >
        <Table columns={subjectColumns} data={assignedSubjects} keyField="faculty_subject_id" />
      </Card>

      {/* Faculty Academic Intelligence Layer — scoped to authenticated faculty */}
      <div className="pt-2">
        <FacultyAcademicIntelligence />
      </div>
    </div>
  );
}

