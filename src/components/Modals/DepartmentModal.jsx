import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Building2 } from 'lucide-react';

export default function DepartmentModal({ isOpen, onClose, onSave, editingDepartment }) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (editingDepartment) {
            setName(editingDepartment.name);
        } else {
            setName('');
        }
    }, [editingDepartment, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-dark-surface p-6 sm:p-8 shadow-2xl custom-scrollbar border border-slate-200 dark:border-dark-border"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                        {editingDepartment ? <Edit3 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                    </div>
                                    {editingDepartment ? 'Edit Department' : 'Add Department'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full p-2 h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Department Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Engineering"
                                    className="h-[44px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg px-4 text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors h-[44px] flex items-center"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 h-[44px] flex items-center active:scale-95"
                                >
                                    {editingDepartment ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
