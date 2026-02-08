'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, ArrowRight, Phone, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('other');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const response = await api.post('/auth/login', { email, password });
                const { token, user } = response.data;
                login(token, user);
                onClose();
            } else {
                await api.post('/auth/register', {
                    displayName,
                    email,
                    password,
                    dob,
                    gender,
                    phoneNumber
                });
                setMode('login');
                setError('Registration successful! Please login.');
                // Reset fields
                setDisplayName('');
                setDob('');
                setPhoneNumber('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden"
                >
                    <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
                        {/* Background Gradients */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full -ml-16 -mb-16" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 mb-4 shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {mode === 'login' ? 'System Access' : 'Create Infinity ID'}
                            </h2>
                            <p className="text-slate-400 text-sm mt-2">
                                {mode === 'login' ? 'Enter your credentials to continue' : 'Join the MROHAUNG network today'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Full Name"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="date"
                                                    value={dob}
                                                    onChange={(e) => setDob(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm font-medium appearance-none"
                                                required
                                            >
                                                <option value="male" className="bg-slate-900">Male</option>
                                                <option value="female" className="bg-slate-900">Female</option>
                                                <option value="other" className="bg-slate-900">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="+1 234 567 890"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@nexus.com"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Cipher</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Access System' : 'Initialize ID'}
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                            <button
                                onClick={() => {
                                    setMode(mode === 'login' ? 'register' : 'login');
                                    setError('');
                                }}
                                className="text-center text-slate-400 text-xs font-bold hover:text-white transition-colors"
                            >
                                {mode === 'login' ? "Don't have an Infinity ID? Register" : "Already have an account? Login"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
