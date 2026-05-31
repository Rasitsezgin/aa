import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PricingContent from '../../../components/admin/PricingContent';
import { getPricingCatalog } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function AdminPricingPage() {
    const session = await auth();
    if (!session?.user?.id) {
        return redirect('/login');
    }

    const catalog = await getPricingCatalog();

    return <PricingContent initialCatalog={catalog} />;
}
