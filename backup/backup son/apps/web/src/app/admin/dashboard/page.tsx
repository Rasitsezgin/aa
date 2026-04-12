import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

export default async function DashboardAdminPage() {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user has admin privileges
    // In production, you should check user.role === 'admin' or similar
    // For now, we'll assume any authenticated user can access admin features

    // Import the client component only after authentication check
    const DashboardAdminClient = (await import("./DashboardAdminClient")).default;

    return <DashboardAdminClient />;
}
