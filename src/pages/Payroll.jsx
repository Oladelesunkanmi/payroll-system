import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Calculator, FileSpreadsheet, CheckCircle2, Clock, DollarSign, Info, Banknote } from 'lucide-react';

export default function Payroll() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [msg, setMsg] = useState('');
    const [saving, setSaving] = useState(false);
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        fetchPayrolls();
    }, [selectedMonth, selectedYear]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const data = await api.getPayrolls(selectedMonth, selectedYear);
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch payrolls:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateNigerianPIT = (monthlyGross) => {
        const annualGross = monthlyGross * 12;
        if (annualGross <= 0) return 0;

        const basic = annualGross * 0.50;
        const housing = annualGross * 0.30;
        const transport = annualGross * 0.20;

        const pension = (basic + housing + transport) * 0.08;
        const nhf = basic * 0.025;
        const totalDeductions = pension + nhf;

        let reliefBase = 200000;
        if (0.01 * annualGross > reliefBase) reliefBase = 0.01 * annualGross;
        const cra = reliefBase + (0.20 * annualGross);

        const taxableIncome = annualGross - cra - totalDeductions;
        if (taxableIncome <= 0) return Number(((annualGross * 0.01) / 12).toFixed(2));

        let annualTax = 0;
        let remaining = taxableIncome;

        const brackets = [
            { limit: 300000, rate: 0.07 },
            { limit: 300000, rate: 0.11 },
            { limit: 500000, rate: 0.15 },
            { limit: 500000, rate: 0.19 },
            { limit: 1600000, rate: 0.21 },
            { limit: Infinity, rate: 0.24 }
        ];

        for (const bracket of brackets) {
            if (remaining > bracket.limit) {
                annualTax += bracket.limit * bracket.rate;
                remaining -= bracket.limit;
            } else {
                annualTax += remaining * bracket.rate;
                remaining = 0;
                break;
            }
        }

        const monthlyTax = annualTax / 12;
        const minTax = (annualGross * 0.01) / 12;
        return Number(Math.max(monthlyTax, minTax).toFixed(2));
    };

    const saveRecord = useCallback(async (rec) => {
        setSaving(true);
        try {
            await api.updatePayroll(rec.id, {
                ...rec,
                net_salary: Number(calcNet(rec)),
                payment_status: 'Calculated'
            });
        } catch (error) {
            toast.error('Auto-save failed: ' + error.message);
        } finally {
            setSaving(false);
        }
    }, []);

    const handleFieldChange = (id, field, value) => {
        setRecords((prev) =>
            prev.map((r) => {
                if (r.id === id) {
                    const numVal = Number(value) || 0;
                    let updated = { ...r, [field]: numVal };

                    if (field === 'basic_salary' || field === 'allowances') {
                        const newGross = (field === 'basic_salary' ? numVal : r.basic_salary) + (field === 'allowances' ? numVal : r.allowances);
                        updated.tax = calculateNigerianPIT(newGross);
                    }

                    const final = { ...updated, net_salary: Number(calcNet(updated)) };

                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => {
                        saveRecord(final);
                    }, 8000);

                    return final;
                }
                return r;
            })
        );
    };

    const calcNet = (r) => (r.basic_salary + r.allowances - r.deductions - (r.absence_deduction || 0) - r.tax).toFixed(2);

    const handleCalc = async (rec) => {
        try {
            await api.updatePayroll(rec.id, {
                ...rec,
                net_salary: Number(calcNet(rec)),
                payment_status: 'Calculated'
            });
            toast.success(`Payroll for ${rec.employee.first_name} recalculated and saved!`);
            fetchPayrolls();
        } catch (error) {
            toast.error('Failed to update record: ' + error.message);
        }
    };

    const handleGenerate = async () => {
        const loading = toast.loading('Generating all monthly records...');
        try {
            await Promise.all(records.map(r => 
                api.updatePayroll(r.id, {
                    ...r,
                    net_salary: Number(calcNet(r)),
                    payment_status: 'Pending'
                })
            ));
            fetchPayrolls();
            toast.success('All monthly payroll records generated!', { id: loading });
        } catch (error) {
            toast.error('Failed to generate payroll: ' + error.message, { id: loading });
        }
    };

    const handlePayAll = async () => {
        if (!window.confirm('This will mark all records for this month as paid. Continue?')) return;
        
        const loading = toast.loading('Marking all records as paid...');
        setProcessing(true);
        try {
            const result = await api.bulkMarkPaid(selectedMonth, selectedYear);
            toast.success(result.message, { id: loading });
            fetchPayrolls();
        } catch (error) {
            toast.error('Failed to mark as paid: ' + error.message, { id: loading });
        } finally {
            setProcessing(false);
        }
    };

    const handlePaystack = async () => {
        if (!window.confirm('This will initiate bulk transfers via Paystack. Continue?')) return;
        
        const loading = toast.loading('Initiating bulk transfers via Paystack...');
        setProcessing(true);
        try {
            const result = await api.processBulkTransfer();
            toast.success(`Successfully initiated transfers for ${result.count} employees!`, { id: loading });
            fetchPayrolls();
        } catch (error) {
            toast.error('Paystack processing failed: ' + error.message, { id: loading });
        } finally {
            setProcessing(false);
        }
    };

    const totalNet = records.reduce((s, r) => s + Number(r.net_salary), 0);
    const processed = records.filter((r) => r.payment_status === 'Processed').length;

    const badge = (status) => {
        const m = {
            Processed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-500/30',
            Calculated: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/30',
            Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/30',
        };
        return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${m[status] || m.Pending}`;
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
                        <Banknote className="h-6 w-6 text-primary-500" />
                        Payroll Processing
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5">
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors"
                            >
                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                                    <option key={m} value={i + 1}>{m}</option>
                                ))}
                            </select>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{records.length} employees</p>
                        {saving && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-500 animate-pulse bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                                <Clock className="h-3 w-3" /> Auto-Saving
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleGenerate} className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface px-5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-dark-hover shadow-sm transition-all active:scale-95">
                        <Calculator className="h-4 w-4 shrink-0" />
                        <span>Generate Monthly List</span>
                    </button>
                    <button 
                        onClick={handlePayAll} 
                        disabled={processing || records.filter(r => r.payment_status !== 'Processed').length === 0}
                        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-6 text-sm font-bold text-white dark:text-slate-900 shadow-lg shadow-slate-500/20 transition-all hover:bg-slate-800 dark:hover:bg-dark-hover disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Pay All</span>
                    </button>
                    <button 
                        onClick={handlePaystack} 
                        disabled={processing || records.filter(r => r.payment_status === 'Pending').length === 0}
                        className="inline-flex h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        {processing ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        ) : (
                            <FileSpreadsheet className="h-4 w-4 shrink-0" />
                        )}
                        <span>Paystack</span>
                    </button>
                </div>
            </motion.div>

            {/* Success message */}
            {msg && (
                <motion.div variants={itemVariants} className="animate-scale-in flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-5 py-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0" /> {msg}
                </motion.div>
            )}

            {/* Summary cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 drop-shadow-sm">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Net Payroll</p>
                            <p className="truncate text-2xl font-black text-slate-800 dark:text-white mt-1">
                                ₦{totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 drop-shadow-sm">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Processed</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{processed} <span className="text-lg text-slate-400 font-medium tracking-normal">/ {records.length}</span></p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 dark:border-dark-border bg-white/80 dark:bg-dark-surface p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 drop-shadow-sm">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{records.length - processed}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payroll table */}
            <motion.div variants={itemVariants} className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/40 dark:shadow-black/20">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Employee</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Department</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Base Salary</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Bonus</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Deductions</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-center">Absences</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right text-amber-600 dark:text-amber-500">Absnt Deduct</th>
                                <th className="group relative whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right text-red-500 dark:text-red-400">
                                    <div className="flex items-center justify-end gap-1.5">
                                        Tax
                                        <Info className="h-4 w-4 text-slate-400 dark:text-slate-500 cursor-help" />
                                    </div>
                                    <div className="invisible absolute right-6 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 text-left text-xs font-normal text-slate-600 dark:text-slate-300 shadow-xl shadow-slate-200/60 dark:shadow-black/40 transition-all group-hover:visible normal-case tracking-normal">
                                        <p className="mb-2 font-bold text-slate-800 dark:text-white uppercase tracking-wider">Nigerian PAYE Rules</p>
                                        <ul className="space-y-2 list-disc pl-3">
                                            <li><span className="font-semibold text-slate-700 dark:text-slate-200">Consolidated Relief (CRA):</span> Higher of ₦200k or 1% Gross + 20% Gross (Annualized).</li>
                                            <li><span className="font-semibold text-slate-700 dark:text-slate-200">Pension:</span> 8% of Basic+Housing+Transport</li>
                                            <li><span className="font-semibold text-slate-700 dark:text-slate-200">NHF:</span> 2.5% of Basic</li>
                                            <li><span className="font-semibold text-slate-700 dark:text-slate-200">Taxable:</span> Gross - CRA - Deductions</li>
                                        </ul>
                                    </div>
                                </th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right text-emerald-600 dark:text-emerald-500">Net Pay</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-center">Status</th>
                                <th className="whitespace-nowrap px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center h-full">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : records.map((rec) => (
                                <tr key={rec.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-sm text-sm font-bold text-white">
                                                {rec.employee?.first_name?.[0]}{rec.employee?.last_name?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{rec.employee?.first_name} {rec.employee?.last_name}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">EMP{String(rec.employee_id).padStart(3, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{rec.employee?.department?.name || 'Unassigned'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <input
                                            type="number"
                                            value={rec.basic_salary}
                                            readOnly
                                            className="h-[36px] w-[140px] rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg/50 px-3 text-right text-sm font-mono font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70 focus:outline-none shadow-inner"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <input
                                            type="number"
                                            value={rec.allowances}
                                            onChange={(e) => handleFieldChange(rec.id, 'allowances', e.target.value)}
                                            className="h-[36px] w-[100px] rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bg px-3 text-right text-sm font-mono font-medium text-slate-700 dark:text-slate-200 transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none"
                                        />
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-bold text-slate-500 dark:text-slate-400">
                                        ₦{(rec.deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">{rec.absence_days || 0}d</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-bold text-amber-600 dark:text-amber-500">
                                        <span className="bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">₦{(rec.absence_deduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-bold text-red-500 dark:text-red-400">
                                        ₦{rec.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                                        ₦{Number(rec.net_salary || calcNet(rec)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center">
                                        <span className={badge(rec.payment_status)}>{rec.payment_status}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleCalc(rec)}
                                            className="inline-flex h-[36px] items-center justify-center gap-1.5 rounded-lg border border-primary-200 dark:border-primary-900/50 bg-primary-50 dark:bg-primary-900/10 px-3 text-xs font-bold text-primary-600 dark:text-primary-400 transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
                                        >
                                            <Calculator className="h-3.5 w-3.5" /> Calc
                                        </button>
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
