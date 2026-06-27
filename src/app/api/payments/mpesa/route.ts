import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

// Simulated M-Pesa STK Push
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { orderId, phone } = await req.json();
    if (!orderId || !phone) {
      return NextResponse.json({ success: false, error: 'Order ID and phone are required' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (order.userId !== auth.id && auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Simulate STK push delay (in real app: call Safaricom Daraja API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate simulated checkout request ID
    const checkoutRequestId = 'ws_CO_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const mpesaRef = 'QK' + Math.random().toString(36).slice(2, 10).toUpperCase();

    // Update order with mpesa reference
    await updateOrder(orderId, {
      mpesaPhone: phone,
      mpesaRef,
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestId,
        mpesaRef,
        message: `M-Pesa payment request sent to ${phone}. Check your phone to complete the transaction.`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Payment initiation failed' }, { status: 500 });
  }
}