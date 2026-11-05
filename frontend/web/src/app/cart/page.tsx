'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingCart, Tag } from 'lucide-react';
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
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Cart</h1>
          <p className="text-secondary-500 mb-6">Please login to view your cart</p>
          <Link href="/login" className="btn-primary btn-md">Login to Continue</Link>
        </div>
      </ShopLayout>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const formatPrice = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-secondary-500">Your cart is empty</p>
            <Link href="/products" className="btn-primary btn-md mt-4 inline-flex">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
                const stock = item.variant ? item.variant.stock : item.product.stock;
                return (
                  <div key={item.id} className="card p-4 flex gap-4">
                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="h-8 w-8 text-gray-300" /></div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-primary-600 line-clamp-1">
                        {item.product.name}
                      </Link>
                      {item.variant && <p className="text-xs text-secondary-500 mt-0.5">{item.variant.name}</p>}
                      <p className="font-bold mt-1">{formatPrice(price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border rounded-lg">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updating === item.id} className="p-1.5 hover:bg-gray-50"><Minus className="h-3 w-3" /></button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= stock || updating === item.id} className="p-1.5 hover:bg-gray-50"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeItem(item.id)} disabled={updating === item.id} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div>
              <div className="card p-6 sticky top-20">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Shipping</span>
                    <span className="text-green-600 font-medium">{subtotal >= 499 ? 'FREE' : '₹49'}</span>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(subtotal + (subtotal >= 499 ? 0 : 49))}</span>
                </div>

                {/* Coupon */}
                <div className="mt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Coupon code"
                        className="input pl-9 text-sm uppercase"
                      />
                    </div>
                    <button onClick={applyCoupon} className="btn-outline btn-sm">Apply</button>
                  </div>
                  {couponMessage && <p className={`text-xs mt-1 ${couponMessage.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>{couponMessage}</p>}
                </div>

                <button className="btn-primary btn-lg w-full mt-6">
                  Proceed to Checkout
                </button>
                <Link href="/products" className="block text-center text-sm text-primary-600 mt-3 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
