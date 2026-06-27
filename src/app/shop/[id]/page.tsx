import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';
import { getProductById, getProducts } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product?.name || 'Product' };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, allProducts] = await Promise.all([getProductById(id), getProducts()]);
  if (!product || !product.active) notFound();
  const related = allProducts.filter(p => p.active && p.category === product.category && p.id !== product.id).slice(0, 4);
  return <ProductDetail product={product} related={related} />;
}
