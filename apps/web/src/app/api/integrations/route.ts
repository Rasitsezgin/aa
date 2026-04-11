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
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { platform, apiKey, apiSecret, apiExtra } = body;

        if (!platform || !apiKey || !apiSecret) {
            return NextResponse.json({ error: "Platform, API Key and API Secret are required" }, { status: 400 });
        }

        // Check if integration already exists for this tenant and platform
        const existingIntegration = await prisma.integration.findFirst({
            where: {
                tenantId,
                platform: platform,
            }
        });

        if (existingIntegration) {
            // Update
            const updated = await prisma.integration.update({
                where: { id: existingIntegration.id },
                data: {
                    apiKey,
                    apiSecret,
                    apiExtra: apiExtra || {},
                    isActive: true,
                }
            });
            return NextResponse.json({ success: true, id: updated.id });
        }

        // Create
        const created = await prisma.integration.create({
            data: {
                tenantId,
                platform,
                apiKey,
                apiSecret,
                apiExtra: apiExtra || {},
                isActive: true,
            }
        });

        return NextResponse.json({ success: true, id: created.id }, { status: 201 });

    } catch (error) {
        console.error("Error saving integration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        const tenantId = (session?.user as any)?.tenantId as string;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Integration ID missing" }, { status: 400 });
        }

        await prisma.integration.delete({
            where: {
                id,
                tenantId, // ensure tenant owns it
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting integration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
