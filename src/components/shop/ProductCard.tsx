'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star, Eye, Tag, Zap, PackageX } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calcDiscount } from '@/lib/utils';
import { useCartStore, useWishlistStore } from '@/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);  // ← add this
  const router = useRouter();
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wished = has(product.id);
  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : 0;

  useEffect(() => { setMounted(true); }, []); // ← add this

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem(product, 1);
    toast.success(`${product.name.slice(0, 25)}... added to cart`);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast(wished ? 'Removed from wishlist' : 'Added to wishlist', { icon: wished ? '💔' : '❤️' });
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/shop/${product.id}`);
  }

  // ← gate wished on mounted so server & client render the same initial HTML
  const isWished = mounted && wished;

  return (
    <Link href={`/shop/${product.id}`} className="group card flex flex-col hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imgError ? (
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingCart size={48} className="text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white text-xs px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
              <Tag size={10} />
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-800 text-white text-xs px-2 py-0.5 rounded-lg flex items-center gap-1">
              <PackageX size={10} />
              Out of Stock
            </span>
          )}
          {product.featured && (
            <span className="badge bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
              <Zap size={10} />
              Featured
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all ${isWished ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
            aria-label="Add to wishlist"
          >
            <Heart size={14} fill={isWished ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleQuickView}
            className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all"
            aria-label="Quick view"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart size={15} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-green-600 font-semibold mb-1">{product.category}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-green-700 transition-colors flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={11} className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-orange-600 font-medium mt-1 flex items-center gap-1">
            <Zap size={10} />
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
}