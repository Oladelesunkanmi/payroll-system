import { createContext, useContext, useState, useEffect } from 'react';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('payroll_user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('payroll_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('payroll_user');
        }
    }, [user]);

    const login = (email, password) => {
        const found = demoUsers.find(
            (u) => u.email === email && u.password === password
        );
        if (!found) {
            return { success: false, error: 'Invalid email or password' };
        }
        const { password: _, ...safeUser } = found;
        setUser(safeUser);
        return { success: true };
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
