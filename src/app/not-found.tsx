import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gray-100 mb-2">404</div>
        <div className="text-6xl mb-6">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">Sorry, the page you are looking for does not exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
            <Home size={16} /> Go Home
          </Link>
          <Link href="/shop" className="btn-secondary px-6 py-3 inline-flex items-center gap-2">
            <ShoppingBag size={16} /> Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
