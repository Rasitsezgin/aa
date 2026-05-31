export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[çÇ]/g, 'c')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[şŞ]/g, 's')
        .replace(/[üÜ]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 60);
}

export async function POST(request: NextRequest) {
    try {
        const { email, password, firstName, lastName, company, phone, subdomain } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email ve şifre gereklidir.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Şifre en az 8 karakter olmalıdır.' },
                { status: 400 }
            );
        }

        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Bu email adresi zaten kayıtlıdır.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create a NEW tenant for each registered user (multi-tenant SaaS)
        const tenantName = company || `${firstName || email.split('@')[0]}'in Mağazası`;
        const baseSlug = generateSlug(tenantName);

        // Ensure unique slug by appending random suffix if needed
        let slug = baseSlug;
        let slugExists = await prisma.tenant.findFirst({ where: { slug } });
        if (slugExists) {
            slug = `${baseSlug}-${Date.now().toString(36)}`;
        }

        // Use transaction to create tenant + admin role + user atomically
        const result = await prisma.$transaction(async (tx) => {
            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    slug,
                    plan: 'FREE',
                    isOnboarded: false,
                },
            });

            // Create default ADMIN role for this tenant
            // Note: We use connectOrCreate for permissions to avoid duplicates if they exist, 
            // though implicit M-N usually handles this by creating new records in the join table.
            const adminRole = await tx.role.create({
                data: {
                    name: 'Admin',
                    description: 'Mağaza Yöneticisi - Tam Yetki',
                    tenantId: tenant.id,
                    isSystem: true,
                    permissions: {
                        create: [
                            { action: 'manage', resource: 'all' },
                        ],
                    },
                },
            });

            // Create user as ADMIN of their own tenant
            const user = await tx.user.create({
                data: {
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                    firstName: firstName || email.split('@')[0],
                    lastName: lastName || '',
                    phone: phone || '',
                    type: 'ADMIN',
                    tenantId: tenant.id,
                    roleId: adminRole.id,
                    status: 'active',
                },
            });

            return { user, tenant };
        }, {
            timeout: 10000 // 10 seconds timeout for the transaction
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Kayıt başarılı. Yönlendiriliyorsunuz...',
                email: result.user.email,
                tenantId: result.tenant.id,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Register error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });

        // Check if it's a known Prisma error
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            return NextResponse.json(
                { error: `Kayıt başarısız: ${target.join(', ')} alanı benzersiz olmalıdır.` },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Kayıt işlemi sırasında bir hata oluştu.' },
            { status: 500 }
        );
    }
}
