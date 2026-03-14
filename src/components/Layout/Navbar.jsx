import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell, ChevronDown, User, LogOut } from 'lucide-react';

const pageTitles = {
    '/': 'Dashboard',
    '/employees': 'Employees',
    '/payroll': 'Payroll',
    '/payslips': 'Payslips',
    '/reports': 'Reports',
    '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold text-slate-800 md:text-xl">{pageTitle}</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder=""
                        className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 placeholder-slate-400 transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    />
                </div>

                {/* Notifications */}
                <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                    <Bell className="h-5 w-5" />
                    {/* <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /> */}
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-semibold text-white">
                            {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                            <p className="text-xs capitalize text-slate-400">{user?.role}</p>
                        </div>
                        <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                    </button>

                    {dropdownOpen && (
                        <div className="animate-scale-in absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-200/50">
                            <div className="border-b border-slate-100 px-4 py-2.5">
                                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                            <button className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                <User className="h-4 w-4" />
                                Profile
                            </button>
                            <button
                                onClick={() => { logout(); }}
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
