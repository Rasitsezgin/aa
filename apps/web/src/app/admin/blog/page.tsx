import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import BlogAdminContent from '@/components/admin/BlogAdminContent';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect('/login');
  }

  return <BlogAdminContent />;
}
