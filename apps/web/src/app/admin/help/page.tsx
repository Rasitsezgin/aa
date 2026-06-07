import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import HelpAdminContent from '@/components/admin/HelpAdminContent';

export const dynamic = 'force-dynamic';

export default async function AdminHelpPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect('/login');
  }

  return <HelpAdminContent />;
}
