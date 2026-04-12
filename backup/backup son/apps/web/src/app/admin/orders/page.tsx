'use client';

import AdminOrderManagement from '@/components/orders/AdminOrderManagement';

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto">
        <AdminOrderManagement />
      </div>
    </div>
  );
}
