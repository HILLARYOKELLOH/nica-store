'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDateTime, getOrderStatusColor } from '@/lib/utils';
import { Order, Product } from '@/types';
import {
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp,
  DollarSign, AlertCircle, Clock, ArrowRight, CreditCard
} from 'lucide-react';




// ── StatCard (leasing-style) ──────────────────────────────────────────────────
function StatCard({
  title,
  value,
  trend,
  icon,
}: {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-5">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
      </div>
      <div className="rounded-lg bg-gray-50 p-2">{icon}</div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/products?limit=100').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([o, p, u]) => {
      if (o.success) setOrders(o.data);
      if (p.success) setProducts(p.data);
      if (u.success) setUsers(u.data);
    }).finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Derived data ────────────────────────────────────────────────────────────
  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        {/* ── Sidebar (unchanged) ───────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 bg-gray-900 min-h-screen fixed left-0 top-14 z-40">
          <nav className="p-4 space-y-1 mt-2">
            {[
              { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} /> },
              { label: 'Products',  href: '/admin/products',  icon: <Package size={16} /> },
              { label: 'Orders',    href: '/admin/orders',    icon: <ShoppingBag size={16} /> },
              { label: 'Users',     href: '/admin/users',     icon: <Users size={16} /> },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                {item.icon}{item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-800 mt-4">
              <Link href="/shop" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-green-400 transition-colors">
                <ArrowRight size={16} /> View Store
              </Link>
            </div>
          </nav>
        </aside>

        {/* ── Main content (redesigned) ─────────────────────────────────────── */}
        <main className="lg:ml-56 flex-1 p-6 space-y-6">

          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard size={22} className="text-green-600" />
              Dashboard — {currentMonth}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Welcome back, {user.name}! Here&apos;s your store overview for the current month.
            </p>
          </div>

          {/* Alerts */}
          {(outOfStock > 0 || pendingOrders > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outOfStock > 0 && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      {outOfStock} product{outOfStock > 1 ? 's' : ''} out of stock
                    </p>
                    <Link href="/admin/products" className="text-xs text-red-600 hover:underline">
                      Manage inventory →
                    </Link>
                  </div>
                </div>
              )}
              {pendingOrders > 0 && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <Clock size={18} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting processing
                    </p>
                    <Link href="/admin/orders" className="text-xs text-amber-600 hover:underline">
                      View orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={formatPrice(revenue)}
              trend="+12% this month"
              icon={<DollarSign size={20} className="text-green-600" />}
            />
            <StatCard
              title="Total Orders"
              value={orders.length}
              trend={`${pendingOrders} pending`}
              icon={<ShoppingBag size={20} className="text-blue-600" />}
            />
            <StatCard
              title="Products"
              value={products.length}
              trend={`${lowStock} low stock`}
              icon={<Package size={20} className="text-purple-600" />}
            />
            <StatCard
              title="Customers"
              value={users.filter(u => u.role === 'user').length}
              trend="All time"
              icon={<Users size={20} className="text-orange-600" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Package size={18} /> Manage Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <CreditCard size={18} /> View Orders
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <Users size={18} /> Manage Users
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="rounded-lg border border-gray-200 bg-white">

            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-600" /> Recent Orders
                </h2>
                <p className="text-sm text-gray-500">Latest transactions from your store</p>
              </div>
              <Link href="/admin/orders" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {/* Tab filters */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-6 py-3">
              {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED'].map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer ${
                    i === 0
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Table */}
            {dataLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {['ORDER ID', 'CUSTOMER', 'AMOUNT', 'PAYMENT', 'STATUS', 'DATE'].map(h => (
                        <th key={h} className="px-6 py-3 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No orders yet. Orders will appear here once customers start purchasing.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map(order => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs font-bold text-gray-900">{order.id}</td>
                          <td className="px-6 py-3">
                            <p className="font-medium text-gray-900">{order.userName}</p>
                            <p className="text-xs text-gray-500">{order.userEmail}</p>
                          </td>
                          <td className="px-6 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                          <td className="px-6 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                              order.paymentMethod === 'mpesa'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500">{formatDateTime(order.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}