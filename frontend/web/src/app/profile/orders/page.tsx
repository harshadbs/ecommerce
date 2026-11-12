'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  total: string;
  orderStatus: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: string }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders?limit=20')
      .then(res => setOrders(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: string) => `₹${Number(price).toLocaleString('en-IN')}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6">My Orders</h1>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No orders yet</p>
          <Link href="/products" className="btn-primary btn-sm mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-medium">#{order.orderNumber}</p>
                  <p className="text-xs text-secondary-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.orderStatus] || 'bg-secondary-100 text-secondary-800'}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="text-sm text-secondary-600">
                {order.items.slice(0, 2).map(item => (
                  <p key={item.id}>{item.name} × {item.quantity}</p>
                ))}
                {order.items.length > 2 && <p className="text-secondary-400">+{order.items.length - 2} more items</p>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
