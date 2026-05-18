'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { MainLayout } from '@/components/layout/MainLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!isMounted) {
    return null; // Prevent hydration mismatch by not rendering until mounted
  }

  if (!token) {
    return null; // Don't render dashboard content if no token
  }

  return <MainLayout>{children}</MainLayout>;
}
