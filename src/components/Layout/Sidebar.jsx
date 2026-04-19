import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Banknote,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    X,
    CircleDollarSign,
    Building2,
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Employees', icon: Users, path: '/employees' },
    { label: 'Departments', icon: Building2, path: '/departments' },
    { label: 'Attendance', icon: FileText, path: '/attendance' },
    { label: 'Payroll', icon: Banknote, path: '/payroll' },
    { label: 'Payslips', icon: FileText, path: '/payslips' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ onClose }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-full flex-col bg-sidebar text-white lg:glass-dark lg:border-r lg:border-white/5">
            {/* Logo */}
            <div className="flex h-20 items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
                        <CircleDollarSign className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">PayrollPro</span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 flex-1 space-y-1.5 px-4">
                {menuItems.map(({ label, icon: Icon, path }, i) => (
                    <motion.div
                        key={path}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <NavLink
                            to={path}
                            end={path === '/'}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-white'}`} />
                                    <span>{label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-500"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/5 p-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
