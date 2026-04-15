import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Payslips from './pages/Payslips';
import Reports from './pages/Reports';
import Departments from './pages/Departments';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function App() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();

    return (
        <>
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'glass font-sans text-sm font-medium',
                    duration: 4000,
                    style: {
                        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                        color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                    },
                }}
            />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/" replace /> : <Login />}
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="departments" element={<Departments />} />
                        <Route path="payroll" element={<Payroll />} />
                        <Route path="payslips" element={<Payslips />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

