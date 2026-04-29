import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Users, Banknote } from 'lucide-react';

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

export default function EmployeeModal({ isOpen, onClose, onSave, editingEmployee, departments }) {
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        if (editingEmployee) {
            setForm({
                firstName: editingEmployee.first_name || '',
                lastName: editingEmployee.last_name || '',
                email: editingEmployee.email || '',
                departmentId: editingEmployee.department_id || '',
                position: editingEmployee.position || '',
                salary: editingEmployee.salary || '',
                hireDate: editingEmployee.date_hired ? editingEmployee.date_hired.split('T')[0] : '',
                accountNumber: editingEmployee.account_number || '',
                bankCode: editingEmployee.bank_code || '',
                bankName: editingEmployee.bank_name || ''
            });
        } else {
            setForm(emptyForm);
        }
    }, [editingEmployee, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const inputClasses = "h-[44px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg px-4 text-sm text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none transition-all";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-dark-surface p-6 sm:p-8 shadow-2xl custom-scrollbar border border-slate-200 dark:border-dark-border"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                        {editingEmployee ? <Edit3 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                    </div>
                                    {editingEmployee ? 'Edit Employee Details' : 'Onboard New Employee'}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-1 pl-11">Fill in the required information below.</p>
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

                            <div className="border-t border-slate-100 dark:border-white/5 pt-5 rounded-xl bg-slate-50/50 dark:bg-dark-bg/20 p-5 mt-4">
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
                                <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors h-[44px] flex items-center">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-xl bg-primary-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 h-[44px] flex items-center active:scale-95">
                                    {editingEmployee ? 'Update Employee' : 'Save Employee'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
