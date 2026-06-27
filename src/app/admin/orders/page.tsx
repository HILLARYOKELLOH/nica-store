'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';
import { formatPrice, formatDateTime, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils';
import { ShoppingBag, Search, LayoutDashboard, Package, Users, ChevronDown, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/orders').then(r => r.json()).then(d => {
      if (d.success) setOrders(d.data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }).finally(() => setDataLoading(false));
  }, [user]);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: data.data.status } : o));
      toast.success(`Order status updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setUpdatingOrder(null);
    }
  }

  async function updatePaymentStatus(orderId: string, paymentStatus: string) {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrders(os => os.map(o => o.id === orderId ? { ...o, paymentStatus: data.data.paymentStatus } : o));
      toast.success('Payment status updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingOrder(null);
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.userEmail.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-56 bg-gray-900 min-h-screen fixed left-0 top-14 z-40">
          <nav className="p-4 space-y-1 mt-2">
            {[{ label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} /> }, { label: 'Products', href: '/admin/products', icon: <Package size={16} /> }, { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={16} /> }, { label: 'Users', href: '/admin/users', icon: <Users size={16} /> }].map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === '/admin/orders' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:ml-56 flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/dashboard" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"><ArrowLeft size={12} /> Dashboard</Link>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><ShoppingBag size={22} className="text-green-600" /> Orders</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total Orders', value: orders.length, color: 'text-gray-900' },
              { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600' },
              { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
              { label: 'Revenue', value: formatPrice(orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0)), color: 'text-blue-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID, customer email..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {/* Orders */}
          <div className="space-y-3">
            {dataLoading ? [1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />) :
              filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-500">
                  <ShoppingBag size={32} className="mx-auto mb-3 text-gray-300" /><p>No orders found</p>
                </div>
              ) : filtered.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-mono font-bold text-gray-900">{order.id}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.userName}</p>
                        <p className="text-xs text-gray-500">{order.userEmail}</p>
                      </div>
                      <span className="text-sm font-black text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge text-xs capitalize ${getOrderStatusColor(order.status)}`}>{order.status}</span>
                      <span className={`badge text-xs capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                      <span className="badge text-xs bg-gray-100 text-gray-600 capitalize">{order.paymentMethod}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded order details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-white rounded-xl px-3 py-2 border border-gray-100">
                              <span className="font-medium text-gray-900">{item.productName}</span>
                              <span className="text-gray-500">{item.quantity}x {formatPrice(item.price)} = <strong>{formatPrice(item.price * item.quantity)}</strong></span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-900">{order.address}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Delivery Fee</p>
                          <p className="text-sm font-medium">{order.deliveryFee === 0 ? <span className="text-green-600">FREE</span> : formatPrice(order.deliveryFee)}</p>
                        </div>
                        {order.mpesaRef && (
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">M-Pesa Ref</p>
                            <p className="text-sm font-mono font-bold text-green-700">{order.mpesaRef}</p>
                          </div>
                        )}
                        {order.notes && (
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Status controls */}
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Update Order Status</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ORDER_STATUSES.map(s => (
                              <button key={s} onClick={() => updateStatus(order.id, s)} disabled={order.status === s || updatingOrder === order.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${order.status === s ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Payment Status</p>
                          <div className="flex gap-1.5">
                            {['pending', 'paid', 'failed', 'refunded'].map(s => (
                              <button key={s} onClick={() => updatePaymentStatus(order.id, s)} disabled={order.paymentStatus === s || updatingOrder === order.id}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${order.paymentStatus === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-700'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </main>
      </div>
    </div>
  );
}
