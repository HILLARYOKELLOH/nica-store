'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { Package, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  return (
    <>
      <header className="bg-gray-900 text-white h-14 flex items-center px-6 sticky top-0 z-50 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-black text-lg">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          <span>NICA <span className="text-green-400">STORE</span></span>
          <span className="text-xs bg-green-600 px-2 py-0.5 rounded-md font-semibold ml-1">ADMIN</span>
        </Link>
        <div className="ml-auto flex items-center gap-5">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">View Store</Link>
          {user && <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>}
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>
      {children}
    </>
  );
}
