"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    ShieldAlert, Shield, Lock, Unlock, Eye, Search, Filter,
    AlertTriangle, CheckCircle, XCircle, Clock, Globe, Wifi,
    ChevronLeft, ChevronRight, Loader2, Ban, Activity,
    Key, Users, BarChart3, TrendingUp, TrendingDown
} from 'lucide-react';

interface LoginAttempt {
    success: boolean;
    email: string;
    ipAddress?: string;
    ip?: string;
    createdAt?: string;
    userAgent?: string;
}

interface SuspiciousIp {
    ipAddress?: string;
    ip?: string;
    _count?: {
        id: number;
    };
    failedCount?: number;
    count?: number;
}

export default function SecurityPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'logins' | 'ips' | '2fa'>('overview');
    const [loginSearch, setLoginSearch] = useState('');
    const [loginFilter, setLoginFilter] = useState('');
    const [loginPage, setLoginPage] = useState(1);
    const [blockIpModal, setBlockIpModal] = useState(false);
    const [blockIpValue, setBlockIpValue] = useState('');
    const [blockReason, setBlockReason] = useState('');

    const queryClient = useQueryClient();

    const { data: securityStats, isLoading: statsLoading } = useQuery({
        queryKey: ['security-stats'],
        queryFn: () => adminApi.getSecurityStats(),
    });

    const { data: loginAttempts, isLoading: loginsLoading } = useQuery({
        queryKey: ['login-attempts', { email: loginSearch, success: loginFilter, page: loginPage }],
        queryFn: () => adminApi.getLoginAttempts({
            email: loginSearch || undefined,
            success: loginFilter || undefined,
            page: loginPage,
        }),
        enabled: activeTab === 'overview' || activeTab === 'logins',
    });

    const { data: suspiciousIps, isLoading: ipsLoading } = useQuery({
        queryKey: ['suspicious-ips'],
        queryFn: () => adminApi.getSuspiciousIps(),
        enabled: activeTab === 'overview' || activeTab === 'ips',
    });

    const { data: twoFAStats, isLoading: tfaLoading } = useQuery({
        queryKey: ['2fa-stats'],
        queryFn: () => adminApi.get2FAStats(),
        enabled: activeTab === 'overview' || activeTab === '2fa',
    });

    const blockIpMutation = useMutation({
        mutationFn: ({ ip, reason }: { ip: string; reason: string }) => adminApi.blockIp(ip, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suspicious-ips'] });
            setBlockIpModal(false);
            setBlockIpValue('');
            setBlockReason('');
        },
    });

    const logins = loginAttempts?.attempts || loginAttempts || [];
    const totalLoginPages = loginAttempts?.totalPages || 1;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const tabs = [
        { key: 'overview', label: 'Genel Bakış', icon: Activity },
        { key: 'logins', label: 'Giriş Denemeleri', icon: Key },
        { key: 'ips', label: 'Şüpheli IP\'ler', icon: Globe },
        { key: '2fa', label: '2FA İstatistikleri', icon: Shield },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Güvenlik Merkezi</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Giriş denemeleri, IP izleme ve 2FA yönetimi</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 w-fit shadow-sm">
                {tabs.map(tab => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as 'overview' | 'logins' | 'ips' | '2fa')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <TabIcon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Toplam Giriş', value: securityStats?.totalAttempts || 0, icon: Key, color: 'blue', change: null },
                            { label: 'Başarısız Giriş', value: securityStats?.failedAttempts || 0, icon: XCircle, color: 'red', change: null },
                            { label: 'Şüpheli IP', value: (Array.isArray(suspiciousIps) ? suspiciousIps : []).length, icon: ShieldAlert, color: 'amber', change: null },
                            { label: '2FA Kullanım', value: `${twoFAStats?.percentage || 0}%`, icon: Shield, color: 'green', change: null },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                                        <stat.icon size={18} className={`text-${stat.color}-500`} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                </div>
                                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Login Attempts */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Key size={18} className="text-blue-500" /> Son Giriş Denemeleri
                            </h3>
                        </div>
                        {loginsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">E-posta</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">IP</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {(Array.isArray(logins) ? logins : []).slice(0, 10).map((login: LoginAttempt, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4">
                                                {login.success ? (
                                                    <span className="flex items-center gap-1 text-green-500 text-xs font-bold"><CheckCircle size={14} /> Başarılı</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle size={14} /> Başarısız</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-foreground">{login.email}</td>
                                            <td className="p-4 text-sm text-slate-500 font-mono">{login.ipAddress || login.ip || '—'}</td>
                                            <td className="p-4 text-sm text-slate-500">{login.createdAt ? formatDate(login.createdAt) : '—'}</td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(logins) || logins.length === 0) && (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Kayıt bulunamadı</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* LOGINS TAB */}
            {activeTab === 'logins' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text" placeholder="E-posta ile ara..."
                                value={loginSearch} onChange={(e) => { setLoginSearch(e.target.value); setLoginPage(1); }}
                                className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <select value={loginFilter} onChange={(e) => { setLoginFilter(e.target.value); setLoginPage(1); }}
                            className="h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-400 outline-none">
                            <option value="">Tüm Durumlar</option>
                            <option value="true">Başarılı</option>
                            <option value="false">Başarısız</option>
                        </select>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        {loginsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">E-posta</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">IP Adresi</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">User Agent</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {(Array.isArray(logins) ? logins : []).map((login: LoginAttempt, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4">
                                                    {login.success ? (
                                                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold"><CheckCircle size={14} /> Başarılı</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle size={14} /> Başarısız</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-foreground">{login.email}</td>
                                                <td className="p-4 text-sm text-slate-500 font-mono">{login.ipAddress || login.ip || '—'}</td>
                                                <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate">{login.userAgent || '—'}</td>
                                                <td className="p-4 text-sm text-slate-500">{login.createdAt ? formatDate(login.createdAt) : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalLoginPages > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-white/5">
                                        <span className="text-xs text-slate-500 font-bold">Sayfa {loginPage} / {totalLoginPages}</span>
                                        <div className="flex gap-2">
                                            <button disabled={loginPage <= 1} onClick={() => setLoginPage(p => p - 1)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 disabled:opacity-30"><ChevronLeft size={16} /></button>
                                            <button disabled={loginPage >= totalLoginPages} onClick={() => setLoginPage(p => p + 1)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 disabled:opacity-30"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* IPs TAB */}
            {activeTab === 'ips' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setBlockIpModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">
                            <Ban size={16} /> IP Engelle
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        {ipsLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">IP Adresi</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Başarısız Deneme</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Risk</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {(Array.isArray(suspiciousIps) ? suspiciousIps : []).map((ip: SuspiciousIp, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 text-sm font-bold text-foreground font-mono">{ip.ipAddress || ip.ip}</td>
                                            <td className="p-4 text-sm text-red-500 font-bold">{ip._count?.id || ip.failedCount || ip.count || 0}</td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${(ip._count?.id || ip.count || 0) > 10
                                                    ? 'bg-red-500/10 text-red-500'
                                                    : (ip._count?.id || ip.count || 0) > 5
                                                        ? 'bg-amber-500/10 text-amber-500'
                                                        : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {(ip._count?.id || ip.count || 0) > 10 ? 'Yüksek' : (ip._count?.id || ip.count || 0) > 5 ? 'Orta' : 'Düşük'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => { setBlockIpValue(ip.ipAddress || ip.ip || ''); setBlockReason('Şüpheli aktivite'); setBlockIpModal(true); }}
                                                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 ml-auto"
                                                >
                                                    <Ban size={14} /> Engelle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!Array.isArray(suspiciousIps) || suspiciousIps.length === 0) && (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Şüpheli IP bulunamadı</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* 2FA TAB */}
            {activeTab === '2fa' && (
                <div className="space-y-6">
                    {tfaLoading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
                                    <Shield size={28} className="text-green-500 mx-auto mb-3" />
                                    <div className="text-3xl font-black text-foreground">{twoFAStats?.enabled || 0}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">2FA Aktif</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
                                    <Users size={28} className="text-slate-400 mx-auto mb-3" />
                                    <div className="text-3xl font-black text-foreground">{twoFAStats?.disabled || 0}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">2FA Pasif</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
                                    <BarChart3 size={28} className="text-blue-500 mx-auto mb-3" />
                                    <div className="text-3xl font-black text-foreground">{twoFAStats?.percentage || 0}%</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Kullanım Oranı</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                <h3 className="font-bold text-foreground mb-4">2FA Penetrasyon Oranı</h3>
                                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${twoFAStats?.percentage || 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                                    <span>{twoFAStats?.enabled || 0} aktif</span>
                                    <span>{twoFAStats?.total || 0} toplam</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Block IP Modal */}
            {blockIpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setBlockIpModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 max-w-md w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                            <Ban size={20} className="text-red-500" /> IP Adresini Engelle
                        </h3>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">IP Adresi *</label>
                            <input value={blockIpValue} onChange={(e) => setBlockIpValue(e.target.value)} placeholder="192.168.1.1"
                                className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-red-500/50 font-mono" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Neden</label>
                            <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Engelleme nedeni"
                                className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-red-500/50" />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setBlockIpModal(false)} className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface/80">İptal</button>
                            <button
                                onClick={() => blockIpMutation.mutate({ ip: blockIpValue, reason: blockReason })}
                                disabled={!blockIpValue || blockIpMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50"
                            >
                                {blockIpMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />} Engelle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
