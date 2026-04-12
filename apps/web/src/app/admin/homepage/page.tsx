import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function HomepageAdminPage() {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user has admin privileges (you might want to add a role check here)
    // For now, we'll assume any authenticated user can access admin features
    // In production, you should check user.role === 'admin' or similar

    // Import the client component only after authentication check
    const HomepageAdminClient = (await import("./HomepageAdminClient")).default;

    return <HomepageAdminClient />;
}
