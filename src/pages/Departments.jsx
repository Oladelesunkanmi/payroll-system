import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Search, Plus, Edit3, Trash2, X, Building2,
    ChevronLeft, ChevronRight,
} from 'lucide-react';

const emptyForm = { name: '' };

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const perPage = 8;

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const data = await api.getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        String(d.id).includes(search)
    );

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
    const openEdit = (dept) => {
        setEditingId(dept.id);
        setForm({ name: dept.name });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this department? This may affect employees assigned to it.')) {
            try {
                await api.deleteDepartment(id);
                setDepartments((prev) => prev.filter((d) => d.id !== id));
            } catch (error) {
                alert('Failed to delete department: ' + error.message);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updated = await api.updateDepartment(editingId, form);
                setDepartments((prev) => prev.map((d) => d.id === editingId ? updated : d));
            } else {
                const created = await api.createDepartment(form);
                setDepartments((prev) => [...prev, created]);
            }
            setModalOpen(false);
        } catch (error) {
            alert('Failed to save department: ' + error.message);
        }
    };

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Department Management</h2>
                    <p className="text-sm text-slate-500">{filtered.length} departments total</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-700 hover:shadow-xl"
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Add Department</span>
                </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search departments..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="whitespace-nowrap px-6 py-3 font-semibold text-slate-600">ID</th>
                                <th className="whitespace-nowrap px-6 py-3 font-semibold text-slate-600">Department Name</th>
                                <th className="whitespace-nowrap px-6 py-3 font-semibold text-slate-600">Created At</th>
                                <th className="whitespace-nowrap px-6 py-3 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-slate-400">Loading departments...</td>
                                </tr>
                            ) : paginated.map((dept) => (
                                <tr key={dept.id} className="transition-colors hover:bg-slate-50/70">
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">{dept.id}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-slate-800">{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                        {dept.created_at ? new Date(dept.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEdit(dept)}
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id)}
                                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                                        No departments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
                        <p className="text-xs text-slate-500">
                            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === i + 1
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="animate-scale-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Edit Department' : 'Add New Department'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Department Name</label>
                                <input
                                    required
                                    autoFocus
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Engineering, Marketing..."
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-700"
                                >
                                    {editingId ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
