import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Save, Building2, User, Mail, Shield, Sun, Moon, Monitor, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const { preference, setTheme } = useTheme();
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
    });
    const [company, setCompany] = useState({
        name: '',
        industry: '',
        size: '',
        address: '',
    });

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputClasses = "h-[44px] w-full rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg px-4 text-sm font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 transition-all focus:outline-none";

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun, description: 'Classic light interface' },
        { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
        { value: 'system', label: 'System', icon: Monitor, description: 'Match your OS setting' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-4xl space-y-6 pb-10">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                        <SettingsIcon className="h-6 w-6 text-primary-500" />
                        System Settings
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Manage your preferences, profile, and company configuration</p>
                </div>
            </motion.div>

            {saved && (
                <motion.div variants={itemVariants} className="animate-scale-in rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-5 py-4 text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200/50 dark:bg-emerald-800/50">
                        <Save className="h-4 w-4" />
                    </div>
                    Settings saved successfully!
                </motion.div>
            )}

            {/* Appearance */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
                <div className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20 px-6 py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 shadow-sm">
                        <Sun className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Appearance & Theme</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Customize how the platform looks on your device</p>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {themeOptions.map(({ value, label, icon: Icon, description }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
                                    preference === value
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 shadow-lg shadow-primary-500/10'
                                        : 'border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20 hover:border-slate-300 dark:hover:border-dark-hover hover:shadow-md hover:bg-white dark:hover:bg-dark-hover'
                                }`}
                            >
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                                    preference === value
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110'
                                        : 'bg-white dark:bg-dark-bg text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-dark-surface group-hover:text-slate-600 dark:group-hover:text-slate-300 shadow-sm'
                                }`}>
                                    <Icon className="h-7 w-7" />
                                </div>
                                <div className="text-center mt-2">
                                    <p className={`text-base font-bold ${
                                        preference === value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'
                                    }`}>{label}</p>
                                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[140px] leading-relaxed mx-auto">{description}</p>
                                </div>
                                {preference === value && (
                                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-md">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Profile & Company */}
            <motion.form variants={itemVariants} onSubmit={handleSave} className="rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
                <div className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20 px-6 py-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 shadow-sm">
                        <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Account Details</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Update your personal and organizational information</p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Profile Section */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Personal Information
                        </h4>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClasses} placeholder="Your name" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={`${inputClasses} pl-12`} placeholder="you@company.com" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClasses} placeholder="+234..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Address</label>
                                <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={inputClasses} placeholder="Your address" />
                            </div>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
                                <Shield className="h-4 w-4 text-primary-500" />
                                <span className="text-sm font-bold capitalize text-slate-700 dark:text-slate-300">Access Level: {user?.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-dark-border w-full"></div>

                    {/* Company Section */}
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Company Information
                        </h4>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Organization Name</label>
                                <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className={inputClasses} placeholder="Company Ltd" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Industry</label>
                                <input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} className={inputClasses} placeholder="e.g. Technology" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Company Size</label>
                                <select value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })} className={`${inputClasses} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat`}>
                                    <option>1-10 Employees</option>
                                    <option>11-50 Employees</option>
                                    <option>50-200 Employees</option>
                                    <option>200-500 Employees</option>
                                    <option>500+ Employees</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Headquarters</label>
                                <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className={inputClasses} placeholder="Location" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20 px-6 py-5 sm:px-8 flex justify-end">
                    <button type="submit" className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 active:scale-95 w-full sm:w-auto">
                        <Save className="h-5 w-5 shrink-0" />
                        <span>Save Configuration</span>
                    </button>
                </div>
            </motion.form>
        </motion.div>
    );
}
