import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { StudentCombobox } from '../../components/ui/StudentCombobox';
import { useToast } from '../../context/ToastContext';
import { CreditCard, CheckCircle, AlertTriangle, RefreshCw, Receipt } from 'lucide-react';

export function AdminFees() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('1');
  const [feeData, setFeeData] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.getStudents().then((res) => {
      if (res.success && res.data.length > 0) {
        setStudents(res.data);
      }
    });
  }, []);

  const loadFees = async (sId, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.getFees(sId);
      if (res.success) {
        setFeeData(res);
      }
      if (isRefresh) {
        toast.success('Fee ledger updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch fee details');
      toast.error(err.message || 'Error loading fees', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadFees(selectedStudentId);
    }
  }, [selectedStudentId]);

  const selectedStudent = students.find((s) => String(s.student_id) === String(selectedStudentId));
  const summary = feeData?.summary || {};
  const records = feeData?.data || [];

  const columns = [
    { header: 'Fee Type', accessor: 'fee_type', cellClassName: 'font-semibold text-slate-100' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Total Invoiced', accessor: 'amount', align: 'right', render: (val) => <span className="font-mono">₹{parseFloat(val).toLocaleString()}</span> },
    { header: 'Paid Amount', accessor: 'paid_amount', align: 'right', render: (val) => <span className="font-mono font-bold text-emerald-400">₹{parseFloat(val).toLocaleString()}</span> },
    { header: 'Status', accessor: 'payment_status', align: 'center', render: (val) => <Badge variant={val === 'Paid' ? 'success' : 'warning'} dot>{val}</Badge> },
    { header: 'Payment Date', accessor: 'payment_date', render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A') },
    { header: 'Transaction Ref', accessor: 'transaction_reference', cellClassName: 'font-mono text-xs text-blue-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Student Selector Bar with Combobox */}
      <div className="bg-[#0b121e] border border-slate-800 rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <StudentCombobox
            students={students}
            value={selectedStudentId}
            onChange={(newId) => setSelectedStudentId(String(newId))}
            label="Select Student for Fee Ledger"
          />
        </div>

        <div className="self-end md:self-center">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadFees(selectedStudentId, true)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced Fee"
          value={`₹${summary.total_fee ? summary.total_fee.toLocaleString() : 0}`}
          subtitle="Curriculum semester fee"
          icon={Receipt}
          color="blue"
        />
        <MetricCard
          title="Total Paid"
          value={`₹${summary.total_paid ? summary.total_paid.toLocaleString() : 0}`}
          subtitle="Recorded settlements"
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Outstanding Due"
          value={`₹${summary.total_due ? summary.total_due.toLocaleString() : 0}`}
          subtitle={summary.total_due === 0 ? 'Clear - No dues' : 'Pending payment'}
          icon={AlertTriangle}
          color={summary.total_due > 0 ? 'rose' : 'emerald'}
        />
      </div>

      <Card
        title={`Student Fee Ledger: ${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''}`}
        icon={CreditCard}
        subtitle="Finance &amp; fee settlement transactions recorded in PostgreSQL"
      >
        {loading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadFees(selectedStudentId, false)} />
        ) : records.length === 0 ? (
          <EmptyState title="No Fee Records" description="No fee transactions recorded for this student." icon={CreditCard} />
        ) : (
          <Table columns={columns} data={records} keyField="fee_id" />
        )}
      </Card>
    </div>
  );
}
