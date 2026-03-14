import NextAuth from "next-auth"
import { prisma } from "@pazaryonetimi/database"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Lazy loading of auth settings - only fetch when actually needed
let cachedSettings: any = null;
let settingsFetched = false;

async function getAuthSettings() {
    // Return cached settings if already fetched
    if (settingsFetched) {
        return cachedSettings;
    }

    try {
        const settings = await prisma.tenantSettings.findFirst({
            select: {
                config: true,
            }
        });
        const config = (settings?.config as Record<string, any>) || {};
        cachedSettings = {
            google_id: config.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
            google_secret: config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "",
            facebook_id: config.facebookAppId || process.env.FACEBOOK_CLIENT_ID || "",
            facebook_secret: config.facebookAppSecret || process.env.FACEBOOK_CLIENT_SECRET || "",
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

export const { handlers, signIn, signOut, auth } = NextAuth(async (req) => {
    const dynamicSettings = await getAuthSettings();

    return {
        // JWT strategy - no adapter needed (Credentials-only + manual OAuth handling)
        providers: [
            // Google OAuth - only register if credentials exist
            ...(dynamicSettings.google_id && dynamicSettings.google_id !== ""
                ? [
                    Google({
                        clientId: dynamicSettings.google_id,
                        clientSecret: dynamicSettings.google_secret,
                    }),
                ]
                : []),
            // Facebook OAuth - only register if credentials exist
            ...(dynamicSettings.facebook_id && dynamicSettings.facebook_id !== ""
                ? [
                    Facebook({
                        clientId: dynamicSettings.facebook_id,
                        clientSecret: dynamicSettings.facebook_secret,
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
                        // Try real database lookup first
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
                                // Log successful login
                                await prisma.activityLog.create({
                                    data: {
                                        tenantId: user.tenantId,
                                        userId: user.id,
                                        action: 'LOGIN',
                                        resource: 'user',
                                        resourceId: user.id,
                                        details: { method: 'credentials', ip: 'server' },
                                    },
                                }).catch(() => { }); // Don't block login on log failure

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
                    } catch (dbError) {
                        console.error("Database authentication error:", dbError);
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
            async session({ session, token }: { session: any; token: any }) {
                if (session.user && token?.sub) {
                    session.user.id = token.sub;
                    (session.user as any).type = token.type;
                    (session.user as any).tenantId = token.tenantId;
                    (session.user as any).isOnboarded = token.isOnboarded;
                }
                return session;
            },
            async jwt({ token, user }: { token: any; user: any }) {
                if (user) {
                    token.sub = user.id;
                    token.type = (user as any).type;
                    token.tenantId = (user as any).tenantId;
                    token.isOnboarded = (user as any).isOnboarded;
                }
                return token;
            },
            async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
                // Redirect to dashboard after login
                if (url.startsWith('/')) return `${baseUrl}${url}`;
                if (url.startsWith(baseUrl)) return url;
                return `${baseUrl}/dashboard`;
            },
        },
        session: { strategy: "jwt" },
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
        trustHost: true,
    } as any
})
