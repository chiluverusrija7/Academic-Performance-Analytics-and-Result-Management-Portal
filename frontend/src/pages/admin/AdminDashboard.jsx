import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  GraduationCap,
  Building,
  BookOpen,
  Layers,
  Calendar,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const toast = useToast();

  const loadAdminData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [stuRes, facRes, deptRes, courseRes, subRes] = await Promise.all([
        api.getStudents(),
        api.getFacultyList(),
        api.getDepartments(),
        api.getCourses(),
        api.getSubjects(),
      ]);

      if (stuRes.success) setStudents(stuRes.data);
      if (facRes.success) setFaculty(facRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (courseRes.success) setCourses(courseRes.data);
      if (subRes.success) setSubjects(subRes.data);

      if (isRefresh) {
        toast.success('Institute metrics refreshed from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrator dashboard');
      toast.error(err.message || 'Error loading dashboard', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadAdminData(false)} />;

  const deptChartData = departments.map((d) => ({
    name: d.dept_code,
    fullName: d.dept_name,
    students: parseInt(d.total_students || 0, 10),
    faculty: parseInt(d.total_faculty || 0, 10),
    courses: parseInt(d.total_courses || 0, 10),
  }));

  const PIE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#06b6d4', '#f59e0b'];

  const deptColumns = [
    { header: 'Code', accessor: 'dept_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Department Name', accessor: 'dept_name' },
    { header: 'HOD', accessor: 'hod_first_name', render: (val, row) => val ? `Prof. ${val} ${row.hod_last_name || ''}` : 'Appointed Soon' },
    { header: 'Courses', accessor: 'total_courses', align: 'center' },
    { header: 'Faculty', accessor: 'total_faculty', align: 'center' },
    { header: 'Students', accessor: 'total_students', align: 'center', cellClassName: 'font-semibold text-emerald-400' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-purple-950/70 via-navy-900 to-navy-900 border border-purple-500/20 rounded-2xl p-6 md:p-7 overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="purple" size="sm">
                System Administrator
              </Badge>
              <Badge variant="success" size="sm" dot>
                PostgreSQL Online
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight font-display">
              Institute Administration Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live enterprise statistics across {departments.length} academic departments &amp; {courses.length} degree programs
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadAdminData(true)}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={students.length}
          subtitle={`Enrolled across ${departments.length} departments`}
          icon={GraduationCap}
          color="blue"
        />
        <MetricCard
          title="Total Faculty"
          value={faculty.length}
          subtitle="Academic professors & staff"
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Academic Departments"
          value={departments.length}
          subtitle="CSE, ECE, AIML, DS"
          icon={Building}
          color="purple"
        />
        <MetricCard
          title="Curriculum Modules"
          value={`${courses.length} / ${subjects.length}`}
          subtitle="Programs & active subjects"
          icon={BookOpen}
          color="sky"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Enrollment Bar Chart */}
        <Card
          title="Student Distribution by Department"
          icon={GraduationCap}
          subtitle="Live enrollment count per academic department"
        >
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
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
                  formatter={(val, name, item) => [`${val} Students`, item.payload.fullName]}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Faculty & Course Stack Chart */}
        <Card
          title="Faculty Deployment & Course Offerings"
          icon={Users}
          subtitle="Teaching staff and degree offerings per department"
        >
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
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
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => <span className="text-slate-300">{val === 'faculty' ? 'Faculty Count' : 'Courses'}</span>}
                />
                <Bar dataKey="faculty" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="courses" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Access Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/admin/students" className="p-4 bg-navy-900/80 hover:bg-navy-800 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all flex items-center gap-3 group shadow-card">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Manage Students</span>
            <span className="text-[10px] text-slate-500">Registry &amp; CRUD</span>
          </div>
        </Link>

        <Link to="/admin/faculty" className="p-4 bg-navy-900/80 hover:bg-navy-800 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all flex items-center gap-3 group shadow-card">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
            <Users size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Faculty Directory</span>
            <span className="text-[10px] text-slate-500">Staff &amp; HODs</span>
          </div>
        </Link>

        <Link to="/admin/departments" className="p-4 bg-navy-900/80 hover:bg-navy-800 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all flex items-center gap-3 group shadow-card">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
            <Building size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Departments</span>
            <span className="text-[10px] text-slate-500">Divisions &amp; Blocks</span>
          </div>
        </Link>

        <Link to="/admin/subjects" className="p-4 bg-navy-900/80 hover:bg-navy-800 border border-white/5 hover:border-sky-500/30 rounded-xl transition-all flex items-center gap-3 group shadow-card">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Subjects Registry</span>
            <span className="text-[10px] text-slate-500">Curriculum &amp; Credits</span>
          </div>
        </Link>
      </div>

      {/* Departments Overview Table */}
      <Card title="Academic Departments &amp; Program Distribution" icon={Building}>
        <Table columns={deptColumns} data={departments} keyField="dept_id" />
      </Card>
    </div>
  );
}
