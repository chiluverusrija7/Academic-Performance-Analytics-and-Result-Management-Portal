import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { StudentCombobox } from '../../components/ui/StudentCombobox';
import { useToast } from '../../context/ToastContext';
import { BookOpen, RefreshCw } from 'lucide-react';

export function AdminEnrollments() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [enrollments, setEnrollments] = useState([]);
  const toast = useToast();

  useEffect(() => {
    api.getStudents().then((res) => {
      if (res.success && res.data.length > 0) {
        setStudents(res.data);
      }
    });
  }, []);

  const loadEnrollments = async (sId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getEnrollments(sId);
      if (res.success) {
        setEnrollments(res.data);
      }
      if (isRefresh) {
        toast.success('Enrollments updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch enrollments');
      toast.error(err.message || 'Error loading enrollments', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadEnrollments(selectedStudentId);
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find((s) => String(s.student_id) === String(selectedStudentId));

  const columns = [
    { header: 'Registration No', accessor: 'registration_number', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Course Program', accessor: 'course_name' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Section', accessor: 'section', align: 'center' },
    { header: 'Academic Year', accessor: 'academic_year' },
    {
      header: 'Enrollment Date',
      accessor: 'enrollment_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
    },
    { header: 'Fee Status', accessor: 'fee_status', align: 'center', render: (val) => <Badge variant={val === 'Paid' ? 'success' : 'warning'} dot>{val || 'Active'}</Badge> },
    { header: 'Attendance', accessor: 'attendance_status', align: 'center', render: (val) => <Badge variant="primary">{val || 'Regular'}</Badge> },
    { header: 'Enroll Status', accessor: 'enroll_status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      {/* Searchable Student Combobox Filter Bar */}
      <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <StudentCombobox
            students={students}
            value={selectedStudentId}
            onChange={(newId) => setSelectedStudentId(String(newId))}
            label="Filter by Student"
          />
        </div>

        <div className="self-end md:self-center">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadEnrollments(selectedStudentId, true)}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Card
        title={`Student Term Enrollments: ${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''}`}
        icon={BookOpen}
        subtitle="Review registration status across academic semesters in PostgreSQL"
      >
        {loading ? (
          <TableSkeleton rows={4} cols={8} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadEnrollments(selectedStudentId, false)} />
        ) : enrollments.length === 0 ? (
          <EmptyState title="No Enrollments Found" description="No academic term enrollments found for this student." icon={BookOpen} />
        ) : (
          <Table columns={columns} data={enrollments} keyField="enrollment_id" />
        )}
      </Card>
    </div>
  );
}
