'use client';

import {
  ShoppingCart,
  Package,
  Users,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface DashboardStats {
  total: number;
  revenue: number;
  totalCustomers: number;
  lowStock: number;
  trends: { days: number; revenue: number | null; orders: number | null; customers: number | null };
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  user: { name: string } | null;
  total: string;
  orderStatus: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const formatCurrency = (amount: number | string) => `₹${Number(amount).toLocaleString('en-IN')}`;
const formatCount = (n: number) => n.toLocaleString('en-IN');
const formatStatus = (status: string) =>
  status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ');

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data.data.stats,
  });

  const { data: recentOrders = [], isLoading: ordersLoading, isError: ordersError } = useQuery<RecentOrder[]>({
    queryKey: ['dashboard-recent-orders'],
    queryFn: async () => (await api.get('/orders?page=1&limit=5')).data.data || [],
  });

  const trends = statsData?.trends;
  const stats = [
    {
      name: 'Total Revenue',
      value: statsData ? formatCurrency(statsData.revenue) : '—',
      change: trends?.revenue ?? null,
      icon: IndianRupee,
    },
    {
      name: 'Total Orders',
      value: statsData ? formatCount(statsData.total) : '—',
      change: trends?.orders ?? null,
      icon: ShoppingCart,
    },
    {
      name: 'Total Customers',
      value: statsData ? formatCount(statsData.totalCustomers) : '—',
      change: trends?.customers ?? null,
      icon: Users,
    },
    {
      name: 'Low Stock Items',
      value: statsData ? formatCount(statsData.lowStock ?? 0) : '—',
      change: null,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {statsError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard figures. Refresh the page to try again.
        </p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <stat.icon className="h-5 w-5 text-primary-600" />
              </div>
              {stat.change !== null && (
                <span
                  className={`flex items-center text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                  title={`Last ${trends?.days ?? 30} days vs the ${trends?.days ?? 30} days before`}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change > 0 ? '+' : ''}
                  {stat.change}%
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{statsLoading ? '…' : stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            View all
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(ordersLoading || ordersError || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    {ordersLoading ? 'Loading…' : ordersError ? 'Could not load orders.' : 'No orders yet.'}
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.user?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-700">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/products" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900">Add New Product</h3>
          <p className="mt-1 text-sm text-gray-600">Create a new product listing</p>
        </Link>
        <Link href="/dashboard/coupons" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900">Create Coupon</h3>
          <p className="mt-1 text-sm text-gray-600">Set up discount codes</p>
        </Link>
        <Link href="/dashboard/reports" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900">View Reports</h3>
          <p className="mt-1 text-sm text-gray-600">Analyze sales and performance</p>
        </Link>
      </div>
    </div>
  );
}
