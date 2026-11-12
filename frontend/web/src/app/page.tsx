'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, RotateCcw, BadgePercent } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import { ProductCard, type ProductCardData } from '@/components/ProductCard';
import api, { assetUrl } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const benefits = [
  { icon: Truck, label: 'Free shipping', desc: 'On orders above ₹499' },
  { icon: ShieldCheck, label: 'Secure payment', desc: '100% protected checkout' },
  { icon: RotateCcw, label: 'Easy returns', desc: '7-day return policy' },
  { icon: BadgePercent, label: 'Best prices', desc: 'Guaranteed lowest' },
];

const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardData[]>([]);
  const [newArrival, setNewArrival] = useState<ProductCardData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8').then(res => setFeaturedProducts(res.data.data || [])).catch(() => {});
    api.get('/products?sort=newest&limit=1').then(res => setNewArrival(res.data.data?.[0] || null)).catch(() => {});
    api.get('/categories?parent_id=null').then(res => setCategories(res.data.data.categories || [])).catch(() => {});
  }, []);

  return (
    <ShopLayout>
      {/* Hero: asymmetric bento */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Main tile (60%) */}
          <div className="relative flex min-h-[380px] animate-fade-up flex-col justify-end overflow-hidden rounded-3xl border border-line bg-secondary-100 p-8 sm:p-12 lg:col-span-3 lg:min-h-[520px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cta/15 via-transparent to-transparent"
            />
            <div className="relative max-w-xl">
              <p className="eyebrow">New season edit</p>
              <h1 className="mt-4 text-[40px] leading-[1.05] sm:text-6xl lg:text-7xl">
                Everyday tech, thoughtfully chosen.
              </h1>
              <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
                Discover deals on electronics, fashion and more. Free shipping on orders above ₹499.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/products?featured=true" className="btn-cta btn-lg">
                  Shop featured
                </Link>
                <Link href="/categories" className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-brand hover:underline">
                  Browse categories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stacked tiles (40%) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {newArrival ? (
              <Link
                href={`/products/${newArrival.slug}`}
                className="card card-hover group flex animate-fade-up items-center gap-5 overflow-hidden rounded-3xl p-5"
              >
                <div className="aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-2xl bg-secondary-100 sm:w-36">
                  {newArrival.images?.[0] ? (
                    <img
                      src={assetUrl(newArrival.images[0].url)}
                      alt={newArrival.images[0].alt || newArrival.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-secondary-300" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">New arrival</p>
                  <h2 className="mt-2 line-clamp-2 text-2xl">{newArrival.name}</h2>
                  <p className="price mt-2 text-lg">{formatPrice(newArrival.price)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    View product <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/products"
                className="card card-hover flex animate-fade-up flex-col justify-end rounded-3xl p-8"
              >
                <p className="eyebrow">The full range</p>
                <h2 className="mt-2 text-3xl">Shop all products</h2>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Start browsing <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}

            <div className="flex animate-fade-up flex-col justify-end rounded-3xl bg-brand p-8 text-brand-fg">
              <RotateCcw className="h-8 w-8" aria-hidden="true" />
              <h2 className="mt-6 text-3xl">Free 7-day returns</h2>
              <p className="mt-2 text-sm opacity-80">Changed your mind? Send it back within a week.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8" aria-label="Categories">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex min-h-[56px] shrink-0 items-center gap-3 rounded-full border border-line bg-surface py-2 pl-2 pr-6 text-sm font-medium transition-colors hover:border-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
                  <ShoppingBag className="h-4 w-4 text-secondary-400" aria-hidden="true" />
                </span>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl">Featured picks</h2>
            <Link href="/products?featured=true" className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Why shop with us */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-3xl sm:text-4xl">Why shop with us</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {benefits.map(b => (
            <div key={b.label} className="card rounded-2xl p-6">
              <b.icon className="h-6 w-6 text-brand" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-5 font-medium">{b.label}</p>
              <p className="mt-1 text-sm text-muted">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </ShopLayout>
  );
}
