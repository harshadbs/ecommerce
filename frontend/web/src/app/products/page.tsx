'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShoppingBag, X, ChevronDown } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import { ProductCard } from '@/components/ProductCard';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  mrp: string;
  stock: number;
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  category: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// useSearchParams() needs a Suspense boundary, otherwise `next build` fails prerendering /products
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <ShopLayout>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
          </div>
        </ShopLayout>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Read params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const featured = searchParams.get('featured') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Local form state
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (featured) params.set('featured', featured);
    params.set('page', String(page));
    params.set('limit', '12');

    api.get(`/products?${params.toString()}`).then(res => {
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 0 });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [search, category, sort, minPrice, maxPrice, featured, page]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    params.delete('page'); // Reset page on filter change
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const applyPriceFilter = () => {
    updateParams({ min_price: minPriceInput, max_price: maxPriceInput });
  };

  const clearFilters = () => {
    router.push('/products');
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  const hasActiveFilters = search || category || minPrice || maxPrice || featured;
  const activeFilterCount = [search, category, minPrice || maxPrice, featured].filter(Boolean).length;

  const activeCategory = categories.find(c => c.id === category);
  const pageTitle = activeCategory?.name || (featured ? 'Featured' : search ? `Results for “${search}”` : 'All products');

  const sortSelect = (id: string) => (
    <select id={id} value={sort} onChange={e => updateParams({ sort: e.target.value })} className="input">
      <option value="newest">Newest first</option>
      <option value="price_asc">Price: low to high</option>
      <option value="price_desc">Price: high to low</option>
      <option value="name_asc">Name: A to Z</option>
      <option value="name_desc">Name: Z to A</option>
    </select>
  );

  const categoryButton = (id: string, label: string) => {
    const selected = category === id;
    return (
      <button
        key={id || 'all'}
        onClick={() => updateParams({ category: id })}
        aria-pressed={selected}
        className={`flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-sm ${
          selected ? 'bg-primary-50 font-semibold text-brand' : 'text-secondary-700 hover:bg-secondary-100'
        }`}
      >
        {label}
      </button>
    );
  };

  const accordionSummary =
    'flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden';

  // Shared by the desktop sidebar and the mobile bottom sheet
  const filters = (
    <div className="space-y-2">
      <form onSubmit={handleSearch} className="relative pb-2">
        <Search className="absolute left-3 top-[22px] h-4 w-4 -translate-y-1/2 text-secondary-400" aria-hidden="true" />
        <input
          type="search"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="input pl-9"
        />
      </form>

      <details open className="group border-t border-line pt-1">
        <summary className={accordionSummary}>
          Category <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-0.5 pb-3">
          {categoryButton('', 'All categories')}
          {categories.map(cat => categoryButton(cat.id, cat.name))}
        </div>
      </details>

      <details open className="group border-t border-line pt-1">
        <summary className={accordionSummary}>
          Price <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="pb-3">
          <div className="flex gap-2">
            <input type="number" inputMode="numeric" placeholder="Min ₹" aria-label="Minimum price" value={minPriceInput} onChange={e => setMinPriceInput(e.target.value)} className="input" />
            <input type="number" inputMode="numeric" placeholder="Max ₹" aria-label="Maximum price" value={maxPriceInput} onChange={e => setMaxPriceInput(e.target.value)} className="input" />
          </div>
          <button onClick={applyPriceFilter} className="btn-primary btn-sm mt-2 w-full">Apply price</button>
        </div>
      </details>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="flex min-h-[44px] items-center gap-1 border-t border-line pt-1 text-sm font-medium text-red-700 hover:underline">
          <X className="h-4 w-4" aria-hidden="true" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          {activeCategory ? (
            <>
              <Link href="/products" className="hover:text-brand">Shop</Link>
              <span aria-hidden="true">/</span>
              <span className="text-ink" aria-current="page">{activeCategory.name}</span>
            </>
          ) : (
            <span className="text-ink" aria-current="page">Shop</span>
          )}
        </nav>

        {/* Title row */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl">{pageTitle}</h1>
            <p className="mt-2 text-sm text-muted">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <label htmlFor="sort-desktop" className="text-sm text-muted">Sort by</label>
            <div className="w-52">{sortSelect('sort-desktop')}</div>
          </div>
        </div>

        <div className="mt-8 flex gap-10">
          {/* Desktop: sticky filter sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
            <div className="sticky top-24">{filters}</div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-secondary-300" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-display text-2xl">No products found</p>
                <p className="mt-2 text-sm text-muted">Try adjusting your filters.</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-primary btn-md mt-6">Clear filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    {page > 1 && (
                      <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) }).toString()}`} className="btn-outline btn-sm">
                        Previous
                      </Link>
                    )}
                    <span className="text-sm tabular-nums text-muted">Page {page} of {pagination.totalPages}</span>
                    {page < pagination.totalPages && (
                      <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) }).toString()}`} className="btn-outline btn-sm">
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: sticky Filter & Sort bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 p-3 backdrop-blur lg:hidden">
        <button onClick={() => setShowFilters(true)} className="btn-outline btn-md w-full" aria-haspopup="dialog">
          <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
          Filter &amp; Sort{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Mobile: bottom sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter and sort">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] animate-slide-up flex-col rounded-t-3xl bg-canvas">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-display text-xl">Filter &amp; Sort</p>
              <button onClick={() => setShowFilters(false)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-secondary-100" aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div>
                <label htmlFor="sort-mobile" className="mb-2 block text-sm font-semibold">Sort by</label>
                {sortSelect('sort-mobile')}
              </div>
              {filters}
            </div>
            <div className="border-t border-line p-4">
              <button onClick={() => setShowFilters(false)} className="btn-primary btn-lg w-full">
                Show {pagination.total} product{pagination.total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}
