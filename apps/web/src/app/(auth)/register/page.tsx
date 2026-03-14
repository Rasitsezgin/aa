"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        company: '',
    });

    const getPasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'password') {
            setPassword(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.firstName.trim()) {
            setError('Adınız zorunludur.');
            return;
        }
        if (!formData.email.trim()) {
            setError('E-posta adresi zorunludur.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Geçerli bir e-posta adresi giriniz.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır.');
            return;
        }

        setIsLoading(true);
        try {
            // Register user
            const registerRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    company: formData.company,
                }),
            });

            if (!registerRes.ok) {
                const data = await registerRes.json();
                throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
            }

            setSuccess(true);

            // Auto login after successful registration, then redirect to onboarding
            setTimeout(async () => {
                await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    callbackUrl: '/onboarding',
                });
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Hemen Başlayın
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm leading-relaxed">
                    14 gün ücretsiz deneme ile yapay zeka gücünü keşfedin.
                </p>
            </div>

            <motion.form
                variants={itemVariants}
                className="space-y-5"
                onSubmit={handleSubmit}
            >
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                    </motion.div>
                )}

                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 flex items-start gap-3"
                    >
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Kayıt başarılı! Panelinize yönlendiriliyorsunuz...</p>
                    </motion.div>
                )}
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Adınız</label>
                        <div
                            className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'name'
                                ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                        >
                            <input
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Ahmet"
                                className="w-full px-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Soyadınız</label>
                        <div
                            className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'surname'
                                ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                }`}
                        >
                            <input
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                onFocus={() => setFocusedInput('surname')}
                                onBlur={() => setFocusedInput(null)}
                                placeholder="Yılmaz"
                                className="w-full px-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Company Name Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Şirket / Mağaza Adı</label>
                    <div
                        className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'company'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                    >
                        <input
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedInput('company')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="Mağaza adınız (opsiyonel)"
                            className="w-full px-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        />
                    </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">E-posta Adresi</label>
                    <div
                        className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'email'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                    >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                            <Mail
                                size={18}
                                className={`transition-colors duration-300 ${focusedInput === 'email' ? 'text-blue-500' : 'text-slate-400'
                                    }`}
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="ornek@sirket.com"
                            className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Şifre</label>
                    <div
                        className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'password'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                    >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                            <Lock
                                size={18}
                                className={`transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-500' : 'text-slate-400'
                                    }`}
                            />
                        </div>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="Min. 8 karakter"
                            className="w-full pl-12 pr-12 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="flex gap-1 pt-1 px-1 h-1.5 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-500 ${i < passwordStrength
                                    ? 'bg-blue-500'
                                    : 'bg-slate-100 dark:bg-white/5'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="terms"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 checked:border-blue-500 checked:bg-blue-500 transition-all"
                        />
                        <Check size={12} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <label htmlFor="terms" className="text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none leading-relaxed">
                        <Link href="/terms" className="text-slate-900 dark:text-white font-bold hover:underline">Kullanım Şartları</Link>&apos;nı ve <Link href="/privacy" className="text-slate-900 dark:text-white font-bold hover:underline">Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
                    </label>
                </div>

                {/* Register Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group mt-2 relative py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm overflow-hidden shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-slate-900/40 dark:hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Hesap Oluşturuluyor...
                            </>
                        ) : (
                            <>
                                Hesabımı Oluştur
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-8 text-center bg-slate-100 dark:bg-white/5 p-4 rounded-xl">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Zaten üye misiniz?{' '}
                    <Link href="/login" className="text-slate-900 dark:text-blue-400 font-black hover:underline transition-all">
                        Giriş Yapın
                    </Link>
                </p>
            </motion.div>
        </motion.div>
    );
}

