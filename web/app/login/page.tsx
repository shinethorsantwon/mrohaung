'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Github, Chrome, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#020617] relative overflow-hidden selection:bg-blue-500/30">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[140px]"
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] blend-overlay" />
            </div>

            {/* Left Side: Brand & Info (Desktop Only) */}
            <div className="hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 transform -rotate-6">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic tracking-tighter">
                            MROHAUNG
                        </span>
                    </div>

                    <h2 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                        Experience <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Digital Freedom
                        </span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-10 max-w-md leading-relaxed">
                        Connect, share, and belong in a community built for the next generation of social interaction.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: CheckCircle2, text: "Privacy-focused ecosystem", color: "text-blue-400" },
                            { icon: CheckCircle2, text: "Real-time communication", color: "text-indigo-400" },
                            { icon: CheckCircle2, text: "Secure asset management", color: "text-purple-400" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="text-slate-300 font-medium">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Login Form (Full-screen on Mobile) */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 relative md:min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "backOut" }}
                    className="w-full max-w-[440px] p-8 md:p-10 rounded-[2.5rem] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                >
                    <div className="text-center mb-10">
                        <div className="md:hidden flex justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20 transform -rotate-3">
                                <LogIn className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-400 font-medium">Please enter your credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Terminal</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-medium"
                                    required
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                                <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Recover</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all font-medium"
                                    required
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-blue-500/20 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden py-4 bg-[#f8fafc] hover:bg-white text-[#020617] font-black rounded-2xl shadow-[0_12px_24px_-8px_rgba(255,255,255,0.2)] transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-6 h-6 border-3 border-slate-300 border-t-black rounded-full animate-spin"
                                    />
                                ) : (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2"
                                    >
                                        Execute Login
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                            >
                                <p className="text-sm text-red-400 text-center font-bold tracking-tight">{error}</p>
                            </motion.div>
                        )}
                    </form>

                    <div className="mt-10">
                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Secure Connect</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 transition-all group">
                                <Chrome className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-wider">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 transition-all group">
                                <Github className="w-5 h-5 group-hover:text-white transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-wider">Github</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-slate-500 text-sm font-medium">
                        New system user?{' '}
                        <Link href="/register" className="text-white hover:text-blue-400 font-bold ml-1 transition-colors underline-offset-4 hover:underline">
                            Request Access
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
