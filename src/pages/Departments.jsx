import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Edit3, Trash2 } from 'lucide-react';
import DepartmentModal from '../components/Modals/DepartmentModal';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await api.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = departments.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingDepartment(null);
        setModalOpen(true);
    };

    const openEdit = (dept) => {
        setEditingDepartment(dept);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this department?')) {
            try {
                await api.deleteDepartment(id);
                setDepartments(prev => prev.filter(d => d.id !== id));
            } catch (error) {
                alert('Failed to delete department: ' + error.message);
            }
        }
    };

    const handleSave = async (name) => {
        try {
            if (editingDepartment) {
                const updated = await api.updateDepartment(editingDepartment.id, { name });
                setDepartments((prev) => prev.map((d) => (d.id === editingDepartment.id ? updated : d)));
            } else {
                const created = await api.createDepartment({ name });
                setDepartments((prev) => [...prev, created]);
            }
            setModalOpen(false);
        } catch (error) {
            alert('Failed to save department: ' + error.message);
        }
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
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary-500" />
                        Departments
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage organizational units and structure</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 h-[44px] text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 active:scale-95"
                >
                    <Plus className="h-5 w-5 shrink-0" />
                    <span>Add Department</span>
                </button>
            </motion.div>

            {/* Filter Bar */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-[48px] w-full rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg px-5 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all"
                    />
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-[60%] min-w-[400px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs w-1/4">ID</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Department Name</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filtered.map((d) => (
                                <tr key={d.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                                    <td className="whitespace-nowrap px-6 py-5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">DEPT{String(d.id).padStart(3, '0')}</td>
                                    <td className="whitespace-nowrap px-6 py-5">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-base">{d.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(d)}
                                                className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <Building2 className="h-10 w-10 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No departments found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal */}
            <DepartmentModal 
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingDepartment={editingDepartment}
            />
        </motion.div>
    );
}
