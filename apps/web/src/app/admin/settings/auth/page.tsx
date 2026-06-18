import { Shield } from "lucide-react"
import AuthSettingsForm from "./auth-settings-form"
import { getStringSettings } from "@/lib/admin-settings-store"

export const dynamic = 'force-dynamic'

export default async function AuthSettingsPage() {
    const settings = await getStringSettings([
        'google_id', 'google_secret', 'facebook_id', 'facebook_secret',
    ])

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Shield className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Giriş Ayarları</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Sosyal medya giriş entegrasyonlarını buradan yönetin.</p>
                </div>
            </div>

            <AuthSettingsForm settings={settings} />
        </div>
    )
}
