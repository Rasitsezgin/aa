"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTasks(tenantId: string) {
    try {
        const tasks = await prisma.adminTask.findMany({
            where: { tenantId },
            include: {
                assignee: { select: { firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return tasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            // Map Prisma status to UI status
            status: t.status === 'DONE' ? 'done' : 
                    t.status === 'IN_REVIEW' ? 'review' : 
                    t.status === 'IN_PROGRESS' ? 'in-progress' : 'todo',
            // Map Prisma priority to UI priority
            priority: t.priority === 'HIGH' || t.priority === 'URGENT' ? 'high' :
                      t.priority === 'LOW' ? 'low' : 'medium',
            assignee: (t.assignee?.firstName ? `${t.assignee.firstName} ${t.assignee.lastName || ''}` : t.assignee?.email) || "Atanmadı",
            dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : "",
            tags: Array.isArray(t.tags) ? t.tags : [],
            progress: t.status === 'DONE' ? 100 : 
                      t.status === 'IN_REVIEW' ? 90 :
                      t.status === 'IN_PROGRESS' ? 50 : 0
        }));
    } catch (error) {
        console.error("Görevler alınırken hata:", error);
        return [];
    }
}

export async function createTask(tenantId: string, data: any) {
    try {
        await prisma.adminTask.create({
            data: {
                tenantId,
                title: data.title,
                description: data.description,
                priority: data.priority === 'Yüksek' ? 'HIGH' : data.priority === 'Düşük' ? 'LOW' : 'MEDIUM',
                status: 'TODO',
                tags: ['yeni'],
                dueDate: data.dueDate ? new Date(data.dueDate) : null
                // Note: Assignee mapping would require users fetch, omitted for simplicity
            }
        });
        
        revalidatePath('/dashboard/task-manager');
        return { success: true };
    } catch (error) {
        console.error("Görev oluşturulurken hata:", error);
        return { success: false, error: "Görev oluşturulamadı." };
    }
}
