import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { BookOpen, Search, RefreshCw } from 'lucide-react';

export function AdminSubjects() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const loadSubjects = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getSubjects({ search });
      if (res.success) {
        setSubjects(res.data);
      }
      if (isRefresh) {
        toast.success('Curriculum subjects updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
      toast.error(err.message || 'Error loading subjects', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [search]);

  const columns = [
    { header: 'Subject Code', accessor: 'subject_code', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Subject Title', accessor: 'subject_name' },
    { header: 'Course', accessor: 'course_code', align: 'center', render: (val) => <Badge variant="primary">{val}</Badge> },
    { header: 'Sem', accessor: 'semester_no', align: 'center', render: (val) => `S${val}` },
    { header: 'Credits', accessor: 'credits', align: 'center' },
    { header: 'L-T-P', accessor: 'lecture_hours', align: 'center', render: (val, row) => `${val}-${row.tutorial_hours}-${row.practical_hours}` },
    { header: 'Max Marks', accessor: 'max_marks', align: 'right', cellClassName: 'font-mono' },
    { header: 'Pass Marks', accessor: 'pass_marks', align: 'right', cellClassName: 'font-mono' },
    { header: 'Weightage (Int/Ext)', accessor: 'internal_weightage', align: 'center', render: (val, row) => `${parseInt(val)}% / ${parseInt(row.external_weightage)}%` },
    { header: 'Type', accessor: 'is_lab', align: 'center', render: (val) => <Badge variant={val ? 'sky' : 'default'}>{val ? 'Lab' : 'Theory'}</Badge> },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Curriculum Subjects &amp; Syllabi Registry"
        icon={BookOpen}
        subtitle="Manage academic subject modules, credit distributions, and exam weightages in PostgreSQL"
        action={
          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search subjects..."
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
          <TableSkeleton rows={8} cols={10} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadSubjects(false)} />
        ) : subjects.length === 0 ? (
          <EmptyState title="No Subjects Found" description="No subjects match your search query." icon={BookOpen} />
        ) : (
          <Table columns={columns} data={subjects} keyField="subject_id" />
        )}
      </Card>
    </div>
  );
}
