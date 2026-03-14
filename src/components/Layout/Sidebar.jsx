import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Employees', icon: Users, path: '/employees' },
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
        <div className="flex h-full flex-col bg-sidebar text-white">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500">
                        <CircleDollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">PayrollPro</span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-4 flex-1 space-y-1 px-3">
                {menuItems.map(({ label, icon: Icon, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === '/'}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg font-medium transition-all duration-200 ${isActive
                                ? 'bg-sidebar-active text-white shadow-md shadow-primary-900/30'
                                : 'text-indigo-200 hover:bg-sidebar-hover hover:text-white'
                            }`
                        }
                    >
                        <Icon className="h-[28px] w-[28px]" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-200 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300"
                >
                    <LogOut className="h-[18px] w-[18px]" />
                    Logout
                </button>
            </div>
        </div>
    );
}
