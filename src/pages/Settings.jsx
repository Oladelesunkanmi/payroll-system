import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Building2, User, Mail, Shield } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+1 (555) 123-4567',
        address: '123 Business Ave, Suite 100',
    });
    const [company, setCompany] = useState({
        name: 'PayrollPro Inc.',
        industry: 'Technology',
        size: '50-200',
        address: '456 Corporate Blvd, Floor 10',
    });

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Profile & Company</h2>
                <p className="text-sm text-slate-500">Manage your profile and company settings</p>
            </div>

            {saved && (
                <div className="animate-scale-in rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Settings saved successfully!
                </div>
            )}

            {/* Profile */}
            <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Profile Information</h3>
                        <p className="text-xs text-slate-400">Update your personal details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                        <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                        <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                        <Shield className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium capitalize text-slate-600">Role: {user?.role}</span>
                    </div>
                </div>

                {/* Company */}
                <div className="mt-8 mb-5 flex items-center gap-3 border-t border-slate-100 pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                        <Building2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-800">Company Information</h3>
                        <p className="text-xs text-slate-400">Your organisation details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Company Name</label>
                        <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Industry</label>
                        <input value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Company Size</label>
                        <select value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none">
                            <option>1-10</option><option>11-50</option><option>50-200</option><option>200-500</option><option>500+</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                        <input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
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
