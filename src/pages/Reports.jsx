import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Reports() {
    const { theme } = useTheme();
    const [reportsData, setReportsData] = useState(null);
    const [loading, setLoading] = useState(true);

    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await api.getReportsData();
                setReportsData(data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading || !reportsData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600"></div>
            </div>
        );
    }

    const { monthly_totals, department_distribution } = reportsData;

    const barData = {
        labels: monthly_totals?.map(m => m.month) || [],
        datasets: [{
            label: 'Payroll Total ($)',
            data: monthly_totals?.map(m => m.total) || [],
            backgroundColor: isDark
                ? ['#6366f1', '#6366f1', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
                : ['#c7d2fe', '#c7d2fe', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
            borderRadius: 6,
            barThickness: 36,
        }],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#334155' : '#1e293b',
                padding: 12,
                cornerRadius: 8,
                callbacks: { label: (c) => `₦${c.raw.toLocaleString()}` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', callback: (v) => `₦${(v / 1000).toFixed(0)}K`, font: { family: 'Inter', size: 12 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { family: 'Inter', size: 12 } }
            },
        },
    };

    const salaryDistData = {
        labels: department_distribution?.map(d => d.name) || [],
        datasets: [{
            data: department_distribution?.map(d => d.total_salary) || [],
            backgroundColor: isDark
                ? ['#818cf8', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9']
                : ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    const doughnutOpts = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 14, usePointStyle: true, pointStyleWidth: 8, font: { family: 'Inter', size: 12 }, color: isDark ? '#94a3b8' : '#64748b' }
            },
            tooltip: {
                backgroundColor: isDark ? '#334155' : '#1e293b',
                padding: 12,
                cornerRadius: 8,
                callbacks: { label: (c) => `₦${c.raw.toLocaleString()}` }
            },
        },
    };

    const totalSalary = department_distribution?.reduce((s, d) => s + d.total_salary, 0) || 0;
    const totalEmp = department_distribution?.reduce((s, d) => s + d.count, 0) || 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Payroll Reports</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Analytics and insights</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30"><DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" /></div>
                    <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Annual Salary</p><p className="text-lg font-bold text-slate-800 dark:text-white">₦{totalSalary.toLocaleString()}</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30"><Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                    <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Employees</p><p className="text-lg font-bold text-slate-800 dark:text-white">{totalEmp}</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30"><TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div>
                    <div><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Salary</p><p className="text-lg font-bold text-slate-800 dark:text-white">₦{totalEmp > 0 ? Math.round(totalSalary / totalEmp).toLocaleString() : 0}</p></div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm xl:col-span-2">
                    <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-white">Monthly Payroll Totals</h3>
                    <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Last 6 months</p>
                    <div className="h-72"><Bar data={barData} options={barOpts} /></div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-white">Salary Distribution</h3>
                    <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">By department</p>
                    <div className="h-64"><Doughnut data={salaryDistData} options={doughnutOpts} /></div>
                </div>
            </div>

            {/* Dept summary table */}
            <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm">
                <div className="p-6 pb-0">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">Department Salary Summary</h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Breakdown by department</p>
                </div>
                <div className="overflow-x-auto p-6 pt-4">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-dark-border">
                                <th className="pb-3 font-semibold text-slate-600 dark:text-slate-300">Department</th>
                                <th className="pb-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Employees</th>
                                <th className="pb-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Total Salary</th>
                                <th className="pb-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Avg Salary</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                            {department_distribution?.map((d) => (
                                <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{d.name}</td>
                                    <td className="py-3 text-right text-slate-600 dark:text-slate-400">{d.count}</td>
                                    <td className="py-3 text-right font-medium text-slate-800 dark:text-slate-200">₦{d.total_salary.toLocaleString()}</td>
                                    <td className="py-3 text-right text-slate-600 dark:text-slate-400">₦{d.count > 0 ? Math.round(d.total_salary / d.count).toLocaleString() : 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
