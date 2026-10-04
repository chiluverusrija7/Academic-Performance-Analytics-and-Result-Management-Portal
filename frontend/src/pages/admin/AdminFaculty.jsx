import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { LoadingSpinner, ErrorAlert, EmptyState } from '../../components/ui/States';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { Users, Plus, Search, Trash2, Edit, Eye, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';

export function AdminFaculty() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const toast = useToast();

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [viewDetails, setViewDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [facultyForm, setFacultyForm] = useState({
    employee_code: '',
    dept_id: '1',
    first_name: '',
    last_name: '',
    email: '',
    phone_no: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    specialization: 'Computer Science',
    employment_type: 'Full-Time',
    experience_years: '3',
    office_room: 'CS-201',
    status: 'Active',
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {};
      if (selectedDept) params.dept_id = selectedDept;
      const [facRes, deptRes] = await Promise.all([
        api.getFacultyList(params),
        api.getDepartments(),
      ]);

      if (facRes.success) setFaculty(facRes.data);
      if (deptRes.success) setDepartments(deptRes.data);

      if (isRefresh) {
        toast.success('Faculty directory updated from PostgreSQL', 'Synced');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty records');
      toast.error(err.message || 'Error loading faculty', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDept]);

  const openAddModal = () => {
    const nextCode = `EMP${String(faculty.length + 101).padStart(3, '0')}`;
    setFacultyForm({
      employee_code: nextCode,
      dept_id: departments[0]?.dept_id || '1',
      first_name: '',
      last_name: '',
      email: '',
      phone_no: '',
      designation: 'Assistant Professor',
      qualification: 'M.Tech',
      specialization: '',
      employment_type: 'Full-Time',
      experience_years: '3',
      office_room: '',
      status: 'Active',
    });
    setModalError('');
    setIsAddOpen(true);
  };

  const openEditModal = (f) => {
    setSelectedFaculty(f);
    setFacultyForm({
      first_name: f.first_name || '',
      last_name: f.last_name || '',
      email: f.email || '',
      phone_no: f.phone_no || '',
      designation: f.designation || 'Assistant Professor',
      qualification: f.qualification || 'M.Tech',
      specialization: f.specialization || '',
      employment_type: f.employment_type || 'Full-Time',
      experience_years: String(f.experience_years || 0),
      office_room: f.office_room || '',
      status: f.status || 'Active',
    });
    setModalError('');
    setIsEditOpen(true);
  };

  const openViewModal = async (f) => {
    setSelectedFaculty(f);
    setViewDetails(null);
    setIsViewOpen(true);
    setDetailsLoading(true);
    try {
      const res = await api.getFaculty(f.faculty_id);
      if (res.success) {
        setViewDetails(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load faculty dossier', 'Error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDeleteModal = (f) => {
    setSelectedFaculty(f);
    setModalError('');
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        ...facultyForm,
        dept_id: parseInt(facultyForm.dept_id, 10),
        experience_years: parseInt(facultyForm.experience_years, 10) || 0,
      };
      const res = await api.createFaculty(payload);
      if (res.success) {
        setIsAddOpen(false);
        toast.success(`Faculty member Prof. ${facultyForm.first_name} created in PostgreSQL!`, 'Faculty Added');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create faculty record');
      toast.error(err.message || 'Failed to create faculty', 'Create Error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        ...facultyForm,
        experience_years: parseInt(facultyForm.experience_years, 10) || 0,
      };
      const res = await api.updateFaculty(selectedFaculty.faculty_id, payload);
      if (res.success) {
        setIsEditOpen(false);
        toast.success(`Faculty profile for Prof. ${selectedFaculty.first_name} updated!`, 'Faculty Updated');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update faculty');
      toast.error(err.message || 'Failed to update faculty', 'Update Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setModalError('');
    try {
      const res = await api.deleteFaculty(selectedFaculty.faculty_id);
      if (res.success) {
        setIsDeleteOpen(false);
        toast.success(`Faculty record for ${selectedFaculty.employee_code} deleted!`, 'Faculty Deleted');
        await loadData();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to delete faculty');
      toast.error(err.message || 'Failed to delete faculty', 'Delete Error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = faculty.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (f.first_name || '').toLowerCase().includes(q) ||
      (f.last_name || '').toLowerCase().includes(q) ||
      (f.employee_code || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.specialization || '').toLowerCase().includes(q)
    );
  });

  const deptFilterOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: String(d.dept_id), label: `${d.dept_code} - ${d.dept_name}` })),
  ];

  const deptFormOptions = departments.map((d) => ({
    value: String(d.dept_id),
    label: `${d.dept_code} - ${d.dept_name}`,
  }));

  const designationOptions = [
    { value: 'Professor', label: 'Professor' },
    { value: 'Associate Professor', label: 'Associate Professor' },
    { value: 'Assistant Professor', label: 'Assistant Professor' },
    { value: 'Head of Department', label: 'Head of Department' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'On Leave', label: 'On Leave' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const columns = [
    { header: 'Code', accessor: 'employee_code', cellClassName: 'font-mono font-bold text-blue-400' },
    {
      header: 'Faculty Name',
      accessor: 'first_name',
      render: (val, row) => `Prof. ${val} ${row.last_name || ''}`,
    },
    { header: 'Department', accessor: 'dept_code', align: 'center', render: (val) => <Badge variant="sky">{val}</Badge> },
    { header: 'Designation', accessor: 'designation' },
    { header: 'Specialization', accessor: 'specialization', cellClassName: 'text-xs text-slate-300' },
    { header: 'Subjects', accessor: 'assigned_subjects_count', align: 'center', cellClassName: 'font-bold text-blue-400' },
    { header: 'Email', accessor: 'email', cellClassName: 'font-mono text-xs text-slate-300 truncate max-w-[140px]' },
    { header: 'Status', accessor: 'status', align: 'center', render: (val) => <Badge variant="success" dot>{val || 'Active'}</Badge> },
    {
      header: 'Actions',
      accessor: 'faculty_id',
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
        title="Faculty &amp; Teaching Staff Management"
        icon={Users}
        subtitle="Manage professor profiles, department allocations, and teaching modules in PostgreSQL"
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-44 sm:w-56">
              <Search size={14} className="text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#0b121e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="w-48 sm:w-56">
              <CustomSelect
                options={deptFilterOptions}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
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
              Add Faculty
            </Button>
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={8} cols={8} />
        ) : error ? (
          <ErrorAlert message={error} onRetry={() => loadData(false)} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No Faculty Found" description="No faculty records match your filters." icon={Users} />
        ) : (
          <Table columns={columns} data={filtered} keyField="faculty_id" />
        )}
      </Card>

      {/* Add Faculty Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Appoint New Faculty Member" subtitle="Insert faculty record into PostgreSQL database" maxWidth="max-w-2xl" icon={Plus}>
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Employee Code *</label>
              <input
                type="text"
                required
                value={facultyForm.employee_code}
                onChange={(e) => setFacultyForm({ ...facultyForm, employee_code: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Department *</label>
              <CustomSelect
                options={deptFormOptions}
                value={facultyForm.dept_id}
                onChange={(e) => setFacultyForm({ ...facultyForm, dept_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={facultyForm.first_name}
                onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={facultyForm.last_name}
                onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={facultyForm.phone_no}
                onChange={(e) => setFacultyForm({ ...facultyForm, phone_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Designation</label>
              <CustomSelect
                options={designationOptions}
                value={facultyForm.designation}
                onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={facultyForm.qualification}
                onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={facultyForm.experience_years}
                onChange={(e) => setFacultyForm({ ...facultyForm, experience_years: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems, Machine Learning"
                value={facultyForm.specialization}
                onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Office Room</label>
              <input
                type="text"
                placeholder="e.g. Room 303, Block B"
                value={facultyForm.office_room}
                onChange={(e) => setFacultyForm({ ...facultyForm, office_room: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Appoint in PostgreSQL</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Faculty Profile" subtitle={`Code: ${selectedFaculty?.employee_code}`} maxWidth="max-w-2xl" icon={Edit}>
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={facultyForm.first_name}
                onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                value={facultyForm.last_name}
                onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={facultyForm.phone_no}
                onChange={(e) => setFacultyForm({ ...facultyForm, phone_no: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Designation</label>
              <CustomSelect
                options={designationOptions}
                value={facultyForm.designation}
                onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Qualification</label>
              <input
                type="text"
                value={facultyForm.qualification}
                onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })}
                className="w-full bg-[#0b121e] border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Status</label>
              <CustomSelect
                options={statusOptions}
                value={facultyForm.status}
                onChange={(e) => setFacultyForm({ ...facultyForm, status: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
            <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>Update Faculty</Button>
          </div>
        </form>
      </Modal>

      {/* View Faculty Dossier Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Prof. ${selectedFaculty?.first_name} ${selectedFaculty?.last_name || ''}`} subtitle={selectedFaculty?.employee_code} icon={Users}>
        {detailsLoading ? (
          <div className="py-8 text-center"><p className="text-xs text-slate-400 animate-pulse">Loading assigned subjects from PostgreSQL...</p></div>
        ) : viewDetails ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#0b121e] border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-sm">Prof. {viewDetails.first_name} {viewDetails.last_name}</span>
                <Badge variant="success" dot>{viewDetails.status}</Badge>
              </div>
              <p className="text-slate-400 font-mono">
                {viewDetails.employee_code} • {viewDetails.designation}
              </p>
              <p className="text-blue-400 font-medium mt-0.5">{viewDetails.dept_name} ({viewDetails.dept_code})</p>
            </div>

            <dl className="grid grid-cols-2 gap-y-3 text-xs">
              <div><dt className="text-slate-400">Qualification</dt><dd className="text-slate-200 font-semibold">{viewDetails.qualification || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Specialization</dt><dd className="text-slate-200 font-semibold">{viewDetails.specialization || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Email</dt><dd className="text-slate-200 font-semibold font-mono truncate">{viewDetails.email || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Phone</dt><dd className="text-slate-200 font-semibold font-mono">{viewDetails.phone_no || 'N/A'}</dd></div>
              <div><dt className="text-slate-400">Experience</dt><dd className="text-slate-200 font-semibold">{viewDetails.experience_years} Years</dd></div>
              <div><dt className="text-slate-400">Office</dt><dd className="text-slate-200 font-semibold">{viewDetails.office_room || 'N/A'}</dd></div>
            </dl>

            <div className="pt-2 border-t border-white/5">
              <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-blue-400" />
                <span>Assigned Teaching Modules ({viewDetails.assigned_subjects?.length || 0})</span>
              </h4>
              {viewDetails.assigned_subjects?.length === 0 ? (
                <p className="text-slate-500 italic">No assigned subjects found.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {viewDetails.assigned_subjects?.map((sub) => (
                    <div key={sub.faculty_subject_id} className="p-2 bg-[#0b121e] rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-blue-400">{sub.subject_code}</span> - {sub.subject_name}
                        <div className="text-[10px] text-slate-400">Sem {sub.semester_no} (Sec {sub.section}) • {sub.credits} Credits</div>
                      </div>
                      <Badge variant="sky">{sub.assignment_status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/5">
              <Button variant="secondary" size="sm" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Faculty Deletion" icon={Trash2} iconColor="text-red-400" iconBg="bg-red-500/10 border-red-500/20">
        {modalError && <div className="mb-4"><ErrorAlert message={modalError} /></div>}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-100">Permanent Database Deletion</p>
              <p className="mt-1 leading-relaxed">
                Are you sure you want to delete faculty record <strong>Prof. {selectedFaculty?.first_name} {selectedFaculty?.last_name} ({selectedFaculty?.employee_code})</strong>?
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
            <p className="font-bold text-amber-200">⚠ NOTE: Deletion will fail if the faculty has:</p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-300/80 mt-1">
              <li>Assigned teaching subjects (faculty_subject records)</li>
              <li>Recorded attendance sessions</li>
              <li>Linked user accounts in the system</li>
            </ul>
            <p className="text-amber-200 font-semibold mt-1">You will receive an error message if deletion is blocked by active dependencies.</p>
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
