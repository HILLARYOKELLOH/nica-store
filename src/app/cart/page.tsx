'use client';

import { useCartStore } from '@/store';
import { formatPrice, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Truck, Tag } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, getTotal } = useCartStore();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const subtotal = getTotal();
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping!</p>
        <Link href="/shop" className="btn-primary inline-flex px-8 py-3.5">Browse Products <ArrowRight size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart <span className="text-green-600">({items.reduce((s, i) => s + i.quantity, 0)} items)</span></h1>
        <button onClick={() => { clearCart(); toast('Cart cleared'); }} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">Clear cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex gap-4">
              {/* Image */}
              <Link href={`/shop/${item.productId}`} className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                {!imgErrors[item.productId] && item.product?.images[0] ? (
                  <Image src={item.product.images[0]} alt={item.product?.name || ''} fill className="object-cover"
                    onError={() => setImgErrors(e => ({ ...e, [item.productId]: true }))} sizes="96px" />
                ) : <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>}
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.productId}`} className="font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-2 text-sm leading-snug">
                  {item.product?.name}
                </Link>
                <p className="text-xs text-green-600 font-medium mt-1">{item.product?.category}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  {/* Qty */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"><Minus size={13} /></button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors" disabled={item.quantity >= (item.product?.stock || 99)}><Plus size={13} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-gray-900">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                    {item.quantity > 1 && <span className="text-xs text-gray-400">{formatPrice(item.product?.price || 0)} each</span>}
                    <button onClick={() => { removeItem(item.productId); toast('Item removed'); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-lg text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1"><Truck size={13} /> Delivery</span>
                <span className={delivery === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                  {delivery === 0 ? 'FREE' : formatPrice(delivery)}
                </span>
              </div>
              {delivery > 0 && (
                <div className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 flex items-start gap-2">
                  <Tag size={11} className="flex-shrink-0 mt-0.5" />
                  Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE delivery!
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-xl text-gray-900">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Free delivery progress */}
            {delivery > 0 && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress to free delivery</span>
                  <span>{Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }} />
                </div>
              </div>
            )}

            <Link href="/checkout" className="btn-primary w-full py-3.5 text-base mb-3">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
            <Link href="/shop" className="btn-secondary w-full py-3">Continue Shopping</Link>

            {/* Payment methods */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-3">Secure checkout — we accept</p>
              <div className="flex justify-center gap-3">
                <div className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg">M-PESA</div>
                <div className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg">CASH</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
