import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        const body = await request.json();
        
        const task = await prisma.adminTask.update({
            where: { id, tenantId: session.user.tenantId },
            data: {
                title: body.title,
                description: body.description,
                status: body.status,
                priority: body.priority,
                tags: body.tags,
                assigneeId: body.assigneeId,
                dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        await prisma.adminTask.delete({
            where: { id, tenantId: session.user.tenantId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
