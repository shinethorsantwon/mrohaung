'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, ArrowRight, Phone, Calendar, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
    const [showPassword, setShowPassword] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { login } = useAuth();

    // Responsive detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync mode with initialMode if it changes while open
    useEffect(() => {
        if (isOpen) setMode(initialMode);
    }, [isOpen, initialMode]);

    // Clear error on mode change
    useEffect(() => {
        setError('');
    }, [mode]);

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
                // Optional: clear fields
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const mobileVariants = {
        hidden: { y: '100%', opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8
            }
        },
        exit: {
            y: '100%',
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' }
        }
    } as const;

    const desktopVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 20,
                stiffness: 200
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20,
            transition: { duration: 0.2 }
        }
    } as const;


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={cn(
                            "absolute inset-0 transition-colors duration-500",
                            isMobile
                                ? "bg-white/90 backdrop-blur-xl"
                                : "bg-black/40 backdrop-blur-sm"
                        )}
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={isMobile ? mobileVariants : desktopVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                            "relative z-50 w-full overflow-hidden",
                            isMobile
                                ? "h-screen flex flex-col justify-center px-6"
                                : "max-w-lg bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/40"
                        )}
                    >
                        {/* Background Decorative Gradients (Desktop) */}
                        {!isMobile && (
                            <>
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-[80px] rounded-full pointer-events-none" />
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className={cn(
                                "absolute z-50 p-3 rounded-2xl bg-black/5 hover:bg-black/10 text-slate-600 transition-all active:scale-90",
                                isMobile ? "top-6 right-6" : "top-8 right-8"
                            )}
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative z-10 w-full max-w-sm mx-auto overflow-y-auto max-h-[90vh] no-scrollbar py-4">
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 mb-6 shadow-xl shadow-indigo-500/20"
                                >
                                    <Sparkles className="w-8 h-8 text-white" />
                                </motion.div>
                                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
                                    Welcome to <span className="text-indigo-600">MROHAUNG</span>
                                </h2>
                                <p className="text-slate-500 text-lg font-medium">
                                    {mode === 'login' ? 'Great to see you again!' : 'Join the premium community today'}
                                </p>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={mode}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    {mode === 'register' && (
                                        <>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="Full Name"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-base font-semibold"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        type="date"
                                                        value={dob}
                                                        onChange={(e) => setDob(e.target.value)}
                                                        className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold"
                                                        required
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        className="w-full px-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-sm font-semibold appearance-none"
                                                        required
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="Phone Number"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-base font-semibold"
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-base font-semibold"
                                            required
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full pl-12 pr-12 py-4 bg-slate-100/50 border-2 border-transparent rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all text-base font-semibold"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center border border-red-100"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 text-base uppercase tracking-wider transition-all disabled:opacity-70 mt-4"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {mode === 'login' ? 'Sign In Securely' : 'Create Identity'}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </motion.form>
                            </AnimatePresence>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className="text-slate-500 text-sm font-bold hover:text-indigo-600 transition-colors inline-flex items-center gap-1 group"
                                >
                                    {mode === 'login' ? (
                                        <>Don't have an identity yet? <span className="text-indigo-600 group-hover:underline Decoration-2">Register Now</span></>
                                    ) : (
                                        <>Already a member? <span className="text-indigo-600 group-hover:underline decoration-2">Sign In</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}


