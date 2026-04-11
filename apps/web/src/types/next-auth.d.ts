import { UserType } from "@/lib/prisma";
import NextAuth, { DefaultSession } from "next-auth";

// Convert Prisma Enum to String or import Enum from prisma client
// But prisma client is in packages/database. 
// We can import UserType from "@/lib/prisma" if it exports enums (usually does via PrismaClient export).
// But standard pattern:

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string;
            type: UserType; // System Role (ADMIN, USER)
            roleId?: string; // Custom Role ID
            // We can also include expanded role permissions here if needed
        } & DefaultSession["user"]
    }

    interface User {
        id: string;
        type: UserType;
        roleId?: string;
    }
}
