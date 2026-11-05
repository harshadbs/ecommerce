'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, Heart, Settings } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth.store';

const profileLinks = [
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/profile/orders', label: 'My Orders', icon: Package },
  { href: '/profile/addresses', label: 'Addresses', icon: MapPin },
  { href: '/profile/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <ShopLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="card p-4">
              <div className="mb-4 pb-4 border-b">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {profileLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === link.href ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-600 hover:bg-gray-50'}`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </ShopLayout>
  );
}
