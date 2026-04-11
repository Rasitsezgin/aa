import DashboardClient from "./dashboard-client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface DashboardConfig {
    showStats: boolean;
    showRevenue: boolean;
    showServerStatus: boolean;
    showQuickActions: boolean;
    showLiveLogs: boolean;
    showPlatformStats: boolean;
    isActive: boolean;
    capabilities?: { seo?: boolean; analysis?: boolean; image?: boolean };
    tokensUsed: number;
    showAiVision: boolean;
}

// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const session = await auth();

    let config: DashboardConfig | null = null;

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { dashboardConfig: true },
        });

        if (user?.dashboardConfig && typeof user.dashboardConfig === 'object' && !Array.isArray(user.dashboardConfig)) {
            config = user.dashboardConfig as unknown as DashboardConfig;
        }
    }

    return <DashboardClient config={config} />;
}
