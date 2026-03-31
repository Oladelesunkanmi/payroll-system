import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calculator, FileSpreadsheet, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export default function Payroll() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const data = await api.getPayrolls();
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (id, field, value) => {
        setRecords((prev) =>
            prev.map((r) => {
                if (r.id === id) {
                    const updated = { ...r, [field]: Number(value) || 0 };
                    // Recalculate net salary live
                    return { ...updated, net_salary: Number(calcNet(updated)) };
                }
                return r;
            })
        );
    };

    const calcNet = (r) => (r.basic_salary + r.allowances - r.deductions).toFixed(2);

    const handleGenerate = async () => {
        try {
            await Promise.all(records.map(r => 
                api.updatePayroll(r.id, {
                    ...r,
                    net_salary: Number(calcNet(r)),
                    payment_status: 'Pending'
                })
            ));
            fetchPayrolls();
            setMsg('Monthly payroll records generated and pending processing.');
            setTimeout(() => setMsg(''), 4000);
        } catch (error) {
            alert('Failed to generate payroll: ' + error.message);
        }
    };

    const handlePaystack = async () => {
        if (!window.confirm('This will initiate bulk transfers via Paystack. Continue?')) return;
        
        setProcessing(true);
        try {
            const result = await api.processBulkTransfer();
            setMsg(`Successfully initiated transfers for ${result.count} employees via Paystack.`);
            fetchPayrolls();
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            alert('Paystack processing failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    const totalNet = records.reduce((s, r) => s + Number(r.net_salary), 0);
    const processed = records.filter((r) => r.payment_status === 'Processed').length;

    const badge = (status) => {
        const m = {
            Processed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            Calculated: 'bg-blue-50 text-blue-700 ring-blue-600/20',
            Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        };
        return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${m[status] || m.Pending}`;
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Payroll Processing</h2>
                    <p className="text-sm text-slate-500">March 2026 — {records.length} employees</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleGenerate} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Calculator className="h-4 w-4 shrink-0" />
                        <span>Generate Monthly List</span>
                    </button>
                    <button 
                        onClick={handlePaystack} 
                        disabled={processing || records.filter(r => r.payment_status === 'Pending').length === 0}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        ) : (
                            <FileSpreadsheet className="h-4 w-4 shrink-0" />
                        )}
                        <span>Process via Paystack</span>
                    </button>
                </div>
            </div>

            {/* Success message */}
            {msg && (
                <div className="animate-scale-in flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {msg}
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                        <DollarSign className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">Total Net Payroll</p>
                        <p className="truncate text-lg font-bold text-slate-800">
                            ₦{totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Processed</p>
                        <p className="text-lg font-bold text-slate-800">{processed} / {records.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">Pending</p>
                        <p className="text-lg font-bold text-slate-800">{records.length - processed}</p>
                    </div>
                </div>
            </div>

            {/* Payroll table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Employee</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">Department</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Base Salary</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Bonus</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Deductions</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-right">Net Pay</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.map((rec) => (
                                <tr key={rec.id} className="transition-colors hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap px-4 py-3.5">
                                        <p className="font-medium text-slate-800">{rec.employee?.first_name} {rec.employee?.last_name}</p>
                                        <p className="text-xs text-slate-400">EMP{String(rec.employee_id).padStart(3, '0')}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{rec.employee?.department?.name || 'Unassigned'}</td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-slate-700">
                                        ₦{rec.basic_salary?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                                        <input
                                            type="number"
                                            value={rec.allowances}
                                            onChange={(e) => handleFieldChange(rec.id, 'allowances', e.target.value)}
                                            className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-sm text-slate-700 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 focus:outline-none"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                                        <input
                                            type="number"
                                            value={rec.deductions}
                                            onChange={(e) => handleFieldChange(rec.id, 'deductions', e.target.value)}
                                            className="w-24 rounded border border-slate-200 px-2 py-1 text-right text-sm text-slate-700 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 focus:outline-none"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-800">
                                        ₦{Number(rec.net_salary || calcNet(rec)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                        <span className={badge(rec.payment_status)}>{rec.payment_status}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                        <button
                                            onClick={() => handleCalc(rec)}
                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
                                        >
                                            <Calculator className="h-3.5 w-3.5" /> Calculate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
