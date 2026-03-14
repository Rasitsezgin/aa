// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

// Mock tenant validation for build - in production this would check DB
function validateTenant(subdomain: string) {
    // In production, this would query database
    // For now, accept any subdomain
    return {
        id: '1',
        name: subdomain.charAt(0).toUpperCase() + subdomain.slice(1),
        plan: 'professional'
    }
}

// This layout handles requests for specific subdomains (tenants)
export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ site: string }>;
}) {
    const { site } = await params;
    const subdomain = decodeURIComponent(site);

    // In production, this would validate against database
    const tenant = validateTenant(subdomain);

    // You might want to pass tenant data via React Context or just rely on server components fetching it
    return (
        <div className="tenant-layout">
            {/* We can inject tenant-specific theme here */}
            {children}
        </div>
    );
}
