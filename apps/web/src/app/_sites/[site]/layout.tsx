// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

// This layout handles requests for specific subdomains (tenants)
export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ site: string }>;
}) {
    await params;

    // You might want to pass tenant data via React Context or just rely on server components fetching it
    return (
        <div className="tenant-layout">
            {/* We can inject tenant-specific theme here */}
            {children}
        </div>
    );
}
