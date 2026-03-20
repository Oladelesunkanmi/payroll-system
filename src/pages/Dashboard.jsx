import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Banknote, CircleDollarSign, ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const [statsData, setStatsData] = useState(null);
    const [chartsData, setChartsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [stats, reports] = await Promise.all([
                    api.getDashboardStats(),
                    api.getReportsData()
                ]);
                setStatsData(stats);
                setChartsData(reports);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading || !statsData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Employees',
            value: statsData.total_employees,
            change: '+3 this month',
            trend: 'up',
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Payroll Processed',
            value: `${statsData.processed_payrolls} / ${statsData.processed_payrolls + statsData.pending_payrolls}`,
            change: `${Math.round((statsData.processed_payrolls / (statsData.processed_payrolls + statsData.pending_payrolls || 1)) * 100)}% completed`,
            trend: 'up',
            icon: Banknote,
            color: 'from-emerald-500 to-emerald-600',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600',
        },
        {
            label: 'Total Salary Paid',
            value: `₦${(statsData.total_salary_paid / 1000).toFixed(1)}K`,
            change: '+2.5% vs last month',
            trend: 'up',
            icon: CircleDollarSign,
            color: 'from-violet-500 to-violet-600',
            bgLight: 'bg-violet-50',
            textColor: 'text-violet-600',
        },
        {
            label: 'Pending Tasks',
            value: statsData.pending_payrolls,
            change: statsData.pending_payrolls > 0 ? 'Needs attention' : 'All clear',
            trend: statsData.pending_payrolls > 0 ? 'down' : 'up',
            icon: ClipboardList,
            color: 'from-amber-500 to-amber-600',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600',
        },
    ];

    const barChartData = {
        labels: chartsData?.monthly_totals?.map(m => m.month) || [],
        datasets: [
            {
                label: 'Payroll Expenses ($)',
                data: chartsData?.monthly_totals?.map(m => m.total) || [],
                backgroundColor: '#6366f1',
                borderRadius: 6,
                barThickness: 32,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                callbacks: {
                    label: (ctx) => `₦${ctx.raw.toLocaleString()}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9' },
                ticks: {
                    font: { family: 'Inter', size: 12 },
                    color: '#94a3b8',
                    callback: (v) => `₦${(v / 1000).toFixed(0)}K`,
                },
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' },
            },
        },
    };

    const doughnutData = {
        labels: chartsData?.department_distribution?.map(d => d.name) || [],
        datasets: [
            {
                data: chartsData?.department_distribution?.map(d => d.count) || [],
                backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { family: 'Inter', size: 12 },
                    color: '#64748b',
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
            },
        },
    };
    return (
        <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`animate-fade-in stagger-${i + 1} group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <p className="mt-1.5 text-2xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                                )}
                                <span className={stat.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Bar chart */}
                <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">Monthly Payroll Expenses</h3>
                            <p className="mt-0.5 text-sm text-slate-500">Last 6 months overview</p>
                        </div>
                        <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-100">
                            <option>Last 6 months</option>
                            <option>Last 12 months</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Doughnut chart */}
                <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-800">Employee Distribution</h3>
                        <p className="mt-0.5 text-sm text-slate-500">By department</p>
                    </div>
                    <div className="h-64">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-base font-semibold text-slate-800">Recent Activity</h3>
                <div className="space-y-4">
                    {[
                        { text: 'Payroll processed for Engineering department', time: '2 hours ago', type: 'success' },
                        { text: 'New employee Sarah Johnson onboarded', time: '5 hours ago', type: 'info' },
                        { text: 'Payslips generated for February 2026', time: '1 day ago', type: 'success' },
                        { text: 'Pending payroll approval for Marketing team', time: '2 days ago', type: 'warning' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                            <div className={`h-2.5 w-2.5 rounded-full ${item.type === 'success' ? 'bg-emerald-500' : item.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
                                }`} />
                            <p className="flex-1 text-sm text-slate-600">{item.text}</p>
                            <span className="text-xs text-slate-400">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
