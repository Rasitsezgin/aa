import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

type AuthProviderSettings = {
    google_id: string;
    google_secret: string;
    facebook_id: string;
    facebook_secret: string;
};

// Lazy loading of auth settings - only fetch when actually needed
let cachedSettings: AuthProviderSettings | null = null;
let settingsFetched = false;

async function getAuthSettings() {
    // Return cached settings if already fetched
    if (settingsFetched) {
        return cachedSettings;
    }

    try {
        // Fetch all auth-related system settings
        const settings = await prisma.systemSettings.findMany({
            where: {
                key: {
                    in: ['google_id', 'google_secret', 'facebook_id', 'facebook_secret']
                }
            }
        });

        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value as string;
            return acc;
        }, {} as Record<string, string>);

        cachedSettings = {
            google_id: settingsMap.google_id || process.env.GOOGLE_CLIENT_ID || "",
            google_secret: settingsMap.google_secret || process.env.GOOGLE_CLIENT_SECRET || "",
            facebook_id: settingsMap.facebook_id || process.env.FACEBOOK_CLIENT_ID || "",
            facebook_secret: settingsMap.facebook_secret || process.env.FACEBOOK_CLIENT_SECRET || "",
        };
    } catch (error) {
        console.warn("[NextAuth] Failed to load auth settings from database, using env vars:", error);
        cachedSettings = {
            google_id: process.env.GOOGLE_CLIENT_ID || "",
            google_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            facebook_id: process.env.FACEBOOK_CLIENT_ID || "",
            facebook_secret: process.env.FACEBOOK_CLIENT_SECRET || "",
        };
    }
    
    settingsFetched = true;
    return cachedSettings;
}

export const { handlers, signIn, signOut, auth } = NextAuth(async () => {
    const dynamicSettings = await getAuthSettings();

    return {
        adapter: PrismaAdapter(prisma),
        providers: [
            // Google OAuth - only register if credentials exist
            ...(dynamicSettings.google_id && dynamicSettings.google_id !== ""
                ? [
                    Google({
                        clientId: dynamicSettings.google_id,
                        clientSecret: dynamicSettings.google_secret,
                        allowDangerousEmailAccountLinking: true,
                    }),
                ]
                : []),
            // Facebook OAuth - only register if credentials exist
            ...(dynamicSettings.facebook_id && dynamicSettings.facebook_id !== ""
                ? [
                    Facebook({
                        clientId: dynamicSettings.facebook_id,
                        clientSecret: dynamicSettings.facebook_secret,
                        allowDangerousEmailAccountLinking: true,
                    }),
                ]
                : []),
            Credentials({
                name: "Credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" }
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) return null;

                    try {
                        // 1. Call real backend API for authentication and token procurement
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/auth/login`, {
                            method: 'POST',
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                            headers: { "Content-Type": "application/json" }
                        });

                        const data = await res.json();

                        if (res.ok && data.accessToken) {
                            // Log successful login (best effort)
                            try {
                                await prisma.activityLog.create({
                                    data: {
                                        tenantId: data.user.tenantId,
                                        userId: data.user.id,
                                        action: 'LOGIN',
                                        resource: 'user',
                                        resourceId: data.user.id,
                                        details: { method: 'backend_sync', ip: 'server' },
                                    },
                                });
                            } catch { }

                            return {
                                id: data.user.id,
                                email: data.user.email,
                                name: [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || data.user.email,
                                type: data.user.type,
                                tenantId: data.user.tenantId,
                                accessToken: data.accessToken,
                                isOnboarded: true, // Backend successful login implies some level of validity
                            };
                        }

                        // 2. Fallback to local prisma if backend is down (only for dev/emergency)
                        if (res.status >= 500 || !res.ok) {
                            console.warn("[NextAuth] Backend auth failed, falling back to local DB");
                            const user = await prisma.user.findFirst({
                                where: { email: credentials.email as string },
                                include: { tenant: true },
                            });

                            if (user && user.password) {
                                const isValid = await bcrypt.compare(
                                    credentials.password as string,
                                    user.password
                                );
                                if (isValid) {
                                    return {
                                        id: user.id,
                                        email: user.email,
                                        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
                                        type: user.type,
                                        tenantId: user.tenantId,
                                        isOnboarded: user.tenant?.isOnboarded ?? false,
                                        image: user.image,
                                    };
                                }
                            }
                        }
                    } catch (dbError) {
                        console.error("Authentication flow error:", dbError);
                    }

                    return null;
                }
            })
        ],
        pages: {
            signIn: "/login",
            error: "/login",
        },
        callbacks: {
            async signIn({ user, account, profile }) {
                if (account?.provider !== 'credentials') {
                    // Check if user has a tenantId, if not, assign default or create one
                    if (user.id && !(user as any).tenantId) {
                        const existingUser = await prisma.user.findUnique({
                            where: { id: user.id },
                            select: { tenantId: true }
                        });

                        if (!existingUser?.tenantId) {
                            // Find the first available tenant or create a default one
                            let tenant = await prisma.tenant.findFirst();
                            if (!tenant) {
                                tenant = await prisma.tenant.create({
                                    data: {
                                        name: 'Default Tenant',
                                        plan: 'FREE'
                                    }
                                });
                            }
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { tenantId: tenant.id }
                            });
                            (user as any).tenantId = tenant.id;
                        } else {
                            (user as any).tenantId = existingUser.tenantId;
                        }
                    }
                }
                return true;
            },
            async session({ session, token }: { session: any; token: any }) {
                if (session.user && token?.sub) {
                    session.user.id = token.sub;
                    (session.user as any).type = token.type;
                    (session.user as any).tenantId = token.tenantId;
                    (session.user as any).isOnboarded = token.isOnboarded;
                    (session.user as any).accessToken = token.accessToken;
                }
                
                // For OAuth users, if tenantId is missing in token, fetch it
                if (session.user && !(session.user as any).tenantId) {
                    const user = await prisma.user.findUnique({
                        where: { id: session.user.id },
                        select: { tenantId: true, type: true }
                    });
                    if (user) {
                        (session.user as any).tenantId = user.tenantId;
                        (session.user as any).type = user.type;
                    }
                }

                return session;
            },
            async jwt({ token, user, account }: { token: any; user: any; account: any }) {
                if (user) {
                    token.sub = user.id;
                    token.type = (user as any).type;
                    token.tenantId = (user as any).tenantId;
                    token.isOnboarded = (user as any).isOnboarded;
                    token.accessToken = (user as any).accessToken;
                }
                return token;
            },
            async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
                if (url.startsWith('/')) return `${baseUrl}${url}`;
                else if (new URL(url).origin === baseUrl) return url;
                return `${baseUrl}/dashboard`;
            },
        },
        session: { strategy: "jwt" },
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
        trustHost: true,
    } as any
})
