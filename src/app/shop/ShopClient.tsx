'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';
import { Search, SlidersHorizontal, X, ChevronDown, Grid, List } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ShopClient({ initialProducts, categories }: { initialProducts: Product[]; categories: string[] }) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (featuredOnly) list = list.filter(p => p.featured);
    if (priceMin) list = list.filter(p => p.price >= Number(priceMin));
    if (priceMax) list = list.filter(p => p.price <= Number(priceMax));
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'popular': list.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [initialProducts, selectedCategory, search, featuredOnly, priceMin, priceMax, sort]);

  function clearFilters() {
    setSearch(''); setSelectedCategory('all'); setSort('newest');
    setPriceMin(''); setPriceMax(''); setFeaturedOnly(false);
  }

  const hasFilters = search || selectedCategory !== 'all' || priceMin || priceMax || featuredOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedCategory !== 'all' ? selectedCategory : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} products found</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2 transition-colors ${view === 'grid' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Grid size={16} /></button>
            <button onClick={() => setView('list')} className={`p-2 transition-colors ${view === 'list' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List size={16} /></button>
          </div>
          {/* Filters toggle (mobile) */}
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={15} /> Filters
            {hasFilters && <span className="w-2 h-2 bg-green-600 rounded-full" />}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6' : 'hidden'} lg:block lg:static lg:w-64 lg:flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="font-bold text-lg">Filters</h3>
            <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Search</h3>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Category</h3>
            <div className="space-y-1">
              {['all', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedCategory === cat ? 'bg-green-600 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Price Range (KES)</h3>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          {/* Featured */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`w-10 h-6 rounded-full transition-colors relative ${featuredOnly ? 'bg-green-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${featuredOnly ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Featured only</span>
            </label>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
              <X size={14} /> Clear All Filters
            </button>
          )}

          {filtersOpen && (
            <button onClick={() => setFiltersOpen(false)} className="w-full mt-3 btn-primary">
              Show {filtered.length} Results
            </button>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  {selectedCategory} <button onClick={() => setSelectedCategory('all')}><X size={10} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  "{search}" <button onClick={() => setSearch('')}><X size={10} /></button>
                </span>
              )}
              {featuredOnly && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  Featured <button onClick={() => setFeaturedOnly(false)}><X size={10} /></button>
                </span>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-2.5">Clear Filters</button>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'flex flex-col gap-4'}>
              {filtered.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
