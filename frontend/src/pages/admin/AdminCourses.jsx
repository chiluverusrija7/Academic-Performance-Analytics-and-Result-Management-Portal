import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { Layers, RefreshCw } from 'lucide-react';

export function AdminCourses() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const toast = useToast();

  const loadCourses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getCourses();
      if (res.success) {
        setCourses(res.data);
      }
      if (isRefresh) {
        toast.success('Course registry updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
      toast.error(err.message || 'Error loading courses', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  if (loading) return <TableSkeleton rows={5} cols={9} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadCourses(false)} />;

  const columns = [
    { header: 'Course Code', accessor: 'course_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Degree Program Name', accessor: 'course_name' },
    { header: 'Department', accessor: 'dept_code', align: 'center', render: (val) => <Badge variant="sky">{val}</Badge> },
    { header: 'Level', accessor: 'degree_level', align: 'center' },
    { header: 'Duration', accessor: 'duration_years', align: 'center', render: (val) => `${val} Yrs` },
    { header: 'Semesters', accessor: 'total_semesters', align: 'center' },
    { header: 'Credits', accessor: 'total_credits', align: 'center' },
    { header: 'Intake', accessor: 'intake_capacity', align: 'center' },
    { header: 'Enrolled', accessor: 'enrolled_students_count', align: 'center', cellClassName: 'font-semibold text-emerald-400' },
    { header: 'Subjects', accessor: 'total_subjects_count', align: 'center', cellClassName: 'font-semibold text-blue-300' },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Degree Programs &amp; Course Registry"
        icon={Layers}
        subtitle="Undergraduate and postgraduate curriculum structures in PostgreSQL"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadCourses(true)}
          >
            Refresh
          </Button>
        }
      >
        <Table columns={columns} data={courses} keyField="course_id" />
      </Card>
    </div>
  );
}
