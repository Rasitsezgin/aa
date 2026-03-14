import DashboardClient from "./dashboard-client";

// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    return <DashboardClient config={null} />;
}
