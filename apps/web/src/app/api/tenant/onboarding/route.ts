export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from '../../../../auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli.' }, { status: 401 });
        }

        const user = session.user as any;
        const tenantId = user.tenantId;

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant bilgisi bulunamadı.' }, { status: 400 });
        }

        const body = await request.json();

        // Verify the tenant belongs to the current user
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant bulunamadı.' }, { status: 404 });
        }

        // 1. Update tenant with company information
        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: body.companyName || tenant.name,
                taxOffice: body.taxOffice || null,
                taxNumber: body.taxNumber || null,
                companyType: body.companyType || null,
                address: body.address || null,
                city: body.city || null,
                district: body.district || null,
                postcode: body.postcode || null,
                phone: body.phone || null,
                isOnboarded: true,
            },
        });

        // 2. Create integrations for selected platforms
        const selectedPlatforms: string[] = body.selectedPlatforms || [];
        for (const platform of selectedPlatforms) {
            const existing = await prisma.integration.findFirst({
                where: { tenantId, platform: platform as any },
            });
            if (!existing) {
                await prisma.integration.create({
                    data: {
                        tenantId,
                        platform: platform as any,
                        isActive: false, // User needs to add API keys later
                        apiKey: '',
                        apiSecret: '',
                    },
                });
            }
        }

        // 3. Record selected shipping/payment preferences
        const selectedShipping: string[] = body.selectedShipping || [];
        const selectedPayment: string[] = body.selectedPayment || [];
        const allServices = [...selectedShipping, ...selectedPayment];

        for (const serviceType of allServices) {
            const existing = await prisma.serviceCredential.findFirst({
                where: { tenantId, serviceType: serviceType as any },
            });
            if (!existing) {
                await prisma.serviceCredential.create({
                    data: {
                        tenantId,
                        serviceType: serviceType as any,
                        apiKey: '',
                        isActive: false,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Kurulum tamamlandı.',
        });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json(
            { error: 'Kurulum sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}
