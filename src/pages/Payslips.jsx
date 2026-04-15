import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function Payslips() {
    const { user } = useAuth();
    const [slips, setSlips] = useState([]);
    const [selected, setSelected] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlips = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const empId = user.employee_id;
                if (!empId) {
                    setLoading(false);
                    return;
                }
                const data = await api.getMyPayrolls(empId);
                setSlips(data);
                if (data.length > 0) setSelected(data[0]);
            } catch (error) {
                console.error('Failed to fetch payslips:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlips();
    }, [user]);

    const handleDownload = (slip) => {
        const text = `PAYSLIP - ${new Date(slip.period_start).toLocaleDateString()}\n\nBasic Salary: ₦${slip.basic_salary.toFixed(2)}\nAllowances: ₦${slip.allowances.toFixed(2)}\nDeductions: ₦${slip.deductions.toFixed(2)}\nTax: ₦${slip.tax.toFixed(2)}\nNet Salary: ₦${slip.net_salary.toFixed(2)}\n\nStatus: ${slip.payment_status}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${new Date(slip.period_start).getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600"></div></div>;
    if (!selected) return <div className="py-12 text-center text-slate-500 dark:text-slate-400">No payslips found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">My Payslips</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">View and download your salary payslips</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Current payslip */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                    <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">Payslip — {new Date(selected.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Status: {selected.payment_status}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(selected)}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700"
                            >
                                <Download className="h-4 w-4 shrink-0" />
                                <span>Download</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Earnings */}
                            <div className="rounded-lg border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-card p-4">
                                <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Earnings</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">₦{selected.basic_salary.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Allowances</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">+₦{selected.allowances.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="rounded-lg border border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-card p-4">
                                <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Deductions</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Company Deductions</span>
                                        <span className="font-medium text-red-500 dark:text-red-400">-₦{selected.deductions.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Tax</span>
                                        <span className="font-medium text-red-500 dark:text-red-400">-₦{selected.tax.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Net */}
                            <div className="rounded-lg border-2 border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20 p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Net Salary</span>
                                    <span className="text-xl font-bold text-primary-700 dark:text-primary-300">₦{selected.net_salary.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-white">Payroll History</h3>
                    <div className="space-y-2">
                        {slips.map((slip) => (
                            <div key={slip.id}>
                                <button
                                    onClick={() => { setSelected(slip); setExpanded(expanded === slip.id ? null : slip.id); }}
                                    className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${selected.id === slip.id ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{new Date(slip.period_start).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">₦{slip.net_salary.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${slip.payment_status === 'Processed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30' : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30'}`}>
                                            {slip.payment_status}
                                        </span>
                                        {expanded === slip.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </div>
                                </button>
                                {expanded === slip.id && (
                                    <div className="animate-scale-in mt-1 rounded-lg bg-slate-50 dark:bg-dark-card p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                        <p>Basic: ₦{slip.basic_salary.toFixed(2)}</p>
                                        <p>Allowances: +₦{slip.allowances.toFixed(2)}</p>
                                        <p>Tax: -₦{slip.tax.toFixed(2)}</p>
                                        <p>Deductions: -₦{slip.deductions.toFixed(2)}</p>
                                        <button onClick={() => handleDownload(slip)} className="mt-2 text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                                            <Download className="h-3 w-3" /> Download
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
