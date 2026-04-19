import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit3, Trash2, X, Search, Building2, Users
} from 'lucide-react';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
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

    const openAdd = () => { setEditingId(null); setName(''); setModalOpen(true); };
    const openEdit = (d) => { setEditingId(d.id); setName(d.name); setModalOpen(true); };

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

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updated = await api.updateDepartment(editingId, { name });
                setDepartments(prev => prev.map(d => d.id === editingId ? updated : d));
            } else {
                const created = await api.createDepartment({ name });
                setDepartments(prev => [...prev, created]);
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
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-[48px] w-full rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 pl-12 pr-4 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-sm transition-all"
                    />
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[500px] text-left text-sm">
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
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl custom-scrollbar border border-slate-200 dark:border-white/10"
                        >
                            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                            {editingId ? <Edit3 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                        </div>
                                        {editingId ? 'Edit Department' : 'Add Department'}
                                    </h3>
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
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Department Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Engineering"
                                        className="h-[44px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/50 px-4 text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
                                    <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors h-[44px] flex items-center">
                                        Cancel
                                    </button>
                                    <button type="submit" className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 h-[44px] flex items-center active:scale-95">
                                        {editingId ? 'Update' : 'Create'}
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
