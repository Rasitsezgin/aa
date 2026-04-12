'use server'

import { prisma } from "@pazaryonetimi/database";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveDashboardLayout(layoutConfig: object) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { dashboardConfig: layoutConfig as object }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Kaydedilemedi" };
    }
}
