import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Users, Banknote, CircleDollarSign, ClipboardList, TrendingUp, TrendingDown,
    UserPlus, Edit2, UserMinus, CreditCard, LogIn, Activity
} from 'lucide-react';
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
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [chartsData, setChartsData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [stats, reports, recentActivities] = await Promise.all([
                    api.getDashboardStats(),
                    api.getReportsData(),
                    api.getRecentActivity()
                ]);
                setStatsData(stats);
                setChartsData(reports);
                setActivities(recentActivities);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error(error.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading || !statsData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600"></div>
            </div>
        );
    }

    // Format currency
    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
        return `₦${amount.toLocaleString()}`;
    };

    // Build dynamic change text from real data
    const totalPayrolls = statsData.processed_payrolls + statsData.pending_payrolls + (statsData.calculated_payrolls || 0);
    const completionPercent = totalPayrolls > 0
        ? Math.round((statsData.processed_payrolls / totalPayrolls) * 100)
        : 0;

    const salaryChangePercent = statsData.salary_change_percent || 0;
    const salaryChangeText = salaryChangePercent !== 0
        ? `${salaryChangePercent > 0 ? '+' : ''}${salaryChangePercent.toFixed(1)}% vs last month`
        : (statsData.last_month_salary > 0 ? 'Same as last month' : 'First month');

    const newHiresText = statsData.new_employees_month > 0
        ? `+${statsData.new_employees_month} this month`
        : 'No new hires this month';

    const stats = [
        {
            label: 'Total Employees',
            value: statsData.total_employees,
            change: newHiresText,
            trend: statsData.new_employees_month > 0 ? 'up' : 'neutral',
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            path: '/employees',
        },
        {
            label: 'Payroll Processed',
            value: `${statsData.processed_payrolls} / ${totalPayrolls}`,
            change: `${completionPercent}% completed`,
            trend: completionPercent >= 50 ? 'up' : 'down',
            icon: Banknote,
            color: 'from-emerald-500 to-emerald-600',
            path: '/payroll',
        },
        {
            label: 'Total Salary Paid',
            value: formatCurrency(statsData.total_salary_paid),
            change: salaryChangeText,
            trend: salaryChangePercent >= 0 ? 'up' : 'down',
            icon: CircleDollarSign,
            color: 'from-violet-500 to-violet-600',
            path: '/reports',
        },
        {
            label: 'Pending Tasks',
            value: statsData.pending_payrolls + (statsData.calculated_payrolls || 0),
            change: statsData.pending_payrolls > 0 ? `${statsData.pending_payrolls} need processing` : 'All clear',
            trend: statsData.pending_payrolls > 0 ? 'down' : 'up',
            icon: ClipboardList,
            color: 'from-amber-500 to-amber-600',
            path: '/payroll',
        },
    ];

    const barChartData = {
        labels: chartsData?.monthly_totals?.map(m => m.month) || [],
        datasets: [
            {
                label: 'Payroll Expenses ($)',
                data: chartsData?.monthly_totals?.map(m => m.total) || [],
                backgroundColor: isDark ? '#818cf8' : '#6366f1',
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
                backgroundColor: isDark ? '#334155' : '#1e293b',
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
                grid: { color: isDark ? '#1e293b' : '#f1f5f9' },
                ticks: {
                    font: { family: 'Inter', size: 12 },
                    color: isDark ? '#64748b' : '#94a3b8',
                    callback: (v) => `₦${(v / 1000).toFixed(0)}K`,
                },
            },
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 12 }, color: isDark ? '#64748b' : '#94a3b8' },
            },
        },
    };

    const doughnutData = {
        labels: chartsData?.department_distribution?.map(d => d.name) || [],
        datasets: [
            {
                data: chartsData?.department_distribution?.map(d => d.count) || [],
                backgroundColor: isDark
                    ? ['#818cf8', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9']
                    : ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
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
                    color: isDark ? '#94a3b8' : '#64748b',
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#334155' : '#1e293b',
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
            },
        },
    };
    const iconMap = {
        UserPlus, Edit2, UserMinus, CreditCard, LogIn, Activity
    };

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    if (user.role !== 'admin' && user.role !== 'hr') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center animate-fade-in">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-xl shadow-primary-500/10">
                    <CircleDollarSign className="h-10 w-10" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Welcome back, {user.name}!</h2>
                    <p className="text-slate-500 dark:text-slate-400">Your employee dashboard is being personalized. For now, you can view your monthly earnings and download payslips.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                    <button 
                        onClick={() => window.location.href = '/payslips'}
                        className="rounded-xl bg-primary-600 px-8 py-3 font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 active:scale-95"
                    >
                        View My Payslips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Monthly salary budget banner */}
            {statsData.total_salary_budget > 0 && (
                <div className="card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                            <CircleDollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Salary Budget</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">₦{statsData.total_salary_budget.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Across {statsData.total_departments} departments</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{statsData.total_employees} active employees</p>
                    </div>
                </div>
            )}

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            onClick={() => stat.path && navigate(stat.path)}
                            className={`animate-fade-in stagger-${i + 1} group cursor-pointer card card-hover p-5`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                    <p className="mt-1.5 text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 text-xs">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                ) : stat.trend === 'down' ? (
                                    <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                                ) : (
                                    <span className="h-3.5 w-3.5 inline-flex items-center justify-center text-slate-400">—</span>
                                )}
                                <span className={
                                    stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                                    stat.trend === 'down' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-slate-500 dark:text-slate-400'
                                }>
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
                <div
                    onClick={() => navigate('/reports')}
                    className="animate-fade-in cursor-pointer card card-hover p-6 xl:col-span-2"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-800 dark:text-white">Monthly Payroll Expenses</h3>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Last 6 months overview</p>
                        </div>
                        <select className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30">
                            <option>Last 6 months</option>
                            <option>Last 12 months</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Doughnut chart */}
                <div
                    onClick={() => navigate('/departments')}
                    className="animate-fade-in cursor-pointer card card-hover p-6"
                >
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-white">Employee Distribution</h3>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">By department</p>
                    </div>
                    <div className="h-64">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div
                onClick={() => navigate('/reports')}
                className="animate-fade-in cursor-pointer card card-hover p-6"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
                    <Activity className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="space-y-4">
                    {activities.length > 0 ? (
                        activities.map((item, i) => {
                            const Icon = iconMap[item.icon] || Activity;
                            return (
                                <div key={item.id} className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 ${item.color.replace('text-', 'bg-').replace('500', '100')}`}>
                                        <Icon className={`h-4 w-4 ${item.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.action}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.details}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{formatRelativeTime(item.created_at)}</span>
                                        {item.user && (
                                            <p className="text-[10px] text-slate-300 dark:text-slate-600">by {item.user.username}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
