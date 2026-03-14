import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { monthlyExpenses, departmentSalarySummary, departmentDistribution } from '../data/mockData';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const barData = {
    labels: monthlyExpenses.labels,
    datasets: [{
        label: 'Payroll Total ($)',
        data: monthlyExpenses.data,
        backgroundColor: ['#c7d2fe', '#c7d2fe', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
        borderRadius: 6,
        barThickness: 36,
    }],
};

const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8, callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } } },
    scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', callback: (v) => `$${(v / 1000).toFixed(0)}K`, font: { family: 'Inter', size: 12 } } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } },
    },
};

const salaryDistData = {
    labels: departmentDistribution.labels,
    datasets: [{
        data: departmentSalarySummary.map(d => d.totalSalary),
        backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
        borderWidth: 0,
        hoverOffset: 4,
    }],
};

const doughnutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
        legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 8, font: { family: 'Inter', size: 12 }, color: '#64748b' } },
        tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8, callbacks: { label: (c) => `$${c.raw.toLocaleString()}` } },
    },
};

export default function Reports() {
    const totalSalary = departmentSalarySummary.reduce((s, d) => s + d.totalSalary, 0);
    const totalEmp = departmentSalarySummary.reduce((s, d) => s + d.employees, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Payroll Reports</h2>
                <p className="text-sm text-slate-500">Analytics and insights</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100"><DollarSign className="h-5 w-5 text-primary-600" /></div>
                    <div><p className="text-xs font-medium text-slate-500">Total Annual Salary</p><p className="text-lg font-bold text-slate-800">${totalSalary.toLocaleString()}</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"><Users className="h-5 w-5 text-emerald-600" /></div>
                    <div><p className="text-xs font-medium text-slate-500">Total Employees</p><p className="text-lg font-bold text-slate-800">{totalEmp}</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100"><TrendingUp className="h-5 w-5 text-violet-600" /></div>
                    <div><p className="text-xs font-medium text-slate-500">Avg Salary</p><p className="text-lg font-bold text-slate-800">${Math.round(totalSalary / totalEmp).toLocaleString()}</p></div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                    <h3 className="mb-1 text-base font-semibold text-slate-800">Monthly Payroll Totals</h3>
                    <p className="mb-5 text-sm text-slate-500">Last 6 months</p>
                    <div className="h-72"><Bar data={barData} options={barOpts} /></div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold text-slate-800">Salary Distribution</h3>
                    <p className="mb-5 text-sm text-slate-500">By department</p>
                    <div className="h-64"><Doughnut data={salaryDistData} options={doughnutOpts} /></div>
                </div>
            </div>

            {/* Dept summary table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6 pb-0">
                    <h3 className="text-base font-semibold text-slate-800">Department Salary Summary</h3>
                    <p className="mt-0.5 text-sm text-slate-500">Breakdown by department</p>
                </div>
                <div className="overflow-x-auto p-6 pt-4">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-3 font-semibold text-slate-600">Department</th>
                                <th className="pb-3 font-semibold text-slate-600 text-right">Employees</th>
                                <th className="pb-3 font-semibold text-slate-600 text-right">Total Salary</th>
                                <th className="pb-3 font-semibold text-slate-600 text-right">Avg Salary</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departmentSalarySummary.map((d) => (
                                <tr key={d.department} className="hover:bg-slate-50">
                                    <td className="py-3 font-medium text-slate-800">{d.department}</td>
                                    <td className="py-3 text-right text-slate-600">{d.employees}</td>
                                    <td className="py-3 text-right font-medium text-slate-800">${d.totalSalary.toLocaleString()}</td>
                                    <td className="py-3 text-right text-slate-600">${d.avgSalary.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
