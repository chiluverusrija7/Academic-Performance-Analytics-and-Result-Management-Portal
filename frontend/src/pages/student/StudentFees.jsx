import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, MetricCard } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { CreditCard, CheckCircle, AlertTriangle, Receipt, RefreshCw, Eye, Download, ShieldCheck } from 'lucide-react';

export function StudentFees() {
  const { user } = useAuth();
  const studentId = user?.student_id || 1;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [student, setStudent] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadFees = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [feeRes, stuRes] = await Promise.all([
        api.getFees(studentId),
        api.getStudent(studentId),
      ]);

      if (feeRes.success) setFeeData(feeRes);
      if (stuRes.success) setStudent(stuRes.data);
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
    loadFees();
  }, [studentId]);

  const openReceipt = (fee) => {
    setSelectedFee(fee);
    setIsReceiptOpen(true);
  };

  if (loading) return <TableSkeleton rows={4} cols={7} />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadFees(false)} />;

  const summary = feeData?.summary || {};
  const records = feeData?.data || [];

  const columns = [
    { header: 'Fee Category', accessor: 'fee_type', cellClassName: 'font-semibold text-white' },
    { header: 'Semester', accessor: 'semester_no', align: 'center', render: (val) => `Sem ${val}` },
    { header: 'Academic Year', accessor: 'academic_year' },
    {
      header: 'Total Invoiced',
      accessor: 'amount',
      align: 'right',
      render: (val) => <span className="font-mono font-semibold">₹{parseFloat(val).toLocaleString()}</span>,
    },
    {
      header: 'Amount Paid',
      accessor: 'paid_amount',
      align: 'right',
      render: (val) => <span className="font-mono font-bold text-emerald-400">₹{parseFloat(val).toLocaleString()}</span>,
    },
    {
      header: 'Settlement Status',
      accessor: 'payment_status',
      align: 'center',
      render: (val) => <Badge variant={val === 'Paid' ? 'success' : 'warning'} dot>{val}</Badge>,
    },
    {
      header: 'Payment Date',
      accessor: 'payment_date',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'Pending'),
    },
    { header: 'Mode', accessor: 'payment_mode', render: (val) => val || 'Online' },
    { header: 'Transaction Ref', accessor: 'transaction_reference', cellClassName: 'font-mono text-xs text-blue-300' },
    {
      header: 'Actions',
      accessor: 'fee_id',
      align: 'center',
      render: (val, row) => (
        <Button
          variant="secondary"
          size="xs"
          icon={Eye}
          onClick={() => openReceipt(row)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced Fee"
          value={`₹${summary.total_fee ? summary.total_fee.toLocaleString() : 0}`}
          subtitle="Semester academic dues"
          icon={Receipt}
          color="blue"
        />
        <MetricCard
          title="Total Paid"
          value={`₹${summary.total_paid ? summary.total_paid.toLocaleString() : 0}`}
          subtitle="Cleared bank transactions"
          icon={CheckCircle}
          color="emerald"
        />
        <MetricCard
          title="Outstanding Due"
          value={`₹${summary.total_due ? summary.total_due.toLocaleString() : 0}`}
          subtitle={summary.total_due === 0 ? 'Clear - No outstanding dues' : 'Payment required'}
          icon={AlertTriangle}
          color={summary.total_due > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Fee Ledger Table */}
      <Card
        title="Fee Ledger &amp; Verified Transactions"
        icon={CreditCard}
        subtitle="Historical tuition and examination fee settlements stored in PostgreSQL"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadFees(true)}
          >
            Refresh
          </Button>
        }
      >
        {records.length === 0 ? (
          <EmptyState
            title="No Fee Records"
            description="No tuition fee invoices found for this account."
            icon={CreditCard}
          />
        ) : (
          <Table columns={columns} data={records} keyField="fee_id" />
        )}
      </Card>

      {/* Fee Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Official Fee Payment Receipt"
        maxWidth="max-w-lg"
        icon={Receipt}
      >
        {selectedFee && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-navy-950 border border-white/5 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-white">EduInsight Finance &amp; Accounts Cell</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Verified Payment Receipt</p>
            </div>

            <div className="p-3.5 rounded-lg bg-navy-950/80 border border-white/5 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="text-white font-semibold">{student?.first_name} {student?.last_name} ({student?.roll_no})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-blue-400 font-bold">{selectedFee.transaction_reference || 'TXN20260001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fee Purpose:</span>
                <span className="text-slate-200">{selectedFee.fee_type} (Semester {selectedFee.semester_no})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Date:</span>
                <span className="text-slate-200">{selectedFee.payment_date ? new Date(selectedFee.payment_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="text-slate-200">{selectedFee.payment_mode || 'Online NetBanking'}</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between text-sm">
                <span className="text-slate-300 font-bold">Total Settled:</span>
                <span className="text-emerald-400 font-bold">₹{parseFloat(selectedFee.paid_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReceiptOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
