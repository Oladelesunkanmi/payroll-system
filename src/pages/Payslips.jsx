import { useState } from 'react';
import { payslipHistory } from '../data/mockData';
import { Download, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function Payslips() {
    const [selected, setSelected] = useState(payslipHistory[0]);
    const [expanded, setExpanded] = useState(null);

    const handleDownload = (slip) => {
        const text = `PAYSLIP - ${slip.month}\n\nBasic Salary: $${slip.basicSalary.toFixed(2)}\nAllowances: $${slip.allowances.toFixed(2)}\nDeductions: $${slip.deductions.toFixed(2)}\nNet Salary: $${slip.netSalary.toFixed(2)}\n\nStatus: ${slip.status}\nPaid: ${slip.paidDate}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${slip.month.replace(/\s/g, '-').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800">My Payslips</h2>
                <p className="text-sm text-slate-500">View and download your salary payslips</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Current payslip */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                                    <FileText className="h-5 w-5 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800">Payslip — {selected.month}</h3>
                                    <p className="text-xs text-slate-400">Paid on {selected.paidDate}</p>
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
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                <h4 className="mb-3 text-sm font-semibold text-slate-700">Earnings</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Basic Salary</span>
                                        <span className="font-medium text-slate-800">${selected.basicSalary.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Allowances</span>
                                        <span className="font-medium text-emerald-600">+${selected.allowances.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                                <h4 className="mb-3 text-sm font-semibold text-slate-700">Deductions</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Total Deductions</span>
                                    <span className="font-medium text-red-500">-${selected.deductions.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Net */}
                            <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-semibold text-primary-700">Net Salary</span>
                                    <span className="text-xl font-bold text-primary-700">${selected.netSalary.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-base font-semibold text-slate-800">Payroll History</h3>
                    <div className="space-y-2">
                        {payslipHistory.map((slip) => (
                            <div key={slip.id}>
                                <button
                                    onClick={() => { setSelected(slip); setExpanded(expanded === slip.id ? null : slip.id); }}
                                    className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors ${selected.id === slip.id ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{slip.month}</p>
                                            <p className="text-xs text-slate-400">${slip.netSalary.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                            {slip.status}
                                        </span>
                                        {expanded === slip.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                    </div>
                                </button>
                                {expanded === slip.id && (
                                    <div className="animate-scale-in mt-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                                        <p>Basic: ${slip.basicSalary.toFixed(2)}</p>
                                        <p>Allowances: +${slip.allowances.toFixed(2)}</p>
                                        <p>Deductions: -${slip.deductions.toFixed(2)}</p>
                                        <button onClick={() => handleDownload(slip)} className="mt-2 text-primary-600 hover:underline flex items-center gap-1">
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
