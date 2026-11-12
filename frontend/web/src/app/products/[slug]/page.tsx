'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Heart, Minus, Plus, Package, Check, AlertTriangle, XCircle } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  size: string | null;
  color: string | null;
  price: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  price: string;
  mrp: string;
  sku: string | null;
  stock: number;
  lowStockThreshold?: number;
  status: string;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
  variants: ProductVariant[];
  _count: { reviews: number };
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/products/slug/${slug}`)
      .then(res => {
        setProduct(res.data.data.product);
        if (res.data.data.product.variants?.length > 0) {
          setSelectedVariant(res.data.data.product.variants[0]);
        }
      })
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      </ShopLayout>
    );
  }

  if (!product) return null;

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const discount = Math.round(((Number(product.mrp) - currentPrice) / Number(product.mrp)) * 100);
  const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', {
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      });
      setCartMessage('Added to cart!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err: any) {
      setCartMessage(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    try {
      await api.post('/wishlist', { productId: product.id });
      setCartMessage('Added to wishlist!');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err: any) {
      setCartMessage(err.response?.data?.error || 'Already in wishlist');
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  const outOfStock = currentStock === 0;
  const lowStock = !outOfStock && currentStock <= (product.lowStockThreshold ?? 0);
  const messageIsError = cartMessage.includes('Failed') || cartMessage.includes('Already');
  const addLabel = outOfStock ? 'Out of stock' : addingToCart ? 'Adding…' : 'Add to Cart';

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/products?category=${product.category.id}`} className="hover:text-brand">
            {product.category.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink" aria-current="page">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Media (60%) */}
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-4 lg:flex-row-reverse">
              <div className="aspect-[4/5] flex-1 overflow-hidden rounded-3xl border border-line bg-secondary-100">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.images[selectedImage]?.alt || product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-24 w-24 text-secondary-300" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      aria-label={`Show image ${idx + 1}`}
                      aria-pressed={idx === selectedImage}
                      className={`aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-secondary-100 lg:w-full ${idx === selectedImage ? 'border-brand' : 'border-transparent'}`}
                    >
                      <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buy box (40%), sticky on desktop */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <p className="eyebrow">{product.category.name}</p>
              <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>

              {product._count?.reviews > 0 && (
                <p className="mt-2 text-sm text-muted">
                  {product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}
                </p>
              )}

              {product.shortDesc && <p className="mt-3 text-muted">{product.shortDesc}</p>}

              {/* Price */}
              <div className="mt-5 flex flex-wrap items-baseline gap-3">
                <span className="price text-3xl">{formatPrice(currentPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg tabular-nums text-secondary-400 line-through">
                      <span className="sr-only">MRP </span>
                      {formatPrice(Number(product.mrp))}
                    </span>
                    <span className="badge bg-ink text-canvas">{discount}% off</span>
                  </>
                )}
              </div>

              {/* Availability: icon + text, never colour alone */}
              <p className="mt-4 flex items-center gap-2 text-sm font-medium">
                {outOfStock ? (
                  <><XCircle className="h-4 w-4 text-red-700" aria-hidden="true" /> Out of stock</>
                ) : lowStock ? (
                  <><AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" /> Low stock: only {currentStock} left</>
                ) : (
                  <><Check className="h-4 w-4 text-success" aria-hidden="true" /> In stock</>
                )}
              </p>

              {/* Variants */}
              {product.variants.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold">
                    Variant{selectedVariant ? <span className="font-normal text-muted">: {selectedVariant.name}</span> : null}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        aria-pressed={selectedVariant?.id === v.id}
                        className={`min-h-[44px] rounded-lg border px-4 text-sm ${selectedVariant?.id === v.id ? 'border-brand bg-primary-50 font-semibold text-brand ring-1 ring-brand' : 'border-secondary-300 bg-surface hover:border-secondary-400'} ${v.stock === 0 ? 'opacity-50 line-through' : ''}`}
                        disabled={v.stock === 0}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold">Quantity</h3>
                <div className="inline-flex items-center rounded-lg border border-secondary-300 bg-surface">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-11 w-11 items-center justify-center rounded-l-lg hover:bg-secondary-100 disabled:opacity-40">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} disabled={quantity >= currentStock} aria-label="Increase quantity" className="flex h-11 w-11 items-center justify-center rounded-r-lg hover:bg-secondary-100 disabled:opacity-40">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button onClick={addToCart} disabled={outOfStock || addingToCart} className="btn-cta btn-lg flex-1">
                  <ShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />
                  {addLabel}
                </button>
                <button onClick={addToWishlist} className="btn-outline btn-lg" aria-label="Add to wishlist">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {cartMessage && (
                <p role="status" className={`mt-3 text-sm font-medium ${messageIsError ? 'text-red-700' : 'text-success'}`}>
                  {cartMessage}
                </p>
              )}

              <p className="mt-4 text-sm text-muted">
                Free delivery over ₹499 <span aria-hidden="true">·</span> 7-day returns{' '}
                <span aria-hidden="true">·</span> Secure payment
              </p>
            </div>
          </div>
        </div>

        {/* Below the fold */}
        <div className="mt-14 grid gap-10 border-t border-line pt-10 lg:grid-cols-5 lg:gap-12">
          <section className="lg:col-span-3">
            <h2 className="text-2xl sm:text-3xl">Description</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-secondary-700">{product.description}</p>
          </section>
          <section className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl">Details</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-muted">Category</dt>
                <dd className="font-medium">{product.category.name}</dd>
              </div>
              {product.sku && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>

      {/* Mobile: sticky add-to-cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-line bg-canvas/95 p-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{product.name}</p>
          <p className="price text-lg">{formatPrice(currentPrice)}</p>
        </div>
        <button onClick={addToCart} disabled={outOfStock || addingToCart} className="btn-cta btn-lg ml-auto shrink-0">
          {addLabel}
        </button>
      </div>
    </ShopLayout>
  );
}
