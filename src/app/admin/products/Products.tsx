'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, Plus, Edit2, Trash2, Search, LayoutDashboard, ShoppingBag, Users, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', originalPrice: '', category: '', images: '', stock: '', tags: '', featured: false, active: true };
const CATEGORIES = ['Electronics', 'Fashion', 'Footwear', 'Home & Living', 'Beauty', 'Sports & Fitness', 'Food & Drinks'];

export default function AdminProductsPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); })
      .finally(() => setDataLoading(false));
  }, [user]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), originalPrice: String(p.originalPrice || ''), category: p.category, images: p.images.join(', '), stock: String(p.stock), tags: p.tags.join(', '), featured: p.featured, active: p.active });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name, description: form.description, price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category, images: form.images.split(',').map(s => s.trim()).filter(Boolean),
        stock: Number(form.stock), tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        featured: form.featured, active: form.active,
      };
      const url = editing ? `/api/products/${editing.id}` : '/api/products';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      if (editing) {
        setProducts(ps => ps.map(p => p.id === editing.id ? data.data : p));
        toast.success('Product updated!');
      } else {
        setProducts(ps => [data.data, ...ps]);
        toast.success('Product created!');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setProducts(ps => ps.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(p: Product) {
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) });
      const data = await res.json();
      if (data.success) { setProducts(ps => ps.map(pr => pr.id === p.id ? data.data : pr)); toast(p.active ? 'Product hidden' : 'Product published'); }
    } catch { toast.error('Failed'); }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 bg-gray-900 min-h-screen fixed left-0 top-14 z-40">
          <nav className="p-4 space-y-1 mt-2">
            {[{ label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} /> }, { label: 'Products', href: '/admin/products', icon: <Package size={16} /> }, { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag size={16} /> }, { label: 'Users', href: '/admin/users', icon: <Users size={16} /> }].map(item => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === '/admin/products' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                {item.icon}{item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:ml-56 flex-1 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <Link href="/admin/dashboard" className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"><ArrowLeft size={12} /> Dashboard</Link>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Package size={22} className="text-green-600" /> Products</h1>
            </div>
            <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-sm"><Plus size={16} /> Add Product</button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Products', value: products.length, color: 'text-gray-900' },
              { label: 'Low Stock (≤5)', value: products.filter(p => p.stock <= 5 && p.stock > 0).length, color: 'text-orange-600' },
              { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataLoading ? [1,2,3,4,5].map(i => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                  )) : filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.images[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="40px" onError={() => {}} /> : <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 max-w-[180px] truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>
                        {p.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>{p.stock}</span>
                        {p.stock === 0 && <p className="text-xs text-red-500">Out of stock</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`badge text-xs ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Hidden'}</span>
                          {p.featured && <span className="badge text-xs bg-yellow-100 text-yellow-700">Featured</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleActive(p)} className={`p-1.5 rounded-lg transition-colors ${p.active ? 'text-gray-400 hover:bg-gray-100' : 'text-green-600 hover:bg-green-50'}`} title={p.active ? 'Hide' : 'Show'}>
                            {p.active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                            {deleting === p.id ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!dataLoading && filtered.length === 0 && (
                <div className="py-12 text-center text-gray-500"><Package size={32} className="mx-auto mb-3 text-gray-300" /><p>No products found</p></div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="input-field" placeholder="e.g. Premium Wireless Headphones" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} className="input-field resize-none" placeholder="Detailed product description..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (KES) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Original Price (KES)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} min="0" className="input-field" placeholder="For showing discount" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required className="input-field">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required min="0" className="input-field" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URLs (comma separated)</label>
                  <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} rows={2} className="input-field resize-none text-sm" placeholder="https://images.unsplash.com/..., https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="wireless, headphones, audio" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm font-medium text-gray-700">Featured product</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm font-medium text-gray-700">Active (visible in store)</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                  {saving ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{editing ? 'Saving...' : 'Creating...'}</span> : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
