import { Plus, Users, Shield } from "lucide-react";
import Link from "next/link";

export default async function RolesPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rol ve İzin Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Bakım modunda.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Role Placeholder */}
                <Link href="/admin/roles/new" className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px] flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group p-6 min-h-[200px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold">Yeni Rol Ekle</span>
                </Link>
            </div>
        </div>
    );
}
