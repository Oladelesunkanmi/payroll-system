import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference) {
    if (preference === 'system') return getSystemTheme();
    return preference;
}

export function ThemeProvider({ children }) {
    const [preference, setPreference] = useState(() => {
        const stored = localStorage.getItem('payroll_theme');
        return stored || 'light';
    });

    const effectiveTheme = resolveTheme(preference);

    // Apply dark class to <html> and persist preference
    useEffect(() => {
        const root = document.documentElement;
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('payroll_theme', preference);
    }, [preference, effectiveTheme]);

    // Listen for system preference changes when in 'system' mode
    useEffect(() => {
        if (preference !== 'system') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const root = document.documentElement;
            if (mq.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [preference]);

    const setTheme = useCallback((newPref) => {
        setPreference(newPref);
    }, []);

    const toggleTheme = useCallback(() => {
        setPreference((prev) => {
            const resolved = resolveTheme(prev);
            return resolved === 'dark' ? 'light' : 'dark';
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme: effectiveTheme, preference, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
