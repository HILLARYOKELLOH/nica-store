'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import { Package, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setUser(data.data);
      toast.success(`Welcome back, ${data.data.name.split(' ')[0]}!`);
      router.push(data.data.role === 'admin' ? '/admin/dashboard' : redirect);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type: 'admin' | 'user') {
    if (type === 'admin') { setEmail('admin@nicastore.co.ke'); setPassword('admin123'); }
    else { setEmail('jane@example.com'); setPassword('admin123'); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={24} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-gray-900">NICA <span className="text-green-600">STORE</span></h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field pl-11" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-green-600 hover:text-green-700 font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input-field pl-11 pr-11" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</span>
                : <><span>Sign In</span> <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">Create one free</Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-5 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Demo Accounts (click to fill)</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('user')} className="flex-1 py-2 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:border-green-500 hover:text-green-700 transition-all">
                👤 User Demo
              </button>
              <button onClick={() => fillDemo('admin')} className="flex-1 py-2 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:text-purple-700 transition-all">
                ⚙️ Admin Demo
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
