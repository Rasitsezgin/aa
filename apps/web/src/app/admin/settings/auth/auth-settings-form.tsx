'use client'

import { updateAuthSettings } from "@/actions/auth-settings"
import { Save, Chrome, Facebook as FacebookIcon } from "lucide-react"
import { useActionState } from "react"

const initialState = {
    message: '',
    success: false
}

export default function AuthSettingsForm({ settings }: { settings: Record<string, string> }) {
    const [state, formAction, isPending] = useActionState(updateAuthSettings, initialState)

    return (
        <form action={formAction} className="grid gap-6">
            {state?.message && (
                <div className={`p-4 rounded-xl ${state.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border font-medium`}>
                    {state.message}
                </div>
            )}

            {/* Google Card */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                        <span className="font-bold text-slate-600 dark:text-white text-lg">G</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Google Entegrasyonu</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client ID</label>
                        <input
                            name="google_id"
                            defaultValue={settings.google_id || ''}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                            placeholder="apps.googleusercontent.com..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Client Secret</label>
                        <input
                            name="google_secret"
                            defaultValue={settings.google_secret || ''}
                            type="password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                            placeholder="••••••••••••••••"
                        />
                    </div>
                </div>
            </div>

            {/* Facebook Card */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FacebookIcon size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Facebook Entegrasyonu</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">App ID</label>
                        <input
                            name="facebook_id"
                            defaultValue={settings.facebook_id || ''}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                            placeholder="1234567890..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">App Secret</label>
                        <input
                            name="facebook_secret"
                            defaultValue={settings.facebook_secret || ''}
                            type="password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                            placeholder="••••••••••••••••"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Save size={20} />
                    <span>{isPending ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
                </button>
            </div>
        </form>
    )
}
