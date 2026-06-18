import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/platform-admin";

export const dynamic = 'force-dynamic'

export default async function HomepageAdminPage() {
    const session = await auth();

    if (!session?.user?.id || !isPlatformAdmin(session.user as { type?: string; tenantId?: string | null })) {
        redirect("/unauthorized?from=admin");
    }

    const HomepageAdminClient = (await import("./HomepageAdminClient")).default;

    return <HomepageAdminClient />;
}
