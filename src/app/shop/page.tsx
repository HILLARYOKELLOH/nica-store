import { Suspense } from 'react';
import ShopClient from './ShopClient';
import { getProducts } from '@/lib/db';

export const metadata = { title: 'Shop' };

export default async function ShopPage() {
  const products = await getProducts();
  const activeProducts = products.filter(p => p.active);
  const categories = [...new Set(activeProducts.map(p => p.category))].sort();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ShopClient initialProducts={activeProducts} categories={categories} />
    </Suspense>
  );
}
