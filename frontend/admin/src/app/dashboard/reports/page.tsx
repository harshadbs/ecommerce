'use client';

import { useQuery } from '@tanstack/react-query';
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ReportsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/orders/stats');
      return res.data.data.stats;
    },
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      const res = await api.get('/admin/customers?limit=1');
      return res.data.pagination.total;
    },
  });

  const stats = statsData || { total: 0, pending: 0, processing: 0, delivered: 0, revenue: 0 };
  const totalCustomers = customersData || 0;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const statCards = [
    { name: 'Total Revenue', value: formatCurrency(stats.revenue), icon: IndianRupee, color: 'bg-green-500' },
    { name: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'Total Customers', value: totalCustomers, icon: Users, color: 'bg-purple-500' },
    { name: 'Pending Orders', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { name: 'Processing', value: stats.processing, icon: Package, color: 'bg-orange-500' },
    { name: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'bg-green-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Order Status Breakdown</h2>
        <div className="space-y-3">
          {[
            { label: 'Pending', count: stats.pending, color: 'bg-yellow-400' },
            { label: 'Processing / Shipped', count: stats.processing, color: 'bg-blue-400' },
            { label: 'Delivered', count: stats.delivered, color: 'bg-green-400' },
            { label: 'Cancelled / Returned', count: stats.total - stats.pending - stats.processing - stats.delivered, color: 'bg-red-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-700 flex-1">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.count}</span>
              <div className="w-32 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${stats.total ? (item.count / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue info */}
      <div className="card p-6 mt-4">
        <h2 className="text-lg font-semibold mb-2">Revenue Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Paid Revenue</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Order Value</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.delivered > 0 ? formatCurrency(Math.round(stats.revenue / stats.delivered)) : '₹0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Conversion Rate (Delivered/Total)</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
