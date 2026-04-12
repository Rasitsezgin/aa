// Force dynamic rendering to avoid build-time DB calls
export const dynamic = 'force-dynamic'

export default async function TenantHomePage({
    params,
}: {
    params: Promise<{ site: string }>;
}) {
    const { site } = await params;
    const subdomain = decodeURIComponent(site);
    const tenantName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-black">
            <h1 className="text-4xl font-bold mb-4">{tenantName}</h1>
            <p className="text-slate-500">Welcome to the tenant dashboard for {subdomain}.</p>

            {/* This is just a placeholder. 
          Ideally, we would reuse the Dashboard components here if this IS the dashboard, 
          or a separate store-front if this is their public site. 
          
          Based on the plan, subdomains are for the Tenant Dashboard/App.
      */}
        </div>
    );
}
