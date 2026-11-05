'use client';

import { useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { useAuthStore } from '@/stores/auth.store';

export function ShopLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
