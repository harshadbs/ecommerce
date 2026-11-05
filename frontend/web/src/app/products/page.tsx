'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
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

export default function ProductsPage() {
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

  const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;
  const getDiscount = (price: string, mrp: string) => Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100);

  const hasActiveFilters = search || category || minPrice || maxPrice || featured;

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-secondary-500 mt-1">{pagination.total} product{pagination.total !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden btn-outline btn-sm">
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search..."
                    className="input pl-9 text-sm"
                  />
                </div>
              </form>

              {/* Categories */}
              <div>
                <h3 className="font-medium text-sm mb-2">Category</h3>
                <div className="space-y-1">
                  <button onClick={() => updateParams({ category: '' })} className={`block text-sm w-full text-left px-2 py-1 rounded ${!category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-600 hover:bg-gray-50'}`}>
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => updateParams({ category: cat.id })} className={`block text-sm w-full text-left px-2 py-1 rounded ${category === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-secondary-600 hover:bg-gray-50'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-sm mb-2">Price Range</h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPriceInput} onChange={e => setMinPriceInput(e.target.value)} className="input text-sm w-20" />
                  <input type="number" placeholder="Max" value={maxPriceInput} onChange={e => setMaxPriceInput(e.target.value)} className="input text-sm w-20" />
                </div>
                <button onClick={applyPriceFilter} className="btn-primary btn-sm mt-2 w-full">Apply</button>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-medium text-sm mb-2">Sort By</h3>
                <select value={sort} onChange={e => updateParams({ sort: e.target.value })} className="input text-sm">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-600 hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-secondary-500">No products found</p>
                <p className="text-sm text-secondary-400 mt-1">Try adjusting your filters</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-primary btn-sm mt-4">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(product => (
                    <Link key={product.id} href={`/products/${product.slug}`} className="card group overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-12 w-12 text-gray-300" /></div>
                        )}
                        {Number(product.mrp) > Number(product.price) && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {getDiscount(product.price, product.mrp)}% OFF
                          </span>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-red-600 text-xs font-bold px-3 py-1 rounded">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-secondary-500">{product.category?.name}</p>
                        <h3 className="font-medium text-sm mt-0.5 line-clamp-2 group-hover:text-primary-600">{product.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-bold">{formatPrice(product.price)}</span>
                          {Number(product.mrp) > Number(product.price) && (
                            <span className="text-xs text-secondary-400 line-through">{formatPrice(product.mrp)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Link href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) }).toString()}`} className="btn-outline btn-sm">
                        Previous
                      </Link>
                    )}
                    <span className="text-sm text-secondary-600">Page {page} of {pagination.totalPages}</span>
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
    </ShopLayout>
  );
}
