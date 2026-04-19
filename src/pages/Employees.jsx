import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit3, Trash2, X, Filter,
    ChevronLeft, ChevronRight, Users, Briefcase, Banknote
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
            Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30',
            'On Leave': 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30',
            Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/30',
        };
        return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status] || styles.Active}`;
    };

    const inputClasses = "h-[44px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/50 px-4 text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-10">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary-500" />
                        Staff Directory
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage and view your {filtered.length} employees</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 h-[44px] text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 active:scale-95"
                >
                    <Plus className="h-5 w-5 shrink-0" />
                    <span>Add Employee</span>
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="h-[48px] w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
                    <select
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                        className="h-[48px] w-full appearance-none rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 pl-12 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all sm:w-56 relative z-0"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">ID</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Name</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Department</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Position</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Salary</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Status</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {paginated.map((emp) => (
                                <tr key={emp.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">EMP{String(emp.id).padStart(3, '0')}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm text-sm font-bold text-white">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            {emp.department?.name || 'Unassigned'}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">{emp.position}</td>
                                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-800 dark:text-slate-200">₦{emp.salary?.toLocaleString()}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={statusBadge('Active')}>Active</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(emp)}
                                                className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(emp.id)}
                                                className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
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
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <Users className="h-10 w-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No employees found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-800/10 px-6 py-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-xl p-2 h-[36px] w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-[36px] w-[36px] rounded-xl text-sm font-bold transition-colors ${page === i + 1
                                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-xl p-2 h-[36px] w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl custom-scrollbar border border-slate-200 dark:border-white/10"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                        {editingId ? <Edit3 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                    </div>
                                    {editingId ? 'Edit Employee Details' : 'Onboard New Employee'}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-1 pl-11">Fill in the required information below.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="rounded-full p-2 h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">First Name</label>
                                    <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClasses} placeholder="John" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Last Name</label>
                                    <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inputClasses} placeholder="Doe" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClasses} placeholder="john@company.com" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Department</label>
                                    <select required value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className={inputClasses}>
                                        <option value="" disabled>Select Department</option>
                                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 border-t border-slate-100 dark:border-white/5 pt-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Position / Title</label>
                                    <input required value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className={inputClasses} placeholder="e.g. Senior Dev" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Base Salary (₦)</label>
                                    <input required type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className={inputClasses} placeholder="0.00" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date Hired</label>
                                    <input required type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className={inputClasses} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-white/5 pt-5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-5 mt-4">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-emerald-500" /> Financial Details
                                </h4>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Bank Name</label>
                                        <input required value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} className={inputClasses} placeholder="Guaranty Trust Bank" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Account No.</label>
                                        <input required value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} className={inputClasses} placeholder="0123456789" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Bank routing code</label>
                                        <input required value={form.bankCode} onChange={e => setForm({ ...form, bankCode: e.target.value })} className={inputClasses} placeholder="058" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors h-[44px] flex items-center">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 h-[44px] flex items-center active:scale-95">
                                    {editingId ? 'Update Employee' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>
        </motion.div>
    );
}
