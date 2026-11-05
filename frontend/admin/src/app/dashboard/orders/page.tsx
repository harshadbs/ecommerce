'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Eye, X } from 'lucide-react';
import api from '@/lib/api';
import { Badge, Modal } from '@/components/ui';

interface Order {
  id: string;
  orderNumber: string;
  user: { id: string; name: string; email: string; phone: string | null };
  address: { city: string; state: string };
  subtotal: string;
  total: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: string; total: string }[];
  statusHistory: { status: string; note: string | null; createdAt: string }[];
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  PACKED: 'info',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  RETURNED: 'danger',
  REFUNDED: 'default',
};

const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await api.get(`/orders?${params.toString()}`);
      return res.data;
    },
  });

  const orders: Order[] = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 0 };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note: string }) => {
      return api.patch(`/orders/${id}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
    },
  });

  const formatPrice = (price: string | number) => `₹${Number(price).toLocaleString('en-IN')}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">{pagination.total} order{pagination.total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search order #, customer..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="input flex-1 min-w-[200px]"
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-auto">
            <option value="">All Status</option>
            {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <ShoppingCart className="h-12 w-12 mb-3 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.orderStatus] || 'default'}>
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setSelectedOrder(order); setNewStatus(order.orderStatus); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600" title="View / Update">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline btn-sm">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="btn-outline btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.orderNumber || ''}`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium">{selectedOrder.user.name}</p>
                <p className="text-gray-600">{selectedOrder.user.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{selectedOrder.address.city}, {selectedOrder.address.state}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="font-medium mb-2">Items</p>
              <div className="border rounded-md divide-y">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between px-3 py-2 text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2 text-sm font-bold bg-gray-50">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="border-t pt-4">
              <p className="font-medium mb-2">Update Order Status</p>
              <div className="flex gap-3">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input flex-1">
                  {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <input
                type="text"
                placeholder="Note (optional)"
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                className="input mt-2"
              />
              <button
                onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus, note: statusNote })}
                disabled={updateStatusMutation.isPending || newStatus === selectedOrder.orderStatus}
                className="btn-primary btn-md mt-3"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory.length > 0 && (
              <div>
                <p className="font-medium mb-2">Status History</p>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Badge variant={statusColors[h.status] || 'default'}>{h.status}</Badge>
                      <span className="text-gray-500">{formatDate(h.createdAt)}</span>
                      {h.note && <span className="text-gray-600">— {h.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
