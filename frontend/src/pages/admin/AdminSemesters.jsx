import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { Calendar, RefreshCw } from 'lucide-react';

export function AdminSemesters() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const toast = useToast();

  const loadSemesters = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getSemesters();
      if (res.success) {
        setSemesters(res.data);
      }
      if (isRefresh) {
        toast.success('Semester records updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch semesters');
      toast.error(err.message || 'Error loading semesters', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  if (loading) return <TableSkeleton rows={5} cols={9} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadSemesters(false)} />;

  const columns = [
    { header: 'Course', accessor: 'course_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Course Program', accessor: 'course_name' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Academic Year', accessor: 'academic_year' },
    { header: 'Term', accessor: 'term_name' },
    {
      header: 'Start Date',
      accessor: 'start_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—'),
    },
    {
      header: 'End Date',
      accessor: 'end_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—'),
    },
    { header: 'Enrollments', accessor: 'enrolled_students_count', align: 'center', cellClassName: 'font-semibold text-emerald-400' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Academic Semesters &amp; Terms Calendar"
        icon={Calendar}
        subtitle="Term session dates, enrollment capacity, and academic schedules in PostgreSQL"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadSemesters(true)}
          >
            Refresh
          </Button>
        }
      >
        <Table columns={columns} data={semesters} keyField="semester_id" />
      </Card>
    </div>
  );
}
