export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrations = await prisma.integration.findMany({
            where: {
                tenantId,
                isActive: true
            }
        });

        // Hide secrets
        const safeIntegrations = integrations.map(int => ({
            id: int.id,
            platform: int.platform,
            apiKey: int.apiKey ? "********" : "",
            apiExtra: int.apiExtra,
            isActive: int.isActive,
            createdAt: int.createdAt,
            updatedAt: int.updatedAt,
        }));

        return NextResponse.json(safeIntegrations);
    } catch (error) {
        console.error("Error fetching integrations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: "Bu endpoint sadece okuma icin. Entegrasyon ekleme API uzerinden yapilmali." },
        { status: 405 }
    );
}

export async function DELETE(req: NextRequest) {
    return NextResponse.json(
        { error: "Bu endpoint sadece okuma icin. Entegrasyon silme API uzerinden yapilmali." },
        { status: 405 }
    );
}
