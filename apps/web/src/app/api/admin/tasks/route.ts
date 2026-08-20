import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assigneeId = searchParams.get('assigneeId');

        const where: any = { tenantId: session.user.tenantId };
        if (status) where.status = status;
        if (assigneeId) where.assigneeId = assigneeId;

        const tasks = await prisma.adminTask.findMany({
            where,
            include: { assignee: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        // Ensure tasks always return id as string
        return NextResponse.json(tasks.map(t => ({
            ...t,
            assignee: t.assignee || { name: 'Atanmadı' },
            description: t.description || ""
        })));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        const task = await prisma.adminTask.create({
            data: {
                tenantId: session.user.tenantId,
                title: body.title,
                description: body.description,
                status: body.status || 'TODO',
                priority: body.priority || 'MEDIUM',
                tags: body.tags || [],
                assigneeId: body.assigneeId || null,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
