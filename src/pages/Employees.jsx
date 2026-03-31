import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Search, Plus, Edit3, Trash2, X, Filter,
    ChevronLeft, ChevronRight,
} from 'lucide-react';

const emptyForm = { 
    firstName: '', 
    lastName: '', 
    email: '', 
    departmentId: '', 
    position: '', 
    salary: '', 
    hireDate: '',
    accountNumber: '',
    bankCode: '',
    bankName: ''
};

export default function Employees() {
    const [employeeList, setEmployeeList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const perPage = 8;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [emps, depts] = await Promise.all([api.getEmployees(), api.getDepartments()]);
            setEmployeeList(emps);
            setDepartments(depts);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    /* Filtered list */
    const filtered = employeeList.filter((e) => {
        const fullName = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase();
        const matchSearch =
            fullName.includes(search.toLowerCase()) ||
            String(e.id).includes(search) ||
            (e.email || '').toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter ? e.department_id === Number(deptFilter) : true;
        return matchSearch && matchDept;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    /* Handlers */
    const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
    const openEdit = (emp) => {
        setEditingId(emp.id);
        setForm({
            firstName: emp.first_name,
            lastName: emp.last_name,
            email: emp.email,
            departmentId: emp.department_id,
            position: emp.position,
            salary: emp.salary,
            hireDate: emp.date_hired ? emp.date_hired.split('T')[0] : '',
            accountNumber: emp.account_number || '',
            bankCode: emp.bank_code || '',
            bankName: emp.bank_name || ''
        });
        setModalOpen(true);
    };
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.deleteEmployee(id);
                setEmployeeList((prev) => prev.filter((e) => e.id !== id));
            } catch (error) {
                alert('Failed to delete employee: ' + error.message);
            }
        }
    };
    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            department_id: Number(form.departmentId),
            position: form.position,
            salary: Number(form.salary),
            date_hired: new Date(form.hireDate).toISOString(),
            account_number: form.accountNumber,
            bank_code: form.bankCode,
            bank_name: form.bankName
        };

        try {
            if (editingId) {
                const updated = await api.updateEmployee(editingId, payload);
                setEmployeeList((prev) => prev.map((emp) =>
                    emp.id === editingId ? updated : emp
                ));
            } else {
                const created = await api.createEmployee(payload);
                setEmployeeList((prev) => [...prev, created]);
            }
            setModalOpen(false);
        } catch (error) {
            alert('Failed to save employee: ' + error.message);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'On Leave': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
        };
        return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Active}`;
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Employee Management</h2>
                    <p className="text-sm text-slate-500">{filtered.length} employees found</p>
                </div>
                <button
                    id="add-employee-btn"
                    onClick={openAdd}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        id="employee-search"
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search employees..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    />
                </div>
                <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                        id="department-filter"
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-10 pr-8 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none sm:w-48"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">ID</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Name</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Department</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Position</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Salary</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.map((emp) => (
                                <tr key={emp.id} className="transition-colors hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">{emp.id}</td>
                                    <td className="whitespace-nowrap px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-semibold text-white">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs text-slate-400">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{emp.department?.name || 'Unassigned'}</td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{emp.position}</td>
                                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-800">₦{emp.salary?.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-4 py-3.5">
                                        <span className={statusBadge('Active')}>Active</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEdit(emp)}
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === i + 1
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="animate-scale-in w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl custom-scrollbar">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Edit Employee' : 'Add New Employee'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                                    <input
                                        id="firstName"
                                        required
                                        value={form.firstName}
                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                                    <input
                                        id="lastName"
                                        required
                                        value={form.lastName}
                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                                    <input
                                        id="email"
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="departmentId" className="mb-1 block text-sm font-medium text-slate-700">Department</label>
                                    <select
                                        id="departmentId"
                                        required
                                        value={form.departmentId}
                                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {Array.isArray(departments) && departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Position</label>
                                    <input
                                        required
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Salary</label>
                                    <input
                                        required
                                        type="number"
                                        value={form.salary}
                                        onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">Hire Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.hireDate}
                                        onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="mb-3 text-sm font-semibold text-slate-800">Bank Details (for Paystack transfers)</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Bank Name</label>
                                        <input
                                            required
                                            value={form.bankName}
                                            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                                            placeholder="e.g. Zenith Bank"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Account Number</label>
                                        <input
                                            required
                                            value={form.accountNumber}
                                            onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                                            placeholder="10-digit NUBAN"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-slate-700">Bank Code</label>
                                        <input
                                            required
                                            value={form.bankCode}
                                            onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
                                            placeholder="e.g. 057"
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700"
                                >
                                    {editingId ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
