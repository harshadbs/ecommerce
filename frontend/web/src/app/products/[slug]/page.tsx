'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, Minus, Plus, Star, ChevronLeft, Package } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
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

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-secondary-500 mb-6">
          <Link href="/products" className="hover:text-primary-600 flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" /> Products
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.id}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-secondary-700 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url}
                  alt={product.images[selectedImage]?.alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${idx === selectedImage ? 'border-primary-500' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-primary-600 font-medium">{product.category.name}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mt-1">{product.name}</h1>

            {product.shortDesc && (
              <p className="text-secondary-600 mt-2">{product.shortDesc}</p>
            )}

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-secondary-400 line-through">{formatPrice(Number(product.mrp))}</span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{discount}% off</span>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                      className={`px-3 py-2 rounded-lg border text-sm ${selectedVariant?.id === v.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'} ${v.stock === 0 ? 'opacity-50 line-through' : ''}`}
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
              <h3 className="text-sm font-medium mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(currentStock, q + 1))} className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-gray-50">
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-secondary-500">{currentStock} available</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={addToCart}
                disabled={currentStock === 0 || addingToCart}
                className="btn-primary btn-lg flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {currentStock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={addToWishlist} className="btn-outline btn-lg">
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {cartMessage && (
              <p className={`mt-3 text-sm font-medium ${cartMessage.includes('Failed') || cartMessage.includes('Already') ? 'text-red-600' : 'text-green-600'}`}>
                {cartMessage}
              </p>
            )}

            {/* Description */}
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-secondary-600 whitespace-pre-line">{product.description}</p>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-secondary-400 mt-4">SKU: {product.sku}</p>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
