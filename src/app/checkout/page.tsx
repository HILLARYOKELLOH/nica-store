'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store';
import { formatPrice, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, mpesaPhoneFormat } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Smartphone, DollarSign, Lock, ChevronRight, MapPin, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'details' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
    paymentMethod: '' as 'mpesa' | 'cash' | '',
    mpesaPhone: user?.phone || '',
  });

  const subtotal = getTotal();
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  function update(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to checkout</h1>
        <p className="text-gray-500 mb-6">Please sign in or create an account to place your order.</p>
        <Link href="/auth/login?redirect=/checkout" className="btn-primary inline-flex px-8 py-3">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    router.replace('/cart');
    return null;
  }

  async function placeOrder() {
    if (!form.paymentMethod) { toast.error('Select a payment method'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod: form.paymentMethod,
          address: form.address,
          phone: form.phone,
          notes: form.notes,
          mpesaPhone: form.mpesaPhone,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const newOrderId = data.data.id;
      setOrderId(newOrderId);

      if (form.paymentMethod === 'mpesa') {
        setMpesaLoading(true);
        const mpRes = await fetch('/api/payments/mpesa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrderId, phone: mpesaPhoneFormat(form.mpesaPhone) }),
        });
        const mpData = await mpRes.json();
        setMpesaLoading(false);
        if (!mpData.success) throw new Error(mpData.error);
        toast.success('M-Pesa prompt sent! Check your phone.');
      }

      clearCart();
      setStep('confirm');
    } catch (err: any) {
      toast.error(err.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Order Placed! 🎉</h1>
        <p className="text-gray-600 mb-2">Thank you for shopping at NICA STORE</p>
        <p className="text-sm text-gray-500 mb-6">Order ID: <span className="font-bold text-gray-900">{orderId}</span></p>

        {form.paymentMethod === 'mpesa' ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Smartphone size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-800 mb-1">M-Pesa Payment Sent</p>
                <p className="text-sm text-green-700">Check your phone ({form.mpesaPhone}) for the M-Pesa prompt. Enter your PIN to complete payment.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-start gap-3">
              <DollarSign size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 mb-1">Cash on Delivery</p>
                <p className="text-sm text-amber-700">Have <span className="font-bold">{formatPrice(total)}</span> ready when your order arrives. Our rider will collect payment.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders" className="btn-primary px-8 py-3">View My Orders</Link>
          <Link href="/shop" className="btn-secondary px-8 py-3">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        {[['details', 'Delivery Details'], ['payment', 'Payment']].map(([s, label], i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 ${step === s || (s === 'details' && step === 'payment') ? 'text-green-700' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-green-600 text-white' : (i === 0 && step === 'payment') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
              <span className="text-sm font-semibold hidden sm:block">{label}</span>
            </div>
            {i === 0 && <ChevronRight size={16} className="mx-3 text-gray-300" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'details' && (
            <div className="card p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2"><MapPin size={18} className="text-green-600" /> Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2"><User size={13} className="inline mr-1" />Full Name</label>
                  <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2"><Phone size={13} className="inline mr-1" />Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" placeholder="+254 7XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address</label>
                  <input type="text" value={form.address} onChange={e => update('address', e.target.value)} className="input-field" placeholder="Street, Estate, City" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} className="input-field resize-none" placeholder="Any special instructions for delivery..." />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!form.name || !form.phone || !form.address) { toast.error('Please fill in all required fields'); return; }
                  setStep('payment');
                }}
                className="btn-primary w-full mt-5 py-3.5"
              >
                Continue to Payment <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="card p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2"><Lock size={18} className="text-green-600" /> Payment Method</h2>

              {/* M-Pesa */}
              <div
                onClick={() => update('paymentMethod', 'mpesa')}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all mb-4 ${form.paymentMethod === 'mpesa' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${form.paymentMethod === 'mpesa' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                  {form.paymentMethod === 'mpesa' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-lg">M</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">M-Pesa</p>
                      <p className="text-xs text-gray-500">Lipa na M-Pesa · Instant payment</p>
                    </div>
                  </div>
                  {form.paymentMethod === 'mpesa' && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">M-Pesa Phone Number</label>
                      <input type="tel" value={form.mpesaPhone} onChange={e => update('mpesaPhone', e.target.value)}
                        className="input-field" placeholder="07XX XXX XXX or 254 7XX XXX XXX" />
                      <p className="text-xs text-gray-500 mt-1.5">You will receive a payment prompt on this number</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => update('paymentMethod', 'cash')}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.paymentMethod === 'cash' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${form.paymentMethod === 'cash' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                  {form.paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('details')} className="btn-secondary flex-1 py-3">Back</button>
                <button
                  onClick={placeOrder}
                  disabled={loading || mpesaLoading || !form.paymentMethod}
                  className="btn-primary flex-1 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading || mpesaLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {mpesaLoading ? 'Sending M-Pesa...' : 'Placing Order...'}
                    </span>
                  ) : (
                    <span>Place Order · {formatPrice(total)}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product?.images[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="48px" />
                    ) : <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.product?.name}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Delivery</span><span className={delivery === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
              <div className="border-t pt-2 flex justify-between font-black text-gray-900"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
