'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, Tag, Lock } from 'lucide-react';
import { ShopLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; slug: string; price: string; mrp: string; images: { url: string }[]; stock: number };
  variant: { id: string; name: string; price: string; stock: number } | null;
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    } catch {}
    setUpdating(null);
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await api.delete(`/cart/items/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {}
    setUpdating(null);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await api.post('/cart/coupon', { code: couponCode.toUpperCase() });
      setCouponMessage('Coupon applied!');
    } catch (err: any) {
      setCouponMessage(err.response?.data?.error || 'Invalid coupon');
    }
    setTimeout(() => setCouponMessage(''), 3000);
  };

  if (!isAuthenticated && !loading) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-secondary-300" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-3xl">Your cart</h1>
          <p className="mb-8 mt-2 text-muted">Please log in to view your cart.</p>
          <Link href="/login" className="btn-primary btn-lg">Log in to continue</Link>
        </div>
      </ShopLayout>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  const FREE_SHIPPING_FROM = 499;
  const SHIPPING_FEE = 49;
  const freeShipping = subtotal >= FREE_SHIPPING_FROM;
  const shipping = freeShipping ? 0 : SHIPPING_FEE;
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_FROM) * 100));

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl sm:text-4xl">Your cart</h1>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand" />
          </div>
        ) : items.length === 0 ? (
          <div className="card rounded-3xl px-6 py-20 text-center">
            <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-secondary-300" strokeWidth={1.5} aria-hidden="true" />
            <p className="font-display text-2xl">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted">Find something you like and it will show up here.</p>
            <Link href="/products" className="btn-primary btn-lg mt-8 inline-flex">Continue shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map(item => {
                const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
                const stock = item.variant ? item.variant.stock : item.product.stock;
                return (
                  <div key={item.id} className="card flex gap-4 p-4">
                    <Link href={`/products/${item.product.slug}`} className="shrink-0">
                      <div className="aspect-[4/5] w-20 overflow-hidden rounded-xl bg-secondary-100 sm:w-24">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0].url} alt={item.product.name} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ShoppingBag className="h-8 w-8 text-secondary-300" aria-hidden="true" /></div>
                        )}
                      </div>
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/products/${item.product.slug}`} className="line-clamp-1 font-medium hover:text-brand">
                            {item.product.name}
                          </Link>
                          {item.variant && <p className="mt-0.5 text-sm text-muted">{item.variant.name}</p>}
                          <p className="mt-1 text-sm tabular-nums text-muted">{formatPrice(price)} each</p>
                        </div>
                        <p className="price shrink-0 text-lg">{formatPrice(price * item.quantity)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="inline-flex items-center rounded-lg border border-secondary-300 bg-surface">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updating === item.id} aria-label={`Decrease quantity of ${item.product.name}`} className="flex h-11 w-11 items-center justify-center rounded-l-lg hover:bg-secondary-100 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                          <span className="w-9 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= stock || updating === item.id} aria-label={`Increase quantity of ${item.product.name}`} className="flex h-11 w-11 items-center justify-center rounded-r-lg hover:bg-secondary-100 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} disabled={updating === item.id} className="flex min-h-[44px] items-center gap-1.5 px-2 text-sm text-muted hover:text-red-700">
                          <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div>
              <div className="card sticky top-24 rounded-2xl p-6">
                <h2 className="text-2xl">Order summary</h2>

                {/* Free-shipping progress */}
                <div className="mt-5 rounded-xl bg-secondary-100 p-4">
                  <p className="text-sm font-medium">
                    {freeShipping
                      ? 'You have free shipping on this order.'
                      : `You’re ${formatPrice(FREE_SHIPPING_FROM - subtotal)} away from free shipping.`}
                  </p>
                  <div
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary-200"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={shippingProgress}
                    aria-label="Progress towards free shipping"
                  >
                    <div className="h-full rounded-full bg-success transition-[width] duration-300" style={{ width: `${shippingProgress}%` }} />
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Shipping</span>
                    <span className="font-medium tabular-nums">{freeShipping ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="price text-2xl">{formatPrice(subtotal + shipping)}</span>
                </div>

                {/* Coupon */}
                <div className="mt-5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" aria-hidden="true" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className="input pl-9 uppercase"
                      />
                    </div>
                    <button onClick={applyCoupon} className="btn-outline btn-sm">Apply</button>
                  </div>
                  {couponMessage && <p role="status" className={`mt-2 text-xs ${couponMessage.includes('Invalid') ? 'text-red-700' : 'text-success'}`}>{couponMessage}</p>}
                </div>

                <button className="btn-cta btn-lg mt-6 w-full">
                  Proceed to Checkout
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout
                </p>
                <Link href="/products" className="mt-2 flex min-h-[44px] items-center justify-center text-sm font-semibold text-brand hover:underline">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
