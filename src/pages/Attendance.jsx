import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Save, CheckCircle2, XCircle, Clock, Search, ClipboardList } from 'lucide-react';

export default function Attendance() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, [date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await api.getAttendanceByDate(date);
            setRecords(data);
        } catch (error) {
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (employeeId, status) => {
        setRecords(prev => prev.map(r =>
            r.employee_id === employeeId ? { ...r, status } : r
        ));
    };

    const handleNoteChange = (employeeId, note) => {
        setRecords(prev => prev.map(r =>
            r.employee_id === employeeId ? { ...r, note } : r
        ));
    };

    const handleSaveAll = async () => {
        const toSave = records.filter(r => r.status !== '');
        if (toSave.length === 0) {
            toast('No attendance records to save', { icon: 'ℹ️' });
            return;
        }

        setSaving(true);
        const loadingToast = toast.loading('Saving attendance...');
        try {
            await api.bulkMarkAttendance({
                date,
                records: toSave.map(r => ({
                    employee_id: r.employee_id,
                    status: r.status,
                    note: r.note || ''
                }))
            });
            toast.success('Attendance saved successfully!', { id: loadingToast });
            fetchAttendance();
        } catch (error) {
            toast.error('Failed to save attendance', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const markAllPresent = () => {
        setRecords(prev => prev.map(r =>
            r.status === '' || r.status === 'Absent' ? { ...r, status: 'Present' } : r
        ));
    };

    const filtered = records.filter(r => {
        const term = search.toLowerCase();
        return `${r.first_name} ${r.last_name}`.toLowerCase().includes(term) || r.department.toLowerCase().includes(term);
    });

    const statusColors = {
        'Present': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400',
        'Absent': 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-400',
        'Leave': 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-900/30 dark:text-violet-400',
        'Half Day': 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400',
        '': 'bg-slate-50 text-slate-500 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400'
    };

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
            {/* Header and Controls */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary-500" />
                        Daily Attendance
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Track and manage employee attendance logs</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="h-[44px] w-full sm:w-[180px] rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg pl-12 pr-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 shadow-sm focus:outline-none transition-all"
                        />
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 drop-shadow-sm"><CheckCircle2 className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Present</p><p className="text-2xl font-black text-slate-800 dark:text-white">{records.filter(r => r.status === 'Present').length}</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 drop-shadow-sm"><XCircle className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Absent</p><p className="text-2xl font-black text-slate-800 dark:text-white">{records.filter(r => r.status === 'Absent').length}</p></div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 drop-shadow-sm"><Clock className="h-6 w-6" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Half Day</p><p className="text-2xl font-black text-slate-800 dark:text-white">{records.filter(r => r.status === 'Half Day').length}</p></div>
                </div>
                <div className="rounded-2xl border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10 p-5 shadow-sm backdrop-blur-xl flex items-center gap-4 cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all hover:-translate-y-1 hover:shadow-md" onClick={markAllPresent}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 drop-shadow-sm"><CheckCircle2 className="h-6 w-6" /></div>
                    <div><p className="text-sm font-black text-primary-700 dark:text-primary-400">Mark All Present</p></div>
                </div>
            </motion.div>

            {/* Action Bar */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"

                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-[48px] w-full rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg px-5 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 shadow-sm focus:outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="inline-flex h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 disabled:opacity-50 active:scale-95"
                >
                    <Save className="h-5 w-5" />
                    Save Attendance
                </button>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Employee</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Department</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Status</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs w-1/3">Notes (Optional)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center h-full">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        <ClipboardList className="mx-auto h-10 w-10 opacity-20 mb-3" />
                                        <span className="font-medium">No records found for this date.</span>
                                    </td>
                                </tr>
                            ) : filtered.map((emp) => (
                                <tr key={emp.employee_id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm text-sm font-bold text-white">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">EMP{String(emp.employee_id).padStart(3, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{emp.department}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <select
                                            value={emp.status}
                                            onChange={(e) => handleStatusChange(emp.employee_id, e.target.value)}
                                            className={`h-[40px] w-full rounded-xl border-0 pl-4 pr-10 text-sm font-bold ring-1 ring-inset focus:ring-2 focus:ring-inset transition-all appearance-none ${statusColors[emp.status]}`}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Leave">Leave</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={emp.note}
                                            onChange={(e) => handleNoteChange(emp.employee_id, e.target.value)}
                                            placeholder="Reason for absence or note..."
                                            className="h-[40px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg px-4 text-sm font-medium outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-dark-surface focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all dark:text-white placeholder:text-slate-400"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
