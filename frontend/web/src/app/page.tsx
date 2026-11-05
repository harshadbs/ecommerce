'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  category: { name: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=8').then(res => setFeaturedProducts(res.data.data || [])).catch(() => {});
    api.get('/categories?parent_id=null').then(res => setCategories(res.data.data.categories || [])).catch(() => {});
  }, []);

  const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;
  const getDiscount = (price: string, mrp: string) => Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);

  return (
    <ShopLayout>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Shop the Best Products Online</h1>
            <p className="mt-4 text-lg text-primary-100">Discover amazing deals on electronics, fashion, and more. Free shipping on orders above ₹499.</p>
            <div className="mt-8 flex gap-4">
              <Link href="/products" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                Shop Now
              </Link>
              <Link href="/categories" className="border border-white/50 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders ₹499+' },
              { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
              { icon: CreditCard, label: 'Easy Returns', desc: '7-day return policy' },
              { icon: ShoppingBag, label: 'Best Prices', desc: 'Guaranteed lowest' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <f.icon className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{f.label}</p>
                  <p className="text-xs text-secondary-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.id}`} className="group text-center">
                <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden mb-2">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                  )}
                </div>
                <p className="text-sm font-medium group-hover:text-primary-600 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products?featured=true" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <Link key={product.id} href={`/products/${product.slug}`} className="card group overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="h-12 w-12" />
                    </div>
                  )}
                  {Number(product.mrp) > Number(product.price) && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {getDiscount(product.price, product.mrp)}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-secondary-500">{product.category?.name}</p>
                  <h3 className="font-medium text-sm mt-0.5 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                    {Number(product.mrp) > Number(product.price) && (
                      <span className="text-xs text-secondary-400 line-through">{formatPrice(product.mrp)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ShopLayout>
  );
}
