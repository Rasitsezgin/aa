'use client'

import { useActionState } from "react"
import { createRole } from "@/actions/roles"
import { Save, AlertCircle, Check } from "lucide-react"

const initialState = {
    success: false,
    message: '',
    errors: {} as Record<string, string[]>
}

export default function RoleForm({ permissions }: { permissions: any[] }) {
    const [state, formAction, isPending] = useActionState(createRole, initialState)

    return (
        <form action={formAction} className="space-y-6">
            {state?.message && (
                <div className={`p-4 rounded-xl ${state.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border font-medium flex items-center gap-3`}>
                    {state.success ? <Check size={20} /> : <AlertCircle size={20} />}
                    {state.message}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Rol Adı</label>
                <input
                    name="name"
                    type="text"
                    placeholder="Örn: Editör"
                    className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500/50"
                />
                {state.errors?.name && <p className="text-red-500 text-xs font-bold pl-1">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Açıklama</label>
                <textarea
                    name="description"
                    rows={3}
                    placeholder="Bu rolün yetkilerini kısaca açıklayın..."
                    className="w-full p-4 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-blue-500/50 resize-none"
                />
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Yetkiler</label>
                {permissions.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-center text-slate-500 text-sm">
                        Henüz tanımlanmış izin yok.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map((perm) => (
                            <label key={perm.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:border-blue-500/30 transition-colors">
                                <input type="checkbox" name="permissions" value={perm.id} className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300">{perm.action}</div>
                                    <div className="text-xs text-slate-500">{perm.resource}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Save size={20} />
                    <span>{isPending ? 'Oluşturuluyor...' : 'Rolü Kaydet'}</span>
                </button>
            </div>
        </form>
    )
}
