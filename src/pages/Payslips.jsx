import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Eye, ChevronDown, ChevronUp, User, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Payslips() {
    const { user } = useAuth();
    const [slips, setSlips] = useState([]);
    const [selected, setSelected] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.role === 'admin' || user?.role === 'hr';
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(user?.employee_id || '');

    useEffect(() => {
        if (isAdmin) {
            fetchEmployees();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (selectedEmployeeId) {
            fetchSlips(selectedEmployeeId);
        } else {
            setSlips([]);
            setSelected(null);
            setLoading(false);
        }
    }, [selectedEmployeeId]);

    const fetchEmployees = async () => {
        try {
            const data = await api.getEmployees();
            setEmployees(data);
            if (!selectedEmployeeId && data.length > 0) {
                setSelectedEmployeeId(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const fetchSlips = async (empId) => {
        setLoading(true);
        try {
            const data = await api.getMyPayrolls(empId);
            setSlips(data);
            if (data.length > 0) setSelected(data[0]);
            else setSelected(null);
        } catch (error) {
            console.error('Failed to fetch payslips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (slip) => {
        const doc = new jsPDF();
        const emp = slip.employee || {};

        // Document styling preferences
        const brandColor = [29, 78, 216]; // Tailwind blue-700
        const headerTextColor = [255, 255, 255];
        const textMuted = [100, 116, 139];
        
        // Brand/Header
        doc.setFontSize(24);
        doc.setTextColor(...brandColor);
        doc.setFont('helvetica', 'bold');
        doc.text("COMPANY PAYROLL", 14, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(...textMuted);
        doc.setFont('helvetica', 'normal');
        doc.text("123 Business Road, Lagos, Nigeria", 14, 32);
        doc.text("support@company.com | +234 800 000 0000", 14, 37);

        // Payslip info box
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42); // slate 900
        doc.setFont('helvetica', 'bold');
        doc.text("PAYSLIP", 196, 25, { align: "right" });
        doc.setFontSize(10);
        doc.setTextColor(...textMuted);
        doc.setFont('helvetica', 'normal');
        const periodStr = new Date(slip.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        doc.text(`Period: ${periodStr}`, 196, 32, { align: "right" });
        doc.text(`Status: ${slip.payment_status}`, 196, 37, { align: "right" });
        
        doc.setDrawColor(226, 232, 240); // slate 200
        doc.line(14, 45, 196, 45); // horizontal divider

        // Employee Details Header
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text("Employee Details", 14, 55);
        
        autoTable(doc, {
            startY: 60,
            theme: 'plain',
            body: [
                ['Name:', `${emp.first_name || ''} ${emp.last_name || ''}`, 'Employee ID:', `EMP${String(emp.id || '').padStart(3,'0')}`],
                ['Position:', emp.position || 'N/A', 'Department:', emp.department?.name || 'N/A'],
                ['Bank:', emp.bank_name || 'N/A', 'Account No:', emp.account_number || 'N/A']
            ],
            styles: { fontSize: 10, cellPadding: 2, textColor: [30, 41, 59] },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 25 },
                1: { cellWidth: 65 },
                2: { fontStyle: 'bold', cellWidth: 25 },
                3: { cellWidth: 65 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 12;
        
        // Earnings & Deductions
        autoTable(doc, {
            startY: finalY,
            theme: 'grid',
            headStyles: { fillColor: brandColor, textColor: headerTextColor, fontStyle: 'bold' },
            head: [['Description', 'Earnings (NGN)', 'Deductions (NGN)']],
            body: [
                ['Basic Salary', slip.basic_salary.toLocaleString(undefined, { minimumFractionDigits: 2 }), ''],
                ['Allowances', slip.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 }), ''],
                ['Company Deductions', '', slip.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })],
                ...(slip.absence_deduction > 0 ? [['Absences', '', slip.absence_deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })]] : []),
                ['Tax (P.A.Y.E)', '', slip.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })],
            ],
            bodyStyles: { textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            foot: [
                ['Total', 
                (slip.basic_salary + slip.allowances).toLocaleString(undefined, { minimumFractionDigits: 2 }), 
                (slip.deductions + (slip.absence_deduction || 0) + slip.tax).toLocaleString(undefined, { minimumFractionDigits: 2 })]
            ],
            footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
        });
        
        // Net Salary Box
        const netY = doc.lastAutoTable.finalY + 12;
        doc.setFillColor(240, 253, 244); // green-50
        doc.setDrawColor(187, 247, 208); // green-200
        doc.roundedRect(14, netY, 182, 18, 2, 2, 'FD'); // Fill and Draw border
        
        doc.setFontSize(12);
        doc.setTextColor(22, 101, 52); // green-800
        doc.setFont('helvetica', 'bold');
        doc.text("NET SALARY:", 20, netY + 12);
        
        doc.setFontSize(16);
        doc.text(`NGN ${slip.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 190, netY + 12, { align: 'right' });

        // Signature area
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFont('helvetica', 'normal');
        doc.line(14, netY + 40, 60, netY + 40);
        doc.text("Authorized Signature", 14, netY + 45);

        // Save
        const filename = `Payslip_${emp.first_name || 'Employee'}_${periodStr.replace(' ', '_')}.pdf`;
        doc.save(filename);
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600"></div></div>;

    const empObj = selected?.employee;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Payslips</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">View and download salary records</p>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="h-10 w-64 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-3 text-sm text-slate-700 dark:text-slate-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name} (EMP{String(emp.id).padStart(3, '0')})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {!selected ? (
                <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-dark-border bg-white/50 dark:bg-dark-surface/50">
                    <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No payslips found for this employee.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Current payslip */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden shadow-sm">
                            {/* Decorative top bar */}
                            <div className="h-2 bg-gradient-to-r from-primary-500 to-blue-600"></div>
                            
                            <div className="p-6 sm:p-8">
                                {/* Payslip Header */}
                                <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
                                            <span className="text-xl font-black text-white tracking-tighter">CO</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">COMPANY</h3>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Payslip Record</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end pt-2">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date(selected.period_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${selected.payment_status === 'Processed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {selected.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownloadPDF(selected)}
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-900 shadow-md hover:bg-slate-800 dark:hover:bg-white transition-colors"
                                        >
                                            <Download className="h-4 w-4 shrink-0" />
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Employee Details Block */}
                                <div className="mb-8 rounded-xl bg-slate-50 dark:bg-dark-card p-5 border border-slate-100 dark:border-dark-border">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        <User className="h-4 w-4 text-primary-500" />
                                        EMPLOYEE DETAILS
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Full Name</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{empObj?.first_name} {empObj?.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Employee ID</p>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">EMP{String(empObj?.id || '').padStart(3, '0')}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Designation</p>
                                            <p className="font-medium text-slate-700 dark:text-slate-300">{empObj?.position}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase font-semibold">Department</p>
                                            <p className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                {empObj?.department?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Details */}
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Earnings */}
                                    <div>
                                        <div className="mb-3 border-b border-slate-200 dark:border-dark-border pb-2">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Earnings</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Basic Salary</span>
                                                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">₦{selected.basic_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Allowances</span>
                                                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+ ₦{selected.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div>
                                        <div className="mb-3 border-b border-slate-200 dark:border-dark-border pb-2">
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Deductions</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Company Deductions</span>
                                                <span className="font-mono text-red-500 dark:text-red-400 font-semibold">- ₦{selected.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {selected.absence_deduction > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Absences ({selected.absence_days} days)</span>
                                                    <span className="font-mono text-amber-500 dark:text-amber-400 font-semibold">- ₦{selected.absence_deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Tax (P.A.Y.E)</span>
                                                <span className="font-mono text-red-500 dark:text-red-400 font-semibold">- ₦{selected.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Net */}
                                <div className="mt-8 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-500">Total Net Salary</span>
                                        <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                                            <span className="text-xl mr-1 font-semibold text-emerald-600/70 dark:text-emerald-500/50">₦</span>
                                            {selected.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface py-5 px-4 shadow-sm h-fit">
                        <h3 className="mb-4 px-2 text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary-500" />
                            Payroll History
                        </h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {slips.map((slip) => (
                                <div key={slip.id}>
                                    <button
                                        onClick={() => { setSelected(slip); setExpanded(expanded === slip.id ? null : slip.id); }}
                                        className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${selected.id === slip.id ? 'bg-primary-50/50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-700 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selected.id === slip.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                <Eye className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(slip.period_start).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                                <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">₦{slip.net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {expanded === slip.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                        </div>
                                    </button>
                                    
                                    {expanded === slip.id && (
                                        <div className="animate-scale-in my-1 ml-11 mr-2 rounded-xl bg-slate-50 dark:bg-dark-card p-3 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-dark-border space-y-1.5 shadow-inner">
                                            <p className="flex justify-between"><span>Basic:</span> <span className="font-mono font-semibold">₦{slip.basic_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                                            <p className="flex justify-between"><span>Allowances:</span> <span className="font-mono text-emerald-600">+₦{slip.allowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                                            <p className="flex justify-between"><span>Tax:</span> <span className="font-mono text-red-500">-₦{slip.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                                            <p className="flex justify-between"><span>Deductions:</span> <span className="font-mono text-red-500">-₦{slip.deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>
                                            {slip.absence_deduction > 0 && <p className="flex justify-between text-amber-600"><span>Absences ({slip.absence_days}d):</span> <span className="font-mono">-₦{slip.absence_deduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>}
                                            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-dark-border">
                                                <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(slip); }} className="w-full justify-center flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/30 py-1.5 rounded-lg transition-colors">
                                                    <Download className="h-3 w-3" /> Download PDF
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
