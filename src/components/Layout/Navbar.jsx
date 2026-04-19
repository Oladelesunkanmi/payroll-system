import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, ChevronDown, User, LogOut, ShieldCheck, UserCircle, Sun, Moon } from 'lucide-react';

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
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    useEffect(() => {
        const handleClick = (e) => {
            const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target);
            const clickedOutsideNotifications = notificationsRef.current && !notificationsRef.current.contains(e.target);

            if (clickedOutsideDropdown && clickedOutsideNotifications) {
                setDropdownOpen(false);
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const unreadCount = notifications.filter((notification) => !notification.read).length;

    const loadNotifications = async () => {
        if (notificationsLoading || notifications.length > 0) {
            return;
        }

        setNotificationsLoading(true);
        setNotificationsError('');

        try {
            const items = await api.getNotifications();
            setNotifications(items || []);
        } catch (error) {
            setNotificationsError(error.message || 'Unable to load notifications');
        } finally {
            setNotificationsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        } catch (error) {
            setNotificationsError(error.message || 'Unable to mark notifications read');
        }
    };

    const handleNotificationClick = async (itemId) => {
        try {
            await api.markNotificationRead(itemId);
            setNotifications((current) => current.map((item) => item.id === itemId ? { ...item, read: true } : item));
        } catch (error) {
            console.error('Failed to mark notification read:', error);
        }
    };

    const handleNotificationsToggle = async () => {
        if (!notificationsOpen) {
            await loadNotifications();
        }
        setNotificationsOpen((prev) => !prev);
    };

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-dark-border bg-white/80 dark:bg-dark-surface/80 px-4 backdrop-blur-md md:px-8 transition-colors duration-300">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={pageTitle}
                >
                    <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white md:text-xl font-display">{pageTitle}</h1>
                </motion.div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Search */}
                <div className="relative hidden lg:block">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search workspace..."
                        className="h-10 w-[200px] xl:w-[280px] rounded-full border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-slate-800/50 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:w-[240px] xl:focus:w-[320px] focus:border-primary-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:outline-none shadow-inner"
                    />
                </div>
                
                <button className="lg:hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Search className="h-5 w-5" />
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="group relative rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-amber-400"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {theme === 'dark' ? (
                            <motion.div
                                key="sun"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Sun className="h-5 w-5" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="moon"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Moon className="h-5 w-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={handleNotificationsToggle}
                        className="group relative rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {notificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="notification-panel absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-2xl"
                            >
                                <div className="bg-slate-50/80 dark:bg-slate-800/80 px-6 py-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Notifications</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Recent system activity</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notificationsLoading ? (
                                        <div className="flex h-28 items-center justify-center px-6 text-sm text-slate-500 dark:text-slate-400">
                                            Loading notifications...
                                        </div>
                                    ) : notificationsError ? (
                                        <div className="px-6 py-4 text-sm text-red-600 dark:text-red-400">{notificationsError}</div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-6 py-6 text-sm text-slate-500 dark:text-slate-400">No recent notifications.</div>
                                    ) : (
                                        notifications.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNotificationClick(item.id)}
                                                className={`w-full text-left border-b border-slate-100 dark:border-dark-border px-6 py-4 last:border-b-0 transition-colors ${item.read ? 'bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                            >
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.action}</p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.details}</p>
                                                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                                    <span>{formatRelativeTime(item.created_at)}</span>
                                                    {!item.read && <span className="rounded-full bg-primary-600 px-2 py-0.5 text-white">New</span>}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`flex items-center gap-2.5 rounded-xl p-1.5 pr-3 transition-all ${dropdownOpen ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white shadow-lg shadow-primary-500/25">
                            {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                        </div>
                        <div className="hidden text-left md:block">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
                            <div className="flex items-center gap-1">
                                {(user?.role === 'admin' || user?.role === 'hr') ? (
                                    <ShieldCheck className="h-3 w-3 text-primary-500" />
                                ) : (
                                    <UserCircle className="h-3 w-3 text-slate-400" />
                                )}
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{user?.role}</p>
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
                                className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl shadow-slate-200/60 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/5"
                            >
                                <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Account</p>
                                    <p className="mt-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span>My Profile</span>
                                    </button>
                                    <div className="my-1 h-px bg-slate-100 dark:bg-dark-border" />
                                    <button
                                        onClick={() => logout()}
                                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400">
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
