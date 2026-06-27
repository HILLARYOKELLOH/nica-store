'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store';
import {
  ShoppingCart, Search, User, Menu, X, Heart, Package,
  ChevronDown, LogOut, Settings, LayoutDashboard,Truck, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Electronics', 'Fashion', 'Footwear', 'Home & Living', 'Beauty', 'Sports & Fitness', 'Food & Drinks'];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const count = useCartStore(s => s.getCount());
  const { user, logout } = useAuthStore();

  // Separate effect — runs once on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ✅ Removed setMounted(true) from here
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300 bg-white',
      scrolled ? 'shadow-md' : 'border-b border-gray-100'
    )}>
      <div className="bg-green-600 text-white text-xs py-1.5 font-medium flex items-center justify-center gap-4">
  <span className="flex items-center gap-1.5"><Truck size={12} /> Free delivery on orders over KES 2,000</span>
  <span className="opacity-40">·</span>
  <span className="flex items-center gap-1.5"><CreditCard size={12} /> Pay with M-Pesa or Cash on Delivery</span>
</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition-colors shadow-sm">
              <Package size={20} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-black text-gray-900 tracking-tight">NICA</span>
              <span className="text-lg font-black text-green-600 tracking-tight"> STORE</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-sm transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              className="md:hidden p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link href="/account" className="hidden sm:flex p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Wishlist">
              <Heart size={20} />
            </Link>

            {/* Cart — ✅ badge gated on mounted */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Cart">
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} className={cn('transition-transform text-gray-400', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-medium">
                        <LayoutDashboard size={15} /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User size={15} /> My Account
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Package size={15} /> My Orders
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <User size={16} /> Sign In
              </Link>
            )}

            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Category nav - desktop */}
        <nav className="hidden lg:flex items-center gap-1 pb-2 overflow-x-auto">
          <Link
            href="/shop"
            className={cn(
              'text-sm font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
              pathname === '/shop' && !new URLSearchParams().get('category')
                ? 'bg-green-50 text-green-700 font-semibold'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            )}
          >
            All Products
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 pt-2 border-t border-gray-100 bg-white">
          <form onSubmit={handleSearch} className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            />
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <Link href="/shop" className="flex items-center px-3 py-2.5 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium text-sm">
            All Products
          </Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="flex items-center px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}