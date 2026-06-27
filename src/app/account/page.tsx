'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useWishlistStore } from '@/store';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package, Heart, Settings, Lock, Phone, MapPin, Save } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const { items: wishlistIds } = useWishlistStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'security'>('profile');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [wishProducts, setWishProducts] = useState<Product[]>([]);
  const [loadingWish, setLoadingWish] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '', address: user.address || '' });
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'wishlist' || wishlistIds.length === 0) return;
    setLoadingWish(true);
    fetch('/api/products?limit=50')
      .then(r => r.json())
      .then(d => {
        if (d.success) setWishProducts(d.data.filter((p: Product) => wishlistIds.includes(p.id)));
      })
      .finally(() => setLoadingWish(false));
  }, [activeTab, wishlistIds]);

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Lock size={40} className="text-gray-300 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-4">Sign in to view your account</h1>
      <Link href="/auth/login" className="btn-primary inline-flex px-8 py-3">Sign In</Link>
    </div>
  );

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setUser({ ...user!, ...form });
    toast.success('Profile updated!');
    setSaving(false);
  }

  const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
    { key: 'wishlist', label: `Wishlist (${wishlistIds.length})`, icon: <Heart size={16} /> },
    { key: 'security', label: 'Security', icon: <Lock size={16} /> },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-2xl font-black text-white">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge text-xs px-2 py-0.5 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              {user.role === 'admin' ? '⚙️ Administrator' : '👤 Customer'}
            </span>
          </div>
        </div>
        <div className="ml-auto flex gap-3">
          <Link href="/orders" className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
            <Package size={15} /> My Orders
          </Link>
          {user.role === 'admin' && (
            <Link href="/admin/dashboard" className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <Settings size={15} /> Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap -mb-px ${activeTab === tab.key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Personal Information</h2>
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><User size={14} className="inline mr-1" />Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input value={user.email} disabled className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Phone size={14} className="inline mr-1" />Phone Number</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><MapPin size={14} className="inline mr-1" />Delivery Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input-field" placeholder="Street, Estate, City" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3 disabled:opacity-60">
              {saving ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</span> : <><Save size={16} />Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistIds.length === 0 ? (
            <div className="card p-12 text-center">
              <Heart size={40} className="text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-5 text-sm">Save items you love by clicking the heart icon on any product</p>
              <Link href="/shop" className="btn-primary inline-flex px-6 py-2.5 text-sm">Browse Products</Link>
            </div>
          ) : loadingWish ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {wishProducts.map(product => (
                <Link key={product.id} href={`/shop/${product.id}`} className="card hover:shadow-lg transition-all group">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 33vw" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-green-600 font-semibold mb-1">{product.category}</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</p>
                    <p className="font-black text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Lock size={18} className="text-green-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Password</p>
                  <p className="text-xs text-gray-500">Last changed: Unknown</p>
                </div>
              </div>
              <button className="btn-secondary text-sm px-4 py-2">Change Password</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Account Role</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <span className={`badge text-xs px-3 py-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h3 className="font-semibold text-red-700 mb-1 text-sm">Danger Zone</h3>
              <p className="text-xs text-red-600 mb-3">Once you delete your account, there is no going back.</p>
              <button className="text-sm text-red-600 border border-red-200 hover:bg-red-100 transition-colors px-4 py-2 rounded-lg font-medium">Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
