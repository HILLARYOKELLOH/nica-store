'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Order } from '@/types';
import { formatPrice, formatDateTime, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ChevronDown, ChevronUp, Lock } from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data.sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Lock size={40} className="text-gray-300 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to view orders</h1>
      <Link href="/auth/login?redirect=/orders" className="btn-primary inline-flex px-8 py-3 mt-4">Sign In</Link>
    </div>
  );

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <Package size={48} className="text-gray-200 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h1>
      <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
      <Link href="/shop" className="btn-primary inline-flex px-8 py-3">Shop Now</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card overflow-visible">
            {/* Header */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold text-gray-900">{order.id}</span>
                  <span className={`badge ${getOrderStatusColor(order.status)} capitalize`}>{order.status}</span>
                  <span className={`badge ${getPaymentStatusColor(order.paymentStatus)} capitalize`}>{order.paymentStatus}</span>
                </div>
                <span className="text-xs text-gray-500">{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500 capitalize">{order.paymentMethod} payment</p>
                </div>
                {expanded === order.id ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Expanded */}
            {expanded === order.id && (
              <div className="border-t border-gray-100 p-5 space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="56px" />
                        ) : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  <div><p className="text-xs text-gray-500 mb-1">Delivery Address</p><p className="text-sm font-medium text-gray-900">{order.address}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Payment</p><p className="text-sm font-medium text-gray-900 capitalize">{order.paymentMethod}{order.mpesaRef && <span className="text-xs text-gray-500 block">Ref: {order.mpesaRef}</span>}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Total</p>
                    <div className="text-sm">
                      <p className="text-gray-600">Subtotal: {formatPrice(order.subtotal)}</p>
                      <p className="text-gray-600">Delivery: {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</p>
                      <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </div>
                {order.notes && <div className="p-3 bg-amber-50 rounded-xl"><p className="text-xs text-amber-800"><strong>Notes:</strong> {order.notes}</p></div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
