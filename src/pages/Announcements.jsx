import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Send, Users, Building2, Trash2,
    Search, Bell, Info, Calendar, User, ChevronRight,
    SearchX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin' || user?.role === 'hr';
    const [messages, setMessages] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New announcement form
    const [showComposer, setShowComposer] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetType, setTargetType] = useState('All'); // 'All' or 'Department'
    const [selectedDept, setSelectedDept] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        try {
            const [msgData, deptData] = await Promise.all([
                api.getAnnouncements(),
                api.getDepartments()
            ]);
            setMessages(msgData);
            setDepartments(deptData);

        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSending(true);
        try {
            const payload = {
                title,
                content,
                target_type: targetType,
                department_id: targetType === 'Department' ? Number(selectedDept) : null
            };

            await api.createAnnouncement(payload);
            toast.success('Broadcast sent successfully!');
            setTitle('');
            setContent('');
            setShowComposer(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this broadcast?')) return;
        try {
            await api.deleteAnnouncement(id);
            toast.success('Message deleted');
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const filteredMessages = messages.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 animate-fade-in pb-10"
        >
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                            <Megaphone className="h-7 w-7" />
                        </div>
                        Broadcast Center
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 ml-1">
                        Communicate organizational updates to your workforce
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowComposer(!showComposer)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-primary-500/40 active:scale-95"
                    >
                        {showComposer ? 'View History' : <><Send className="h-4 w-4" /> Create Broadcast</>}
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {showComposer ? (
                    <motion.div
                        key="composer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="rounded-[2.5rem] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/20">
                            <div className="mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Compose New Message</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Select your audience and craft your message below.</p>
                            </div>

                            <form onSubmit={handleSend} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Audience Type</label>
                                        <div className="flex p-1.5 gap-2 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border">
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('All')}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${targetType === 'All' ? 'bg-white dark:bg-dark-surface text-primary-600 dark:text-primary-400 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                Broad Broadcast
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('Department')}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all ${targetType === 'Department' ? 'bg-white dark:bg-dark-surface text-primary-600 dark:text-primary-400 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                Targeted Team
                                            </button>
                                        </div>
                                    </div>

                                    {targetType === 'Department' && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Select Department</label>
                                            <select
                                                required
                                                value={selectedDept}
                                                onChange={(e) => setSelectedDept(e.target.value)}
                                                className="w-full h-14 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg px-5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="">Choose a team...</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Message Subject</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Important Update on Monthly Remuneration"
                                        className="w-full h-14 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg px-5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Detailed Content</label>
                                    <textarea
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={6}
                                        placeholder="Type your message here. Use clear and professional language..."
                                        className="w-full rounded-3xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-6 text-sm font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-dark-surface focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-inner leading-relaxed resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setShowComposer(false)}
                                        className="px-8 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-10 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {sending ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Initialize Broadcast
                                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-100/50 dark:bg-dark-bg/50 p-6 rounded-[2rem] border border-slate-200 dark:border-dark-border backdrop-blur-sm">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search broadcasts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-11 pr-4 rounded-xl border-none bg-white dark:bg-dark-surface text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                <Bell className="h-4 w-4 text-primary-500" />
                                {filteredMessages.length} Messages Logged
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <div className="h-12 w-12 border-4 border-primary-200 dark:border-primary-900/30 border-t-primary-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-bold text-slate-500 animate-pulse">Scanning communication archives...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredMessages.map((msg, idx) => (
                                    <motion.div
                                        key={msg.id}
                                        variants={itemVariants}
                                        className="group relative rounded-[2rem] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Status Badge Side */}
                                            <div className="md:w-48 shrink-0 flex md:flex-col justify-between md:justify-start gap-4">
                                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${msg.target_type === 'All' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'}`}>
                                                    {msg.target_type === 'All' ? <Users className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                                                    {msg.target_type === 'All' ? 'Global' : 'Targeted'}
                                                </div>
                                                <div className="flex md:flex-col gap-2 opacity-60">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {formatDate(msg.created_at)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <User className="h-3.5 w-3.5" />
                                                        {msg.sender?.username || 'HR Dept'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Message Content */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                                                        {msg.title}
                                                    </h4>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(msg.id)}
                                                            className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {msg.target_type === 'Department' && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-bg w-fit text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                        <ChevronRight className="h-3 w-3 text-primary-500" />
                                                        For: {msg.department?.name || 'Assigned Team'}
                                                    </div>
                                                )}

                                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 dark:bg-dark-bg/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                                <div className="p-6 rounded-full bg-slate-100 dark:bg-dark-surface mb-6">
                                    <SearchX className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">No Communications Found</h3>
                                <p className="text-sm font-medium text-slate-500 mt-2">Try adjusting your search or create a new broadcast.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
