import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Calendar,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { CustomSelect } from '../../components/ui/CustomSelect';

export function StudentAttendance() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const loadAttendance = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getAttendance(studentId);
      if (res.success) {
        setAttendanceData(res);
      }
      if (isRefresh) {
        toast.success('Attendance records refreshed from PostgreSQL', 'Updated');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance records');
      toast.error(err.message || 'Could not load attendance', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [studentId]);

  if (loading) return <TableSkeleton rows={8} cols={6} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadAttendance(false)} />;

  const stats = attendanceData?.stats || {};
  const subjectSummary = attendanceData?.subject_summary || [];
  const rawRecords = attendanceData?.records || [];

  const filteredRecords = subjectFilter === 'ALL'
    ? rawRecords
    : rawRecords.filter((r) => r.subject_code === subjectFilter);

  const chartData = subjectSummary.map((s) => ({
    code: s.subject_code,
    name: s.subject_name,
    percentage: parseFloat(s.attendance_percentage || 0),
    attended: s.attended_classes,
    total: s.total_classes,
  }));

  const summaryColumns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Scheduled', accessor: 'total_classes', align: 'center' },
    { header: 'Attended', accessor: 'attended_classes', align: 'center', cellClassName: 'text-emerald-400 font-semibold' },
    { header: 'Missed', accessor: 'missed_classes', align: 'center', cellClassName: 'text-rose-400 font-semibold' },
    {
      header: 'Progress',
      accessor: 'attendance_percentage',
      render: (val) => (
        <div className="w-32">
          <ProgressBar value={parseFloat(val || 0)} max={100} color="auto" showValue />
        </div>
      ),
    },
    {
      header: 'Eligibility',
      accessor: 'attendance_percentage',
      align: 'center',
      render: (val) => {
        const eligible = parseFloat(val || 0) >= 75;
        return (
          <Badge variant={eligible ? 'success' : 'danger'} dot>
            {eligible ? 'Eligible' : 'Shortage (<75%)'}
          </Badge>
        );
      },
    },
  ];

  const logColumns = [
    {
      header: 'Class Date',
      accessor: 'class_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—'),
    },
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono text-blue-300 font-bold' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Period', accessor: 'period_no', align: 'center', render: (val) => `Period ${val}` },
    {
      header: 'Status',
      accessor: 'is_present',
      align: 'center',
      render: (val) => (
        <Badge variant={val ? 'success' : 'danger'}>
          {val ? 'Present' : 'Absent'}
        </Badge>
      ),
    },
    {
      header: 'Instructor',
      accessor: 'faculty_first_name',
      render: (val, row) => (val ? `Prof. ${val} ${row.faculty_last_name || ''}` : 'Faculty In-Charge'),
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      cellClassName: 'text-slate-400 italic text-xs',
      render: (val) => val || '—',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Attendance"
          value={`${stats.overall_percentage ?? 0}%`}
          subtitle="Mandatory requirement: >= 75%"
          icon={CheckSquare}
          color={stats.overall_percentage >= 75 ? 'emerald' : 'rose'}
        />
        <MetricCard
          title="Total Classes"
          value={stats.total_classes || 0}
          subtitle="Delivered sessions"
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Attended"
          value={stats.attended_classes || 0}
          subtitle="Verified presence"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Missed"
          value={stats.missed_classes || 0}
          subtitle="Recorded absent"
          icon={XCircle}
          color={stats.missed_classes > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Visual Chart Card */}
      {chartData.length > 0 && (
        <Card title="Subject Attendance Distribution" icon={BookOpen}>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="code"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1824',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val, name, item) => [
                    `${val}% (${item.payload.attended}/${item.payload.total} classes)`,
                    item.payload.name,
                  ]}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Subject-Wise Summary Table */}
      <Card
        title="Subject-Wise Summary &amp; Exam Eligibility"
        icon={BookOpen}
        subtitle="Individual module tracking with dynamic percentage calculation"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadAttendance(true)}
          >
            Refresh
          </Button>
        }
      >
        <Table columns={summaryColumns} data={subjectSummary} keyField="subject_id" />
      </Card>

      {/* Detailed Session Logs with Interactive Subject Filter */}
      <Card
        title="Session-Wise Attendance Log"
        icon={Calendar}
        subtitle="Chronological log of classroom attendance marked by faculty"
        action={
          <div className="w-56">
            <CustomSelect
              value={subjectFilter}
              onChange={(val) => setSubjectFilter(val)}
              options={[
                { value: 'ALL', label: `All Subjects (${rawRecords.length})` },
                ...subjectSummary.map((s) => ({
                  value: s.subject_code,
                  label: `${s.subject_code} - ${s.subject_name}`,
                })),
              ]}
              placeholder="Filter Subject"
            />
          </div>
        }
      >
        {filteredRecords.length === 0 ? (
          <EmptyState
            title="No Attendance Logs"
            description="No individual session logs match the selected filter."
            icon={CheckSquare}
          />
        ) : (
          <Table columns={logColumns} data={filteredRecords} keyField="attendance_id" />
        )}
      </Card>
    </div>
  );
}
