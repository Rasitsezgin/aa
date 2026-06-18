import RoleForm from "./role-form";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function NewRolePage() {
    const permissions = await prisma.permission.findMany({
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        take: 500,
    });

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Yeni Rol Oluştur</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Yeni bir kullanıcı rolü tanımlayın.</p>
            </div>

            <div className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-200 dark:border-white/10">
                <RoleForm permissions={permissions} />
            </div>
        </div>
    )
}
