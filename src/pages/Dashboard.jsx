import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
    Users, Banknote, CircleDollarSign, ClipboardList, TrendingUp, TrendingDown,
    UserPlus, Edit2, UserMinus, CreditCard, LogIn, Activity, ArrowRight, PlayCircle, Zap
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [stats, recentActivities] = await Promise.all([
                    api.getDashboardStats(),
                    api.getRecentActivity()
                ]);
                setStatsData(stats);
                setActivities(recentActivities);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                toast.error(error.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    if (loading || !statsData) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative flex h-16 w-16">
                    <div className="absolute h-full w-full rounded-full border-4 border-primary-200 dark:border-primary-900 border-t-primary-600 animate-spin"></div>
                    <div className="absolute h-full w-full rounded-full border-4 border-transparent border-b-violet-500 animate-spin flex-reverse opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(2)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
        return `₦${amount.toLocaleString()}`;
    };

    const totalPayrolls = statsData.processed_payrolls + statsData.pending_payrolls + (statsData.calculated_payrolls || 0);
    const completionPercent = totalPayrolls > 0
        ? Math.round((statsData.processed_payrolls / totalPayrolls) * 100)
        : 0;

    const salaryChangePercent = statsData.salary_change_percent || 0;
    const salaryChangeText = salaryChangePercent !== 0
        ? `${Math.abs(salaryChangePercent).toFixed(1)}% vs last month`
        : (statsData.last_month_salary > 0 ? 'Same as last month' : 'First payroll month');

    const newHiresText = statsData.new_employees_month > 0
        ? `+${statsData.new_employees_month} this month`
        : 'Stable workforce';

    const stats = [
        {
            label: 'Total Active Staff',
            value: statsData.total_employees,
            change: newHiresText,
            trend: statsData.new_employees_month > 0 ? 'up' : 'neutral',
            icon: Users,
            color: 'from-blue-500 to-sky-400',
            bgLight: 'bg-blue-50',
            bgDark: 'dark:bg-blue-900/10',
            textLight: 'text-blue-600',
            textDark: 'dark:text-blue-400',
            path: '/employees',
        },
        {
            label: 'Payroll Progress',
            value: `${statsData.processed_payrolls} / ${totalPayrolls}`,
            change: `${completionPercent}% processed`,
            trend: completionPercent >= 50 ? 'up' : 'down',
            icon: Banknote,
            color: 'from-emerald-500 to-teal-400',
            bgLight: 'bg-emerald-50',
            bgDark: 'dark:bg-emerald-900/10',
            textLight: 'text-emerald-700',
            textDark: 'dark:text-emerald-400',
            path: '/payroll',
        },
        {
            label: 'Total Disbursed',
            value: formatCurrency(statsData.total_salary_paid),
            change: salaryChangeText,
            trend: salaryChangePercent >= 0 ? 'up' : 'down',
            icon: CircleDollarSign,
            color: 'from-violet-600 to-fuchsia-500',
            bgLight: 'bg-violet-50',
            bgDark: 'dark:bg-violet-900/10',
            textLight: 'text-violet-700',
            textDark: 'dark:text-violet-400',
            path: '/reports',
        },
        {
            label: 'Pending Approvals',
            value: statsData.pending_payrolls + (statsData.calculated_payrolls || 0),
            change: statsData.pending_payrolls > 0 ? `Action required` : 'All clear',
            trend: statsData.pending_payrolls > 0 ? 'down' : 'up',
            icon: ClipboardList,
            color: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50',
            bgDark: 'dark:bg-amber-900/10',
            textLight: 'text-amber-700',
            textDark: 'dark:text-amber-400',
            path: '/payroll',
        },
    ];

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

    // Employee View Let's leave exactly as is
    if (user.role !== 'admin' && user.role !== 'hr') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-2xl shadow-primary-500/30">
                    <CircleDollarSign className="h-10 w-10" />
                </div>
                <div className="max-w-md space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Welcome back, {user.name}!</h2>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">Your employee dashboard is being personalized. For now, you can view your monthly earnings and download payslips.</p>
                </div>
                <button 
                    onClick={() => navigate('/payslips')}
                    className="mt-4 rounded-xl bg-slate-900 dark:bg-white px-8 py-3.5 font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95"
                >
                    View My Payslips
                </button>
            </motion.div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pb-10"
        >
            {/* Elegant Premium Header */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 p-8 shadow-2xl">
                {/* Background Decorators */}
                <div className="absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-primary-600 to-violet-600 blur-[80px] opacity-40 mix-blend-screen pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 blur-[80px] opacity-20 mix-blend-screen pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                System Online
                            </span>
                            <span className="text-slate-300/80 text-xs font-bold uppercase tracking-widest ml-2">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">Command Center</h1>
                        <p className="text-slate-300 font-medium leading-relaxed">
                            Overview for <strong>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>. 
                            {statsData.pending_payrolls > 0 
                                ? <span className="text-amber-300"> You have {statsData.pending_payrolls} pending tasks that require your attention.</span>
                                : <span className="text-emerald-300"> All your operations are up to date!</span>
                            }
                        </p>
                    </div>

                    {statsData.total_salary_budget > 0 && (
                        <div className="shrink-0 group">
                            <div className="relative rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-primary-500/20">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Company Budget</p>
                                    <p className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-teal-500 tracking-tight drop-shadow-sm">
                                        ₦{statsData.total_salary_budget.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* KPI Cards - Glassmorphic design */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            variants={itemVariants}
                            key={stat.label}
                            onClick={() => stat.path && navigate(stat.path)}
                            className="group cursor-pointer rounded-[1.5rem] border border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 dark:hover:border-white/10 relative overflow-hidden"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-10 dark:group-hover:opacity-20 pointer-events-none`}></div>
                            
                            <div className="flex items-start justify-between relative z-10">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/5`}>
                                    <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                                </div>
                                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs outline outline-1 outline-transparent font-bold ${stat.bgLight} ${stat.bgDark} ${stat.textLight} ${stat.textDark} group-hover:outline-current transition-all`}>
                                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : stat.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="mt-5 relative z-10">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="mt-1 text-3xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Modern Quick Actions Grid */}
                <motion.div variants={itemVariants} className="lg:col-span-1 space-y-5">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
                        <Zap className="h-6 w-6 text-amber-500 shrink-0" fill="currentColor" />
                        Quick Actions
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {/* Process Payroll Button */}
                        <div onClick={() => navigate('/payroll')} className="group cursor-pointer relative overflow-hidden rounded-2xl p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <PlayCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Process Payroll</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Initiate salary transfers</p>
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight className="h-5 w-5 text-primary-500" />
                            </div>
                        </div>
                        
                        {/* Add Staff Button */}
                        <div onClick={() => navigate('/employees')} className="group cursor-pointer relative overflow-hidden rounded-2xl p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <UserPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Onboard Staff</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Add a new employee</p>
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>

                        {/* Record Attendance */}
                        <div onClick={() => navigate('/attendance')} className="group cursor-pointer relative overflow-hidden rounded-2xl p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500/50">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Daily Attendance</h4>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Record leave & status</p>
                                </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight className="h-5 w-5 text-amber-500" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sleek Activity Feed */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Activity className="h-6 w-6 text-emerald-500 shrink-0" />
                            Live Timeline
                        </h3>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 p-2 shadow-sm min-h-[400px]">
                        <div className="p-4 space-y-2">
                            {activities.length > 0 ? (
                                activities.map((item, i) => {
                                    const Icon = iconMap[item.icon] || Activity;
                                    const isLast = i === activities.length - 1;
                                    
                                    return (
                                        <div key={item.id} className="group relative flex items-start gap-5 rounded-2xl p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            {/* Beautiful Timeline Connector */}
                                            {!isLast && (
                                                <div className="absolute left-9 top-12 bottom-[-16px] w-[2px] bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700"></div>
                                            )}
                                            
                                            <div className="relative z-10 flex shrink-0 items-center justify-center pt-1">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20 shadow-sm border border-white/50 dark:border-white/5`}>
                                                    <Icon className={`h-5 w-5 ${item.color}`} />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.action}</h4>
                                                    <span className="text-xs font-bold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                                                        {formatRelativeTime(item.created_at)}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.details}</p>
                                                
                                                {item.user && (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.user.username.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.user.username}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex h-64 flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                    <div className="h-16 w-16 mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-sm font-medium">No system activity logged yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
