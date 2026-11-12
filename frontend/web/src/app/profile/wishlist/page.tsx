'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import api, { assetUrl } from '@/lib/api';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    mrp: string;
    images: { url: string }[];
    stock: number;
  };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then(res => setItems(res.data.data.items || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (id: string) => {
    await api.delete(`/wishlist/${id}`);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const addToCart = async (productId: string) => {
    try {
      await api.post('/cart/items', { productId, quantity: 1 });
      alert('Added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">My Wishlist</h1>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <Heart className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">Your wishlist is empty</p>
          <Link href="/products" className="btn-primary btn-sm mt-4 inline-flex">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="card overflow-hidden">
              <Link href={`/products/${item.product.slug}`} className="block aspect-square bg-secondary-100">
                {item.product.images?.[0] ? (
                  <img src={assetUrl(item.product.images[0].url)} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Heart className="h-12 w-12 text-secondary-300" /></div>
                )}
              </Link>
              <div className="p-3">
                <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-primary-600 line-clamp-2">{item.product.name}</Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold">{formatPrice(item.product.price)}</span>
                  {Number(item.product.mrp) > Number(item.product.price) && (
                    <span className="text-xs text-secondary-400 line-through">{formatPrice(item.product.mrp)}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => addToCart(item.product.id)} disabled={item.product.stock === 0} className="btn-cta btn-sm flex-1">
                    <ShoppingCart className="h-3 w-3 mr-1" />{item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button onClick={() => removeFromWishlist(item.id)} className="btn-outline btn-sm text-red-700"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
