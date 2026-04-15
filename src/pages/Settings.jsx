import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Save, Building2, User, Mail, Shield, Sun, Moon, Monitor } from 'lucide-react';

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

    const inputClasses = "h-10 w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none";

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun, description: 'Classic light interface' },
        { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
        { value: 'system', label: 'System', icon: Monitor, description: 'Match your OS setting' },
    ];

    return (
        <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Profile & Company</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile, company settings, and appearance</p>
            </div>

            {saved && (
                <div className="animate-scale-in rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    Settings saved successfully!
                </div>
            )}

            {/* Appearance */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Appearance</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Choose your preferred theme</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {themeOptions.map(({ value, label, icon: Icon, description }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-300 ${
                                preference === value
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                                    : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                            }`}
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                                preference === value
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                            }`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-semibold ${
                                    preference === value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'
                                }`}>{label}</p>
                                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{description}</p>
                            </div>
                            {preference === value && (
                                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile */}
            <form onSubmit={handleSave} className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Profile Information</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Update your personal details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={`${inputClasses} pl-10`} />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                        <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                        <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className={inputClasses} />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
                        <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-300">Role: {user?.role}</span>
                    </div>
                </div>

                {/* Company */}
                <div className="mt-8 mb-5 flex items-center gap-3 border-t border-slate-100 dark:border-dark-border pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Company Information</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Your organisation details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                        <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Industry</label>
                        <input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Company Size</label>
                        <select value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })} className={inputClasses}>
                            <option>1-10</option><option>11-50</option><option>50-200</option><option>200-500</option><option>500+</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                        <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className={inputClasses} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700">
                        <Save className="h-4 w-4 shrink-0" />
                        <span>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
