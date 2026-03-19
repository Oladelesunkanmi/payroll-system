import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircleDollarSign, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));

        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-500 items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
                <div className="absolute top-1/3 right-16 h-48 w-48 rounded-full bg-white/5" />

                <div className="relative z-10 max-w-md text-center">
                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <CircleDollarSign className="h-9 w-9 text-white" />
                    </div>
                    <h1 className="mb-4 text-4xl font-bold text-white">PayrollPro</h1>
                    <p className="text-lg leading-relaxed text-indigo-100">
                        Streamline your payroll management with our modern, intuitive platform.
                        Manage employees, process salaries, and generate reports effortlessly.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-2xl font-bold text-white">500+</p>
                            <p className="text-sm text-indigo-200">Companies</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">50K+</p>
                            <p className="text-sm text-indigo-200">Employees</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-indigo-200">Uptime</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right login form */}
            <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                            <CircleDollarSign className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-800">PayrollPro</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                        <p className="mt-2 text-slate-500">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {error && (
                            <div className="animate-scale-in rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-700 placeholder-slate-400 transition-all focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                Remember me
                            </label>
                            <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            id="login-button"
                            type="submit"
                            disabled={loading}
                            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Demo Credentials</p>
                        <div className="space-y-1.5 text-xs text-slate-600">
                            <p><span className="font-medium">Admin:</span> admin@payrollpro.com / admin123</p>
                            <p><span className="font-medium">HR:</span> hr@payrollpro.com / hr123</p>
                            <p><span className="font-medium">Employee:</span> sarah.johnson@company.com / emp123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
