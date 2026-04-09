"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveWorkflow(tenantId: string, name: string, nodes: any[]) {
    try {
        if (!nodes || nodes.length < 2) {
            return { success: false, error: "Akış en az bir tetikleyici ve bir aksiyon içermelidir." };
        }

        // The first node is usually the trigger. The rest are actions.
        const triggerNode = nodes[0];
        const actionNodes = nodes.slice(1);

        // Serialize the full node structure into the conditions JSON so we can reconstruct the UI later
        const conditionsJson = JSON.stringify(nodes);

        const automation = await prisma.automation.create({
            data: {
                tenantId,
                name,
                type: "custom-workflow",
                trigger: triggerNode.title, // e.g. 'Sipariş Geldiğinde'
                action: actionNodes.map(n => n.title).join(', '), // e.g. 'SMS At, Fatura Kes'
                conditions: JSON.parse(conditionsJson), // Store the exact UI format
                isActive: true
            }
        });

        revalidatePath('/dashboard/workflow-builder');
        return { success: true, automation };
    } catch (error) {
        console.error("Error saving workflow:", error);
        return { success: false, error: "Akış kaydedilemedi." };
    }
}

export async function getActiveWorkflows(tenantId: string) {
    try {
        const workflows = await prisma.automation.findMany({
            where: { tenantId, type: "custom-workflow" },
            orderBy: { createdAt: 'desc' }
        });
        return workflows;
    } catch (error) {
        console.error("Error fetching workflows:", error);
        return [];
    }
}
