import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, ChevronDown, User, LogOut, ShieldCheck, UserCircle } from 'lucide-react';

const pageTitles = {
    '/': 'Overview',
    '/employees': 'Staff Directory',
    '/departments': 'Departments',
    '/payroll': 'Payroll Processing',
    '/payslips': 'My Payslips',
    '/reports': 'Analytics & Reports',
    '/settings': 'System Settings',
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
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md md:px-8">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={pageTitle}
                >
                    <h1 className="text-lg font-bold tracking-tight text-slate-800 md:text-xl font-display">{pageTitle}</h1>
                </motion.div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 md:gap-5">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    />
                </div>

                {/* Notifications */}
                <button className="group relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-slate-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-2.5 rounded-xl p-1.5 pr-3 transition-all ${dropdownOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white shadow-lg shadow-primary-500/25">
                            {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                            <div className="flex items-center gap-1">
                                {(user?.role === 'admin' || user?.role === 'hr') ? (
                                    <ShieldCheck className="h-3 w-3 text-primary-500" />
                                ) : (
                                    <UserCircle className="h-3 w-3 text-slate-400" />
                                )}
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{user?.role}</p>
                            </div>
                        </div>
                        <ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform duration-300 md:block ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {dropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ring-1 ring-black/5"
                            >
                                <div className="bg-slate-50/50 px-4 py-3.5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Account</p>
                                    <p className="mt-1 truncate text-sm font-medium text-slate-700">{user?.email}</p>
                                </div>
                                <div className="p-1.5">
                                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span>My Profile</span>
                                    </button>
                                    <div className="my-1 h-px bg-slate-100" />
                                    <button
                                        onClick={() => logout()}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-500">
                                            <LogOut className="h-4 w-4" />
                                        </div>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
