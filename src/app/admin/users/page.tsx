'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Users, Search, LayoutDashboard, Package, ShoppingBag, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.success) setUsers(d.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }).finally(() => setDataLoading(false));
  }, [user]);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:flex flex-col w-56 bg-gray-900 min-h-screen fixed left-0 top-14 z-40">
          <nav className="p-4 space-y-1 mt-2">
            {[{ label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} /> }, { label: 'Products', href: '/admin/products', icon: <Package size={16} /> }, { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={16} /> }, { label: 'Users', href: '/admin/users', icon: <Users size={16} /> }].map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === '/admin/users' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:ml-56 flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/dashboard" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"><ArrowLeft size={12} /> Dashboard</Link>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users size={22} className="text-green-600" /> Users</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Users', value: users.length, color: 'text-gray-900' },
              { label: 'Customers', value: users.filter(u => u.role === 'user').length, color: 'text-green-600' },
              { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="all">All Roles</option>
              <option value="user">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Users table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['User', 'Contact', 'Role', 'Address', 'Joined', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataLoading ? [1,2,3,4].map(i => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                  )) : filtered.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{u.id.slice(0, 14)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600"><Mail size={11} className="text-gray-400" />{u.email}</div>
                          {u.phone && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={11} className="text-gray-400" />{u.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs capitalize px-2.5 py-1 ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role === 'admin' ? '⚙️ Admin' : '👤 Customer'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {u.address ? <div className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" />{u.address}</div> : <span className="text-gray-300">Not set</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        {u.id !== user.id && (
                          <button className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline transition-colors">Suspend</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!dataLoading && filtered.length === 0 && (
                <div className="py-12 text-center text-gray-500"><Users size={32} className="mx-auto mb-3 text-gray-300" /><p>No users found</p></div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
