import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ErrorAlert, EmptyState } from '../../components/ui/States';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, Plus, Search, Trash2, Edit, Eye, RefreshCw, AlertTriangle } from 'lucide-react';

export function AdminStudents() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    roll_no: '',
    reg_no: '',
    dept_id: '1',
    course_id: '1',
    first_name: '',
    last_name: '',
    email: '',
    phone_no: '',
    gender: 'Male',
    current_semester: '1',
    section: 'A',
    status: 'Active',
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [stuRes, deptRes, courseRes] = await Promise.all([
        api.getStudents({ search }),
        api.getDepartments(),
        api.getCourses(),
      ]);

      if (stuRes.success) setStudents(stuRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (courseRes.success) setCourses(courseRes.data);

      if (isRefresh) {
        toast.success('Student records updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student records');
      toast.error(err.message || 'Error loading students', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openAddModal = () => {
    setStudentForm({
      roll_no: `23CSE0${students.length + 10}`,
      reg_no: `2023CSE0${students.length + 10}`,
      dept_id: departments[0]?.dept_id || '1',
      course_id: courses[0]?.course_id || '1',
      first_name: '',
      last_name: '',
      email: '',
      phone_no: '',
      gender: 'Male',
      current_semester: '1',
      section: 'A',
      status: 'Active',
    });
    setModalError('');
    setIsAddOpen(true);
  };

  const openEditModal = (stu) => {
    setSelectedStudent(stu);
    setStudentForm({
      first_name: stu.first_name || '',
      last_name: stu.last_name || '',
      email: stu.email || '',
      phone_no: stu.phone_no || '',
      gender: stu.gender || 'Male',
      current_semester: stu.current_semester || 1,
      section: stu.section || 'A',
      status: stu.status || 'Active',
    });
    setModalError('');
    setIsEditOpen(true);
  };

  const openViewModal = (stu) => {
    setSelectedStudent(stu);
    setIsViewOpen(true);
  };

  const openDeleteModal = (stu) => {
    setSelectedStudent(stu);
    setModalError('');
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        ...studentForm,
        dept_id: parseInt(studentForm.dept_id, 10),
        course_id: parseInt(studentForm.course_id, 10),
        current_semester: parseInt(studentForm.current_semester, 10),
      };
      const res = await api.createStudent(payload);
      if (res.success) {
        setIsAddOpen(false);
        toast.success(`Student ${studentForm.first_name} (${studentForm.roll_no}) created in PostgreSQL!`, 'Student Added');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create student');
      toast.error(err.message || 'Failed to create student', 'Create Error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const res = await api.updateStudent(selectedStudent.student_id, studentForm);
      if (res.success) {
        setIsEditOpen(false);
        toast.success(`Student ${selectedStudent.roll_no} updated in PostgreSQL!`, 'Student Updated');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update student');
      toast.error(err.message || 'Failed to update student', 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setModalError('');
    try {
      const res = await api.deleteStudent(selectedStudent.student_id);
      if (res.success) {
        setIsDeleteOpen(false);
        toast.success(`Student ${selectedStudent.roll_no} removed from PostgreSQL database!`, 'Student Deleted');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to delete student');
      toast.error(err.message || 'Failed to delete student', 'Delete Error');
    } finally {
      setSaving(false);
    }
  };

  const deptOptions = departments.map((d) => ({
    value: String(d.dept_id),
    label: `${d.dept_code} - ${d.dept_name}`,
  }));

  const courseOptions = courses.map((c) => ({
    value: String(c.course_id),
    label: `${c.course_code} - ${c.course_name}`,
  }));

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  const columns = [
    { header: 'Roll No', accessor: 'roll_no', cellClassName: 'font-mono font-bold text-blue-400' },
    { header: 'Reg No', accessor: 'reg_no', cellClassName: 'font-mono text-xs text-slate-400' },
    {
      header: 'Student Name',
      accessor: 'first_name',
      render: (val, row) => `${val} ${row.middle_name || ''} ${row.last_name || ''}`,
    },
    { header: 'Department', accessor: 'dept_code', align: 'center', render: (val) => <Badge variant="sky">{val}</Badge> },
    { header: 'Course', accessor: 'course_code', align: 'center', render: (val) => <Badge variant="primary">{val}</Badge> },
    { header: 'Sem', accessor: 'current_semester', align: 'center', render: (val) => `S${val}` },
    { header: 'Sec', accessor: 'section', align: 'center' },
    { header: 'Email', accessor: 'email', cellClassName: 'font-mono text-xs text-slate-300 truncate max-w-[140px]' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
    {
      header: 'Actions',
      accessor: 'student_id',
      align: 'center',
      render: (val, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="xs" icon={Eye} onClick={() => openViewModal(row)} />
          <Button variant="ghost" size="xs" icon={Edit} onClick={() => openEditModal(row)} />
          <Button variant="ghost" size="xs" icon={Trash2} className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => openDeleteModal(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Student Directory &amp; Admissions Management"
        icon={GraduationCap}
        subtitle="Manage student enrollment records, profiles, and academic allocations in PostgreSQL"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#0b121e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => loadData(true)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openAddModal}
            >
              Add Student
            </Button>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={8} cols={9} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadData(false)} />
        ) : students.length === 0 ? (
          <EmptyState title="No Students Found" description="No student records match your query." icon={GraduationCap} />
        ) : (
          <Table columns={columns} data={students} keyField="student_id" />
        )}
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Admit New Student" subtitle="Insert new student record into PostgreSQL database" maxWidth="max-w-2xl" icon={Plus}>
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={studentForm.roll_no}
                onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Registration Number *</label>
              <input
                type="text"
                required
                value={studentForm.reg_no}
                onChange={(e) => setStudentForm({ ...studentForm, reg_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={studentForm.first_name}
                onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={studentForm.last_name}
                onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Department *</label>
              <CustomSelect
                options={deptOptions}
                value={studentForm.dept_id}
                onChange={(e) => setStudentForm({ ...studentForm, dept_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Degree Program *</label>
              <CustomSelect
                options={courseOptions}
                value={studentForm.course_id}
                onChange={(e) => setStudentForm({ ...studentForm, course_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Semester *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={studentForm.current_semester}
                onChange={(e) => setStudentForm({ ...studentForm, current_semester: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Section *</label>
              <input
                type="text"
                required
                value={studentForm.section}
                onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Gender</label>
              <CustomSelect
                options={genderOptions}
                value={studentForm.gender}
                onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={studentForm.phone_no}
                onChange={(e) => setStudentForm({ ...studentForm, phone_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Create in PostgreSQL</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Record" subtitle={`Roll No: ${selectedStudent?.roll_no}`} maxWidth="max-w-2xl" icon={Edit}>
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={studentForm.first_name}
                onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={studentForm.last_name}
                onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={studentForm.phone_no}
                onChange={(e) => setStudentForm({ ...studentForm, phone_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={studentForm.current_semester}
                onChange={(e) => setStudentForm({ ...studentForm, current_semester: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Section</label>
              <input
                type="text"
                value={studentForm.section}
                onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Status</label>
              <CustomSelect
                options={statusOptions}
                value={studentForm.status}
                onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Update in PostgreSQL</Button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Student Record: ${selectedStudent?.roll_no}`} icon={GraduationCap}>
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0b121e] border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                <Badge variant="success" dot>{selectedStudent.status}</Badge>
              </div>
              <p className="text-slate-400 font-mono">
                {selectedStudent.roll_no} • {selectedStudent.reg_no}
              </p>
              <p className="text-blue-400 font-medium mt-0.5">{selectedStudent.course_name} ({selectedStudent.dept_name})</p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <div><dt className="text-slate-400">Current Semester</dt><dd className="text-slate-200 font-semibold">Semester {selectedStudent.current_semester} (Sec {selectedStudent.section})</dd></div>
              <div><dt className="text-slate-400">Gender</dt><dd className="text-slate-200 font-semibold">{selectedStudent.gender || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Email</dt><dd className="text-slate-200 font-semibold font-mono truncate">{selectedStudent.email || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Phone</dt><dd className="text-slate-200 font-semibold font-mono">{selectedStudent.phone_no || 'N/A'}</dd></div>
            </dl>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button variant="secondary" size="sm" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Student Deletion" icon={Trash2} iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20">
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-100">Permanent Database Deletion</p>
              <p className="mt-1 leading-relaxed">
                Are you sure you want to delete student <strong>{selectedStudent?.first_name} {selectedStudent?.last_name} ({selectedStudent?.roll_no})</strong>?
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <p className="font-bold text-amber-200">⚠ CASCADE WARNING — All related records will also be permanently deleted:</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-300/80 mt-1">
              <li>All enrollment records</li>
              <li>All attendance records (all semesters)</li>
              <li>All marks and exam records</li>
              <li>All semester results and SGPA/CGPA data</li>
              <li>All fee and payment records</li>
              <li>Admission record</li>
            </ul>
            <p className="text-amber-200 font-semibold mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" loading={saving} onClick={handleDelete}>Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
