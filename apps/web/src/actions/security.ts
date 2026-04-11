'use server'

import { prisma } from "@/lib/prisma";
// import { authenticator } from "otplib";
import { auth } from "@/auth";

export async function generateTwoFactorSecret() {
    return { error: "2FA temporarily disabled due to system maintenance." };
    /*
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
        session.user.email || 'User',
        'PazarYonetimi',
        secret
    );

    await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorSecret: secret }
    });

    return { secret, otpauth };
    */
}

export async function verifyTwoFactor(token: string) {
    return { error: "2FA temporarily disabled." };
    /*
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.twoFactorSecret) return { error: "Setup failed. Please regenerate." };

    const isValid = authenticator.check(token, user.twoFactorSecret);

    if (isValid) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { twoFactorEnabled: true }
        });
        return { success: true };
    } else {
        return { success: false, error: "Invalid code" };
    }
    */
}

export async function disableTwoFactor() {
    return { success: true };
    /*
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    });

    return { success: true };
    */
}
