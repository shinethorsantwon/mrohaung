'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, Github, Chrome, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function RegisterPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Note: We only send displayName, email, password.
            // Backend will auto-generate username from displayName.
            await api.post('/auth/register', {
                displayName,
                email,
                password
            });

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#020617] relative overflow-hidden selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"
                />
            </div>

            {/* Left Side (Desktop) */}
            <div className="hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-3xl font-black text-white italic tracking-tighter">MROHAUNG</span>
                    </div>

                    <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
                        Start Your <br />
                        <span className="text-indigo-400">Infinity</span> Journey.
                    </h2>

                    <p className="text-xl text-slate-400 max-w-sm leading-relaxed mb-12">
                        Join thousands of creators and thinkers in a platform that prioritizes your identity and connections.
                    </p>

                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-xl overflow-hidden backdrop-blur-sm">
                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-[#020617] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                            +2k
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side / Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10 relative md:min-h-screen">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-[480px] p-8 md:p-12 rounded-[2.5rem] bg-slate-900/50 backdrop-blur-3xl border border-white/5 shadow-2xl"
                >
                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Profile</h1>
                        <p className="text-slate-400 font-medium">Username will be auto-generated from your name.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Identity Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="e.g. Shine Bu Chay"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@nexus.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Access Cipher (Password)</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full relative overflow-hidden py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"
                                    />
                                ) : success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        Initialization Complete
                                        <ShieldCheck className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="default"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        Register Now
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-2xl border ${success ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-sm font-bold text-center tracking-tight`}
                            >
                                {error || "Registration successful! Transporting to Login..."}
                            </motion.div>
                        )}
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <p className="text-center text-slate-500 text-sm font-medium">
                            Already part of the system?{' '}
                            <Link href="/login" className="text-white hover:text-indigo-400 font-bold ml-1 transition-colors underline-offset-4 hover:underline">
                                Login Access
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
