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
  const [rawProduct, rawAll] = await Promise.all([getProductById(id), getProducts()]);
  if (!rawProduct || !rawProduct.active) notFound();

  const mapProduct = (p: typeof rawProduct) => ({
    ...p,
    originalPrice: p.originalPrice ?? undefined,
    images: (p.images as string[]) ?? [],
    tags: (p.tags as string[]) ?? [],
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  });

  const product = mapProduct(rawProduct);
  const related = rawAll
    .filter(p => p.active && p.category === rawProduct.category && p.id !== rawProduct.id)
    .slice(0, 4)
    .map(mapProduct);

  return <ProductDetail product={product} related={related} />;
}