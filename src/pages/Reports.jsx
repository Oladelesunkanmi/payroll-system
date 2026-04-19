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
import { TrendingUp, Users, DollarSign, Lightbulb, ChevronRight } from 'lucide-react';

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
            label: 'Payroll Total (₦)',
            data: monthly_totals?.map(m => m.total) || [],
            backgroundColor: isDark
                ? ['#6366f1', '#6366f1', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
                : ['#c7d2fe', '#c7d2fe', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
            borderRadius: 6,
            barThickness: 48,
        }],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#334155' : '#1e293b',
                padding: 16,
                cornerRadius: 8,
                titleFont: { size: 14, family: 'sans-serif', weight: 'bold' },
                bodyFont: { size: 14, family: 'sans-serif' },
                callbacks: { label: (c) => `₦${c.raw.toLocaleString()}` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: isDark ? '#1e293b' : '#f8fafc', drawBorder: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', callback: (v) => `₦${(v / 1000).toFixed(0)}K`, font: { size: 12, weight: '500' }, padding: 10 }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 12, weight: '500' }, padding: 10 }
            },
        },
    };

    const salaryDistData = {
        labels: department_distribution?.map(d => d.name) || [],
        datasets: [{
            data: department_distribution?.map(d => d.total_salary) || [],
            backgroundColor: isDark
                ? ['#818cf8', '#a78bfa', '#c4b5fd', '#38bdf8', '#7dd3fc', '#6366f1']
                : ['#6366f1', '#8b5cf6', '#a78bfa', '#0ea5e9', '#38bdf8', '#c4b5fd'],
            borderWidth: isDark ? 2 : 0,
            borderColor: isDark ? '#0f172a' : '#ffffff',
            hoverOffset: 10,
        }],
    };

    const doughnutOpts = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right',
                labels: { padding: 20, usePointStyle: true, pointStyleWidth: 10, font: { size: 13, weight: '500' }, color: isDark ? '#cbd5e1' : '#475569' }
            },
            tooltip: {
                backgroundColor: isDark ? '#334155' : '#1e293b',
                padding: 14,
                cornerRadius: 8,
                callbacks: { label: (c) => ` ₦${c.raw.toLocaleString()}` }
            },
        },
    };

    const totalSalary = department_distribution?.reduce((s, d) => s + d.total_salary, 0) || 0;
    const totalEmp = department_distribution?.reduce((s, d) => s + d.count, 0) || 0;

    // Derived Insights logic
    const sortedDepts = [...(department_distribution || [])].sort((a, b) => b.total_salary - a.total_salary);
    const topDept = sortedDepts.length > 0 ? sortedDepts[0] : null;
    const topDeptPercent = topDept && totalSalary > 0 ? Math.round((topDept.total_salary / totalSalary) * 100) : 0;
    
    // Sort logic for bar
    const lastMonth = monthly_totals?.[monthly_totals.length - 1];
    const prevMonth = monthly_totals?.[monthly_totals.length - 2];
    const trend = (lastMonth && prevMonth && prevMonth.total > 0) 
        ? ((lastMonth.total - prevMonth.total) / prevMonth.total) * 100 
        : 0;

    const insights = [
        {
            text: `The ${topDept?.name || 'Top'} department consumes ${topDeptPercent}% of the overall salary budget, totaling ₦${(topDept?.total_salary || 0).toLocaleString()}.`
        },
        {
            text: `Average salary across the entire organization stands at ₦${totalEmp > 0 ? Math.round(totalSalary / totalEmp).toLocaleString() : 0} per employee.`
        },
        {
            text: trend !== 0 
                ? `Payroll expenses have ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trend).toFixed(1)}% compared to the previous month.` 
                : "Payroll expenses remained stable over the last evaluated month."
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Analytics Hub</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Deep dive into financial distributions and salary metrics</p>
            </div>

            {/* Top Summaries */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Cost Run Rate</p>
                        <p className="mt-1 text-3xl font-black text-slate-800 dark:text-white">₦{totalSalary.toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workforce Size</p>
                        <p className="mt-1 text-3xl font-black text-slate-800 dark:text-white">{totalEmp}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg Compensation</p>
                        <p className="mt-1 text-3xl font-black text-slate-800 dark:text-white">₦{totalEmp > 0 ? Math.round(totalSalary / totalEmp).toLocaleString() : 0}</p>
                    </div>
                </div>
            </div>

            {/* Automated Insights Box */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-2 mb-4 relative z-10">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Lightbulb className="h-5 w-5 text-yellow-300" />
                    </div>
                    <h3 className="text-lg font-bold tracking-wide">AI Data Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {insights.map((insight, idx) => (
                        <div key={idx} className="bg-black/10 hover:bg-black/20 transition-colors rounded-xl p-4 border border-white/5 shadow-inner">
                            <p className="text-sm font-medium text-indigo-50 leading-relaxed">
                                {insight.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Giant Charts Section */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm h-[500px] flex flex-col">
                    <div className="mb-6 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Expenditure</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">6-month trend analysis</p>
                        </div>
                        <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-md text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-700">Fiscal '26</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <Bar data={barData} options={barOpts} />
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm h-[500px] flex flex-col">
                    <div className="mb-6 shrink-0">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Department Allocation</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Budget distributed by functional areas</p>
                    </div>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        <div className="w-full h-[90%]">
                            <Doughnut data={salaryDistData} options={doughnutOpts} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Dept Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-dark-border flex justify-between items-end bg-slate-50/50 dark:bg-dark-card/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Financial Breakdown Matrix</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Comparative metrics across all departments</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Department Name</th>
                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Headcount</th>
                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs w-1/3">Budget Allocation</th>
                                <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs text-right">Burn Rate (₦)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-surface">
                            {sortedDepts.map((d) => {
                                const percent = totalSalary > 0 ? (d.total_salary / totalSalary) * 100 : 0;
                                return (
                                    <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            {d.name}
                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
                                        </td>
                                        <td className="px-6 py-5 text-right font-semibold text-slate-600 dark:text-slate-400">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{d.count}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" 
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-10 text-right">
                                                    {percent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-white font-mono">
                                            ₦{d.total_salary.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
