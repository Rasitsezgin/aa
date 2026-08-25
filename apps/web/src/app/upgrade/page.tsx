'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function UpgradeRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const blocked = searchParams.get('blocked');
    const target = blocked ? `/dashboard/upgrade?blocked=${encodeURIComponent(blocked)}` : '/dashboard/upgrade';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );
}

export default function UpgradeRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <UpgradeRedirectContent />
    </Suspense>
  );
}
