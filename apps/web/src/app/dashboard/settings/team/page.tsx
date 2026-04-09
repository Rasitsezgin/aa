"use client";

import React, { useState } from 'react';
import { 
    Users, ShieldCheck, Mail, Check, X,
    UserPlus, Lock, Building, EyeOff, LayoutPanelLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const mockTeam = [
    { id: 1, name: 'Ali Yılmaz', email: 'ali@sirket.com', role: 'Depo Sorumlusu', lastLogin: 'Bugün 09:12' },
    { id: 2, name: 'Ayşe Demir', email: 'ayse.d@sirket.com', role: 'Muhasebe', lastLogin: 'Dün 16:45' },
    { id: 3, name: 'Can Erol', email: 'can@sirket.com', role: 'Müşteri Temsilcisi', lastLogin: '3 Gün Önce' }
];

const mockRoles = [
    { id: 'admin', name: 'Yönetici (Tam Erişim)', count: 1 },
    { id: 'depo', name: 'Depo Sorumlusu', count: 1 },
    { id: 'muhasebe', name: 'Muhasebe', count: 1 },
    { id: 'musteri', name: 'Müşteri Temsilcisi', count: 1 },
];

const mockPermissions = [
    { module: 'Sipariş Yönetimi', desc: 'Siparişleri görebilir ve durumunu değiştirebilir.', usersWithAccess: ['admin', 'depo', 'musteri'] },
    { module: 'Fatura & Cari', desc: 'E-Fatura kesebilir, muhasebe verilerini görebilir.', usersWithAccess: ['admin', 'muhasebe'] },
    { module: 'Ayarlar & Kodlar', desc: 'Sistem entegrasyonlarını, API anahtarlarını değiştirebilir.', usersWithAccess: ['admin'] },
    { module: 'Ürün & Stok Ekleme', desc: 'Yeni ürün açabilir ve Excel ile stok güncelleyebilir.', usersWithAccess: ['admin', 'depo'] },
];

export default function TeamManagementPage() {
    const [selectedRole, setSelectedRole] = useState('depo');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Ekip ve Rol Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Alt kullanıcılar (personeller) oluşturun. Sadece görmelerini istediğiniz ekranlara yetki vererek operasyonlarınızı güvenle devredin.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Yeni Personel Ekle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Available Roles Side */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Sistem Rolleri</h3>
                    <div className="space-y-2">
                        {mockRoles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={\`w-full flex items-center justify-between p-4 rounded-2xl border transition-all \${
                                    selectedRole === role.id 
                                    ? 'bg-primary/5 border-primary/30 text-primary' 
                                    : 'bg-surface border-border hover:border-primary/20 text-slate-700 dark:text-slate-300'
                                }\`}
                            >
                                <span className="font-bold text-sm text-left">{role.name}</span>
                                <span className={\`text-xs font-bold px-2 py-0.5 rounded-full \${selectedRole === role.id ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}\`}>
                                    {role.count} Kişi
                                </span>
                            </button>
                        ))}
                    </div>
                    <button className="w-full py-3 border-2 border-dashed border-border rounded-2xl text-slate-500 font-bold hover:border-primary/30 hover:text-primary transition-colors text-sm">
                        + Yeni Özel Rol Oluştur
                    </button>
                </div>

                {/* Permissions Matrix Side */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Visual Warning for selected role */}
                    {selectedRole !== 'admin' && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
                            <ShieldCheck className="w-6 h-6 text-indigo-500" />
                            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                Şu an <strong className="font-black text-indigo-600 dark:text-indigo-400">{mockRoles.find(r => r.id === selectedRole)?.name}</strong> rolünün yetkilerini (hangi menüleri görebileceğini) düzenliyorsunuz. Ayarları kapattığınızda bu personele sol menüde o kısımlar gizlenir.
                            </p>
                        </div>
                    )}

                    <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <LayoutPanelLeft className="w-5 h-5 text-slate-400" /> Detaylı Panel İzin Matrisi
                            </h3>
                        </div>
                        
                        <div className="divide-y divide-border">
                            {mockPermissions.map((perm, idx) => {
                                const hasAccess = perm.usersWithAccess.includes(selectedRole);
                                const isAdmin = selectedRole === 'admin';
                                
                                return (
                                    <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <div className="max-w-md">
                                            <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                                {perm.module} {isAdmin && <Lock className="w-3 h-3 text-red-400" title="Yöneticinin bu yetkisi kaldırılamaz" />}
                                            </div>
                                            <div className="text-xs text-slate-500">{perm.desc}</div>
                                        </div>
                                        
                                        <label className={\`relative inline-flex items-center \${isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}>
                                            <input type="checkbox" className="sr-only peer" checked={hasAccess} readOnly={isAdmin} />
                                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Team Members in this Role */}
                    <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-bold">Bu Role Sahip Personeller</h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-border">
                                    {mockTeam.filter(t => mockRoles.find(r => r.id === selectedRole)?.name === t.role || (selectedRole === 'admin' && t.id === 0) ).length === 0 ? (
                                        <tr><td className="p-6 text-center text-slate-500 text-sm">Bu gole atanmış personel bulunamadı.</td></tr>
                                    ) : mockTeam.map(member => {
                                        if (mockRoles.find(r => r.id === selectedRole)?.name !== member.role) return null;
                                        return (
                                            <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <td className="p-4 px-6 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {member.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6">
                                                    <div className="text-xs text-slate-500 font-medium">Bağlı Olduğu Şube</div>
                                                    <div className="text-sm font-bold flex items-center gap-1 mt-0.5"><Building className="w-3 h-3 text-slate-400" /> Merkez E-Ticaret</div>
                                                </td>
                                                <td className="p-4 px-6 text-right">
                                                    <div className="text-xs text-slate-400">Son Giriş: {member.lastLogin}</div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
