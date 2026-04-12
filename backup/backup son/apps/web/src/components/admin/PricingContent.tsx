"use client";

import React, { useActionState } from 'react';
import { Save } from 'lucide-react';
import { updatePricingCatalog } from '@/actions/pricing-settings';
import type { PricingCatalog } from '@/config/pricing-catalog';

export default function PricingContent({ initialCatalog }: { initialCatalog: PricingCatalog }) {
    const [state, action, pending] = useActionState(updatePricingCatalog, null);

    const starter = initialCatalog.plans.find((plan) => plan.id === 'starter')!;
    const professional = initialCatalog.plans.find((plan) => plan.id === 'professional')!;
    const enterprise = initialCatalog.plans.find((plan) => plan.id === 'enterprise')!;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Fiyat Merkezi</h1>
                <p className="text-slate-500 font-medium">Landing, pricing ve signup ekranlari bu kaynaktan beslenir.</p>
            </div>

            <form action={action} className="space-y-6">
                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Genel Basliklar</h3>
                        <button
                            type="submit"
                            disabled={pending}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-60"
                        >
                            <Save size={18} />
                            {pending ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>

                    {state && (
                        <div className={`p-4 rounded-2xl text-sm font-bold ${state.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Badge</label>
                            <input name="badge" defaultValue={initialCatalog.badge} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Baslik</label>
                            <input name="title" defaultValue={initialCatalog.title} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Alt Baslik</label>
                            <textarea name="subtitle" rows={2} defaultValue={initialCatalog.subtitle} className="w-full p-4 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-foreground text-sm font-medium outline-none focus:border-blue-500/50 resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Aylik Etiketi</label>
                            <input name="monthlyLabel" defaultValue={initialCatalog.monthlyLabel} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Yillik Etiketi</label>
                            <input name="yearlyLabel" defaultValue={initialCatalog.yearlyLabel} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Yillik Indirim Etiketi</label>
                            <input name="yearlyDiscountLabel" defaultValue={initialCatalog.yearlyDiscountLabel} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                    </div>
                </div>

                <PricingPlanCard title="Baslangic" prefix="starter" defaults={starter} />
                <PricingPlanCard title="Profesyonel" prefix="professional" defaults={professional} />

                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Kurumsal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Plan Adi</label>
                            <input name="enterprise_name" defaultValue={enterprise.name} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Fiyat Etiketi</label>
                            <input name="enterprise_label" defaultValue={enterprise.enterpriseLabel ?? 'Ozel'} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Signup Aciklamasi</label>
                            <input name="enterprise_signupDescription" defaultValue={enterprise.signupDescription} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

function PricingPlanCard({
    title,
    prefix,
    defaults,
}: {
    title: string;
    prefix: 'starter' | 'professional';
    defaults: {
        name: string;
        monthly: number | null;
        yearly: number | null;
        signupDescription: string;
    };
}) {
    return (
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Plan Adi</label>
                    <input name={`${prefix}_name`} defaultValue={defaults.name} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Signup Aciklamasi</label>
                    <input name={`${prefix}_signupDescription`} defaultValue={defaults.signupDescription} className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Aylik Fiyat (TRY)</label>
                    <input name={`${prefix}_monthly`} defaultValue={defaults.monthly ?? ''} inputMode="numeric" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Yillik Fiyat (TRY)</label>
                    <input name={`${prefix}_yearly`} defaultValue={defaults.yearly ?? ''} inputMode="numeric" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                </div>
            </div>
        </div>
    );
}
