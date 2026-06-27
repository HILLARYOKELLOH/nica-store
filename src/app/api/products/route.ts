import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    let products = await getProducts();
    products = products.filter(p => p.active);

    if (category && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }

    switch (sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'rating': products.sort((a, b) => b.rating - a.rating); break;
      case 'popular': products.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = products.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      meta: { total, page, limit, totalPages },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, originalPrice, category, images, stock, tags, featured } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const product = await createProduct({
      id: 'prod_' + uuidv4().replace(/-/g, '').slice(0, 8),
      name, description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category, images: images || [],
      stock: Number(stock) || 0,
      rating: 0, reviewCount: 0,
      tags: tags || [],
      featured: !!featured,
      active: true,
      createdAt: now, updatedAt: now,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
