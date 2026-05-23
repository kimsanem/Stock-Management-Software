'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <Sidebar />
      <main className="p-4 md:p-8 pt-16 md:pt-8">{children}</main>
    </div>
  );
}
