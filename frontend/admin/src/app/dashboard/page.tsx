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

// Mock data - will be replaced with API calls
const stats = [
  {
    name: 'Total Revenue',
    value: '₹4,82,500',
    change: '+12.5%',
    trend: 'up',
    icon: IndianRupee,
  },
  {
    name: 'Total Orders',
    value: '284',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    name: 'Total Customers',
    value: '1,245',
    change: '+15.3%',
    trend: 'up',
    icon: Users,
  },
  {
    name: 'Low Stock Items',
    value: '12',
    change: '-3',
    trend: 'down',
    icon: Package,
  },
];

const recentOrders = [
  { id: 'ORD-1029', customer: 'Rahul Sharma', total: '₹4,999', status: 'Processing' },
  { id: 'ORD-1028', customer: 'Priya Patel', total: '₹2,499', status: 'Shipped' },
  { id: 'ORD-1027', customer: 'Amit Kumar', total: '₹7,999', status: 'Delivered' },
  { id: 'ORD-1026', customer: 'Sneha Gupta', total: '₹1,299', status: 'Processing' },
  { id: 'ORD-1025', customer: 'Vikram Singh', total: '₹3,499', status: 'Pending' },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <stat.icon className="h-5 w-5 text-primary-600" />
              </div>
              <span
                className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
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
        <Link href="/dashboard/products/new" className="card p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900">Add New Product</h3>
          <p className="mt-1 text-sm text-gray-600">Create a new product listing</p>
        </Link>
        <Link href="/dashboard/coupons/new" className="card p-6 hover:shadow-md transition-shadow">
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
