import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Search, RefreshCw, Layers } from 'lucide-react';

export function FacultySubjects() {
  const { user } = useAuth();
  const facultyId = user?.faculty_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [search, setSearch] = useState('');

  const loadSubjects = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getFaculty(facultyId);
      if (res.success) {
        setFaculty(res.data);
      }
      if (isRefresh) {
        toast.success('Assigned subjects updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned subjects');
      toast.error(err.message || 'Error loading subjects', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [facultyId]);

  const assigned = faculty?.assigned_subjects || [];
  const filtered = assigned.filter((sub) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      (sub.subject_code || '').toLowerCase().includes(query) ||
      (sub.subject_name || '').toLowerCase().includes(query) ||
      (sub.course_name || '').toLowerCase().includes(query)
    );
  });

  const columns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Course Program', accessor: 'course_name' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Section', accessor: 'section', align: 'center' },
    { header: 'Type', accessor: 'subject_type', align: 'center', render: (val) => <Badge variant="primary">{val || 'Core'}</Badge> },
    { header: 'Credits', accessor: 'credits', align: 'center' },
    { header: 'Academic Year', accessor: 'academic_year' },
    { header: 'Status', accessor: 'assignment_status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="My Assigned Subjects &amp; Teaching Modules"
        icon={BookOpen}
        subtitle="Active curriculum units allocated to your schedule in PostgreSQL"
        action={
          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-60">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subject code / name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadSubjects(true)}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadSubjects(false)} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No Subjects Found" description="No assigned subjects match your criteria." icon={BookOpen} />
        ) : (
          <Table columns={columns} data={filtered} keyField="faculty_subject_id" />
        )}
      </Card>
    </div>
  );
}
