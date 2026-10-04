import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { Building, RefreshCw, Users, GraduationCap, Layers } from 'lucide-react';

export function AdminDepartments() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const toast = useToast();

  const loadDepts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getDepartments();
      if (res.success) {
        setDepartments(res.data);
      }
      if (isRefresh) {
        toast.success('Department registry updated', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch departments');
      toast.error(err.message || 'Error loading departments', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDepts();
  }, []);

  if (loading) return <TableSkeleton rows={5} cols={8} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadDepts(false)} />;

  const totalStudents = departments.reduce((acc, d) => acc + parseInt(d.total_students || 0, 10), 0);
  const totalFaculty = departments.reduce((acc, d) => acc + parseInt(d.total_faculty || 0, 10), 0);

  const columns = [
    { header: 'Dept Code', accessor: 'dept_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Department Name', accessor: 'dept_name' },
    {
      header: 'Head of Department (HOD)',
      accessor: 'hod_first_name',
      render: (val, row) => (val ? `Prof. ${val} ${row.hod_last_name || ''}` : 'Acting HOD'),
    },
    { header: 'Office Location', accessor: 'office_location' },
    { header: 'Building Block', accessor: 'building' },
    { header: 'Programs', accessor: 'total_courses', align: 'center' },
    { header: 'Faculty', accessor: 'total_faculty', align: 'center' },
    { header: 'Students', accessor: 'total_students', align: 'center', cellClassName: 'font-semibold text-emerald-400' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Departments"
          value={departments.length}
          subtitle="Engineering & Computing"
          icon={Building}
          color="purple"
        />
        <MetricCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Across all departments"
          icon={GraduationCap}
          color="blue"
        />
        <MetricCard
          title="Academic Staff"
          value={totalFaculty}
          subtitle="Assigned faculty count"
          icon={Users}
          color="emerald"
        />
      </div>

      <Card
        title="Academic Departments Registry"
        icon={Building}
        subtitle="Department leadership, building locations, and student/faculty counts in PostgreSQL"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadDepts(true)}
          >
            Refresh
          </Button>
        }
      >
        <Table columns={columns} data={departments} keyField="dept_id" />
      </Card>
    </div>
  );
}
