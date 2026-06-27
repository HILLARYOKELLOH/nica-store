'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/store';
import ProductCard from '@/components/shop/ProductCard';
import { ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft, Truck, Shield, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wished = has(product.id);
  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : 0;

  function handleAdd() {
    addItem(product, qty);
    toast.success(`${qty}x added to cart!`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-green-600 transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-green-600 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {!imgError && product.images[activeImg] ? (
              <Image src={product.images[activeImg]} alt={product.name} fill className="object-cover" onError={() => setImgError(true)} sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🛍️</div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">-{discount}% OFF</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => { setActiveImg(i); setImgError(false); }}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-green-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-2">
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">{product.category}</span>
            <button onClick={() => toggle(product.id)} className={`p-2 rounded-xl border transition-all ${wished ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}>
              <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6 p-4 bg-gray-50 rounded-2xl">
            <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through mb-0.5">{formatPrice(product.originalPrice)}</span>
                <span className="text-sm font-bold text-green-600 mb-0.5">Save {formatPrice(product.originalPrice - product.price)}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-2 mb-5 text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {product.stock > 0 ? <><Check size={16} className="text-green-600" /> In Stock ({product.stock} available)</> : '❌ Out of Stock'}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Minus size={16} /></button>
                  <span className="w-12 text-center font-bold text-gray-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 transition-colors"><Plus size={16} /></button>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={handleAdd} className="flex-1 btn-primary py-3.5 text-base">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <Link href="/checkout" onClick={handleAdd} className="flex-1 btn-outline py-3.5 text-base text-center flex items-center justify-center gap-2">
                  Buy Now
                </Link>
              </div>
            </>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: <Truck size={18} className="text-green-600" />, title: 'Fast Delivery', sub: 'Countrywide' },
              { icon: <Shield size={18} className="text-green-600" />, title: 'Secure Pay', sub: 'M-Pesa / Cash' },
              { icon: <RefreshCw size={18} className="text-green-600" />, title: '7-Day Return', sub: 'Easy returns' },
            ].map(b => (
              <div key={b.title} className="flex flex-col items-center text-center gap-1 p-3 bg-gray-50 rounded-xl">
                {b.icon}
                <p className="text-xs font-semibold text-gray-900">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map(tag => (
                <Link key={tag} href={`/shop?search=${tag}`} className="text-xs bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex border-b border-gray-200 mb-6 gap-1">
          {([['description', 'Description'], ['specs', 'Product Details']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        {activeTab === 'description' ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {[
              ['Product ID', product.id],
              ['Category', product.category],
              ['Rating', `${product.rating} / 5 (${product.reviewCount} reviews)`],
              ['Availability', product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'],
            ].map(([l, v]) => (
              <div key={l} className="flex flex-col gap-1 p-4 bg-gray-50 rounded-xl">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{l}</span>
                <span className="text-sm font-medium text-gray-900">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    </div>
  );
}
