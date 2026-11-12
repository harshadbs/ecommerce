'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/categories', label: 'Categories' },
];

const iconButton =
  'flex h-11 w-11 items-center justify-center rounded-lg text-secondary-700 transition-colors hover:bg-secondary-100';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Shrink the bar once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile panel on navigation and lock page scroll while it is open
  useEffect(() => setMobileMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* Trust strip */}
      <div className="bg-brand text-brand-fg">
        <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide sm:px-6 lg:px-8">
          Free shipping over ₹499 <span aria-hidden="true">·</span> 7-day returns{' '}
          <span aria-hidden="true">·</span> Secure checkout
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-2 transition-[height] duration-200 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 ${
              scrolled ? 'h-14' : 'h-[72px]'
            }`}
          >
            {/* Left: menu button (mobile) + logo */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`${iconButton} -ml-2 md:hidden`}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="whitespace-nowrap font-display text-2xl font-semibold tracking-tight text-brand">
                E-Store
              </Link>
            </div>

            {/* Centre: primary nav */}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`border-b-2 py-1 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'border-brand text-ink'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: search, cart, account */}
            <div className="flex items-center justify-end gap-1">
              <Link href="/products" className={iconButton} aria-label="Search products">
                <Search className="h-5 w-5" />
              </Link>

              {isAuthenticated && (
                <Link href="/profile/wishlist" className={`${iconButton} hidden sm:flex`} aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              )}

              <Link href="/cart" className={iconButton} aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-11 items-center gap-2 rounded-lg px-2 text-secondary-700 hover:bg-secondary-100"
                    aria-label="Account menu"
                    aria-expanded={userMenuOpen}
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden text-sm sm:inline">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-52 animate-fade-up rounded-xl border border-line bg-surface py-2 shadow-soft">
                        <Link href="/profile" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                        <Link href="/profile/orders" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                        <Link href="/profile/wishlist" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                        <hr className="my-1" />
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="btn-outline btn-sm ml-1">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: full-screen slide-in panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-slide-in-left flex-col bg-canvas md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex h-[72px] items-center justify-between border-b border-line px-4">
            <span className="font-display text-2xl font-semibold text-brand">E-Store</span>
            <button onClick={() => setMobileMenuOpen(false)} className={iconButton} aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[56px] items-center border-b border-line font-display text-2xl text-ink"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 space-y-1">
              {(isAuthenticated
                ? [
                    { href: '/profile', label: 'My Profile' },
                    { href: '/profile/orders', label: 'My Orders' },
                    { href: '/profile/wishlist', label: 'Wishlist' },
                    { href: '/cart', label: 'Cart' },
                  ]
                : [
                    { href: '/login', label: 'Login' },
                    { href: '/register', label: 'Create account' },
                  ]
              ).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[48px] items-center text-base text-secondary-700"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex min-h-[48px] w-full items-center gap-2 text-left text-base text-red-700"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
