import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('payroll_user');
        const token = localStorage.getItem('payroll_token');
        // Both must exist to be considered logged in
        return (storedUser && token) ? JSON.parse(storedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('payroll_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('payroll_user');
            localStorage.removeItem('payroll_token');
        }
    }, [user]);

    const login = async (email, password) => {
        try {
            const { user: safeUser, token, employee_id } = await api.login({ email, password });
            localStorage.setItem('payroll_token', token);
            setUser({ ...safeUser, employee_id });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
