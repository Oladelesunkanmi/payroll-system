import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, Edit3, Trash2, Filter,
    ChevronLeft, ChevronRight, Users, Briefcase, DollarSign, CheckCircle2
} from 'lucide-react';
import EmployeeModal from '../components/Modals/EmployeeModal';



export default function Employees() {
    const [employeeList, setEmployeeList] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
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
    const openAdd = () => { setEditingEmployee(null); setModalOpen(true); };
    const openEdit = (emp) => {
        setEditingEmployee(emp);
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

    const handleSave = async (formData) => {
        const payload = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            department_id: Number(formData.departmentId),
            position: formData.position,
            salary: Number(formData.salary),
            date_hired: new Date(formData.hireDate).toISOString(),
            account_number: formData.accountNumber,
            bank_code: formData.bankCode,
            bank_name: formData.bankName
        };

        try {
            if (editingEmployee) {
                const updated = await api.updateEmployee(editingEmployee.id, payload);
                setEmployeeList((prev) => prev.map((emp) =>
                    emp.id === editingEmployee.id ? updated : emp
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
            {/* Simple Stats Summary */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 drop-shadow-sm"><Users className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Teams</p><p className="text-2xl font-black text-slate-800 dark:text-white">{departments.length}</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 drop-shadow-sm"><Briefcase className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Staff Count</p><p className="text-2xl font-black text-slate-800 dark:text-white">{employeeList.length}</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 drop-shadow-sm"><CheckCircle2 className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Now</p><p className="text-2xl font-black text-slate-800 dark:text-white">{employeeList.length}</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 drop-shadow-sm"><DollarSign className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Est.</p><p className="text-2xl font-black text-slate-800 dark:text-white">₦{(employeeList.reduce((s, e) => s + e.salary, 0) / 1000000).toFixed(1)}M</p></div>
                </div>
            </motion.div>

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
                        placeholder=""
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="h-[48px] w-full rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg pl-12 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
                    <select
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                        className="h-[48px] w-full appearance-none rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg pl-12 pr-10 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all sm:w-56 relative z-0"
                    >
                        <option value="">All Departments</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20">
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

            <EmployeeModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingEmployee={editingEmployee}
                departments={departments}
            />
        </motion.div>
    );
}
