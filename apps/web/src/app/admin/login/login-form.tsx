"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle,
    Eye, EyeOff, Fingerprint, Activity, Server, Database,
    Terminal, Wifi, Zap, Globe, Cpu, Radio, ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Animated terminal log lines (Institutionalized)
const terminalLines = [
    { text: ">> INITIALIZING SECURE_GATEWAY_V4", color: "text-blue-400" },
    { text: ">> LOADING ENCRYPTION MODULES (RSA-4096)", color: "text-slate-500" },
    { text: ">> ESTABLISHING PROTECTED HANDSHAKE...", color: "text-slate-500" },
    { text: ">> FIREWALL RULES: VALIDATED ✓", color: "text-emerald-400" },
    { text: ">> SYSTEM_RESOURCES: STABLE", color: "text-blue-400" },
    { text: ">> AWAITING OPERATOR AUTHORIZATION...", color: "text-amber-400" },
];

export default function LoginForm() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState("");
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax logic for admin
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
    const bgX = useTransform(springX, [-500, 500], [15, -15]);
    const bgY = useTransform(springY, [-500, 500], [15, -15]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        const lineTimer = setInterval(() => {
            setVisibleLines((prev) => (prev < terminalLines.length ? prev + 1 : prev));
        }, 800);

        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            mouseX.set(e.clientX - innerWidth / 2);
            mouseY.set(e.clientY - innerHeight / 2);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            clearInterval(timer);
            clearInterval(lineTimer);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [mouseX, mouseY]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { signIn } = await import("next-auth/react");
            const rawCallback = searchParams.get("callbackUrl") || "/admin";
            const callbackUrl = rawCallback.startsWith("/admin") ? rawCallback : "/admin";

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (!result?.ok || result?.error) {
                setError("Erişim reddedildi: Geçersiz operatör kimliği.");
                setIsLoading(false);
            } else {
                window.location.href = callbackUrl;
            }
        } catch (err) {
            setError("Protokol hatası: Sunucuya bağlanılamadı.");
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 flex items-center justify-center overflow-auto bg-[#020617] selection:bg-blue-500/30"
        >
            {/* Background Layer with Parallax */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-[-5%] w-[110%] h-[110%]">
                    <Image
                        src="/images/auth-bg-3d.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-20 mix-blend-luminosity scale-110"
                        priority
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/95 to-blue-950/40" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)]" />

                {/* Clean Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:60px_60px]" />

                {/* Institutional corner marks */}
                <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-white/5 rounded-tl-3xl" />
                <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-white/5 rounded-br-3xl" />
            </div>

            {/* Scanning Line */}
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-10 pointer-events-none"
            />

            <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-24 relative z-20 px-4 sm:px-6 py-8 sm:py-12">

                {/* Left side: System Overview (The Refined Terminal) */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    className="hidden lg:flex flex-col flex-1 max-w-[440px] w-full"
                >
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                                    <ShieldCheck className="w-7 h-7 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-[0.05em] uppercase leading-none">PazarYonetimi</h1>
                                <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-[0.4em] mt-1.5">Executive Dashboard Entry</p>
                            </div>
                        </div>
                        <h2 className="text-3xl xl:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight mb-4 sm:mb-6">
                            Yönetim <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-300">Portalı</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500/80 font-medium leading-relaxed max-w-sm border-l border-white/5 pl-4 sm:pl-6">
                            Sistem yöneticisi paneline güvenli tünel üzerinden erişim sağlanmaktadır. Tüm operasyonlar loglanmaktadır.
                        </p>
                    </div>

                    {/* Highly Refined Terminal Window */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-3xl bg-black/40 border border-white/[0.08] backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/50"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Core Console — sys://auth</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-600 tabular-nums">{currentTime}</div>
                        </div>

                        <div className="p-6 space-y-2 font-mono text-[11px] min-h-[160px]">
                            <AnimatePresence>
                                {terminalLines.slice(0, visibleLines).map((line, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={`${line.color} leading-relaxed font-semibold`}
                                    >
                                        {line.text}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {visibleLines >= terminalLines.length && (
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="text-white ml-0.5"
                                >
                                    _
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* System Metrics Sidebar */}
                    <div className="mt-8 flex items-center justify-between px-4">
                        {[
                            { icon: <Cpu className="w-3.5 h-3.5" />, label: "CPU", val: "2.4%", color: "text-blue-400" },
                            { icon: <Database className="w-3.5 h-3.5" />, label: "DB", val: "SYNCD", color: "text-emerald-400" },
                            { icon: <Radio className="w-3.5 h-3.5" />, label: "SSL", val: "RSA4", color: "text-amber-400" },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/5 ${stat.color}`}>
                                    {stat.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</span>
                                    <span className={`text-[10px] font-black uppercase ${stat.color}`}>{stat.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right side: Login Card (Institutional Vault) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-[480px] relative"
                >
                    {/* Atmospheric Glow */}
                    <div className="absolute -inset-10 bg-blue-600/[0.05] blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative bg-[#0b1220]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden group">
                        {/* Biometric Icon Decor */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                            <Fingerprint size={160} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                                        <Fingerprint className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">Yetkilendirme</h2>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">Operator Authorization</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Secure</span>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Error Display */}
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 mb-6"
                                        >
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <span className="text-[11px] font-bold tracking-tight uppercase">Hata: {error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Operator ID</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-12 sm:h-14 bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-14 pr-6 text-white text-sm font-bold focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-700 font-mono"
                                                placeholder="admin@corporation.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Key</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-12 sm:h-14 bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-14 pr-14 text-white text-sm font-bold focus:border-blue-500/50 focus:bg-blue-500/5 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder-slate-700 font-mono"
                                                placeholder="••••••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-12 sm:h-14 lg:h-16 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.4)] transition-all hover:shadow-[0_25px_60px_-10px_rgba(37,99,235,0.5)] group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Fingerprint className="w-6 h-6" />
                                            GİRİŞ PROTOKOLÜNÜ BAŞLAT
                                        </div>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </div>

                    {/* Footer Badges */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-8 opacity-40">
                        {[
                            { icon: <Shield className="w-4 h-4" />, label: "RSA-4096 BIT" },
                            { icon: <Globe className="w-4 h-4" />, label: "ENCRYPTION ACTIVE" },
                            { icon: <Zap className="w-4 h-4" />, label: "SOC II COMPLIANT" },
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-white">
                                {badge.icon}
                                <span className="text-[8px] font-black uppercase tracking-widest">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
